import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import type { Message, Agent } from '@shared/schema';

interface MessageBubbleProps {
  message: Message;
  showAvatar: boolean;
}

export function MessageBubble({ message, showAvatar }: MessageBubbleProps) {
  // Fetch agent data if this is an agent message
  const { data: agent } = useQuery({
    queryKey: ['/api/agents', message.agentId],
    queryFn: async () => {
      if (!message.agentId) return null;
      const response = await fetch(`/api/agents/${message.agentId}`);
      if (!response.ok) return null;
      return response.json() as Promise<Agent>;
    },
    enabled: !!message.agentId
  });

  const isUserMessage = message.messageType === 'user';
  const isSystemMessage = message.messageType === 'system';

  // System messages
  if (isSystemMessage) {
    return (
      <div className="flex justify-center">
        <div className="bg-gray-800 text-gray-300 text-sm px-3 py-2 rounded-full max-w-md text-center">
          {message.content}
        </div>
      </div>
    );
  }

  // User messages (right-aligned)
  if (isUserMessage) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] space-y-1">
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-2">
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <div className="text-xs text-gray-400 text-right">
            {format(new Date(message.createdAt), 'HH:mm')}
          </div>
        </div>
      </div>
    );
  }

  // Agent messages (left-aligned)
  return (
    <div className="flex items-start space-x-3">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {showAvatar ? (
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: agent?.color || '#6b7280' }}
          >
            {agent?.name?.[0]?.toUpperCase() || 'A'}
          </div>
        ) : (
          <div className="w-8 h-8" /> // Spacer for alignment
        )}
      </div>

      {/* Message Content */}
      <div className="max-w-[70%] space-y-1">
        {showAvatar && agent && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-white">{agent.name}</span>
            <span className="text-xs text-gray-400">{agent.role}</span>
          </div>
        )}
        
        <div className="bg-gray-800 text-white rounded-2xl rounded-tl-md px-4 py-2">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        
        <div className="text-xs text-gray-400 flex items-center space-x-2">
          <span>{format(new Date(message.createdAt), 'HH:mm')}</span>
          {message.metadata?.responseTime && (
            <span>• {message.metadata.responseTime}ms</span>
          )}
          {message.metadata?.isStreaming && (
            <span>• streaming</span>
          )}
        </div>
      </div>
    </div>
  );
}