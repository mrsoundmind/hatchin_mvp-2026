import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertTeamSchema, insertAgentSchema, insertMessageSchema } from "@shared/schema";
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
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
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

  // Messages
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.get("/api/projects/:projectId/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByProject(req.params.projectId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project messages" });
    }
  });

  app.get("/api/teams/:teamId/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByTeam(req.params.teamId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team messages" });
    }
  });

  app.get("/api/agents/:hatchId/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByHatch(req.params.hatchId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hatch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      
      // Generate AI response based on chat type and context
      if (validatedData.type === 'user') {
        setTimeout(async () => {
          try {
            const aiResponse = await generateAIResponse(message, validatedData);
            await storage.createMessage(aiResponse);
          } catch (error) {
            console.error('Failed to generate AI response:', error);
          }
        }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
      }
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid message data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// AI Response Generation based on chat logic from documentation
async function generateAIResponse(userMessage: any, context: any) {
  const { projectId, teamId, hatchId, content } = context;
  
  // Determine response type based on context
  if (hatchId) {
    // 1:1 Hatch conversation - single agent response
    const agent = await storage.getAgent(hatchId);
    if (!agent) throw new Error('Agent not found');
    
    return {
      type: 'hatch' as const,
      author: agent.name,
      hatchId: agent.id,
      teamId: agent.teamId,
      projectId,
      content: generateHatchResponse(agent, content),
      metadata: {
        personality: getHatchPersonality(agent),
        isSystemGenerated: true,
      }
    };
  } else if (teamId) {
    // Team conversation - team members collaborate
    const teamAgents = await storage.getAgentsByTeam(teamId);
    const primaryAgent = teamAgents[0]; // Primary responder
    
    if (!primaryAgent) throw new Error('No team members found');
    
    return {
      type: 'hatch' as const,
      author: primaryAgent.name,
      hatchId: primaryAgent.id,
      teamId,
      projectId,
      content: generateTeamResponse(teamAgents, content),
      metadata: {
        personality: getHatchPersonality(primaryAgent),
        isSystemGenerated: true,
      }
    };
  } else {
    // Project conversation - multiple agents may respond
    const projectAgents = await storage.getAgentsByProject(projectId);
    const relevantAgent = selectMostRelevantAgent(projectAgents, content);
    
    if (!relevantAgent) throw new Error('No project agents found');
    
    return {
      type: 'hatch' as const,
      author: relevantAgent.name,
      hatchId: relevantAgent.id,
      teamId: relevantAgent.teamId,
      projectId,
      content: generateProjectResponse(relevantAgent, projectAgents, content),
      metadata: {
        personality: getHatchPersonality(relevantAgent),
        isSystemGenerated: true,
      }
    };
  }
}

function generateHatchResponse(agent: any, userContent: string): string {
  const responses = {
    'Product Designer': [
      `Great question! From a design perspective, I'd suggest we focus on user experience first. Let me break down some key considerations...`,
      `I love this direction! As we think about the design, here are some principles that could guide us...`,
      `This is exciting! Let me share some design insights that could help shape this idea...`
    ],
    'Product Manager': [
      `This aligns perfectly with our product strategy! Let me help you think through the roadmap and priorities...`,
      `Great thinking! From a product standpoint, I'd recommend we consider these key factors...`,
      `I can help coordinate this across our teams. Here's how I see this fitting into our overall vision...`
    ],
    'Backend Developer': [
      `From a technical perspective, this is definitely achievable. Let me outline the architecture we'd need...`,
      `Good thinking! On the backend side, we'll need to consider scalability and data structure...`,
      `I can build this! Here's my technical approach and what we'll need to implement...`
    ],
    'QA Lead': [
      `This sounds promising! From a quality assurance perspective, here are the testing considerations...`,
      `I'll help ensure this is rock-solid. Let me think through the testing strategy and edge cases...`,
      `Great idea! As we develop this, here are the quality checkpoints we should establish...`
    ]
  };
  
  const roleResponses = responses[agent.role] || responses['Product Manager'];
  return roleResponses[Math.floor(Math.random() * roleResponses.length)];
}

function generateTeamResponse(teamAgents: any[], userContent: string): string {
  return `Thanks for bringing this to the team! We'll coordinate on this and get back to you with a comprehensive plan. Each team member will contribute their expertise to make sure we cover all the bases.`;
}

function generateProjectResponse(agent: any, allAgents: any[], userContent: string): string {
  return `I'll help coordinate this across our project teams. This touches on several areas, so I'll make sure we get input from the right teammates to give you a complete response.`;
}

function selectMostRelevantAgent(agents: any[], content: string): any {
  // Simple relevance logic - could be enhanced with keyword matching
  if (content.toLowerCase().includes('design') || content.toLowerCase().includes('ui')) {
    return agents.find(a => a.role.includes('Designer')) || agents[0];
  }
  if (content.toLowerCase().includes('technical') || content.toLowerCase().includes('backend')) {
    return agents.find(a => a.role.includes('Developer')) || agents[0];
  }
  if (content.toLowerCase().includes('test') || content.toLowerCase().includes('quality')) {
    return agents.find(a => a.role.includes('QA')) || agents[0];
  }
  return agents.find(a => a.role.includes('Manager')) || agents[0];
}

function getHatchPersonality(agent: any) {
  const personalities = {
    'Product Designer': { traits: ['creative', 'user-focused', 'visual'], style: 'enthusiastic' },
    'Product Manager': { traits: ['strategic', 'coordinating', 'goal-oriented'], style: 'collaborative' },
    'Backend Developer': { traits: ['technical', 'systematic', 'detail-oriented'], style: 'analytical' },
    'QA Lead': { traits: ['thorough', 'quality-focused', 'methodical'], style: 'systematic' }
  };
  
  return personalities[agent.role] || personalities['Product Manager'];
}
