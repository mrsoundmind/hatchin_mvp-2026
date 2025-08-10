import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertProjectSchema, insertTeamSchema, insertAgentSchema, insertMessageSchema, insertConversationSchema } from "@shared/schema";
import { z } from "zod";
import { generateIntelligentResponse, generateStreamingResponse } from "./ai/openaiService.js";
import { personalityEngine } from "./ai/personalityEvolution.js";
import { trainingSystem } from "./ai/trainingSystem.js";
import { initializePreTrainedColleagues, devTrainingTools } from "./ai/devTrainingTools.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize pre-trained AI colleagues on server start
  initializePreTrainedColleagues();
  
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

  const httpServer = createServer(app);

  // WebSocket Server Setup
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });

  // Store active connections by conversation ID
  const activeConnections = new Map<string, Set<WebSocket>>();

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
            // B1.1: Handle streaming message requests
            const messageId = `msg-${Date.now()}`;
            const streamingData = data.message;
            
            // Save initial user message 
            const userMessageData = insertMessageSchema.parse(streamingData);
            const savedUserMessage = await storage.createMessage(userMessageData);
            console.log('💾 User message saved:', savedUserMessage.id);
            
            // Broadcast user message immediately
            broadcastToConversation(data.conversationId, {
              type: 'new_message',
              message: savedUserMessage,
              conversationId: data.conversationId
            });
            
            // Send real-time metrics update - extract project/team context from conversation
            const conversationParts = data.conversationId.split('-');
            const contextType = conversationParts[0]; // 'project', 'team', or 'agent'
            const contextId = conversationParts.slice(1).join('-');
            
            broadcastToConversation(data.conversationId, {
              type: 'chat_message',
              projectId: contextType === 'project' ? contextId : undefined,
              teamId: contextType === 'team' ? contextId : undefined,
              agentId: savedUserMessage.agentId,
              conversationId: data.conversationId,
              data: {
                content: savedUserMessage.content,
                senderId: savedUserMessage.agentId || savedUserMessage.userId || 'user',
                messageId: savedUserMessage.id
              },
              timestamp: new Date().toISOString()
            });

            // Start streaming AI response
            console.log('🚀 Starting streaming response...');
            try {
              await handleStreamingColleagueResponse(savedUserMessage, data.conversationId, ws);
            } catch (error) {
              console.error('❌ Streaming response error:', error);
              ws.send(JSON.stringify({
                type: 'streaming_error',
                messageId,
                error: 'Failed to generate response'
              }));
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
            if (savedMessage.messageType === 'user' && savedMessage.content) {
              await handleColleagueResponse(savedMessage, data.conversationId);
            }
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
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format or processing error'
        }));
      }
    });

    ws.on('close', () => {
      // Remove this connection from all conversation rooms
      activeConnections.forEach((connections, conversationId) => {
        connections.delete(ws);
        if (connections.size === 0) {
          activeConnections.delete(conversationId);
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

  // B1.1 & B1.2: Streaming AI colleague response handler
  async function handleStreamingColleagueResponse(userMessage: any, conversationId: string, ws: WebSocket) {
    console.log('🎯 Starting streaming handler for:', conversationId);
    try {
      // Parse conversation ID formats:
      // project-saas-startup -> mode=project, projectId=saas-startup
      // team-saas-startup-design-team -> mode=team, projectId=saas-startup, teamId=design-team
      // agent-saas-startup-product-manager -> mode=agent, projectId=saas-startup, agentId=product-manager
      
      const parts = conversationId.split('-');
      if (parts.length < 2) {
        console.log('❌ Invalid conversation ID format:', conversationId);
        return;
      }
      
      const mode = parts[0] as 'project' | 'team' | 'agent';
      let projectId: string;
      let contextId: string | undefined;
      
      if (mode === 'project') {
        projectId = parts.slice(1).join('-');
      } else if (mode === 'team') {
        // team-saas-startup-design-team: projectId=saas-startup, teamId=design-team  
        projectId = parts[1] + '-' + parts[2]; // saas-startup
        contextId = parts.slice(3).join('-'); // design-team
      } else if (mode === 'agent') {
        // agent-saas-startup-product-manager: projectId=saas-startup, agentId=product-manager
        projectId = parts[1] + '-' + parts[2]; // saas-startup
        contextId = parts.slice(3).join('-'); // product-manager
      } else {
        projectId = parts.slice(1).join('-');
      }
      
      console.log('🔍 Parsed conversation:', { mode, projectId, contextId });
      const project = await storage.getProject(projectId);
      if (!project) {
        console.log('❌ Project not found:', projectId);
        return;
      }

      let respondingAgent;
      let teamName;
      
      if (mode === 'project') {
        const agents = await storage.getAgentsByProject(projectId);
        respondingAgent = agents.find(a => a.role.toLowerCase().includes('manager')) || agents[0];
      } else if (mode === 'team' && contextId) {
        // For team mode: get agents from the specific team
        const agents = await storage.getAgentsByTeam(contextId);
        respondingAgent = agents[0]; // First agent in team responds
        const team = await storage.getTeam(contextId);
        teamName = team?.name;
      } else if (mode === 'agent' && contextId) {
        // For agent mode: get the specific agent by ID
        respondingAgent = await storage.getAgent(contextId);
      } else {
        // Fallback to project agents
        const agents = await storage.getAgentsByProject(projectId);
        respondingAgent = agents[0];
      }

      if (!respondingAgent) {
        console.log('❌ No responding agent found for mode:', mode);
        return;
      }

      console.log('🤖 Responding agent:', respondingAgent.name, respondingAgent.role);
      
      // B3: Get shared memory for the agent
      const sharedMemory = await storage.getSharedMemoryForAgent(respondingAgent.id, projectId);
      console.log('🧠 Loading shared memory for agent:', sharedMemory ? 'Found context' : 'No prior context');

      // Create streaming response message shell
      const responseMessageId = `response-${Date.now()}`;
      let accumulatedContent = '';

      // Notify streaming started
      console.log('📡 Sending streaming_started event');
      ws.send(JSON.stringify({
        type: 'streaming_started',
        messageId: responseMessageId,
        agentId: respondingAgent.id,
        agentName: respondingAgent.name
      }));

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
        // Generate streaming response
        console.log('🔄 Generating streaming response...');
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

        if (!abortController.signal.aborted) {
          // Save complete response to storage
          const responseMessage = {
            id: responseMessageId,
            conversationId,
            agentId: respondingAgent.id,
            senderName: respondingAgent.name,
            content: accumulatedContent,
            messageType: 'agent' as const,
          };

          const savedResponse = await storage.createMessage(responseMessage);
          console.log('💾 Saved streaming response:', savedResponse.id);
          
          // B3: Update stored memory with actual AI response
          await extractAndStoreMemory(userMessage, savedResponse, conversationId, projectId);
          
          // B4: Process personality evolution from this interaction
          // This happens automatically in the streaming generation now

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
        respondingAgent = agents.find(a => a.role.toLowerCase().includes('manager')) || agents[0];
      } else if (mode === 'team') {
        // Team chat: First agent in team responds
        const agents = await storage.getAgentsByTeam(contextId);
        respondingAgent = agents[0];
        const team = await storage.getTeam(contextId);
        teamName = team?.name;
      } else if (mode === 'agent') {
        // Agent chat: Specific agent responds
        respondingAgent = await storage.getAgent(contextId);
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

  return httpServer;
}
