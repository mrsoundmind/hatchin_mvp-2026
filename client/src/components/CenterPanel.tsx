import { Send, Users, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Project, Team, Agent, Message } from "@shared/schema";

type ChatMode = 'project' | 'team' | 'hatch';

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
  const [chatMode, setChatMode] = useState<ChatMode>('project');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Update chat mode based on active selections
  useEffect(() => {
    if (activeAgentId) {
      setChatMode('hatch');
      setSelectedAgent(activeAgentId);
    } else if (activeTeamId) {
      setChatMode('team');
      setSelectedTeam(activeTeamId);
    } else {
      setChatMode('project');
    }
  }, [activeAgentId, activeTeamId]);

  // Fetch messages based on current chat context
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', chatMode, activeProject?.id, selectedTeam, selectedAgent],
    queryFn: async () => {
      if (!activeProject) return [];
      
      let url = '';
      if (chatMode === 'hatch' && selectedAgent) {
        url = `/api/agents/${selectedAgent}/messages`;
      } else if (chatMode === 'team' && selectedTeam) {
        url = `/api/teams/${selectedTeam}/messages`;
      } else {
        url = `/api/projects/${activeProject.id}/messages`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!activeProject,
    refetchInterval: 2000, // Poll for new messages every 2 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!activeProject) throw new Error('No active project');

      const messageData = {
        type: 'user' as const,
        author: 'user',
        projectId: activeProject.id,
        content,
        ...(chatMode === 'team' && selectedTeam && { teamId: selectedTeam }),
        ...(chatMode === 'hatch' && selectedAgent && { hatchId: selectedAgent }),
      };

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setMessageInput('');
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessageMutation.mutate(messageInput.trim());
    }
  };

  const handleActionClick = (action: string) => {
    sendMessageMutation.mutate(action);
  };

  const getPlaceholder = () => {
    if (chatMode === 'hatch' && selectedAgent) {
      const agent = activeProjectAgents.find(a => a.id === selectedAgent);
      return `Message ${agent?.name}...`;
    } else if (chatMode === 'team' && selectedTeam) {
      const team = activeProjectTeams.find(t => t.id === selectedTeam);
      return `Message ${team?.name}...`;
    } else {
      return `Message ${activeProject?.name} team...`;
    }
  };

  const getChatHeader = () => {
    if (chatMode === 'hatch' && selectedAgent) {
      const agent = activeProjectAgents.find(a => a.id === selectedAgent);
      return (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full bg-hatchin-${agent?.color || 'blue'} flex items-center justify-center`}>
            <span className="text-white text-sm font-semibold">
              {agent?.name?.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-medium hatchin-text">{agent?.name}</h3>
            <p className="text-xs hatchin-text-muted">{agent?.role}</p>
          </div>
        </div>
      );
    } else if (chatMode === 'team' && selectedTeam) {
      const team = activeProjectTeams.find(t => t.id === selectedTeam);
      const teamAgentCount = activeProjectAgents.filter(a => a.teamId === selectedTeam).length;
      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-hatchin-purple flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium hatchin-text">{team?.emoji} {team?.name}</h3>
            <p className="text-xs hatchin-text-muted">{teamAgentCount} members</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-hatchin-blue flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {activeProject?.emoji}
            </span>
          </div>
          <div>
            <h3 className="font-medium hatchin-text">{activeProject?.name}</h3>
            <p className="text-xs hatchin-text-muted">Project Chat</p>
          </div>
        </div>
      );
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      {/* Chat Header */}
      <div className="p-4 hatchin-border border-b">
        {/* Mode Selector */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setChatMode('project')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              chatMode === 'project' 
                ? 'bg-hatchin-blue text-white' 
                : 'hatchin-text-muted hover:hatchin-text'
            }`}
          >
            Project
          </button>
          <button
            onClick={() => setChatMode('team')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              chatMode === 'team' 
                ? 'bg-hatchin-blue text-white' 
                : 'hatchin-text-muted hover:hatchin-text'
            }`}
          >
            Team
          </button>
          <button
            onClick={() => setChatMode('hatch')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              chatMode === 'hatch' 
                ? 'bg-hatchin-blue text-white' 
                : 'hatchin-text-muted hover:hatchin-text'
            }`}
          >
            Hatch
          </button>
        </div>

        {/* Chat Context Header */}
        {getChatHeader()}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="font-semibold hatchin-text text-lg mb-2">
              {chatMode === 'hatch' ? 'Start chatting with your Hatch' : 
               chatMode === 'team' ? 'Start your team conversation' : 
               'Kickstart your project'}
            </h3>
            <p className="hatchin-text-muted mb-4">
              {chatMode === 'hatch' ? 'Get personalized help and build a working relationship' : 
               chatMode === 'team' ? 'Coordinate with your team members and assign tasks' : 
               'Share your vision and get instant help from your AI team'}
            </p>
            
            {chatMode === 'project' && (
              <div className="flex flex-wrap gap-2 justify-center">
                <button 
                  onClick={() => handleActionClick('Give me a product roadmap')}
                  className="hatchin-bg-card hover:bg-hatchin-border hatchin-text px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Give me a product roadmap
                </button>
                <button 
                  onClick={() => handleActionClick('Set team goals')}
                  className="hatchin-bg-card hover:bg-hatchin-border hatchin-text px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Set team goals
                </button>
                <button 
                  onClick={() => handleActionClick('Summarize each team\'s task')}
                  className="hatchin-bg-card hover:bg-hatchin-border hatchin-text px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Summarize each team's task
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((message: Message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${
                  message.type === 'user' 
                    ? 'bg-hatchin-blue text-white rounded-lg rounded-br-sm' 
                    : 'bg-hatchin-card hatchin-text rounded-lg rounded-bl-sm'
                } px-4 py-2`}>
                  {message.type === 'hatch' && (
                    <div className="text-xs opacity-70 mb-1">
                      {message.author}
                    </div>
                  )}
                  <div className="text-sm">{message.content}</div>
                  <div className="text-xs opacity-50 mt-1">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 hatchin-border border-t">
        <form onSubmit={handleChatSubmit} className="relative">
          <input 
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full hatchin-bg-card hatchin-border border rounded-lg px-4 py-3 pr-12 text-sm hatchin-text placeholder-hatchin-text-muted focus:outline-none focus:ring-2 focus:ring-hatchin-blue focus:border-transparent"
            disabled={sendMessageMutation.isPending}
          />
          <button 
            type="submit"
            disabled={!messageInput.trim() || sendMessageMutation.isPending}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 hatchin-blue hover:text-opacity-80 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </main>
  );
}