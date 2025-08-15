import { ChevronDown, ChevronRight, MoreHorizontal, FileText, Users, User, X } from "lucide-react";
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
  onDeleteTeam?: (teamId: string) => void;
  onDeleteAgent?: (agentId: string) => void;
  searchQuery?: string;
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
  onDeleteTeam,
  onDeleteAgent,
  searchQuery = "",
}: ProjectTreeProps) {
  // Helper function to highlight search matches
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-hatchin-blue/20 text-hatchin-blue rounded px-1">
          {part}
        </span>
      ) : part
    );
  };
  const getAgentColorClass = (color: string) => {
    switch (color) {
      case 'amber':
        return 'bg-[#FFB547]';
      case 'blue':
        return 'bg-[#6C82FF]';
      case 'green':
        return 'bg-[#47DB9A]';
      case 'purple':
        return 'bg-[#9F7BFF]';
      case 'red':
        return 'bg-[#FF4E6A]';
      default:
        return 'bg-[#6C82FF]';
    }
  };

  const getAgentInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getProjectIconColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-[#6C82FF]';
      case 'green':
        return 'text-[#47DB9A]';
      case 'purple':
        return 'text-[#9F7BFF]';
      case 'amber':
        return 'text-[#FFB547]';
      case 'red':
        return 'text-[#FF4E6A]';
      default:
        return 'text-[#6C82FF]';
    }
  };

  return (
    <div className="space-y-1">
      {projects.map(project => {
        const projectTeams = teams.filter(t => t.projectId === project.id);
        const isProjectActive = project.id === activeProjectId;
        
        const isProjectExpanded = expandedProjects.has(project.id);
        
        return (
          <div key={project.id} className="space-y-1 mt-[-6px] mb-[-6px]">
            {/* Project Level */}
            <div className="flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group">
              <div 
                className={`flex items-center gap-2 min-w-0 flex-1 cursor-pointer rounded-lg p-2 transition-all duration-200 hover:bg-hatchin-border hover:shadow-sm pt-[7px] pb-[7px] ml-[4px] mr-[4px] mt-[-3px] mb-[-3px] relative ${
                  isProjectActive && !activeTeamId && !activeAgentId 
                    ? 'bg-hatchin-blue/10 border-l-2 border-hatchin-blue' 
                    : ''
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
                <FileText className={`w-4 h-4 mr-2 ${getProjectIconColor(project.color)}`} />
                <span className="font-medium hatchin-text truncate text-[13px]">
                  {highlightMatch(project.name, searchQuery)}
                </span>
              </div>
              <button className="opacity-0 group-hover:opacity-100 hatchin-text-muted hover:hatchin-text transition-opacity flex-shrink-0">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Teams and Individual Agents */}
            {isProjectExpanded && (
              <div className="ml-7 space-y-1">
                {/* Teams */}
                {projectTeams.map(team => {
                  const teamAgents = agents.filter(a => a.teamId === team.id);
                  const isTeamActive = team.id === activeTeamId;
                  const isTeamExpanded = expandedTeams.has(team.id);
                  
                  return (
                    <div key={team.id} className="space-y-1">
                      {/* Team Level */}
                      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg transition-all duration-200 group">
                        <div 
                          className={`flex items-center gap-2 min-w-0 flex-1 cursor-pointer rounded-lg p-1 transition-all duration-200 hover:bg-hatchin-border hover:shadow-sm mt-[-4px] mb-[-4px] relative ${
                            isTeamActive && !activeAgentId 
                              ? 'bg-hatchin-blue/10 border-l-2 border-hatchin-blue' 
                              : ''
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
                          <Users className={`w-4 h-4 mr-2 ${getProjectIconColor(projects.find(p => p.id === team.projectId)?.color || 'blue')}`} />
                          <span className="hatchin-text text-[12px]">
                            {highlightMatch(team.name, searchQuery)}
                          </span>
                          <span className="text-xs hatchin-text-muted flex-shrink-0">
                            ({teamAgents.length})
                          </span>
                        </div>
                        {onDeleteTeam && (
                          <button 
                            className="opacity-0 group-hover:opacity-100 hatchin-text-muted hover:text-red-400 transition-all flex-shrink-0 p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTeam(team.id);
                            }}
                            data-testid={`button-delete-team-${team.id}`}
                            title="Delete team"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {/* Team Agents */}
                      {isTeamExpanded && (
                        <div className="ml-7 space-y-0.5">
                          {teamAgents.map(agent => {
                            const isAgentActive = agent.id === activeAgentId;
                            
                            return (
                              <div 
                                key={agent.id}
                                className={`flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 relative group ${
                                  isAgentActive 
                                    ? 'bg-hatchin-blue/10 border-l-2 border-hatchin-blue' 
                                    : 'hover:bg-hatchin-border hover:shadow-sm'
                                }`}
                              >
                                <div 
                                  className="flex items-center gap-3 min-w-0 flex-1"
                                  onClick={() => onSelectAgent(agent.id)}
                                >
                                  <User className={`w-4 h-4 mr-1 ${getProjectIconColor(projects.find(p => p.id === agent.projectId)?.color || 'blue')}`} />
                                  <span className="hatchin-text-muted text-[12px] ml-[-12px] mr-[-12px] pl-[-4px] pr-[-4px]">
                                    {highlightMatch(agent.role || agent.name, searchQuery)}
                                  </span>
                                </div>
                                {onDeleteAgent && (
                                  <button 
                                    className="opacity-0 group-hover:opacity-100 hatchin-text-muted hover:text-red-400 transition-all flex-shrink-0 p-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteAgent(agent.id);
                                    }}
                                    data-testid={`button-delete-agent-${agent.id}`}
                                    title="Delete agent"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {/* Individual Agents (not part of any team) */}
                {(() => {
                  const individualAgents = agents.filter(a => a.projectId === project.id && !a.teamId);
                  return individualAgents.map(agent => {
                    const isAgentActive = agent.id === activeAgentId;
                    
                    return (
                      <div 
                        key={agent.id}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 relative group ${
                          isAgentActive 
                            ? 'bg-hatchin-blue/10 border-l-2 border-hatchin-blue' 
                            : 'hover:bg-hatchin-border hover:shadow-sm'
                        }`}
                      >
                        <div 
                          className="flex items-center gap-3 min-w-0 flex-1"
                          onClick={() => onSelectAgent(agent.id)}
                        >
                          <User className={`w-4 h-4 mr-1 ${getProjectIconColor(projects.find(p => p.id === agent.projectId)?.color || 'blue')}`} />
                          <span className="text-sm hatchin-text-muted">
                            {highlightMatch(agent.name, searchQuery)}
                          </span>
                        </div>
                        {onDeleteAgent && (
                          <button 
                            className="opacity-0 group-hover:opacity-100 hatchin-text-muted hover:text-red-400 transition-all flex-shrink-0 p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteAgent(agent.id);
                            }}
                            data-testid={`button-delete-agent-${agent.id}`}
                            title="Delete agent"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
