import { ChevronDown, ChevronRight, MoreHorizontal, FileText } from "lucide-react";
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
      case 'orange':
      case 'amber':
        return 'bg-[#FFB547]';
      case 'blue':
        return 'bg-[#6C82FF]';
      case 'green':
        return 'bg-[#47DB9A]';
      case 'purple':
        return 'bg-[#9F7BFF]';
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
                className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer rounded-lg p-2 transition-all duration-200 hover:bg-hatchin-border hover:shadow-sm pt-[7px] pb-[7px] ml-[4px] mr-[4px] mt-[-3px] mb-[-3px]"
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
                <span className="text-sm font-medium hatchin-text truncate">
                  {highlightMatch(project.name, searchQuery)}
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
                          className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer rounded-lg p-1 transition-all duration-200 hover:bg-hatchin-border hover:shadow-sm mt-[-4px] mb-[-4px]"
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
                            {highlightMatch(team.name, searchQuery)}
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
                                    ? 'hatchin-bg-card hatchin-border border shadow-sm' 
                                    : 'hover:bg-hatchin-border hover:shadow-sm'
                                }`}
                                onClick={() => onSelectAgent(agent.id)}
                              >
                                <div className={`w-6 h-6 rounded-full flex-shrink-0 ${getAgentColorClass(agent.color)} flex items-center justify-center`}>
                                  <span className="text-xs font-semibold text-white">
                                    {getAgentInitials(agent.name)}
                                  </span>
                                </div>
                                <span className="text-sm hatchin-text-muted truncate">
                                  {highlightMatch(agent.name, searchQuery)}
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
