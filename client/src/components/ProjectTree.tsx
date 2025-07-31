import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import type { Project, Team, Agent } from "@shared/schema";

interface ProjectTreeProps {
  projects: Project[];
  teams: Team[];
  agents: Agent[];
  activeProjectId: string | null;
  activeTeamId: string | null;
  activeAgentId: string | null;
  expandedProjects: Set<string>;
  expandedTeams: Set<string>;
  onSelectProject: (projectId: string) => void;
  onSelectTeam: (teamId: string | null) => void;
  onSelectAgent: (agentId: string | null) => void;
  onToggleProjectExpanded: (projectId: string) => void;
  onToggleTeamExpanded: (teamId: string) => void;
}

export function ProjectTree({
  projects,
  teams,
  agents,
  activeProjectId,
  activeTeamId,
  activeAgentId,
  expandedProjects,
  expandedTeams,
  onSelectProject,
  onSelectTeam,
  onSelectAgent,
  onToggleProjectExpanded,
  onToggleTeamExpanded,
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
    <div className="space-y-1">
      {projects.map(project => {
        const projectTeams = teams.filter(t => t.projectId === project.id);
        const isProjectActive = project.id === activeProjectId;
        
        const isProjectExpanded = expandedProjects.has(project.id);
        
        return (
          <div key={project.id} className="space-y-1">
            {/* Project Level */}
            <div className="flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group">
              <div 
                className={`flex items-center gap-2 min-w-0 flex-1 cursor-pointer ${
                  isProjectActive 
                    ? 'hatchin-bg-card hatchin-border border rounded-lg p-2' 
                    : 'hover:bg-hatchin-border hover:border-transparent rounded-lg p-2'
                }`}
                onClick={() => onSelectProject(project.id)}
              >
                <div 
                  className="flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (projectTeams.length > 0) {
                      onToggleProjectExpanded(project.id);
                    }
                  }}
                >
                  {projectTeams.length > 0 && (
                    isProjectExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 hatchin-text-muted hover:hatchin-text cursor-pointer" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 hatchin-text-muted hover:hatchin-text cursor-pointer" />
                    )
                  )}
                </div>
                <span className="text-sm font-medium hatchin-text truncate">
                  <span className="mr-2">{project.emoji}</span>
                  {project.name}
                </span>
              </div>
              <button className="opacity-0 group-hover:opacity-100 hatchin-text-muted hover:hatchin-text transition-opacity flex-shrink-0">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Teams */}
            {isProjectExpanded && (
              <div className="ml-7 space-y-1">
                {projectTeams.map(team => {
                  const teamAgents = agents.filter(a => a.teamId === team.id);
                  const isTeamActive = team.id === activeTeamId;
                  const isTeamExpanded = expandedTeams.has(team.id);
                  
                  return (
                    <div key={team.id} className="space-y-1">
                      {/* Team Level */}
                      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg transition-all duration-200">
                        <div 
                          className={`flex items-center gap-2 min-w-0 flex-1 cursor-pointer ${
                            isTeamActive 
                              ? 'hatchin-bg-card hatchin-border border rounded-lg p-1' 
                              : 'hover:bg-hatchin-border hover:border-transparent rounded-lg p-1'
                          }`}
                          onClick={() => onSelectTeam(team.id)}
                        >
                          <div 
                            className="flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (teamAgents.length > 0) {
                                onToggleTeamExpanded(team.id);
                              }
                            }}
                          >
                            {teamAgents.length > 0 && (
                              isTeamExpanded ? (
                                <ChevronDown className="w-3 h-3 hatchin-text-muted hover:hatchin-text cursor-pointer" />
                              ) : (
                                <ChevronRight className="w-3 h-3 hatchin-text-muted hover:hatchin-text cursor-pointer" />
                              )
                            )}
                          </div>
                          <span className="text-sm hatchin-text truncate">
                            <span className="mr-2">{team.emoji}</span>
                            {team.name}
                          </span>
                          <span className="text-xs hatchin-text-muted flex-shrink-0">
                            ({teamAgents.length})
                          </span>
                        </div>
                      </div>
                      
                      {/* Agents */}
                      {isTeamExpanded && (
                        <div className="ml-7 space-y-0.5">
                          {teamAgents.map(agent => {
                            const isAgentActive = agent.id === activeAgentId;
                            
                            return (
                              <div 
                                key={agent.id}
                                className={`flex items-center gap-3 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 ${
                                  isAgentActive 
                                    ? 'hatchin-bg-card hatchin-border border' 
                                    : 'hover:bg-hatchin-border hover:border-transparent'
                                }`}
                                onClick={() => onSelectAgent(agent.id)}
                              >
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getAgentColorClass(agent.color)}`}></div>
                                <span className="text-sm hatchin-text-muted truncate">
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
