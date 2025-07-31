import { Send } from "lucide-react";
import type { Project, Team, Agent } from "@shared/schema";

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
      console.log('Message sent:', input.value);
      input.value = '';
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
      {/* Project Header */}
      <div className="p-6 hatchin-border border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold hatchin-text">
              {activeProject.emoji} {activeProject.name}
            </h1>
            <button className="hatchin-bg-blue text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors">
              + Add Hatch
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-6 mt-3">
          <span className="text-sm hatchin-text-muted">Active Teams:</span>
          <div className="flex items-center gap-4">
            {activeProjectTeams.map(team => {
              const teamAgentCount = activeProjectAgents.filter(a => a.teamId === team.id).length;
              return (
                <span key={team.id} className="text-sm hatchin-text">
                  {team.emoji} {team.name} ({teamAgentCount})
                </span>
              );
            })}
          </div>
        </div>
      </div>
      {/* Welcome Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-lg">
          <p className="hatchin-text-muted mt-[0px] mb-[0px]">
            Welcome! This is where your whole project team works together.
          </p>
          
          <div className="mb-6 text-[50px]">🚀</div>
          
          <h2 className="text-2xl font-semibold mb-4 hatchin-text">Kickstart your project</h2>
          <p className="hatchin-text-muted mb-8">
            Share your vision and get instant help from your AI team.
          </p>
          
          <div className="flex flex-wrap gap-3 justify-center">
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
            placeholder={`Message ${activeProject.name} team...`}
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
