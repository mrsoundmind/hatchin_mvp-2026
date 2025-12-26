import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertProjectSchema, insertTeamSchema, insertAgentSchema, insertMessageSchema, insertConversationSchema } from "@shared/schema";
import { parseConversationId } from "@shared/conversationId";
import { z } from "zod";
import { generateIntelligentResponse, generateStreamingResponse } from "./ai/openaiService.js";
import { personalityEngine } from "./ai/personalityEvolution.js";
import { trainingSystem } from "./ai/trainingSystem.js";
import { initializePreTrainedColleagues, devTrainingTools } from "./ai/devTrainingTools.js";
import { runTurn } from "./ai/graph.js";
import { 
  analyzeQuestion, 
  findBestAgentMatch, 
  coordinateMultiAgentResponse,
  calculateExpertiseConfidence,
  initiateHandoff,
  transferContext,
  processHandoffRequest,
  handoffTracker,
  type Agent 
} from "./ai/expertiseMatching.js";
import { TaskDetectionAI, type TaskSuggestion, type ConversationContext } from "./ai/taskDetection.js";
import { resolveSpeakingAuthority } from "./orchestration/resolveSpeakingAuthority";
import { validateMessageIngress } from "./schemas/messageIngress";
import { filterAvailableAgents, type ScopeContext } from "./orchestration/agentAvailability";
import { assertPhase1Invariants } from "./invariants/assertPhase1";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize pre-trained AI colleagues on server start
  initializePreTrainedColleagues();
  
  // Phase 1.2: Environment helpers for production-safe error handling
  const isProd = process.env.NODE_ENV === "production";
  const isDevOrTest = process.env.NODE_ENV === "development" || 
                       process.env.NODE_ENV === "test" || 
                       process.env.DEV === "true";
  
  // Phase 1.2: WebSocket error responder helper (never throws)
  function sendWsError(
    ws: WebSocket,
    params: {
      code: string;
      message: string;
      details?: Record<string, unknown>;
      correlationId?: string;
    }
  ): void {
    try {
      const errorResponse = {
        type: "error",
        code: params.code,
        message: params.message,
        ...(params.details && { details: params.details }),
        ...(params.correlationId && { correlationId: params.correlationId }),
      };
      ws.send(JSON.stringify(errorResponse));
    } catch (sendError) {
      // If sending error fails, log but never throw (production safety)
      console.error("[sendWsError] Failed to send error response:", sendError);
    }
  }
  
  // Phase 0.6.a: Storage status endpoint (read-only, no auth required)
  app.get("/api/system/storage-status", async (req, res) => {
    const { getStorageModeInfo } = await import("./storage");
    const info = getStorageModeInfo();
    res.json({
      mode: info.mode,
      durable: info.durable,
      notes: info.notes
    });
  });
  
  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.extend({
        starterPackId: z.string().optional(),
        projectType: z.string().optional()
      }).parse(req.body);
      const { starterPackId, projectType, ...projectData } = validatedData;
      const project = await storage.createProject(projectData);
      
      // Phase 1.1.c Step 1: Create canonical project conversation
      // conversationId = project-{projectId}
      const conversationId = `project-${project.id}`;
      
      // Idempotent: Check if conversation already exists
      const existingConversations = await storage.getConversationsByProject(project.id);
      const conversationExists = existingConversations.some(conv => conv.id === conversationId);
      
      if (!conversationExists) {
        // Create conversation with the canonical ID
        // Type assertion needed because InsertConversation omits id, but we support it
        await storage.createConversation({
          id: conversationId, // Use canonical ID instead of UUID
          projectId: project.id,
          teamId: null,
          agentId: null,
          type: 'project',
          title: null
        } as any);
        
        if (process.env.NODE_ENV === 'development' || process.env.DEV) {
          console.log(`[ProjectBootstrap] Created project conversation: ${conversationId}`);
        }
      }
      
      // If this is an "idea" project, automatically set up Maya agent and brain
      if (projectType === 'idea') {
        await storage.initializeIdeaProject(project.id);
      }
      
      // If this is a starter pack project, set up teams and agents
      if (starterPackId) {
        await storage.initializeStarterPackProject(project.id, starterPackId);
      }
      
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid project data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.updateProject(req.params.id, req.body);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      // Partial update support for right sidebar saves
      const project = await storage.updateProject(req.params.id, req.body);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Delete project
  app.delete("/api/projects/:id", async (req, res) => {
    console.log('🗑️ DELETE /api/projects/:id called with id:', req.params.id);
    try {
      console.log('🗑️ Calling storage.deleteProject with id:', req.params.id);
      const success = await storage.deleteProject(req.params.id);
      console.log('🗑️ Storage deleteProject result:', success);
      
      if (!success) {
        console.log('❌ Project not found in storage');
        return res.status(404).json({ error: "Project not found" });
      }
      console.log('✅ Project deleted successfully from storage');
      res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error('❌ Error in delete project endpoint:', error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Teams
  app.get("/api/teams", async (req, res) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  app.get("/api/projects/:projectId/teams", async (req, res) => {
    try {
      const teams = await storage.getTeamsByProject(req.params.projectId);
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project teams" });
    }
  });

  app.post("/api/teams", async (req, res) => {
    try {
      const validatedData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(validatedData);
      res.status(201).json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid team data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create team" });
    }
  });

  app.delete("/api/teams/:id", async (req, res) => {
    try {
      const success = await storage.deleteTeam(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Team not found" });
      }
      res.status(200).json({ message: "Team deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete team" });
    }
  });

  app.put("/api/teams/:id", async (req, res) => {
    try {
      const team = await storage.updateTeam(req.params.id, req.body);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      res.json(team);
    } catch (error) {
      res.status(500).json({ error: "Failed to update team" });
    }
  });

  // Agents
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agents" });
    }
  });

  app.get("/api/projects/:projectId/agents", async (req, res) => {
    try {
      const agents = await storage.getAgentsByProject(req.params.projectId);
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project agents" });
    }
  });

  app.get("/api/teams/:teamId/agents", async (req, res) => {
    try {
      const agents = await storage.getAgentsByTeam(req.params.teamId);
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team agents" });
    }
  });

  app.post("/api/agents", async (req, res) => {
    try {
      const validatedData = insertAgentSchema.parse(req.body);
      const agent = await storage.createAgent(validatedData);
      res.status(201).json(agent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid agent data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create agent" });
    }
  });

  app.delete("/api/agents/:id", async (req, res) => {
    try {
      const success = await storage.deleteAgent(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.status(200).json({ message: "Agent deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete agent" });
    }
  });

  app.put("/api/agents/:id", async (req, res) => {
    try {
      const agent = await storage.updateAgent(req.params.id, req.body);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to update agent" });
    }
  });

  // Chat API Routes
  app.get("/api/conversations/:projectId", async (req, res) => {
    try {
      const conversations = await storage.getConversationsByProject(req.params.projectId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid conversation data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // D1.2: Enhanced message loading with pagination and filtering
  app.get("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const { page = "1", limit = "50", before, after, messageType } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      
      const messages = await storage.getMessagesByConversation(
        req.params.conversationId,
        {
          page: pageNum,
          limit: limitNum,
          before: before as string,
          after: after as string,
          messageType: messageType as string
        }
      );
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Add endpoint for creating messages in specific conversations
  app.post("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const messageData = {
        ...req.body,
        conversationId: conversationId
      };
      
      const validatedData = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid message data", details: error.errors });
      }
      console.error('Error creating message in conversation:', error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid message data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // D1.3: Conversation management API routes
  app.put("/api/conversations/:conversationId/archive", async (req, res) => {
    try {
      const success = await storage.archiveConversation(req.params.conversationId);
      if (!success) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json({ message: "Conversation archived successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to archive conversation" });
    }
  });

  app.put("/api/conversations/:conversationId/unarchive", async (req, res) => {
    try {
      const success = await storage.unarchiveConversation(req.params.conversationId);
      if (!success) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json({ message: "Conversation unarchived successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to unarchive conversation" });
    }
  });

  app.get("/api/projects/:projectId/conversations/archived", async (req, res) => {
    try {
      const archivedConversations = await storage.getArchivedConversations(req.params.projectId);
      res.json(archivedConversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch archived conversations" });
    }
  });

  app.delete("/api/conversations/:conversationId", async (req, res) => {
    try {
      const success = await storage.deleteConversation(req.params.conversationId);
      if (!success) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json({ message: "Conversation deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // LangGraph Hatch chat endpoint
  app.post("/api/hatch/chat", async (req, res) => {
    try {
      const { threadId = "default", user = "", history = [], enablePeerNotes = false } = req.body || {};
      const out = await runTurn({ threadId, user, history, enablePeerNotes });

      // Fallback: if LangGraph returned an empty reply, synthesize via OpenAI path
      if (!out.reply || out.reply.trim().length === 0) {
        try {
          const context = {
            mode: 'project' as const,
            projectName: 'SaaS Startup',
            agentRole: 'Product Manager',
            conversationHistory: (history || []).map((m: any) => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content || '',
              timestamp: new Date().toISOString(),
            })),
            userId: 'user',
          };

          const ai = await generateIntelligentResponse(
            user || 'Help me plan next steps.',
            'Product Manager',
            context,
          );

          return res.json({
            messages: [...(history || []), { role: 'assistant', content: ai.content }],
            reply: ai.content,
            needsConsent: false,
          });
        } catch (e) {
          console.error('Fallback OpenAI generation failed:', e);
          // If fallback also fails, return the original out to keep behavior predictable
          return res.json(out);
        }
      }

      res.json(out);
    } catch (error) {
      console.error("LangGraph chat error:", error);
      res.status(500).json({ error: "Failed to process chat" });
    }
  });

  // A1.2 & A1.3: Message reactions for AI training
  app.post('/api/messages/:messageId/reactions', async (req, res) => {
    try {
      const { messageId } = req.params;
      const reactionData = req.body;
      
      // Validate reaction data
      if (!reactionData.reactionType || !['thumbs_up', 'thumbs_down'].includes(reactionData.reactionType)) {
        return res.status(400).json({ error: 'Invalid reaction type' });
      }

      // For now, use a default user ID (in production, get from session)
      const userId = 'user'; 
      
      const reaction = await storage.addMessageReaction({
        messageId,
        userId,
        reactionType: reactionData.reactionType,
        agentId: reactionData.agentId,
        feedbackData: reactionData.feedbackData || {}
      });

      // B4: Integrate reaction with personality evolution
      if (reactionData.agentId) {
        const feedback = reactionData.reactionType === 'thumbs_up' ? 'positive' : 'negative';
        personalityEngine.adaptPersonalityFromFeedback(
          reactionData.agentId,
          userId,
          feedback,
          '', // User message context would need to be passed from frontend
          '' // Agent response would need to be retrieved
        );
        
        console.log(`🎯 B4: Personality feedback integrated: ${feedback} reaction for ${reactionData.agentId}`);
      }

      res.json(reaction);
    } catch (error) {
      console.error('Error adding message reaction:', error);
      res.status(500).json({ error: 'Failed to add reaction' });
    }
  });

  // Get reactions for a message
  app.get('/api/messages/:messageId/reactions', async (req, res) => {
    try {
      const { messageId } = req.params;
      const reactions = await storage.getMessageReactions(messageId);
      res.json(reactions);
    } catch (error) {
      console.error('Error fetching message reactions:', error);
      res.status(500).json({ error: 'Failed to fetch reactions' });
    }
  });

  // Simple feedback endpoint (for user thumbs up/down)
  app.post("/api/training/feedback", async (req, res) => {
    try {
      const { messageId, conversationId, userMessage, agentResponse, agentRole, rating } = req.body;
      
      const trainingFeedback = trainingSystem.addFeedback({
        messageId,
        conversationId,
        userMessage,
        agentResponse,
        agentRole,
        rating
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to record feedback" });
    }
  });

  // Developer training endpoints (protected - only for internal use)
  app.post("/api/dev/training/personality", async (req, res) => {
    try {
      const { role, personality } = req.body;
      const profile = devTrainingTools.updatePersonality(role, personality);
      res.json({ success: true, profile });
    } catch (error) {
      res.status(500).json({ error: "Failed to update personality" });
    }
  });

  app.post("/api/dev/training/example", async (req, res) => {
    try {
      const { role, userInput, idealResponse, category } = req.body;
      const example = devTrainingTools.addExample(role, userInput, idealResponse, category);
      res.json({ success: true, example });
    } catch (error) {
      res.status(500).json({ error: "Failed to add example" });
    }
  });

  app.get("/api/dev/training/stats", async (req, res) => {
    try {
      const stats = devTrainingTools.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  // B4: Personality Evolution API endpoints
  app.get("/api/personality/:agentId/:userId", async (req, res) => {
    try {
      const { agentId, userId } = req.params;
      const stats = personalityEngine.getPersonalityStats(agentId, userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching personality stats:", error);
      res.status(500).json({ error: "Failed to fetch personality data" });
    }
  });

  app.post("/api/personality/feedback", async (req, res) => {
    try {
      const { agentId, userId, feedback, messageContent, agentResponse } = req.body;
      
      if (!agentId || !userId || !feedback) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const updatedProfile = personalityEngine.adaptPersonalityFromFeedback(
        agentId, userId, feedback, messageContent || '', agentResponse || ''
      );
      
      // Store feedback for future analysis
      await storage.storeFeedback(agentId, userId, {
        feedback,
        messageContent,
        agentResponse,
        timestamp: new Date().toISOString()
      });
      
      res.json({ 
        success: true, 
        adaptationConfidence: updatedProfile.adaptationConfidence,
        interactionCount: updatedProfile.interactionCount
      });
    } catch (error) {
      console.error("Error processing personality feedback:", error);
      res.status(500).json({ error: "Failed to process feedback" });
    }
  });

  app.get("/api/personality/analytics/:agentId", async (req, res) => {
    try {
      const { agentId } = req.params;
      const analytics = {
        totalUsers: 0,
        averageAdaptation: 0,
        commonTraitAdjustments: [],
        feedbackStats: { positive: 0, negative: 0 }
      };
      
      // This would aggregate data across all users for this agent
      // For now, return basic structure
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching personality analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // E3.4: Handoff statistics API
  app.get("/api/handoffs/stats", async (req, res) => {
    try {
      const stats = handoffTracker.getHandoffStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch handoff stats" });
    }
  });

  app.get("/api/handoffs/history", async (req, res) => {
    try {
      const { agentId } = req.query;
      const history = handoffTracker.getHandoffHistory(agentId as string);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch handoff history" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket Server Setup
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });

  // Store active connections by conversation ID
  const activeConnections = new Map<string, Set<WebSocket>>();
  
  // Track conversations using streaming to prevent double handlers
  const streamingConversations = new Set<string>();
  
  // Track active streaming responses to prevent duplicates
  const activeStreamingResponses = new Set<string>();

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('New WebSocket connection established');
    
    ws.on('message', async (rawMessage: Buffer) => {
      try {
        const data = JSON.parse(rawMessage.toString());
        
        switch (data.type) {
          case 'join_conversation':
            const conversationId = data.conversationId;
            if (!activeConnections.has(conversationId)) {
              activeConnections.set(conversationId, new Set());
            }
            activeConnections.get(conversationId)!.add(ws);
            
            ws.send(JSON.stringify({
              type: 'connection_confirmed',
              conversationId
            }));
            break;

          case 'send_message_streaming':
            console.log('🔄 Processing streaming message:', data);
            
            // Phase 1.2: Production-safe envelope validation
            let validationResult;
            try {
              validationResult = validateMessageIngress(data);
            } catch (err: any) {
              if (isProd) {
                sendWsError(ws, {
                  code: "INVALID_ENVELOPE",
                  message: "Invalid message payload.",
                  details: { reason: err.message },
                });
                return; // Stop processing
              }
              throw err; // Dev/test: rethrow for fast feedback
            }
            
            if (!validationResult.success) {
              if (isProd) {
                sendWsError(ws, {
                  code: "INVALID_ENVELOPE",
                  message: "Invalid message format.",
                  details: { reason: validationResult.error },
                });
                return; // Stop processing
              }
              // Dev/test: throw for fast feedback
              throw new Error(validationResult.error || 'Invalid message format');
            }
            
            // Extract validated envelope fields
            const envelope = validationResult.envelope!;
            const validatedMode = validationResult.mode!;
            const validatedProjectId = validationResult.projectId!;
            const validatedContextId = validationResult.contextId;
            const addressedAgentId = validationResult.addressedAgentId;
            
            // Phase 1.2: Production-safe invariant assertions
            try {
              assertPhase1Invariants({
                type: 'routing_consistency',
                conversationId: envelope.conversationId,
                mode: validatedMode,
                projectId: validatedProjectId,
                contextId: validatedContextId,
              });
            } catch (err: any) {
              if (isProd) {
                sendWsError(ws, {
                  code: "INVARIANT_VIOLATION",
                  message: "Request violates server contracts.",
                  details: { reason: err.message, type: "routing_consistency" },
                });
                return; // Stop processing
              }
              throw err; // Dev/test: rethrow for fast feedback
            }
            
            // B1.1: Handle streaming message requests
            const messageId = `msg-${Date.now()}`;
            const streamingData = envelope.message;
            
            // Mark this conversation as using streaming
            streamingConversations.add(envelope.conversationId);
            console.log('🎯 Marked conversation as streaming:', envelope.conversationId);
            console.log('🔍 Current streaming conversations:', Array.from(streamingConversations));
            
            // Save initial user message 
            const userMessageData = insertMessageSchema.parse({
              ...streamingData,
              conversationId: envelope.conversationId,
            });
            const savedUserMessage = await storage.createMessage(userMessageData);
            console.log('💾 User message saved:', savedUserMessage.id);
            
            // Broadcast user message immediately
            broadcastToConversation(envelope.conversationId, {
              type: 'new_message',
              message: savedUserMessage,
              conversationId: envelope.conversationId
            });
            
            // Send real-time metrics update - use validated fields
            broadcastToConversation(envelope.conversationId, {
              type: 'chat_message',
              projectId: validatedProjectId,
              teamId: validatedMode === 'team' ? validatedContextId || undefined : undefined,
              agentId: savedUserMessage.agentId,
              conversationId: envelope.conversationId,
              data: {
                content: savedUserMessage.content,
                senderId: savedUserMessage.agentId || savedUserMessage.userId || 'user',
                messageId: savedUserMessage.id
              },
              timestamp: new Date().toISOString()
            });

            // Start streaming AI response
            console.log('🚀 Starting streaming response...');
            
            // Check if already processing this conversation
            if (activeStreamingResponses.has(envelope.conversationId)) {
              console.log('🚫 Already processing streaming response for conversation:', envelope.conversationId);
              return;
            }
            
            // Mark as actively streaming
            activeStreamingResponses.add(envelope.conversationId);
            
            try {
              await handleStreamingColleagueResponse(
                savedUserMessage, 
                envelope.conversationId, 
                ws,
                {
                  mode: validatedMode,
                  projectId: validatedProjectId,
                  contextId: validatedContextId,
                  addressedAgentId,
                }
              );
            } catch (error) {
              console.error('❌ Streaming response error:', error);
              ws.send(JSON.stringify({
                type: 'streaming_error',
                messageId,
                error: 'Failed to generate response'
              }));
            } finally {
              // Remove from active streaming
              activeStreamingResponses.delete(envelope.conversationId);
            }
            break;

          case 'cancel_streaming':
            // B1.3: Handle streaming cancellation
            // AbortController will be handled in the streaming function
            ws.send(JSON.stringify({
              type: 'streaming_cancelled',
              messageId: data.messageId
            }));
            break;

          case 'send_message':
            const messageData = insertMessageSchema.parse(data.message);
            const savedMessage = await storage.createMessage(messageData);
            
            // Broadcast message to all connected clients in this conversation
            const connections = activeConnections.get(data.conversationId);
            if (connections) {
              const broadcastData = JSON.stringify({
                type: 'new_message',
                message: savedMessage,
                conversationId: data.conversationId
              });
              
              connections.forEach(connection => {
                if (connection.readyState === WebSocket.OPEN) {
                  connection.send(broadcastData);
                }
              });
            }

            // Generate AI colleague response if this is a user message
            // FIXED: COMPLETELY DISABLE regular handler to prevent double replies
            // Only the streaming handler (send_message_streaming) will handle AI responses
            console.log('🚫 Regular handler completely disabled to prevent double replies - only streaming handler will respond');
            // await handleColleagueResponse(savedMessage, data.conversationId);
            break;

          case 'start_typing':
            await storage.setTypingIndicator(data.conversationId, data.agentId, true, data.estimatedDuration);
            broadcastToConversation(data.conversationId, {
              type: 'typing_started',
              agentId: data.agentId,
              estimatedDuration: data.estimatedDuration
            });
            break;

          case 'stop_typing':
            await storage.setTypingIndicator(data.conversationId, data.agentId, false);
            broadcastToConversation(data.conversationId, {
              type: 'typing_stopped',
              agentId: data.agentId
            });
            break;
        }
      } catch (error: any) {
        // Phase 1.2: Production-safe catch-all for websocket message handler
        // This ensures NO unexpected error can crash the WS session
        console.error('WebSocket message error:', error);
        
        if (isProd) {
          // Production: send structured error and do not throw
          sendWsError(ws, {
            code: "INTERNAL_ERROR",
            message: "Something went wrong processing your message.",
            details: {
              // Only include safe, non-sensitive fields
              errorType: error?.name || "UnknownError",
              // Do not include full error message or stack in production
            },
          });
        } else {
          // Dev/test: send error AND rethrow for fast feedback
          sendWsError(ws, {
            code: "INTERNAL_ERROR",
            message: "Something went wrong processing your message.",
            details: {
              errorType: error?.name || "UnknownError",
              message: error?.message,
              // In dev/test, include more details for debugging
            },
          });
          throw error; // Rethrow in dev/test for fast feedback
        }
      }
    });

    ws.on('close', () => {
      // Remove this connection from all conversation rooms
      activeConnections.forEach((connections, conversationId) => {
        connections.delete(ws);
        if (connections.size === 0) {
          activeConnections.delete(conversationId);
          // Clean up streaming tracking for conversations with no active connections
          streamingConversations.delete(conversationId);
          activeStreamingResponses.delete(conversationId);
          console.log('🧹 Cleaned up streaming conversation:', conversationId);
        }
      });
      console.log('WebSocket connection closed');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Helper function to broadcast to all connections in a conversation
  function broadcastToConversation(conversationId: string, data: any) {
    const connections = activeConnections.get(conversationId);
    if (connections) {
      const message = JSON.stringify(data);
      connections.forEach(connection => {
        if (connection.readyState === WebSocket.OPEN) {
          connection.send(message);
        }
      });
    }
  }

  // E2.1: Multi-agent response handler for team dynamics
  async function handleMultiAgentResponse(
    selectedAgents: Agent[],
    userMessage: any,
    chatContext: any,
    sharedMemory: string,
    responseMessageId: string,
    conversationId: string,
    ws: WebSocket,
    abortController: AbortController
  ) {
    console.log('🤝 Handling multi-agent team response with', selectedAgents.length, 'agents');
    
    // Parse conversationId to get canonical projectId for memory retrieval
    let projectId: string | null = null;
    try {
      const parsed = parseConversationId(conversationId);
      projectId = parsed.projectId;
    } catch (error: any) {
      // Safe degradation: if conversationId cannot be parsed, log and continue without memory
      if (process.env.NODE_ENV === 'development' || process.env.DEV) {
        console.warn(`⚠️ Cannot parse conversationId for memory retrieval: ${conversationId}`, error.message);
      }
      // projectId remains null, will use empty memory string
    }
    
    try {
      // E2.2: Agent response priority and ordering
      const prioritizedAgents = selectedAgents.sort((a, b) => {
        // Prioritize Product Managers for complex questions
        if (a.role === 'Product Manager' && b.role !== 'Product Manager') return -1;
        if (b.role === 'Product Manager' && a.role !== 'Product Manager') return 1;
        return 0;
      });
      
      let teamResponse = '';
      const agentResponses: Array<{agent: Agent, content: string, confidence: number}> = [];
      
      // E2.3: Team consensus building - get responses from each agent
      for (const agent of prioritizedAgents) {
        if (abortController.signal.aborted) break;
        
        console.log(`🤖 Getting response from ${agent.name} (${agent.role})`);
        
        try {
          // Get agent-specific shared memory using canonical projectId
          const agentMemory = projectId 
            ? await storage.getSharedMemoryForAgent(agent.id, projectId)
            : '';
          
          if (!projectId && (process.env.NODE_ENV === 'development' || process.env.DEV)) {
            console.warn(`⚠️ Skipping memory retrieval for agent ${agent.id}: invalid/missing projectId from conversationId ${conversationId}`);
          }
          
          // Generate response from this agent
          const agentContext = {
            ...chatContext,
            agentRole: agent.role,
            teamMode: true,
            otherAgents: prioritizedAgents.filter(a => a.id !== agent.id).map(a => a.role)
          };
          
          const streamGenerator = generateStreamingResponse(
            userMessage.content,
            agent.role,
            agentContext,
            agentMemory,
            abortController.signal
          );
          
          let agentContent = '';
          for await (const chunk of streamGenerator) {
            if (abortController.signal.aborted) break;
            agentContent += chunk;
          }
          
          if (agentContent.trim()) {
            agentResponses.push({
              agent,
              content: agentContent,
              confidence: calculateExpertiseConfidence(agent, userMessage.content, {})
            });
          }
          
        } catch (error) {
          console.error(`❌ Error getting response from ${agent.name}:`, error);
          
          // E3.1: Attempt handoff to another agent if current agent fails
          const availableAgents = prioritizedAgents.filter(a => a.id !== agent.id);
          if (availableAgents.length > 0) {
            const handoffTarget = availableAgents[0];
            const handoffRequest = initiateHandoff(
              agent,
              handoffTarget,
              'Agent failure - automatic handoff',
              userMessage.content
            );
            
            const handoffResult = processHandoffRequest(handoffRequest, availableAgents);
            if (handoffResult.accepted) {
              console.log(`🔄 Handing off from ${agent.name} to ${handoffTarget.name}: ${handoffResult.reason}`);
              
              // Record handoff attempt
              const handoffStartTime = Date.now();
              try {
                // Get fresh memory and context for handoff using canonical projectId
                const handoffAgentMemory = projectId
                  ? await storage.getSharedMemoryForAgent(handoffTarget.id, projectId)
                  : '';
                
                if (!projectId && (process.env.NODE_ENV === 'development' || process.env.DEV)) {
                  console.warn(`⚠️ Skipping memory retrieval for handoff agent ${handoffTarget.id}: invalid/missing projectId from conversationId ${conversationId}`);
                }
                const handoffAgentContext = {
                  ...chatContext,
                  agentRole: handoffTarget.role,
                  teamMode: true,
                  otherAgents: prioritizedAgents.filter(a => a.id !== handoffTarget.id).map(a => a.role)
                };
                
                const handoffContext = transferContext(handoffRequest, chatContext.conversationHistory, handoffAgentMemory);
                const handoffStreamGenerator = generateStreamingResponse(
                  handoffContext,
                  handoffTarget.role,
                  handoffAgentContext,
                  handoffAgentMemory,
                  abortController.signal
                );
                
                let handoffContent = '';
                for await (const chunk of handoffStreamGenerator) {
                  if (abortController.signal.aborted) break;
                  handoffContent += chunk;
                }
                
                if (handoffContent.trim()) {
                  agentResponses.push({
                    agent: handoffTarget,
                    content: handoffContent,
                    confidence: calculateExpertiseConfidence(handoffTarget, userMessage.content, {})
                  });
                  
                  // Record successful handoff
                  const handoffDuration = Date.now() - handoffStartTime;
                  handoffTracker.recordHandoff(handoffRequest, handoffDuration, true);
                  console.log(`✅ Handoff to ${handoffTarget.name} completed successfully`);
                }
              } catch (handoffError) {
                console.error(`❌ Handoff to ${handoffTarget.name} failed:`, handoffError);
                const handoffDuration = Date.now() - handoffStartTime;
                handoffTracker.recordHandoff(handoffRequest, handoffDuration, false);
              }
            }
          }
        }
      }
      
      // E2.4: Agent disagreement handling and consensus building
      if (agentResponses.length > 1) {
        // Build consensus response
        teamResponse = buildTeamConsensus(agentResponses, userMessage.content);
      } else if (agentResponses.length === 1) {
        teamResponse = agentResponses[0].content;
      } else {
        teamResponse = "I'm sorry, I couldn't generate a response from the team at this time.";
      }
      
      // Stream the team response
      const words = teamResponse.split(' ');
      let accumulatedContent = '';
      for (let i = 0; i < words.length; i++) {
        if (abortController.signal.aborted) break;
        
        const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
        accumulatedContent += chunk;
        
        // Send chunk to client
        ws.send(JSON.stringify({
          type: 'streaming_chunk',
          messageId: responseMessageId,
          chunk,
          accumulatedContent
        }));
        
        // Simulate typing delay for natural feel
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      console.log('✅ Multi-agent team response completed');
      
    } catch (error) {
      console.error('❌ Error in multi-agent response:', error);
      // Fallback to single agent response
      const fallbackAgent = selectedAgents[0];
      const streamGenerator = generateStreamingResponse(
        userMessage.content,
        fallbackAgent.role,
        chatContext,
        sharedMemory,
        abortController.signal
      );
      
      let fallbackContent = '';
      for await (const chunk of streamGenerator) {
        if (abortController.signal.aborted) break;
        fallbackContent += chunk;
        
        ws.send(JSON.stringify({
          type: 'streaming_chunk',
          messageId: responseMessageId,
          chunk,
          accumulatedContent: fallbackContent
        }));
      }
    }
  }
  
  // E2.3: Team consensus building function
  function buildTeamConsensus(agentResponses: Array<{agent: Agent, content: string, confidence: number}>, userMessage: string): string {
    console.log('🤝 Building team consensus from', agentResponses.length, 'responses');
    
    // Sort by confidence
    const sortedResponses = agentResponses.sort((a, b) => b.confidence - a.confidence);
    
    // For now, use the highest confidence response as the base
    // In a more sophisticated implementation, this would analyze and merge responses
    const primaryResponse = sortedResponses[0];
    const supportingAgents = sortedResponses.slice(1);
    
    let consensusResponse = primaryResponse.content;
    
    // Add team context if multiple agents contributed
    if (supportingAgents.length > 0) {
      const teamMembers = sortedResponses.map(r => r.agent.role).join(', ');
      consensusResponse = `As a team (${teamMembers}), here's our collective response:\n\n${consensusResponse}`;
    }
    
    return consensusResponse;
  }

  // B1.1 & B1.2: Streaming AI colleague response handler
  async function handleStreamingColleagueResponse(
    userMessage: any, 
    conversationId: string, 
    ws: WebSocket,
    validatedContext?: {
      mode: "project" | "team" | "agent";
      projectId: string;
      contextId: string | null;
      addressedAgentId?: string;
    }
  ) {
    console.log('🎯 Starting streaming handler for:', conversationId);
    try {
      // Parse conversation ID using shared utility (replaces brittle split logic)
      // Validate conversationId is present and is a string
      if (!conversationId || typeof conversationId !== 'string') {
        console.log('❌ Invalid conversation ID: must be a non-empty string');
        ws.send(JSON.stringify({
          type: 'streaming_error',
          error: 'Invalid conversation ID format'
        }));
        return;
      }

      let parsed;
      try {
        parsed = parseConversationId(conversationId);
      } catch (error: any) {
        // Handle parsing errors safely
        if (error.message.includes('Ambiguous conversation ID')) {
          console.error('❌ Ambiguous conversation ID cannot be safely parsed:', conversationId);
          console.error('   Error:', error.message);
          ws.send(JSON.stringify({
            type: 'streaming_error',
            error: 'Ambiguous conversation context; projectId cannot be safely derived from conversationId. Rename project/team IDs to avoid ambiguous hyphen splits or adopt a safe encoding.',
            conversationId
          }));
          return;
        } else {
          // Other parsing errors (invalid format, etc.)
          console.error('❌ Invalid conversation ID format:', conversationId, error.message);
          ws.send(JSON.stringify({
            type: 'streaming_error',
            error: `Invalid conversation ID format: ${error.message}`,
            conversationId
          }));
          return;
        }
      }

      // Extract parsed values (use validated context if available, otherwise parse)
      const mode = validatedContext?.mode || (parsed.scope as 'project' | 'team' | 'agent');
      const projectId = validatedContext?.projectId || parsed.projectId;
      const contextId = validatedContext?.contextId ?? parsed.contextId;
      const addressedAgentId = validatedContext?.addressedAgentId;
      
      console.log('🔍 Parsed conversation:', { mode, projectId, contextId, addressedAgentId });
      
      // Phase 1.2.b — Ensure canonical conversation exists for all scopes
      // This must execute before any early returns, agent selection, or persistence
      async function ensureConversationExists(params: {
        conversationId: string;
        projectId: string;
        teamId?: string | null;
        agentId?: string | null;
        type: 'project' | 'team' | 'agent';
      }) {
        // Check if conversation already exists (idempotent check)
        const existingConversations = await storage.getConversationsByProject(params.projectId);
        const existing = existingConversations.find(conv => conv.id === params.conversationId);
        
        if (existing) {
          if (process.env.NODE_ENV === 'development' || process.env.DEV) {
            console.log(`[ConversationBootstrap] Conversation already exists: ${params.conversationId}`);
          }
          return existing;
        }

        // Create conversation with canonical ID
        const newConversation = await storage.createConversation({
          id: params.conversationId,
          projectId: params.projectId,
          teamId: params.teamId ?? null,
          agentId: params.agentId ?? null,
          type: params.type === 'agent' ? 'hatch' : params.type, // Storage uses 'hatch' for agent type
          title: null
        } as any);
        
        if (process.env.NODE_ENV === 'development' || process.env.DEV) {
          console.log(`[ConversationBootstrap] Created conversation: ${params.conversationId} (type: ${params.type})`);
        }
        
        return newConversation;
      }
      
      // Ensure conversation exists based on scope
      // Use the parsed conversationId directly (it's already in canonical format)
      if (mode === 'project') {
        await ensureConversationExists({
          conversationId,
          projectId,
          type: 'project'
        });
      } else if (mode === 'team' && contextId) {
        // conversationId is already in format: team-{projectId}-{teamId}
        await ensureConversationExists({
          conversationId,
          projectId,
          teamId: contextId,
          type: 'team'
        });
      } else if (mode === 'agent' && contextId) {
        // conversationId is already in format: agent-{projectId}-{agentId}
        await ensureConversationExists({
          conversationId,
          projectId,
          agentId: contextId,
          type: 'agent'
        });
      }
      
      // Phase 1.2: Production-safe conversation existence assertion
      try {
        assertPhase1Invariants({
          type: 'conversation_exists',
          conversationId,
        });
      } catch (err: any) {
        // In production, the assertion already logs warnings instead of throwing
        if (isProd) {
          console.warn("[INVARIANT] Conversation existence check failed (production-safe):", err.message);
          // Continue processing - the outer catch will handle if needed
        } else {
          throw err; // Dev/test: rethrow
        }
      }
      
      const project = await storage.getProject(projectId);
      if (!project) {
        console.log('❌ Project not found:', projectId);
        return;
      }

      // Phase 1.2: Get available agents using centralized helper
      // Get all project agents first, then filter by scope
      const allProjectAgents = await storage.getAgentsByProject(projectId);
      const projectAgentsAsAgentType: Agent[] = allProjectAgents.map(agent => ({
        id: agent.id,
        name: agent.name,
        role: agent.role,
        teamId: agent.teamId
      }));
      
      // Build scope context for agent availability filtering
      const scopeContext: ScopeContext = {
        projectId,
        mode,
        ...(mode === 'team' && contextId ? { teamId: contextId } : {}),
        ...(mode === 'agent' && contextId ? { agentId: contextId } : {}),
      };
      
      // Phase 1.2: Use centralized agent availability helper
      const availableAgents = filterAvailableAgents(projectAgentsAsAgentType, scopeContext);
      
      let teamName: string | undefined;
      if (mode === 'team' && contextId) {
        const team = await storage.getTeam(contextId);
        teamName = team?.name;
      }

      // Phase 1.2.a: Persistence invariant enforcement
      // Message persistence must not depend on agent availability or orchestration success
      // If no agents are available, we use PM Maya fallback (not fake "System" agent)
      
      // Helper: Get PM fallback agent for the project
      const getProjectPmFallback = async (projectId: string): Promise<Agent | null> => {
        const projectAgents = await storage.getAgentsByProject(projectId);
        
        // Find PM agent by role match (case-insensitive)
        const pmAgent = projectAgents.find(agent => {
          const roleLower = agent.role.toLowerCase();
          return roleLower.includes('product manager') || roleLower === 'pm';
        });
        
        if (pmAgent) {
          return {
            id: pmAgent.id,
            name: pmAgent.name,
            role: pmAgent.role,
            teamId: pmAgent.teamId
          };
        }
        
        // Fallback to first agent in project (if any)
        if (projectAgents.length > 0) {
          const firstAgent = projectAgents[0];
          return {
            id: firstAgent.id,
            name: firstAgent.name,
            role: firstAgent.role,
            teamId: firstAgent.teamId
          };
        }
        
        // Last resort: no agents at all
        return null;
      };
      
      let respondingAgent: Agent | null = null;
      let selectedAgents: Agent[] = [];
      let authority: { allowedSpeaker: Agent; reason: string } | null = null;
      let isPmFallback = false;
      let isSystemFallback = false;
      
      if (availableAgents.length === 0) {
        // Persistence invariant: Even with no agents, we must persist a response
        // Try to use PM Maya fallback instead of fake "System" agent
        const pmFallback = await getProjectPmFallback(projectId);
        
        if (pmFallback) {
          console.log('⚠️ No agents available in scope - using PM Maya fallback');
          respondingAgent = pmFallback;
          selectedAgents = [pmFallback];
          isPmFallback = true;
          // Phase 1.4: Explicit fallback classification
          // Fallback type will be attached to message metadata
        } else {
          // Last resort: project has zero agents total
          console.log('⚠️ No agents available at all - using system fallback (last resort)');
          isSystemFallback = true;
          // Phase 1.4: Explicit fallback classification
          // Fallback type will be attached to message metadata
        }
      } else {
        // Phase 1.1.b: Resolve speaking authority BEFORE any agent selection
        // Extract addressedAgentId from userMessage metadata if present
        const addressedAgentId = (userMessage as any).addressedAgentId || (userMessage as any).metadata?.addressedAgentId;
        
        try {
          // Phase 1.2: Use addressedAgentId from validated envelope (not from raw casting)
          const envelopeAddressedAgentId = addressedAgentId || 
            (userMessage as any).addressedAgentId || 
            (userMessage as any).metadata?.addressedAgentId;
          
          authority = resolveSpeakingAuthority({
            conversationScope: mode,
            conversationId,
            availableAgents,
            addressedAgentId: envelopeAddressedAgentId
          });

          // Phase 1.1.b: Enforce authority result - override all existing selection logic
          respondingAgent = authority.allowedSpeaker;
          selectedAgents = [authority.allowedSpeaker];
        } catch (error: any) {
          // Persistence invariant: If authority resolution fails, use PM fallback
          console.warn('⚠️ Authority resolution failed, using PM fallback:', error.message);
          const pmFallback = await getProjectPmFallback(projectId);
          
          if (pmFallback) {
            respondingAgent = pmFallback;
            selectedAgents = [pmFallback];
            isPmFallback = true;
            // Phase 1.4: Explicit fallback classification
            // Fallback type will be attached to message metadata
          } else {
            // Last resort: use first available agent or system
            respondingAgent = availableAgents[0] || null;
            selectedAgents = respondingAgent ? [respondingAgent] : [];
            isSystemFallback = !respondingAgent;
            // Phase 1.4: Explicit fallback classification
            // Fallback type will be attached to message metadata
          }
        }
      }
      
      // Phase 1.4: No fake "System agent" invariant
      // If system fallback is needed, agentId must be null, not 'system'
      // Only create a minimal agent object for internal use (not persisted with agentId='system')
      if (isSystemFallback && !respondingAgent) {
        // Internal use only - will be persisted with agentId=null
        respondingAgent = {
          id: 'system', // Internal ID only, not persisted
          name: 'System',
          role: 'System',
          teamId: undefined
        };
        selectedAgents = [respondingAgent];
      }
      
      // Type guard: respondingAgent must be set at this point
      if (!respondingAgent) {
        console.error('❌ Critical: respondingAgent is null after fallback logic');
        // This should never happen, but ensure we have a fallback
        // Internal use only - will be persisted with agentId=null
        respondingAgent = {
          id: 'system', // Internal ID only, not persisted
          name: 'System',
          role: 'System',
          teamId: undefined
        };
        selectedAgents = [respondingAgent];
        isSystemFallback = true;
      }

      // Dev-only logging
      if (process.env.NODE_ENV === 'development' || process.env.DEV) {
        const reason = authority ? authority.reason : (isPmFallback ? 'pm_fallback' : isSystemFallback ? 'system_fallback' : 'fallback_no_agents');
        console.log(
          `[Authority] scope=${mode} speaker=${respondingAgent.id} reason=${reason}`
        );
      }

      // Preserve existing expertise matching and multi-agent logic for future use
      // (They will be used after the first speaker speaks, in Phase 1.1.c+)
      // For now, we only enforce the first speaker
      
      // E1.1: Use intelligent agent selection based on expertise matching (preserved for future)
      const matches = findBestAgentMatch(userMessage.content, availableAgents);
      console.log('🎯 Expertise matches:', matches.map(m => ({ 
        name: m.agent.name, 
        role: m.agent.role, 
        confidence: m.confidence,
        reasoning: m.reasoning 
      })));
      
      // E2.1: Multi-agent response coordination for team dynamics (preserved for future)
      const analysis = analyzeQuestion(userMessage.content);
      const maxAgents = analysis.requiresMultipleAgents || analysis.complexity === 'high' ? 3 : 1;
      const potentialMultiAgents = coordinateMultiAgentResponse(userMessage.content, availableAgents, maxAgents);
      
      // E2.1: Log multi-agent selection for team dynamics (preserved for future)
      if (potentialMultiAgents.length > 1) {
        console.log('🤝 Multi-agent team potential:', potentialMultiAgents.map(a => `${a.name} (${a.role})`).join(', '));
      }
      
      console.log('🎯 Authority-enforced speaker:', respondingAgent.name, respondingAgent.role);
      console.log('🔍 Available agents:', availableAgents.map(a => ({ id: a.id, name: a.name, role: a.role })));

      console.log('🤖 Responding agent:', respondingAgent.name, respondingAgent.role);
      
      // B3: Get shared memory for the agent (skip if system fallback)
      const sharedMemory = (respondingAgent && !isSystemFallback && respondingAgent.id !== 'system')
        ? await storage.getSharedMemoryForAgent(respondingAgent.id, projectId)
        : '';
      console.log('🧠 Loading shared memory for agent:', sharedMemory ? 'Found context' : 'No prior context');

      // Create streaming response message shell
      const responseMessageId = `response-${Date.now()}`;
      let accumulatedContent = '';

      // B3: Extract and store conversation memory BEFORE generating response
      await extractAndStoreMemory(userMessage, { content: 'Processing...' }, conversationId, projectId);
      await extractUserName(userMessage.content, conversationId);

      // Load conversation history for context
      const recentMessages = await storage.getMessagesByConversation(conversationId);
      const conversationHistory = recentMessages.slice(-10).map(msg => ({
        role: msg.messageType === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content,
        timestamp: msg.createdAt?.toISOString() || new Date().toISOString(),
        senderId: msg.userId || msg.agentId || 'unknown',
        messageType: msg.messageType === 'system' ? 'agent' as const : msg.messageType as 'user' | 'agent'
      }));

      // Create chat context for AI
      const chatContext = {
        mode: mode as 'project' | 'team' | 'agent',
        projectName: project.name,
        teamName,
        agentRole: respondingAgent.role,
        conversationHistory,
        userId: userMessage.userId || 'user'
      };

      // Create AbortController for cancellation
      const abortController = new AbortController();
      
      // Handle cancellation messages
      const cancelHandler = (message: Buffer) => {
        const data = JSON.parse(message.toString());
        if (data.type === 'cancel_streaming' && data.messageId === responseMessageId) {
          console.log('🛑 Streaming cancelled by user');
          abortController.abort();
        }
      };
      ws.on('message', cancelHandler);

      try {
        // Notify streaming started right before actual streaming begins
        console.log('📡 Sending streaming_started event');
        ws.send(JSON.stringify({
          type: 'streaming_started',
          messageId: responseMessageId,
          agentId: respondingAgent ? respondingAgent.id : 'system',
          agentName: respondingAgent ? respondingAgent.name : 'System'
        }));

        // Persistence invariant: Handle no agents case with graceful fallback
        // Message persistence must not depend on agent availability or orchestration success
        if (isSystemFallback) {
          // Last resort: project has zero agents total
          console.log('📝 Generating system fallback response (no agents in project)');
          accumulatedContent = "I'm sorry, but there are no agents available to respond at this time. Please add agents to this project to enable responses.";
          
          // Send the fallback response as a single chunk
          ws.send(JSON.stringify({
            type: 'streaming_chunk',
            messageId: responseMessageId,
            chunk: accumulatedContent,
            accumulatedContent
          }));
        } else if (isPmFallback) {
          // PM Maya fallback - scope-specific messages
          console.log('📝 Generating PM Maya fallback response');
          
          if (mode === 'team') {
            accumulatedContent = "This team has no Hatches yet. Add one and I'll continue as the team lead once assigned.";
          } else if (mode === 'agent') {
            accumulatedContent = "That Hatch doesn't exist or isn't available in this project. Add it or switch back to Project chat.";
          } else {
            // Project scope (shouldn't happen, but handle gracefully)
            accumulatedContent = "I'm here to help! Let me know what you'd like to work on.";
          }
          
          // Send the fallback response as a single chunk
          ws.send(JSON.stringify({
            type: 'streaming_chunk',
            messageId: responseMessageId,
            chunk: accumulatedContent,
            accumulatedContent
          }));
        } else if (selectedAgents.length > 1) {
          // E2.1: Handle multi-agent responses for team dynamics
          console.log('🤝 Generating multi-agent team response...');
          await handleMultiAgentResponse(selectedAgents, userMessage, chatContext, sharedMemory, responseMessageId, conversationId, ws, abortController);
        } else if (respondingAgent && !isPmFallback && !isSystemFallback) {
          // Single agent response (existing logic)
          console.log('🔄 Generating single agent streaming response...');
          const streamGenerator = generateStreamingResponse(
            userMessage.content,
            respondingAgent.role,
            chatContext,
            sharedMemory,
            abortController.signal
          );

          for await (const chunk of streamGenerator) {
            if (abortController.signal.aborted) {
              console.log('🛑 Stream aborted');
              break;
            }
            
            accumulatedContent += chunk;
            console.log('📤 Sending chunk:', chunk.substring(0, 20) + '...');
            
            // Send chunk to client
            ws.send(JSON.stringify({
              type: 'streaming_chunk',
              messageId: responseMessageId,
              chunk,
              accumulatedContent
            }));
          }
        }

        // Persistence invariant: Always persist agent message, even if empty or fallback
        // This ensures symmetric persistence: user messages are always saved, agent messages must be too
        if (!abortController.signal.aborted) {
          // Save complete response to storage
          // Note: accumulatedContent may be empty or a fallback message, but it must be persisted
          // Phase 1.4: No fake "System agent" invariant
          // If system fallback: agentId=null, messageType='system'
          // If PM fallback: agentId=pmAgent.id, messageType='agent'
          const responseMessage: any = {
            id: responseMessageId,
            conversationId,
            // Invariant: Never persist agentId='system'. Use null for system fallback.
            agentId: isSystemFallback ? null : (respondingAgent && respondingAgent.id !== 'system' ? respondingAgent.id : null),
            senderName: respondingAgent ? respondingAgent.name : 'System',
            content: accumulatedContent || '', // Ensure content exists (empty string if needed)
            messageType: isSystemFallback ? 'system' as const : 'agent' as const,
          };
          
          // Phase 1.2: Production-safe no fake system agent assertion
          // Note: This is inside handleStreamingColleagueResponse, so we can't use sendWsError directly
          // But the assertion already handles production gracefully (logs warnings)
          try {
            assertPhase1Invariants({
              type: 'no_fake_system_agent',
              agentId: responseMessage.agentId,
              messageType: responseMessage.messageType,
            });
          } catch (err: any) {
            // In production, the assertion already logs warnings instead of throwing
            if (isProd) {
              console.warn("[INVARIANT] No fake system agent check failed (production-safe):", err.message);
              // Continue processing - message will still be persisted
            } else {
              throw err; // Dev/test: rethrow
            }
          }
          
          // Phase 1.4: Explicit fallback classification (invariant hardening)
          // Attach machine-readable fallback metadata to all messages
          if (isSystemFallback) {
            // True system fallback: project has zero agents
            responseMessage.metadata = {
              ...responseMessage.metadata,
              fallback: {
                type: 'system',
                reason: 'no_agents_in_project'
              },
              system_fallback_no_agents: true // Legacy flag (preserved for compatibility)
            };
          } else if (isPmFallback) {
            // PM Maya fallback: project has agents but none in scope, or authority failed
            const fallbackReason = availableAgents.length === 0 
              ? 'no_agents_in_scope' 
              : authority === null 
                ? 'authority_failed' 
                : 'no_agents_in_scope';
            
            responseMessage.metadata = {
              ...responseMessage.metadata,
              fallback: {
                type: 'pm',
                reason: fallbackReason
              }
            };
          }

          const savedResponse = await storage.createMessage(responseMessage);
          console.log('💾 Saved streaming response:', savedResponse.id, '(persistence invariant enforced)');
          
          // B3: Update stored memory with actual AI response
          await extractAndStoreMemory(userMessage, savedResponse, conversationId, projectId);
          
          // B4: Process personality evolution from this interaction
          // This happens automatically in the streaming generation now

          // Auto task extraction from conversation
          try {
            const { extractTasksFromMessage, extractTasksFallback } = await import('./ai/taskExtractor.js');
            
            // Get available agents for the project
            const projectAgents = await storage.getAgentsByProject(projectId);
            const availableAgents = projectAgents.map(agent => agent.role);
            
            const projectContext = {
              projectName: chatContext.projectName,
              teamName: chatContext.teamName,
              agentRole: respondingAgent.role,
              availableAgents
            };
            
            // Extract tasks from the conversation
            let taskResult = await extractTasksFromMessage(
              userMessage.content,
              accumulatedContent,
              projectContext
            );
            
            // Fallback to keyword matching if AI extraction fails
            if (!taskResult.hasTasks && taskResult.confidence < 0.5) {
              taskResult = extractTasksFallback(
                userMessage.content,
                accumulatedContent,
                availableAgents
              );
            }
            
            // If tasks were found, send them to the client for approval
            if (taskResult.hasTasks && taskResult.tasks.length > 0) {
              console.log('🎯 Found', taskResult.tasks.length, 'potential tasks from conversation');
              // Normalize suggestedAssignee to include agent id/name/role
              const agentsForProject = await storage.getAgentsByProject(projectId);
              const normalizedTasks = taskResult.tasks.map((t: any) => {
                let suggested = t.suggestedAssignee;
                if (typeof suggested === 'string') {
                  const match = agentsForProject.find(a => a.role === suggested);
                  if (match) {
                    return {
                      ...t,
                      suggestedAssignee: { id: match.id, name: match.name, role: match.role }
                    };
                  }
                }
                return t;
              });

              ws.send(JSON.stringify({
                type: 'task_suggestions',
                tasks: normalizedTasks,
                confidence: taskResult.confidence,
                conversationId,
                projectId
              }));
            }
          } catch (error) {
            console.error('Error extracting tasks from conversation:', error);
            // Don't fail the entire response if task extraction fails
          }

          // Notify streaming completed
          ws.send(JSON.stringify({
            type: 'streaming_completed',
            messageId: responseMessageId,
            message: savedResponse
          }));

          // Broadcast final message to other clients
          broadcastToConversation(conversationId, {
            type: 'new_message',
            message: savedResponse,
            conversationId
          });

          // Send real-time metrics update for AI agent response
          const conversationParts = conversationId.split('-');
          const contextType = conversationParts[0];
          const contextId = conversationParts.slice(1).join('-');
          
          broadcastToConversation(conversationId, {
            type: 'chat_message',
            projectId: contextType === 'project' ? contextId : undefined,
            teamId: contextType === 'team' ? contextId : undefined,
            agentId: savedResponse.agentId,
            conversationId,
            data: {
              content: accumulatedContent,
              senderId: savedResponse.agentId || 'agent',
              messageId: savedResponse.id
            },
            timestamp: new Date().toISOString()
          });
        }
      } finally {
        ws.off('message', cancelHandler);
      }

    } catch (error) {
      console.error('❌ Streaming response error:', error);
      ws.send(JSON.stringify({
        type: 'streaming_error',
        error: 'Failed to generate streaming response'
      }));
    }
  }

  // B3: Extract and store conversation memory from user messages
  async function extractAndStoreMemory(userMessage: any, agentResponse: any, conversationId: string, projectId: string) {
    try {
      const userContent = userMessage.content.toLowerCase();
      
      // Extract key decisions and important context
      if (userContent.includes('decide') || userContent.includes('decision') || userContent.includes('choose')) {
        await storage.addConversationMemory(
          conversationId,
          'decisions',
          `User decision: ${userMessage.content}`,
          8
        );
      }
      
      // Extract project requirements or specifications
      if (userContent.includes('requirement') || userContent.includes('spec') || userContent.includes('need')) {
        await storage.addConversationMemory(
          conversationId,
          'key_points',
          `Project requirement: ${userMessage.content}`,
          7
        );
      }
      
      // Extract goals and objectives
      if (userContent.includes('goal') || userContent.includes('objective') || userContent.includes('target')) {
        await storage.addConversationMemory(
          conversationId,
          'key_points',
          `Project goal: ${userMessage.content}`,
          9
        );
      }
      
      // Extract important agent insights from responses
      const agentContent = agentResponse.content.toLowerCase();
      if (agentContent.includes('recommend') || agentContent.includes('suggest') || agentContent.includes('propose')) {
        await storage.addConversationMemory(
          conversationId,
          'context',
          `Agent recommendation: ${agentResponse.content.substring(0, 200)}...`,
          6
        );
      }
      
      console.log('🧠 Memory extraction completed for conversation:', conversationId);
    } catch (error) {
      console.error('❌ Error extracting memory:', error);
    }
  }

  // Extract user name from messages
  async function extractUserName(content: string, conversationId: string) {
    try {
      const lowerContent = content.toLowerCase();
      
      // Look for "my name is [name]" patterns
      const namePatterns = [
        /my name is ([a-zA-Z]+)/i,
        /i am ([a-zA-Z]+)/i,
        /call me ([a-zA-Z]+)/i,
        /i'm ([a-zA-Z]+)/i
      ];
      
      for (const pattern of namePatterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
          const userName = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
          await storage.addConversationMemory(
            conversationId,
            'context',
            `User's name is ${userName}`,
            10 // Very high importance
          );
          console.log(`👤 User name extracted and stored: ${userName}`);
          break;
        }
      }
    } catch (error) {
      console.error('❌ Error extracting user name:', error);
    }
  }

  // AI colleague response handler
  async function handleColleagueResponse(userMessage: any, conversationId: string) {
    try {
      // Parse conversation context from conversationId
      const contextMatch = conversationId.match(/^(project|team|agent)-(.+?)(?:-(.+))?$/);
      if (!contextMatch) return;

      const [, mode, projectId, contextId] = contextMatch;
      
      // Get project details
      const project = await storage.getProject(projectId);
      if (!project) return;

      // Determine responding agent and context
      let respondingAgent;
      let teamName;
      
      if (mode === 'project') {
        // Project chat: Product Manager typically responds first
        const agents = await storage.getAgentsByProject(projectId);
        // FIXED: Filter by role instead of hardcoded ID
        const validAgents = agents.filter(agent => 
          agent.role === 'Product Manager'
        );
        
        respondingAgent = validAgents[0];
        console.log('🎯 Selected agent for project mode (regular handler):', respondingAgent?.name, respondingAgent?.role);
        console.log('🔍 Available agents (regular):', agents.map(a => ({ id: a.id, name: a.name, role: a.role })));
        console.log('🔍 Valid agents after filtering (regular):', validAgents.map(a => ({ id: a.id, name: a.name, role: a.role })));
      } else if (mode === 'team') {
        // Team chat: First agent in team responds
        const agents = await storage.getAgentsByTeam(contextId);
        respondingAgent = agents[0];
        const team = await storage.getTeam(contextId);
        teamName = team?.name;
        console.log('🎯 Selected agent for team mode (regular handler):', respondingAgent?.name, respondingAgent?.role);
      } else if (mode === 'agent') {
        // Agent chat: Specific agent responds
        respondingAgent = await storage.getAgent(contextId);
        console.log('🎯 Selected agent for agent mode (regular handler):', respondingAgent?.name, respondingAgent?.role);
      }

      if (!respondingAgent) return;

      // Show typing indicator and track response time
      const startTime = Date.now();
      broadcastToConversation(conversationId, {
        type: 'typing_started',
        agentId: respondingAgent.id,
        agentName: respondingAgent.name,
        estimatedDuration: 3000
      });

      // Get recent conversation history for context
      const recentMessages = await storage.getMessagesByConversation(conversationId);
      const conversationHistory = recentMessages.slice(-5).map(msg => ({
        role: msg.messageType === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content,
        timestamp: msg.createdAt?.toISOString() || new Date().toISOString(),
        senderId: msg.userId || msg.agentId || 'unknown',
        messageType: msg.messageType === 'system' ? 'agent' as const : msg.messageType as 'user' | 'agent'
      }));

      // Generate intelligent response using OpenAI
      const response = await generateIntelligentResponse(
        userMessage.content,
        respondingAgent.role,
        {
          mode: mode as 'project' | 'team' | 'agent',
          projectName: project.name,
          teamName,
          agentRole: respondingAgent.role,
          conversationHistory,
          userId: userMessage.userId || 'user' // Pass userId for behavior analysis
        }
      );

      // Stop typing indicator
      broadcastToConversation(conversationId, {
        type: 'typing_stopped',
        agentId: respondingAgent.id
      });

      // Create and save agent response
      const agentMessage = await storage.createMessage({
        conversationId,
        userId: null,
        agentId: respondingAgent.id,
        content: response.content,
        messageType: 'agent',
        metadata: {
          responseTime: Date.now() - startTime,
          personality: respondingAgent.personality?.communicationStyle || 'professional'
        }
      });

      // Broadcast agent response
      broadcastToConversation(conversationId, {
        type: 'new_message',
        message: {
          ...agentMessage,
          senderName: respondingAgent.name
        },
        conversationId
      });

      console.log(`AI Response from ${respondingAgent.name} (${respondingAgent.role}): ${response.content}`);

    } catch (error) {
      console.error('Failed to generate colleague response:', error);
      
      // Stop typing indicator on error
      broadcastToConversation(conversationId, {
        type: 'typing_stopped',
        agentId: 'unknown'
      });
    }
  }

  // Task Management Endpoints
  app.get("/api/tasks", async (req, res) => {
    try {
      const { projectId } = req.query;
      if (!projectId) {
        return res.status(400).json({ error: "Project ID is required" });
      }
      
      const tasks = await storage.getTasksByProject(projectId as string);
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // Auto task extraction endpoint
  app.post("/api/tasks/extract", async (req, res) => {
    try {
      const { userMessage, agentResponse, projectContext } = req.body;
      
      if (!userMessage || !agentResponse) {
        return res.status(400).json({ error: "User message and agent response are required" });
      }

      // Import task extractor
      const { extractTasksFromMessage, extractTasksFallback } = await import('./ai/taskExtractor.js');
      
      // Try AI extraction first
      let result = await extractTasksFromMessage(userMessage, agentResponse, projectContext);
      
      // Fallback to keyword matching if AI extraction fails
      if (!result.hasTasks && result.confidence < 0.5) {
        result = extractTasksFallback(userMessage, agentResponse, projectContext.availableAgents);
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error extracting tasks from conversation:', error);
      res.status(500).json({ error: "Failed to extract tasks" });
    }
  });

  // Task Suggestion Endpoints
  app.post("/api/task-suggestions/analyze", async (req, res) => {
    try {
      const { conversationId, projectId, teamId, agentId } = req.body;
      
      // Get conversation messages
      const messages = await storage.getMessagesByConversation(conversationId);
      if (!messages || messages.length === 0) {
        return res.json({ suggestions: [] });
      }

      // Check if we should analyze this conversation
      const shouldAnalyze = await TaskDetectionAI.shouldAnalyzeConversation(messages);
      if (!shouldAnalyze) {
        return res.json({ suggestions: [] });
      }

      // Get available agents for the project
      const agents = await storage.getAgents();
      const projectAgents = agents.filter(agent => 
        agent.projectId === projectId || 
        (teamId && agent.teamId === teamId)
      );

      // Create conversation context with proper role mapping
      const context: ConversationContext = {
        messages: messages.map(msg => {
          // Map messageType to role correctly
          let role: 'user' | 'assistant' | 'system' = 'assistant';
          if (msg.messageType === 'user') {
            role = 'user';
          } else if (msg.messageType === 'assistant') {
            role = 'assistant';
          }
          
          console.log('🔍 Message mapping:', { 
            messageType: msg.messageType, 
            role, 
            content: msg.content.substring(0, 50) + '...' 
          });
          
          return {
            role,
            content: msg.content,
            timestamp: new Date(msg.createdAt)
          };
        }),
        projectId,
        teamId,
        agentId,
        availableAgents: projectAgents.map(agent => ({
          id: agent.id,
          name: agent.name,
          role: agent.role,
          expertise: agent.expertise || []
        }))
      };

      // Analyze conversation for task suggestions
      const suggestions = await TaskDetectionAI.analyzeConversationForTasks(context);
      
      res.json({ suggestions });
    } catch (error) {
      console.error('Error analyzing conversation for tasks:', error);
      res.status(500).json({ error: "Failed to analyze conversation for tasks" });
    }
  });

  app.post("/api/task-suggestions/approve", async (req, res) => {
    try {
      const { approvedTasks, projectId } = req.body;
      
      // Create tasks in the database
      const createdTasks = [];
      for (const task of approvedTasks) {
        let assigneeId = task?.suggestedAssignee?.id;
        // Fallback: if only role string provided, resolve to an agent id in this project
        if (!assigneeId && typeof task?.suggestedAssignee === 'string') {
          const agents = await storage.getAgentsByProject(projectId);
          const match = agents.find(a => a.role === task.suggestedAssignee);
          assigneeId = match?.id;
        }

        const newTask = {
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: 'pending',
          assigneeId: assigneeId || null,
          projectId: projectId,
          category: task.category,
          estimatedEffort: task.estimatedEffort,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Store task (you'll need to implement this in storage.ts)
        await storage.createTask(newTask);
        createdTasks.push(newTask);
      }

      // Broadcast task creation to all connected clients
      if (wss) {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'task_created',
              data: { tasks: createdTasks, projectId }
            }));
          }
        });
      }

      res.json({ 
        success: true, 
        createdTasks,
        message: `Successfully created ${createdTasks.length} tasks` 
      });
    } catch (error) {
      console.error('Error creating approved tasks:', error);
      res.status(500).json({ error: "Failed to create approved tasks" });
    }
  });

  return httpServer;
}
