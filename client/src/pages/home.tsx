import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/AppHeader";
import { LeftSidebar } from "@/components/LeftSidebar";
import { CenterPanel } from "@/components/CenterPanel";
import { RightSidebar } from "@/components/RightSidebar";
import type { Project, Team, Agent } from "@shared/schema";

export default function Home() {
  const [activeProjectId, setActiveProjectId] = useState<string>("saas-startup");
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeProjectTeams = teams.filter(t => t.projectId === activeProjectId);
  const activeProjectAgents = agents.filter(a => a.projectId === activeProjectId);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        console.log('🔄 Sidebar toggle shortcut activated');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        console.log('🔍 Search focus shortcut activated');
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  return (
    <div className="hatchin-bg-dark min-h-screen overflow-hidden">
      <AppHeader />
      
      <div className="h-[calc(100vh-4rem)] p-2.5 flex gap-3">
        <LeftSidebar
          projects={projects}
          teams={teams}
          agents={agents}
          activeProjectId={activeProjectId}
          activeTeamId={activeTeamId}
          activeAgentId={activeAgentId}
          onSelectProject={setActiveProjectId}
          onSelectTeam={setActiveTeamId}
          onSelectAgent={setActiveAgentId}
        />
        
        <CenterPanel
          activeProject={activeProject}
          activeProjectTeams={activeProjectTeams}
          activeProjectAgents={activeProjectAgents}
          activeTeamId={activeTeamId}
          activeAgentId={activeAgentId}
        />
        
        <RightSidebar
          activeProject={activeProject}
        />
      </div>
    </div>
  );
}
