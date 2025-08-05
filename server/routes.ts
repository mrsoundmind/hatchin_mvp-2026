import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertProjectSchema, insertTeamSchema, insertAgentSchema, insertMessageSchema, insertConversationSchema } from "@shared/schema";
import { z } from "zod";
import { generateIntelligentResponse } from "./ai/openaiService.js";
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

  app.get("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversation(req.params.conversationId);
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
