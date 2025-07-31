import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import type { Project, Team, Agent } from "@shared/schema";

interface ProjectTreeProps {
  projects: Project[];
  teams: Team[];
  agents: Agent[];
  activeProjectId: string | null;
  activeTeamId: string | null;
  activeAgentId: string | null;
  onSelectProject: (projectId: string) => void;
  onSelectTeam: (teamId: string | null) => void;
  onSelectAgent: (agentId: string | null) => void;
}

export function ProjectTree({
  projects,
  teams,
  agents,
  activeProjectId,
  activeTeamId,
  activeAgentId,
  onSelectProject,
  onSelectTeam,
  onSelectAgent,
}: ProjectTreeProps) {
  const getAgentColorClass = (color: string) => {
    switch (color) {
      case 'orange':
        return 'agent-dot-orange';
      case 'blue':
        return 'agent-dot-blue';
      case 'green':
        return 'agent-dot-green';
      default:
        return 'agent-dot-blue';
    }
  };

  return (
    <div className="space-y-2">
      {projects.map(project => {
        const projectTeams = teams.filter(t => t.projectId === project.id);
        const isActive = project.id === activeProjectId;
        
        return (
          <div key={project.id} className="space-y-1">
            <div 
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors group ${
                isActive ? 'hatchin-bg-card' : 'hover:bg-hatchin-border'
              }`}
              onClick={() => {
                onSelectProject(project.id);
                onSelectTeam(null);
                onSelectAgent(null);
              }}
            >
              <div className="flex items-center gap-2">
                {project.isExpanded ? (
                  <ChevronDown className="w-3 h-3 hatchin-text-muted" />
                ) : (
                  <ChevronRight className="w-3 h-3 hatchin-text-muted" />
                )}
                <span className="text-sm font-medium hatchin-text">
                  {project.emoji} {project.name}
                </span>
              </div>
              <button className="opacity-0 group-hover:opacity-100 hatchin-text-muted hover:text-hatchin-text">
                <MoreHorizontal className="w-3 h-3" />
              </button>
            </div>
            
            {/* Teams */}
            {project.isExpanded && (
              <div className="ml-6 space-y-1">
                {projectTeams.map(team => {
                  const teamAgents = agents.filter(a => a.teamId === team.id);
                  const isTeamActive = team.id === activeTeamId;
                  
                  return (
                    <div key={team.id} className="space-y-1">
                      <div 
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          isTeamActive ? 'hatchin-bg-card' : 'hover:bg-hatchin-border'
                        }`}
                        onClick={() => {
                          onSelectTeam(team.id);
                          onSelectAgent(null);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {team.isExpanded ? (
                            <ChevronDown className="w-3 h-3 hatchin-text-muted" />
                          ) : (
                            <ChevronRight className="w-3 h-3 hatchin-text-muted" />
                          )}
                          <span className="text-sm hatchin-text">
                            {team.emoji} {team.name}
                          </span>
                          <span className="text-xs hatchin-text-muted">
                            ({teamAgents.length})
                          </span>
                        </div>
                      </div>
                      
                      {/* Team Members */}
                      {team.isExpanded && (
                        <div className="ml-4 space-y-1">
                          {teamAgents.map(agent => {
                            const isAgentActive = agent.id === activeAgentId;
                            
                            return (
                              <div 
                                key={agent.id}
                                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                  isAgentActive ? 'hatchin-bg-card' : 'hover:bg-hatchin-border'
                                }`}
                                onClick={() => onSelectAgent(agent.id)}
                              >
                                <div className={`w-2 h-2 rounded-full ${getAgentColorClass(agent.color)}`}></div>
                                <span className="text-sm hatchin-text-muted">
                                  {agent.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
