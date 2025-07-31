import { useState, useEffect, useRef } from "react";
import { ProjectTree } from "@/components/ProjectTree";
import { ChevronDown, Search, Settings, LogOut, User } from "lucide-react";
import type { Project, Team, Agent } from "@shared/schema";

interface LeftSidebarProps {
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

export function LeftSidebar({
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
}: LeftSidebarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside className="w-80 hatchin-bg-panel rounded-2xl p-4 overflow-y-auto pl-[20px] pr-[20px]">
      {/* Welcome Header */}
      <div ref={dropdownRef} className="relative mb-4 pb-4 hatchin-border border-b">
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-hatchin-border rounded-lg p-2 transition-colors"
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-hatchin-blue to-hatchin-green rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">S</span>
            </div>
            <span className="text-sm hatchin-text">Welcome, Shashank</span>
          </div>
          <ChevronDown className={`w-3 h-3 hatchin-text-muted transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
        </div>
        
        {/* User Dropdown Menu */}
        {isUserMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 hatchin-bg-card border hatchin-border rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="py-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm hatchin-text hover:bg-hatchin-border transition-colors">
                <User className="w-4 h-4" />
                Profile Settings
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm hatchin-text hover:bg-hatchin-border transition-colors">
                <Settings className="w-4 h-4" />
                Preferences
              </button>
              <div className="border-t hatchin-border my-1"></div>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm hatchin-text hover:bg-hatchin-border transition-colors">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 hatchin-text-muted" />
        <input 
          type="text" 
          placeholder="Search projects or hatches"
          className="w-full hatchin-bg-card hatchin-border border rounded-lg pl-10 pr-4 py-2.5 text-sm hatchin-text placeholder-hatchin-text-muted focus:outline-none focus:ring-2 focus:ring-hatchin-blue focus:border-transparent"
        />
      </div>
      {/* Projects Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium hatchin-text-muted uppercase tracking-wide text-[12px]">
            Projects
          </h2>
          <button className="hatchin-blue hover:bg-hatchin-card px-2 py-1 rounded text-xs font-medium transition-colors">
            + ADD PROJECT
          </button>
        </div>
        
        <ProjectTree
          projects={projects}
          teams={teams}
          agents={agents}
          activeProjectId={activeProjectId}
          activeTeamId={activeTeamId}
          activeAgentId={activeAgentId}
          expandedProjects={expandedProjects}
          expandedTeams={expandedTeams}
          onSelectProject={onSelectProject}
          onSelectTeam={onSelectTeam}
          onSelectAgent={onSelectAgent}
          onToggleProjectExpanded={onToggleProjectExpanded}
          onToggleTeamExpanded={onToggleTeamExpanded}
        />
      </div>
    </aside>
  );
}
