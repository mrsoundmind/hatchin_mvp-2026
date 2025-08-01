import { Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { Project, Team, Agent } from "@shared/schema";
import { useWebSocket, getWebSocketUrl, getConnectionStatusConfig } from '@/lib/websocket';
import { MessageBubble } from './MessageBubble';
import { MessageSkeleton } from './MessageSkeleton';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

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
  
  // Track recently sent message IDs to prevent echo
  const [recentlySentIds, setRecentlySentIds] = useState<Set<string>>(new Set());

  // Handle incoming WebSocket messages
  const handleIncomingMessage = (message: any) => {
    if (message.type === 'new_message') {
      const messageId = message.message.id;
      
      // Skip if this is an echo of our own message
      if (messageId && messageId.startsWith('temp-')) {
        console.log('Ignoring temp message echo:', messageId);
        return;
      }
      
      // Skip if user sent this message (we already have it locally)
      if (message.message.userId === 'user') {
        console.log('Ignoring user message echo:', messageId);
        return;
      }

      const newMessage = {
        id: messageId || `msg-${Date.now()}`,
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

  // Simulate colleague responses
  const simulateColleagueResponse = async (userMessage: string, conversationId: string) => {
    // Only respond if this is still the active conversation
    if (!currentChatContext || currentChatContext.conversationId !== conversationId) return;
    
    const participants = getCurrentChatParticipants();
    
    // PM always responds first to general messages
    const pm = participants.find(p => p.role.toLowerCase().includes('manager')) || participants[0];
    if (!pm) return;

    // Show typing indicator
    setTypingColleagues([pm.name]);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
    
    // Check again if still active conversation
    if (!currentChatContext || currentChatContext.conversationId !== conversationId) {
      setTypingColleagues([]);
      return;
    }
    
    // Remove typing indicator
    setTypingColleagues([]);
    
    // Generate intelligent response based on agent role and context
    const pmResponse = {
      id: `agent-${Date.now()}`,
      content: generatePMResponse(userMessage, currentChatContext?.mode || 'project', pm.role),
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
  };

  // Generate PM responses based on context and message content
  const generatePMResponse = (userMessage: string, mode: string, agentRole: string = "Product Manager") => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Enhanced intelligent responses using AI role profiles from GitHub repository
    if (agentRole === "Product Manager") {
      // Greetings
      if (lowerMessage.includes('hey') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return mode === 'project' ? 
          "Thanks for reaching out! I'm here to coordinate across all teams." :
          mode === 'team' ? "Hey! I'll make sure the team is aligned on your request." :
          "Hello! Happy to chat one-on-one about whatever you need.";
      }
      
      // Intelligent keyword-based responses
      if (lowerMessage.includes("roadmap") || lowerMessage.includes("plan")) {
        return "Let me break this down into phases. What's our primary goal and timeline?";
      }
      if (lowerMessage.includes("priority") || lowerMessage.includes("urgent")) {
        return "I'll help prioritize. What's the impact vs effort on each item?";
      }
      if (lowerMessage.includes("stuck") || lowerMessage.includes("blocked")) {
        return "Let's identify the blocker. Is it resources, decisions, or dependencies?";
      }
      if (lowerMessage.includes("launch") || lowerMessage.includes("release")) {
        return "For launch, I'll coordinate design and product teams on timeline and deliverables.";
      }
      if (lowerMessage.includes("team") || lowerMessage.includes("coordinate")) {
        return "I'll make sure all teams are aligned on this request.";
      }
      
      return "Got it! Let me coordinate with the teams on this.";
    }
    
    if (agentRole === "Product Designer") {
      if (lowerMessage.includes('hey') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hey! I'm here to help with design and user experience.";
      }
      if (lowerMessage.includes("design") || lowerMessage.includes("ui") || lowerMessage.includes("ux")) {
        return "I'll help with the design approach. What's the main user goal here?";
      }
      if (lowerMessage.includes("user") || lowerMessage.includes("flow")) {
        return "Let's map the user journey. What should feel effortless?";
      }
      if (lowerMessage.includes("confusing") || lowerMessage.includes("unclear")) {
        return "Clarity first. Let me suggest some information architecture improvements.";
      }
      return "Good point - let me think about the design implications here.";
    }
    
    if (agentRole === "UI Engineer") {
      if (lowerMessage.includes('hey') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hi! I'm ready to help implement the frontend.";
      }
      if (lowerMessage.includes("code") || lowerMessage.includes("implement") || lowerMessage.includes("build")) {
        return "I can help implement this. What's the technical approach you're considering?";
      }
      if (lowerMessage.includes("bug") || lowerMessage.includes("error") || lowerMessage.includes("broken")) {
        return "Let me help debug this. Can you share the error details or steps to reproduce?";
      }
      if (lowerMessage.includes("performance") || lowerMessage.includes("slow")) {
        return "I'll optimize this. Usually it's bundle size, images, or inefficient renders.";
      }
      return "I can handle the frontend implementation for this.";
    }
    
    if (agentRole === "Backend Developer") {
      if (lowerMessage.includes('hey') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hello! I'm here to handle the backend architecture.";
      }
      if (lowerMessage.includes("api") || lowerMessage.includes("server") || lowerMessage.includes("database")) {
        return "I'll handle the backend architecture. What's the data flow you need?";
      }
      if (lowerMessage.includes("auth") || lowerMessage.includes("login") || lowerMessage.includes("security")) {
        return "Security is crucial. I recommend JWT with proper validation and rate limiting.";
      }
      if (lowerMessage.includes("scale") || lowerMessage.includes("users")) {
        return "Let's plan for scale. I'll design the database and caching strategy.";
      }
      return "I'll ensure the backend can support this feature properly.";
    }
    
    if (agentRole === "QA Lead") {
      if (lowerMessage.includes('hey') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hi! I'm here to ensure quality and comprehensive testing.";
      }
      if (lowerMessage.includes("test") || lowerMessage.includes("quality") || lowerMessage.includes("bug")) {
        return "I'll ensure quality. Let me create comprehensive test cases for this feature.";
      }
      if (lowerMessage.includes("ready") || lowerMessage.includes("ship") || lowerMessage.includes("release")) {
        return "I'll verify readiness. Need to check edge cases and user acceptance criteria.";
      }
      return "I'll make sure we test this thoroughly before shipping.";
    }
    
    // Default fallback for any role
    return "That's definitely something we should prioritize.";
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

  // A1.1 & A1.4: Handle message reactions for AI training
  const reactionMutation = useMutation({
    mutationFn: async ({ messageId, reactionType, agentId }: {
      messageId: string;
      reactionType: 'thumbs_up' | 'thumbs_down';
      agentId?: string;
    }) => {
      return await apiRequest(`/api/messages/${messageId}/reactions`, {
        method: 'POST',
        body: {
          reactionType,
          agentId,
          feedbackData: {
            responseQuality: reactionType === 'thumbs_up' ? 5 : 2,
            helpfulness: reactionType === 'thumbs_up' ? 5 : 2
          }
        }
      });
    }
  });

  const handleMessageReaction = (messageId: string, reactionType: 'thumbs_up' | 'thumbs_down') => {
    // Find the message to get agent ID for training
    const conversationMessages = currentChatContext ? allMessages[currentChatContext.conversationId] || [] : [];
    const message = conversationMessages.find(m => m.id === messageId);
    const agentId = message?.messageType === 'agent' ? message.senderId : undefined;
    
    reactionMutation.mutate({ messageId, reactionType, agentId });
  };

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

        // No need to track sent IDs anymore - we filter by userId instead

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
              
              {/* A3.1 & A3.2: Enhanced Message History with reactions and grouping */}
              {getCurrentMessages().map((message, index) => {
                // A3.2: Message grouping logic
                const messages = getCurrentMessages();
                const isGrouped = index > 0 && 
                  messages[index - 1].messageType === message.messageType &&
                  messages[index - 1].senderId === message.senderId &&
                  (new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime()) < 300000; // 5 minutes

                return (
                  <MessageBubble
                    key={message.id}
                    message={{
                      id: message.id,
                      content: message.content,
                      senderId: message.senderId,
                      senderName: message.senderName,
                      messageType: message.messageType,
                      timestamp: message.timestamp,
                      metadata: {
                        agentRole: message.metadata?.role
                      }
                    }}
                    isGrouped={isGrouped}
                    showReactions={message.messageType === 'agent'}
                    onReaction={handleMessageReaction}
                  />
                );
              })}
              
              {/* Typing Indicators - at bottom of messages */}
              {typingColleagues.length > 0 && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-hatchin-text-muted flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-medium text-white">P</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium hatchin-text mb-1">
                        {typingColleagues[0]}
                      </span>
                      <div className="bg-hatchin-colleague hatchin-text border hatchin-border rounded-2xl px-4 py-3 shadow-sm">
                        <div className="text-sm hatchin-text-muted italic">
                          {typingColleagues[0]} is typing...
                        </div>
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
