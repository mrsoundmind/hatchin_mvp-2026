import { Send } from "lucide-react";
import { useState, useEffect } from "react";
import type { Project, Team, Agent } from "@shared/schema";

type ChatMode = 'project' | 'team' | 'agent';

interface ChatContext {
  mode: ChatMode;
  participantIds: string[];
  conversationId: string;
  projectId: string;
}

interface CenterPanelProps {
  activeProject: Project | undefined;
  activeProjectTeams: Team[];
  activeProjectAgents: Agent[];
  activeTeamId: string | null;
  activeAgentId: string | null;
}

export function CenterPanel({
  activeProject,
  activeProjectTeams,
  activeProjectAgents,
  activeTeamId,
  activeAgentId,
}: CenterPanelProps) {
  // === SUBTASK 2.1.1: Core State Integration ===
  
  // Chat mode state management
  const [chatMode, setChatMode] = useState<ChatMode>('project');
  const [currentChatContext, setCurrentChatContext] = useState<ChatContext | null>(null);
  
  // useEffect to listen to activeProjectId, activeTeamId, activeAgentId changes
  useEffect(() => {
    if (!activeProject) {
      setCurrentChatContext(null);
      return;
    }

    // Implement chatMode derivation logic based on sidebar selections
    let newMode: ChatMode;
    let participantIds: string[];
    let conversationId: string;
    
    if (activeAgentId) {
      // Agent mode: Talk to specific agent (1-on-1)
      newMode = 'agent';
      participantIds = [activeAgentId];
      conversationId = `agent-${activeProject.id}-${activeAgentId}`;
    } else if (activeTeamId) {
      // Team mode: Talk to all agents under specific team
      newMode = 'team';
      participantIds = activeProjectAgents
        .filter(agent => agent.teamId === activeTeamId)
        .map(agent => agent.id);
      conversationId = `team-${activeProject.id}-${activeTeamId}`;
    } else {
      // Project mode: Talk to all teams and agents under project
      newMode = 'project';
      participantIds = activeProjectAgents.map(agent => agent.id);
      conversationId = `project-${activeProject.id}`;
    }

    // Update chat mode and context
    setChatMode(newMode);
    setCurrentChatContext({
      mode: newMode,
      participantIds,
      conversationId,
      projectId: activeProject.id
    });

    // Debug logging for development
    console.log('Chat context updated:', {
      mode: newMode,
      participants: participantIds.length,
      conversationId,
      projectId: activeProject.id
    });

  }, [activeProject?.id, activeTeamId, activeAgentId, activeProjectAgents]);

  // === END SUBTASK 2.1.1 ===

  // === SUBTASK 2.1.2: Context Calculation Logic ===
  
  // Get participants for current chat context
  const getCurrentChatParticipants = (): Agent[] => {
    if (!activeProject || !currentChatContext) return [];
    
    switch (currentChatContext.mode) {
      case 'project':
        // Project mode: Return all agents under activeProject
        return activeProjectAgents;
      
      case 'team':
        // Team mode: Return all agents under activeTeam
        return activeProjectAgents.filter(agent => agent.teamId === activeTeamId);
      
      case 'agent':
        // Agent mode: Return single activeAgent
        return activeProjectAgents.filter(agent => agent.id === activeAgentId);
      
      default:
        return [];
    }
  };

  // Get shared project memory context
  const getSharedProjectMemory = () => {
    if (!activeProject) return null;
    
    return {
      projectId: activeProject.id,
      projectName: activeProject.name,
      projectGoal: activeProject.description || '',
      teams: activeProjectTeams,
      agents: activeProjectAgents,
      // All participants share this memory regardless of chat mode
      sharedContext: `Project: ${activeProject.name}`,
      memoryScope: 'project-wide' // Same memory for all team/agent chats
    };
  };

  // Generate conversation ID based on chat context (already implemented in useEffect)
  const generateConversationId = (mode: ChatMode, projectId: string, contextId?: string): string => {
    switch (mode) {
      case 'project':
        return `project-${projectId}`;
      case 'team':
        return `team-${projectId}-${contextId}`;
      case 'agent':
        return `agent-${projectId}-${contextId}`;
      default:
        return `project-${projectId}`;
    }
  };

  // === END SUBTASK 2.1.2 ===

  // === SUBTASK 2.1.3: Automatic Mode Switching ===
  
  // Get chat context display information
  const getChatContextDisplay = () => {
    if (!currentChatContext) return { title: 'Loading...', subtitle: '', participants: [] };
    
    const participants = getCurrentChatParticipants();
    
    switch (currentChatContext.mode) {
      case 'project':
        return {
          title: `${activeProject?.name}`,
          subtitle: `Project Chat • ${activeProjectTeams.length} teams`,
          participants,
          placeholder: `Message all teams in ${activeProject?.name}...`,
          welcomeTitle: 'Talk to your entire project team',
          welcomeSubtitle: 'Get insights and coordination across all teams and roles.',
          welcomeIcon: '🚀'
        };
      
      case 'team':
        const activeTeam = activeProjectTeams.find(t => t.id === activeTeamId);
        return {
          title: `${activeTeam?.name}`,
          subtitle: `Team Chat • ${participants.length} Colleagues`,
          participants,
          placeholder: `Message ${activeTeam?.name} team...`,
          welcomeTitle: `Collaborate with ${activeTeam?.name}`,
          welcomeSubtitle: 'Focus on team-specific goals and coordination.',
          welcomeIcon: activeTeam?.emoji || '👥'
        };
      
      case 'agent':
        const activeAgent = activeProjectAgents.find(a => a.id === activeAgentId);
        return {
          title: `${activeAgent?.name}`,
          subtitle: `1-on-1 Chat • ${activeAgent?.role}`,
          participants,
          placeholder: `Message ${activeAgent?.name}...`,
          welcomeTitle: `Chat with ${activeAgent?.name}`,
          welcomeSubtitle: `Get specialized help with ${activeAgent?.role.toLowerCase()} tasks.`,
          welcomeIcon: '🤖'
        };
      
      default:
        return {
          title: 'Loading...',
          subtitle: '',
          participants: [],
          placeholder: 'Loading...',
          welcomeTitle: 'Loading...',
          welcomeSubtitle: '',
          welcomeIcon: '⏳'
        };
    }
  };

  const contextDisplay = getChatContextDisplay();

  // === END SUBTASK 2.1.3 ===

  // === SUBTASK 2.1.4: Memory Architecture Setup ===
  
  // Get memory context for current chat
  const getCurrentMemoryContext = () => {
    const sharedMemory = getSharedProjectMemory();
    if (!sharedMemory || !currentChatContext) return null;

    return {
      ...sharedMemory,
      // Chat-specific context
      currentMode: currentChatContext.mode,
      conversationId: currentChatContext.conversationId,
      activeParticipants: getCurrentChatParticipants(),
      // Memory scope - all participants share the same project memory
      memoryAccess: {
        canRead: sharedMemory.projectId ? true : false,
        canWrite: sharedMemory.projectId ? true : false,
        scope: 'project-wide'
      }
    };
  };

  // Connect chat context to memory system
  const chatMemoryContext = getCurrentMemoryContext();

  // Memory persistence check
  const isMemoryContextValid = () => {
    return chatMemoryContext && 
           chatMemoryContext.projectId && 
           chatMemoryContext.activeParticipants.length > 0;
  };

  // === END SUBTASK 2.1.4 ===

  // === TASK 2.3: Message Context Filtering & Participant Logic ===
  
  // Filter messages by current chat context
  const getFilteredMessages = () => {
    if (!currentChatContext) return [];
    
    // For now, return empty array - will be populated with actual messages from storage
    // Messages will be filtered by conversationId which already encodes the context
    const conversationId = currentChatContext.conversationId;
    
    // Future implementation will fetch from storage:
    // return messages.filter(msg => msg.conversationId === conversationId);
    return [];
  };

  // Message routing logic - determines who receives the message
  const getMessageRecipients = () => {
    if (!currentChatContext) return {
      type: 'unknown',
      recipients: [],
      scope: '',
      conversationId: ''
    };
    
    const participants = getCurrentChatParticipants();
    
    switch (currentChatContext.mode) {
      case 'project':
        // Project chat: message goes to all teams and agents under project
        return {
          type: 'project',
          recipients: participants,
          scope: `All ${activeProjectTeams.length} teams in ${activeProject?.name}`,
          conversationId: currentChatContext.conversationId
        };
      
      case 'team':
        // Team chat: message goes to all agents under specific team
        const activeTeam = activeProjectTeams.find(t => t.id === activeTeamId);
        return {
          type: 'team',
          recipients: participants,
          scope: `${activeTeam?.name} team (${participants.length} colleagues)`,
          conversationId: currentChatContext.conversationId
        };
      
      case 'agent':
        // Agent chat: message goes to specific agent only
        const activeAgent = activeProjectAgents.find(a => a.id === activeAgentId);
        return {
          type: 'agent',
          recipients: participants,
          scope: `1-on-1 with ${activeAgent?.name}`,
          conversationId: currentChatContext.conversationId
        };
      
      default:
        return { type: 'unknown', recipients: [], scope: '', conversationId: '' };
    }
  };

  // Conversation switching logic when context changes
  const handleConversationSwitch = (newContext: typeof currentChatContext) => {
    if (!newContext) return;
    
    // Save current conversation state if needed
    const currentMessages = getFilteredMessages();
    
    // Switch to new conversation
    const newConversationId = newContext.conversationId;
    const recipients = getMessageRecipients();
    
    console.log('Conversation switched:', {
      from: currentChatContext?.conversationId,
      to: newConversationId,
      mode: newContext.mode,
      recipients: recipients.scope,
      sharedMemory: chatMemoryContext?.memoryAccess?.scope
    });
    
    // Future: Load messages for new conversation from storage
    // loadMessagesForConversation(newConversationId);
  };

  // Memory context validation for message routing
  const validateMessageContext = () => {
    const recipients = getMessageRecipients();
    const memoryContext = getCurrentMemoryContext();
    
    return {
      canSendMessage: recipients.recipients.length > 0 && (memoryContext?.memoryAccess?.canWrite ?? false),
      messageScope: recipients.scope,
      memoryScope: memoryContext?.memoryAccess?.scope ?? 'unknown',
      participantCount: recipients.recipients.length
    };
  };

  // === END TASK 2.3 ===

  const handleActionClick = (action: string) => {
    console.log('Action triggered:', action);
    
    if (action.includes('generateRoadmap')) {
      console.log('🤖 Product Manager: Let me create a comprehensive roadmap for your SaaS startup...');
    } else if (action.includes('setGoals')) {
      console.log('🤖 Team Lead: I\'ll help you define SMART goals for each team...');
    } else if (action.includes('summarizeTasks')) {
      console.log('🤖 Project Coordinator: Here\'s a summary of current tasks for each team...');
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('message') as HTMLInputElement;
    
    if (input.value.trim()) {
      const messageContext = validateMessageContext();
      const recipients = getMessageRecipients();
      
      if (messageContext.canSendMessage) {
        // Enhanced message with full context and routing
        console.log('Message sent with full context:', {
          message: input.value,
          conversationId: currentChatContext?.conversationId,
          mode: currentChatContext?.mode,
          routing: {
            type: recipients.type,
            scope: recipients.scope,
            participantCount: recipients.recipients.length,
            recipients: recipients.recipients.map((p: any) => p.name)
          },
          memory: {
            projectMemory: chatMemoryContext?.sharedContext,
            memoryScope: chatMemoryContext?.memoryAccess?.scope,
            canWrite: chatMemoryContext?.memoryAccess?.canWrite
          },
          timestamp: new Date().toISOString()
        });
        
        // Future: Save message to storage with proper routing
        // await saveMessage({
        //   content: input.value,
        //   conversationId: recipients.conversationId,
        //   senderId: 'user',
        //   recipients: recipients.recipients.map(p => p.id),
        //   messageType: recipients.type,
        //   projectMemoryId: chatMemoryContext?.projectId
        // });
        
        input.value = '';
      } else {
        console.warn('Cannot send message - invalid context or permissions');
      }
    }
  };

  if (!activeProject) {
    return (
      <main className="flex-1 hatchin-bg-panel rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🐣</div>
          <h2 className="text-2xl font-semibold mb-4 hatchin-text">Welcome to Hatchin</h2>
          <p className="hatchin-text-muted">
            Build AI teammates that understand your goals and help you achieve them.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 hatchin-bg-panel rounded-2xl flex flex-col">
      {/* Enhanced Chat Header */}
      <div className="px-6 py-4 hatchin-border border-b">
        {/* Main Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold hatchin-text text-lg">
              {contextDisplay.title}
            </h1>
          </div>
          <button className="hatchin-bg-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 12h8"/>
              <path d="M12 8v8"/>
            </svg>
            Add Hatch
          </button>
        </div>
        
        {/* Subtitle and Participants Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <span className="hatchin-text-muted text-sm font-medium">
            {contextDisplay.subtitle}
          </span>
          
          {/* Project Mode: Show Teams */}
          {currentChatContext?.mode === 'project' && activeProjectTeams.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              {activeProjectTeams.map(team => {
                const teamAgentCount = activeProjectAgents.filter(a => a.teamId === team.id).length;
                return (
                  <div key={team.id} className="flex items-center gap-1.5 hatchin-text text-sm bg-hatchin-bg-card px-2 py-1 rounded-md">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-hatchin-text-muted">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span>{team.name}</span>
                    <span className="text-hatchin-text-muted">({teamAgentCount})</span>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Team Mode: Show Agents */}
          {currentChatContext?.mode === 'team' && contextDisplay.participants.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              {contextDisplay.participants.map(agent => (
                <div key={agent.id} className="flex items-center gap-1.5 hatchin-text text-sm bg-hatchin-bg-card px-2 py-1 rounded-md">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-hatchin-text-muted">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>{agent.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Dynamic Welcome Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-lg">
          
          
          <div className="text-[36px] mt-[0px] mb-[0px]">{contextDisplay.welcomeIcon}</div>
          
          <h2 className="font-semibold hatchin-text mt-[2px] mb-[2px] text-[16px]">{contextDisplay.welcomeTitle}</h2>
          <p className="hatchin-text-muted text-[14px] mt-[0px] mb-[0px]">
            {contextDisplay.welcomeSubtitle}
          </p>
          
          <div className="flex flex-wrap gap-3 justify-center pt-[11px] pb-[11px]">
            <button 
              onClick={() => handleActionClick('generateRoadmap')}
              className="hatchin-bg-card hover:bg-hatchin-border hatchin-text px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Give me a product roadmap
            </button>
            <button 
              onClick={() => handleActionClick('setGoals')}
              className="hatchin-bg-card hover:bg-hatchin-border hatchin-text px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Set team goals
            </button>
            <button 
              onClick={() => handleActionClick('summarizeTasks')}
              className="hatchin-bg-card hover:bg-hatchin-border hatchin-text px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Summarize each team's task
            </button>
          </div>
        </div>
      </div>
      {/* Chat Input */}
      <div className="p-6 hatchin-border border-t">
        <form onSubmit={handleChatSubmit} className="relative">
          <input 
            name="message"
            type="text" 
            placeholder={contextDisplay.placeholder}
            className="w-full hatchin-bg-card hatchin-border border rounded-lg px-4 py-3 text-sm hatchin-text placeholder-hatchin-text-muted focus:outline-none focus:ring-2 focus:ring-hatchin-blue focus:border-transparent"
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 hatchin-blue hover:text-opacity-80 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </main>
  );
}
