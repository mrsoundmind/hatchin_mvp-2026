import { useQuery } from '@tanstack/react-query';
import type { Agent } from '@shared/schema';

interface TypingIndicatorProps {
  agentIds: string[];
}

export function TypingIndicator({ agentIds }: TypingIndicatorProps) {
  // Fetch agent data for typing indicators
  const { data: agents } = useQuery({
    queryKey: ['/api/agents', agentIds],
    queryFn: async () => {
      if (agentIds.length === 0) return [];
      
      const responses = await Promise.all(
        agentIds.map(async (id) => {
          try {
            const response = await fetch(`/api/agents/${id}`);
            if (!response.ok) return null;
            return response.json() as Promise<Agent>;
          } catch {
            return null;
          }
        })
      );
      
      return responses.filter(Boolean) as Agent[];
    },
    enabled: agentIds.length > 0
  });

  if (!agents || agents.length === 0) return null;

  return (
    <div className="flex items-center space-x-3 animate-fade-in">
      {/* Agent avatars */}
      <div className="flex -space-x-1">
        {agents.map((agent, index) => (
          <div
            key={agent.id}
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-gray-900"
            style={{ 
              backgroundColor: agent.color,
              zIndex: agents.length - index
            }}
          >
            {agent.name[0]?.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Typing animation */}
      <div className="bg-gray-800 rounded-2xl rounded-tl-md px-4 py-2">
        <div className="flex items-center space-x-1">
          <span className="text-gray-300 text-sm">
            {agents.length === 1 
              ? `${agents[0].name} is typing`
              : `${agents.length} agents are typing`
            }
          </span>
          <div className="flex space-x-1 ml-2">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}