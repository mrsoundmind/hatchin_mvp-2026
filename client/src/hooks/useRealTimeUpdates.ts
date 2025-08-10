import { useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from '@/lib/websocket';
import type { Project, Team, Agent } from '@shared/schema';

interface RealTimeMessage {
  type: 'chat_message' | 'task_completed' | 'milestone_reached' | 'performance_update';
  projectId?: string;
  teamId?: string;
  agentId?: string;
  conversationId?: string;
  data: any;
  timestamp: string;
}

interface RealTimeMetrics {
  messagesCount: number;
  lastActivity: Date;
  activeParticipants: string[];
  taskCompletions: number;
  milestoneReaches: number;
}

interface UseRealTimeUpdatesOptions {
  activeProject?: Project;
  activeTeam?: Team;
  activeAgent?: Agent;
  onMetricsUpdate?: (metrics: RealTimeMetrics) => void;
  onProgressUpdate?: (progress: number) => void;
  onTimelineUpdate?: (event: any) => void;
  debounceMs?: number;
}

export function useRealTimeUpdates({
  activeProject,
  activeTeam,
  activeAgent,
  onMetricsUpdate,
  onProgressUpdate,
  onTimelineUpdate,
  debounceMs = 500
}: UseRealTimeUpdatesOptions) {
  const metricsRef = useRef<RealTimeMetrics>({
    messagesCount: 0,
    lastActivity: new Date(),
    activeParticipants: [],
    taskCompletions: 0,
    milestoneReaches: 0,
  });
  
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced update function
  const debouncedUpdate = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      onMetricsUpdate?.(metricsRef.current);
    }, debounceMs);
  }, [onMetricsUpdate, debounceMs]);

  // WebSocket connection for real-time updates
  const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
  
  const { connectionStatus, lastMessage } = useWebSocket(wsUrl, {
    onMessage: (message) => {
      console.log('📡 Real-time update received:', message);
      handleRealTimeMessage(message as RealTimeMessage);
    },
    onConnect: () => {
      console.log('🔌 Connected to real-time updates');
      // Subscribe to relevant channels based on active selections
      subscribeToChannels();
    },
    onDisconnect: () => {
      console.log('🔌 Disconnected from real-time updates');
    }
  });

  // Handle incoming real-time messages
  const handleRealTimeMessage = useCallback((message: RealTimeMessage) => {
    if (!isRelevantMessage(message)) {
      return; // Ignore messages not relevant to current context
    }

    const now = new Date();
    metricsRef.current.lastActivity = now;

    switch (message.type) {
      case 'chat_message':
        handleChatMessage(message);
        break;
      case 'task_completed':
        handleTaskCompleted(message);
        break;
      case 'milestone_reached':
        handleMilestoneReached(message);
        break;
      case 'performance_update':
        handlePerformanceUpdate(message);
        break;
      default:
        console.log('🤷 Unknown message type:', message.type);
    }

    // Trigger debounced update
    debouncedUpdate();
  }, [activeProject, activeTeam, activeAgent, debouncedUpdate]);

  // Check if message is relevant to current context
  const isRelevantMessage = (message: RealTimeMessage): boolean => {
    // Always relevant if no specific context
    if (!activeProject && !activeTeam && !activeAgent) {
      return true;
    }

    // Check project relevance
    if (activeProject && message.projectId === activeProject.id) {
      return true;
    }

    // Check team relevance
    if (activeTeam && message.teamId === activeTeam.id) {
      return true;
    }

    // Check agent relevance
    if (activeAgent && message.agentId === activeAgent.id) {
      return true;
    }

    return false;
  };

  // Handle different types of real-time updates
  const handleChatMessage = (message: RealTimeMessage) => {
    metricsRef.current.messagesCount += 1;
    
    // Track active participants
    if (message.data.senderId && !metricsRef.current.activeParticipants.includes(message.data.senderId)) {
      metricsRef.current.activeParticipants.push(message.data.senderId);
    }

    // Check for task completion keywords in message content
    const content = message.data.content?.toLowerCase() || '';
    if (containsTaskCompletionKeywords(content)) {
      handleTaskCompleted(message);
    }

    // Check for milestone keywords
    if (containsMilestoneKeywords(content)) {
      handleMilestoneReached(message);
    }

    console.log('📨 Chat message processed, total messages:', metricsRef.current.messagesCount);
  };

  const handleTaskCompleted = (message: RealTimeMessage) => {
    metricsRef.current.taskCompletions += 1;
    
    // Calculate progress increase (rough estimation)
    const progressIncrease = Math.min(5 + Math.random() * 10, 15); // 5-15% increase
    onProgressUpdate?.(progressIncrease);

    console.log('✅ Task completed, total completions:', metricsRef.current.taskCompletions);
  };

  const handleMilestoneReached = (message: RealTimeMessage) => {
    metricsRef.current.milestoneReaches += 1;
    
    // Create timeline event
    const timelineEvent = {
      title: extractMilestoneTitle(message.data.content) || 'Milestone Reached',
      date: new Date().toISOString(),
      status: 'Completed' as const,
      color: '#47DB9A'
    };
    
    onTimelineUpdate?.(timelineEvent);

    console.log('🎯 Milestone reached, total milestones:', metricsRef.current.milestoneReaches);
  };

  const handlePerformanceUpdate = (message: RealTimeMessage) => {
    // Handle specific performance metric updates
    if (message.data.progressDelta) {
      onProgressUpdate?.(message.data.progressDelta);
    }
    
    if (message.data.timelineEvent) {
      onTimelineUpdate?.(message.data.timelineEvent);
    }

    console.log('📊 Performance update processed:', message.data);
  };

  // Subscribe to relevant WebSocket channels
  const subscribeToChannels = () => {
    // This would send subscription messages to the WebSocket server
    // For now, we'll rely on the existing conversation-based WebSocket setup
    console.log('📡 Subscribing to real-time channels for:', {
      project: activeProject?.id,
      team: activeTeam?.id,
      agent: activeAgent?.id
    });
  };

  // Utility functions for keyword detection
  const containsTaskCompletionKeywords = (content: string): boolean => {
    const keywords = [
      'completed', 'finished', 'done', 'ready', 'implemented', 'deployed',
      'solved', 'resolved', 'fixed', 'achieved', 'accomplished', 'delivered'
    ];
    return keywords.some(keyword => content.includes(keyword));
  };

  const containsMilestoneKeywords = (content: string): boolean => {
    const keywords = [
      'milestone', 'goal', 'phase', 'release', 'launch', 'deliver', 'ship',
      'feature complete', 'mvp', 'beta', 'alpha', 'v1', 'version'
    ];
    return keywords.some(keyword => content.includes(keyword));
  };

  const extractMilestoneTitle = (content: string): string | null => {
    // Simple extraction of milestone title from message content
    const phrases = [
      /(?:completed|finished|reached) (.+?) (?:milestone|goal|phase)/i,
      /(?:milestone|goal|phase) (.+?) (?:completed|finished|reached)/i,
      /(?:shipped|launched|delivered) (.+)/i
    ];

    for (const phrase of phrases) {
      const match = content.match(phrase);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  };

  // Reset metrics when context changes
  useEffect(() => {
    metricsRef.current = {
      messagesCount: 0,
      lastActivity: new Date(),
      activeParticipants: [],
      taskCompletions: 0,
      milestoneReaches: 0,
    };
  }, [activeProject?.id, activeTeam?.id, activeAgent?.id]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return {
    connectionStatus,
    metrics: metricsRef.current,
    isConnected: connectionStatus === 'connected'
  };
}