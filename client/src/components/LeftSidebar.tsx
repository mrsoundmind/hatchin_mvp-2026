import { ProjectTree } from "@/components/ProjectTree";
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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium hatchin-text-muted uppercase tracking-wide">
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
