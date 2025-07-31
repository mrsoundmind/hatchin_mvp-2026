import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertProjectSchema, insertTeamSchema, insertAgentSchema, insertMessageSchema, insertConversationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Alternative route for messages by conversationId (for easier API usage)
  app.get("/api/messages/:conversationId", async (req, res) => {
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

  // Test endpoint for message storage validation
  app.post("/api/test/chat-storage", async (req, res) => {
    try {
      // Test conversation creation
      const testConversation = await storage.createConversation({
        projectId: "saas-startup",
        teamId: null,
        agentId: null,
        type: "project",
        title: "Test Project Chat"
      });

      // Test message creation
      const testMessage = await storage.createMessage({
        conversationId: testConversation.id,
        userId: null,
        agentId: "product-designer",
        content: "Hello! This is a test message from storage validation.",
        messageType: "agent",
        metadata: {
          isStreaming: false,
          personality: "friendly"
        }
      });

      // Test message retrieval
      const messages = await storage.getMessagesByConversation(testConversation.id);

      res.json({
        success: true,
        testResults: {
          conversationCreated: testConversation,
          messageCreated: testMessage,
          messagesRetrieved: messages,
          messageCount: messages.length
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Storage test failed", details: error });
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

  return httpServer;
}
