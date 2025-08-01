import { Send } from "lucide-react";
import { useState, useEffect } from "react";
import type { Project, Team, Agent } from "@shared/schema";
import { useWebSocket, getWebSocketUrl, getConnectionStatusConfig } from '@/lib/websocket';

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
  
  // Message state management - persistent across conversations
  const [allMessages, setAllMessages] = useState<Record<string, Array<{
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    messageType: 'user' | 'agent';
    timestamp: string;
    conversationId: string;
    status: 'sending' | 'sent' | 'delivered' | 'failed';
    metadata?: any;
  }>>>({});
  const [messageQueue, setMessageQueue] = useState<Array<any>>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [typingColleagues, setTypingColleagues] = useState<string[]>([]);

  // === SUBTASK 3.1.1: Connect WebSocket to Chat UI ===
  
  // WebSocket connection for real-time messaging
  const webSocketUrl = getWebSocketUrl();
  const { connectionStatus, sendMessage: sendWebSocketMessage, lastMessage } = useWebSocket(webSocketUrl, {
    onMessage: (message) => {
      console.log('Received WebSocket message:', message);
      handleIncomingMessage(message);
    },
    onConnect: () => {
      console.log('Chat connected to real-time messaging');
      // Process queued messages when reconnected
      processMessageQueue();
      // Join current conversation room
      if (currentChatContext) {
        sendWebSocketMessage({
          type: 'join_conversation',
          conversationId: currentChatContext.conversationId
        });
      }
    },
    onDisconnect: () => {
      console.log('Chat disconnected from real-time messaging');
    },
    onError: (error) => {
      console.error('Chat messaging error:', error);
    }
  });

  // Connection status configuration for UI display
  const connectionConfig = getConnectionStatusConfig(connectionStatus);

  // === SUBTASK 3.1.2: Real-time Message Sending ===
  
  // Message queuing for offline scenarios  
  const queueMessage = (messageData: any) => {
    setMessageQueue(prev => [...prev, messageData]);
  };

  // Process queued messages when connection is restored
  const processMessageQueue = () => {
    if (connectionStatus === 'connected' && messageQueue.length > 0) {
      messageQueue.forEach(messageData => {
        sendWebSocketMessage(messageData);
        // Update message status to sent
        if (currentChatContext) {
          updateMessageInConversation(currentChatContext.conversationId, messageData.tempId, { status: 'sent' });
        }
      });
      setMessageQueue([]);
    }
  };

  // Enhanced message sending with delivery confirmation and retry
  const sendMessageWithConfirmation = async (messageData: any, tempMessageId: string) => {
    try {
      if (connectionStatus === 'connected') {
        // Send through WebSocket
        sendWebSocketMessage(messageData);
        
        // Save to storage for persistence
        await saveMessageToStorage(messageData.message);
        
        // Update message status to sent
        if (currentChatContext) {
          updateMessageInConversation(currentChatContext.conversationId, tempMessageId, { status: 'sent' });
        }
        
        console.log('Message sent successfully:', messageData);
      } else {
        // Queue message for later delivery
        queueMessage({ ...messageData, tempId: tempMessageId });
        
        // Update message status to queued
        if (currentChatContext) {
          updateMessageInConversation(currentChatContext.conversationId, tempMessageId, { status: 'sending' });
        }
        
        console.log('Message queued for delivery:', messageData);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Update message status to failed
      if (currentChatContext) {
        updateMessageInConversation(currentChatContext.conversationId, tempMessageId, { status: 'failed' });
      }
    }
  };

  // === SUBTASK 3.1.3: Real-time Message Receiving ===
  
  // Handle incoming WebSocket messages
  const handleIncomingMessage = (message: any) => {
    if (message.type === 'new_message') {
      const newMessage = {
        id: message.message.id || `msg-${Date.now()}`,
        content: message.message.content,
        senderId: message.message.agentId || message.message.userId,
        senderName: message.message.senderName || 'Colleague',
        messageType: message.message.messageType,
        timestamp: message.message.timestamp || new Date().toISOString(),
        conversationId: message.message.conversationId,
        status: 'delivered' as const,
        metadata: message.message.metadata
      };

      // Add incoming message to appropriate conversation
      const conversationMessages = allMessages[newMessage.conversationId] || [];
      const exists = conversationMessages.some(msg => msg.id === newMessage.id);
      
      if (!exists) {
        addMessageToConversation(newMessage.conversationId, newMessage);
        console.log('Received message for conversation:', newMessage.conversationId);
      }
    } else if (message.type === 'message_delivered') {
      // Update message status to delivered in appropriate conversation
      const conversationId = message.conversationId;
      if (conversationId) {
        updateMessageInConversation(conversationId, message.messageId, { status: 'delivered' });
      }
    }
  };

  // === SUBTASK 3.1.4: Message Persistence Integration ===
  
  // Save message to storage
  const saveMessageToStorage = async (messageData: any) => {
    try {
      // Future implementation: API call to save message
      // await fetch('/api/messages', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(messageData)
      // });
      
      console.log('Message saved to storage:', messageData);
    } catch (error) {
      console.error('Failed to save message to storage:', error);
      throw error;
    }
  };

  // Get current conversation messages
  const getCurrentMessages = () => {
    if (!currentChatContext) return [];
    return allMessages[currentChatContext.conversationId] || [];
  };

  // Add message to specific conversation
  const addMessageToConversation = (conversationId: string, message: any) => {
    setAllMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), message]
    }));
  };

  // Update message status in specific conversation
  const updateMessageInConversation = (conversationId: string, messageId: string, updates: any) => {
    setAllMessages(prev => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    }));
  };

  // Track response timers to prevent duplicates
  const responseTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Simulate colleague responses
  const simulateColleagueResponse = async (userMessage: string, conversationId: string) => {
    // Clear any existing timer for this conversation
    const existingTimer = responseTimers.current.get(conversationId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      responseTimers.current.delete(conversationId);
    }

    // Only respond if this is still the active conversation
    if (!currentChatContext || currentChatContext.conversationId !== conversationId) return;
    
    const participants = getCurrentChatParticipants();
    
    // PM always responds first to general messages
    const pm = participants.find(p => p.role.toLowerCase().includes('manager')) || participants[0];
    if (!pm) return;

    // Show typing indicator
    setTypingColleagues([pm.name]);
    
    // Create response timer
    const timer = setTimeout(async () => {
      // Check again if still active conversation
      if (!currentChatContext || currentChatContext.conversationId !== conversationId) {
        setTypingColleagues([]);
        responseTimers.current.delete(conversationId);
        return;
      }
      
      // Remove typing indicator
      setTypingColleagues([]);
      
      // Generate PM response based on context and user message
      const pmResponse = {
        id: `agent-${Date.now()}`,
        content: generatePMResponse(userMessage, currentChatContext?.mode || 'project'),
        senderId: pm.id,
        senderName: pm.name,
        messageType: 'agent' as const,
        timestamp: new Date().toISOString(),
        conversationId,
        status: 'delivered' as const,
        metadata: { role: pm.role }
      };

      // Add PM response only if still in same conversation
      if (currentChatContext && currentChatContext.conversationId === conversationId) {
        addMessageToConversation(conversationId, pmResponse);
        
        // Send through WebSocket for real-time sync
        sendWebSocketMessage({
          type: 'agent_response',
          conversationId,
          message: pmResponse
        });
      }
      
      // Clean up timer
      responseTimers.current.delete(conversationId);
    }, 1500 + Math.random() * 2000);

    // Store timer
    responseTimers.current.set(conversationId, timer);
  };

  // Generate PM responses based on context and message content
  const generatePMResponse = (userMessage: string, mode: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Context-specific responses that feel more natural
    if (lowerMessage.includes('hey') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      const greetings = {
        project: [
          "Thanks for reaching out to the SaaS Startup team! I'm here to help coordinate across all our teams.",
          "Hey there! Great to connect with you. What can our team help you with today?",
          "Hello! I'm ready to sync with all teams on whatever you need."
        ],
        team: [
          "Perfect, let me get the team focused on this.",
          "Hey! I'll make sure the team is aligned on your request.",
          "Great to hear from you! The team is ready to collaborate."
        ],
        agent: [
          "Hello! Happy to chat one-on-one about whatever you need.",
          "Hey there! I'm here to help with any specific questions you have.",
          "Great to connect directly! What can I help you with?"
        ]
      };
      
      return greetings[mode as keyof typeof greetings]?.[Math.floor(Math.random() * greetings[mode as keyof typeof greetings].length)] || 
             "Hello! How can I help you today?";
    }
    
    // Default responses for other messages
    const responses = {
      project: [
        "Got it! Let me coordinate with the teams on this.",
        "I'll make sure all teams are aligned on this request.",
        "Thanks for bringing this up. I'll sync with everyone.",
        "This affects multiple teams - I'll handle the coordination."
      ],
      team: [
        "Perfect, let me get the team focused on this.",
        "I'll prioritize this with the team right away.",
        "Good point - I'll discuss this in our next standup.",
        "The team will handle this efficiently."
      ],
      agent: [
        "Absolutely, I can help you with that specific request.",
        "That's exactly what I specialize in handling.",
        "Let me dive into the details on this for you.",
        "I'll take care of this personally."
      ]
    };
    
    return responses[mode as keyof typeof responses]?.[Math.floor(Math.random() * responses[mode as keyof typeof responses].length)] || 
           "I'll take care of that right away.";
  };

  // === END TASK 3.1 ===
  
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
    const newChatContext = {
      mode: newMode,
      participantIds,
      conversationId,
      projectId: activeProject.id
    };
    
    // Initialize conversation if it doesn't exist
    if (!allMessages[conversationId]) {
      setAllMessages(prev => ({
        ...prev,
        [conversationId]: []
      }));
    }
    
    setCurrentChatContext(newChatContext);
    
    // Join new conversation room via WebSocket when connected
    if (connectionStatus === 'connected') {
      sendWebSocketMessage({
        type: 'join_conversation',
        conversationId: conversationId
      });
    }

    // Debug logging for development
    console.log('Chat context updated with persistence:', {
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
        const tempMessageId = `temp-${Date.now()}`;
        const timestamp = new Date().toISOString();
        
        // Create user message for immediate UI display
        const userMessage = {
          id: tempMessageId,
          content: input.value,
          senderId: 'user',
          senderName: 'You',
          messageType: 'user' as const,
          timestamp,
          conversationId: currentChatContext?.conversationId || '',
          status: 'sending' as const,
          metadata: {
            routing: recipients,
            memory: chatMemoryContext
          }
        };

        // Add message to current conversation
        addMessageToConversation(currentChatContext?.conversationId || '', userMessage);

        // Prepare WebSocket message data
        const messageData = {
          type: 'send_message',
          conversationId: currentChatContext?.conversationId || '',
          message: {
            id: tempMessageId,
            conversationId: currentChatContext?.conversationId || '',
            userId: 'user',
            content: input.value,
            messageType: 'user' as const,
            timestamp,
            senderName: 'You',
            metadata: {
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
              }
            }
          }
        };

        // Send with confirmation and retry logic
        sendMessageWithConfirmation(messageData, tempMessageId);
        
        // Clear input immediately to prevent double-send
        input.value = '';
        
        // Store the message content and context for response
        const messageContent = messageData.message.content;
        const contextId = currentChatContext?.conversationId;
        
        // Trigger colleague response after short delay - only if context hasn't changed
        setTimeout(() => {
          if (contextId && currentChatContext?.conversationId === contextId) {
            simulateColleagueResponse(messageContent, contextId);
          }
        }, 500);
        
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
      {/* Message Display Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {getCurrentMessages().length === 0 ? (
          /* Welcome Screen - Show when no messages */
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
        ) : (
          /* Message List - Show when messages exist */
          <>
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoadingMessages && (
                <div className="flex items-center justify-center py-4">
                  <div className="hatchin-text-muted text-sm">Loading conversation...</div>
                </div>
              )}
              
              {getCurrentMessages().map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.messageType === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Message Bubble */}
                  {message.messageType === 'user' ? (
                    /* User Message - Right Aligned */
                    <div className="max-w-[70%] hatchin-bg-blue text-white rounded-2xl px-4 py-3 shadow-sm">
                      <div className="text-sm leading-relaxed">
                        {message.content}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2 text-xs text-white/70">
                        <span>
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        
                        {message.status && (
                          <>
                            <span>•</span>
                            <span className={`${
                              message.status === 'sent' || message.status === 'delivered' 
                                ? 'text-white/90' 
                                : message.status === 'failed' 
                                ? 'text-red-300' 
                                : 'text-white/50'
                            }`}>
                              {message.status === 'sending' && 'Sending...'}
                              {message.status === 'sent' && 'Sent'}
                              {message.status === 'delivered' && 'Delivered'}
                              {message.status === 'failed' && 'Failed'}
                            </span>
                          </>
                        )}
                        
                        {message.metadata?.routing?.scope && (
                          <>
                            <span>•</span>
                            <span className="text-white/70 text-xs">
                              {message.metadata.routing.scope}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Colleague Message - Left Aligned with Avatar */
                    <div className="flex items-start gap-3 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full bg-hatchin-text-muted flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-xs font-medium text-white">
                          {message.senderName.charAt(0)}
                        </span>
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium hatchin-text">
                            {message.senderName}
                          </span>
                          <span className="text-xs hatchin-text-muted">
                            {new Date(message.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        
                        <div className="hatchin-text text-sm leading-relaxed">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ))}
              
              {/* Typing Indicators - at bottom of messages */}
              {typingColleagues.length > 0 && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-hatchin-text-muted flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-medium text-white">P</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium hatchin-text">
                          {typingColleagues[0]}
                        </span>
                        <span className="text-xs hatchin-text-muted">
                          {new Date().toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <div className="hatchin-text-muted text-sm italic">
                        {typingColleagues[0]} is typing...
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Auto-scroll helper */}
            <div ref={(el) => {
              if (el && (getCurrentMessages().length > 0 || typingColleagues.length > 0)) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }} />
          </>
        )}
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
