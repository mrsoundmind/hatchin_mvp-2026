import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { useWebSocket, getWebSocketUrl } from '@/lib/websocket';
import type { Message, Conversation } from '@shared/schema';

interface ChatInterfaceProps {
  conversationId: string;
  conversationType: 'project' | 'team' | 'hatch';
  projectId: string;
  teamId?: string;
  agentId?: string;
}

export function ChatInterface({ 
  conversationId, 
  conversationType, 
  projectId, 
  teamId, 
  agentId 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingAgents, setTypingAgents] = useState<Set<string>>(new Set());

  // Fetch existing messages
  const { data: existingMessages, isLoading } = useQuery({
    queryKey: ['/api/conversations', conversationId, 'messages'],
    queryFn: async () => {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json() as Promise<Message[]>;
    },
    enabled: !!conversationId
  });

  // WebSocket connection for real-time updates
  const { sendMessage, connectionStatus, lastMessage } = useWebSocket(
    getWebSocketUrl(),
    {
      onConnect: () => {
        // Join conversation room
        sendMessage({
          type: 'join_conversation',
          conversationId
        });
      },
      onMessage: (message) => {
        handleWebSocketMessage(message);
      }
    }
  );

  // Handle WebSocket messages
  const handleWebSocketMessage = (wsMessage: any) => {
    switch (wsMessage.type) {
      case 'new_message':
        setMessages(prev => [...prev, wsMessage.message]);
        break;
      case 'agent_typing_start':
        setTypingAgents(prev => new Set([...prev, wsMessage.agentId]));
        break;
      case 'agent_typing_stop':
        setTypingAgents(prev => {
          const updated = new Set(prev);
          updated.delete(wsMessage.agentId);
          return updated;
        });
        break;
    }
  };

  // Initialize messages from query
  useEffect(() => {
    if (existingMessages) {
      setMessages(existingMessages);
    }
  }, [existingMessages]);

  // Send message handler
  const handleSendMessage = async (content: string) => {
    const newMessage = {
      conversationId,
      userId: null, // Will be set by auth system later
      agentId: null,
      content,
      messageType: 'user' as const,
      metadata: {}
    };

    try {
      // Optimistic update
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        ...newMessage,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setMessages(prev => [...prev, tempMessage]);

      // Send via WebSocket for real-time delivery
      sendMessage({
        type: 'send_message',
        conversationId,
        message: newMessage
      });

      // Also persist via API
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      });

      if (!response.ok) throw new Error('Failed to send message');
      const savedMessage = await response.json();

      // Replace temp message with saved one
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id ? savedMessage : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-400">Loading conversation...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a]">
      {/* Chat Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-medium">
              {conversationType === 'project' && 'Project Chat'}
              {conversationType === 'team' && 'Team Chat'}
              {conversationType === 'hatch' && 'Private Chat'}
            </h2>
            <div className="text-xs text-gray-400 mt-1">
              {connectionStatus === 'connected' ? (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  {connectionStatus === 'connecting' ? 'Connecting...' : 'Reconnecting...'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <MessageList messages={messages} />
        
        {/* Typing Indicators */}
        {typingAgents.size > 0 && (
          <div className="px-4 py-2">
            <TypingIndicator agentIds={[...typingAgents]} />
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-800">
        <ChatInput 
          onSendMessage={handleSendMessage}
          disabled={connectionStatus !== 'connected'}
        />
      </div>
    </div>
  );
}