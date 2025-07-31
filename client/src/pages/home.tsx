import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { LeftSidebar } from "@/components/LeftSidebar";
import { CenterPanel } from "@/components/CenterPanel";
import { RightSidebar } from "@/components/RightSidebar";
import type { Project, Team, Agent } from "@shared/schema";

export default function Home() {
  const [activeProjectId, setActiveProjectId] = useState<string>("saas-startup");
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set(["saas-startup"]));
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

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

  // Toggle functions for expand/collapse
  const toggleProjectExpanded = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const toggleTeamExpanded = (teamId: string) => {
    setExpandedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  // Selection handlers with proper state clearing
  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setActiveTeamId(null);
    setActiveAgentId(null);
  };

  const handleSelectTeam = (teamId: string | null) => {
    setActiveTeamId(teamId);
    setActiveAgentId(null);
  };

  const handleSelectAgent = (agentId: string | null) => {
    setActiveAgentId(agentId);
  };

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
      <div className="h-screen p-2.5 flex gap-3">
        <LeftSidebar
          projects={projects}
          teams={teams}
          agents={agents}
          activeProjectId={activeProjectId}
          activeTeamId={activeTeamId}
          activeAgentId={activeAgentId}
          expandedProjects={expandedProjects}
          expandedTeams={expandedTeams}
          onSelectProject={handleSelectProject}
          onSelectTeam={handleSelectTeam}
          onSelectAgent={handleSelectAgent}
          onToggleProjectExpanded={toggleProjectExpanded}
          onToggleTeamExpanded={toggleTeamExpanded}
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
