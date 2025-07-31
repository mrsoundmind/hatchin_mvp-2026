import { ProjectTree } from "@/components/ProjectTree";
import { ChevronDown, Search } from "lucide-react";
import type { Project, Team, Agent } from "@shared/schema";

interface LeftSidebarProps {
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

export function LeftSidebar({
  projects,
  teams,
  agents,
  activeProjectId,
  activeTeamId,
  activeAgentId,
  onSelectProject,
  onSelectTeam,
  onSelectAgent,
}: LeftSidebarProps) {
  return (
    <aside className="w-80 hatchin-bg-panel rounded-2xl p-4 overflow-y-auto">
      {/* Welcome Header */}
      <div className="flex items-center justify-between mb-4 pb-4 hatchin-border border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-hatchin-blue to-hatchin-green rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-sm">S</span>
          </div>
          <span className="text-sm hatchin-text">Welcome, Shashank</span>
        </div>
        <ChevronDown className="w-3 h-3 hatchin-text-muted" />
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
          onSelectProject={onSelectProject}
          onSelectTeam={onSelectTeam}
          onSelectAgent={onSelectAgent}
        />
      </div>
    </aside>
  );
}
