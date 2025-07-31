import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { LeftSidebar } from "@/components/LeftSidebar";
import { CenterPanel } from "@/components/CenterPanel";
import { RightSidebar } from "@/components/RightSidebar";
import { EggHatchingAnimation } from "@/components/EggHatchingAnimation";
import type { Project, Team, Agent } from "@shared/schema";

export default function Home() {
  const [activeProjectId, setActiveProjectId] = useState<string>("saas-startup");
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set(["saas-startup"]));
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [isEggHatching, setIsEggHatching] = useState(false);
  const [ideaProjectData, setIdeaProjectData] = useState<{
    name: string;
    description?: string;
  } | null>(null);

  const { data: projects = [], refetch: refetchProjects } = useQuery<Project[]>({
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

  // Project creation handlers
  const handleCreateProject = async (name: string, description?: string) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: description || `${name} project`,
          emoji: '🚀',
          color: 'blue'
        }),
      });

      if (response.ok) {
        const newProject = await response.json();
        console.log('Project created successfully:', newProject);
        
        // Set the new project as active
        setActiveProjectId(newProject.id);
        setActiveTeamId(null);
        setActiveAgentId(null);
        
        // Expand the new project  
        setExpandedProjects(prev => {
          const newSet = new Set(prev);
          newSet.add(newProject.id);
          return newSet;
        });
        
        // Trigger data refresh
        refetchProjects();
      } else {
        console.error('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  // Idea project creation handler
  const handleCreateIdeaProject = async (name: string, description?: string) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: description || `${name} project`,
          emoji: '🚀',
          color: 'purple',
          projectType: 'idea' // This triggers Maya agent creation and brain initialization
        }),
      });

      if (response.ok) {
        const newProject = await response.json();
        console.log('Idea project created successfully:', newProject);
        
        // Store project data for the egg hatching animation
        setIdeaProjectData({ name, description });
        
        // Start the egg hatching animation
        setIsEggHatching(true);
        
        // Trigger data refresh
        refetchProjects();
        
        return newProject;
      } else {
        console.error('Failed to create idea project');
      }
    } catch (error) {
      console.error('Error creating idea project:', error);
    }
  };

  // Handle egg hatching completion
  const handleEggHatchingComplete = async () => {
    setIsEggHatching(false);
    setIdeaProjectData(null);
    
    // Find the Maya agent for the newly created project
    const mayaAgent = agents.find(agent => 
      agent.isSpecialAgent && 
      agent.name === "Maya" &&
      ideaProjectData
    );
    
    if (mayaAgent) {
      // Navigate to Maya chat
      window.location.href = `/maya/${mayaAgent.projectId}`;
    }
  };

  const handleCreateProjectFromTemplate = async (pack: any, name: string, description?: string) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: description || pack.description,
          emoji: pack.emoji || '🚀',
          color: pack.color || 'blue'
        }),
      });

      if (response.ok) {
        const newProject = await response.json();
        console.log('Project created from template:', newProject);
        
        // Set the new project as active
        setActiveProjectId(newProject.id);
        setActiveTeamId(null);
        setActiveAgentId(null);
        
        // Expand the new project
        setExpandedProjects(prev => {
          const newSet = new Set(prev);
          newSet.add(newProject.id);
          return newSet;
        });
        
        // Trigger data refresh
        refetchProjects();
      } else {
        console.error('Failed to create project from template');
      }
    } catch (error) {
      console.error('Error creating project from template:', error);
    }
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
          onCreateProject={handleCreateProject}
          onCreateProjectFromTemplate={handleCreateProjectFromTemplate}
          onCreateIdeaProject={handleCreateIdeaProject}
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
      
      {/* Egg Hatching Animation */}
      {isEggHatching && ideaProjectData && (
        <EggHatchingAnimation
          projectName={ideaProjectData.name}
          onComplete={handleEggHatchingComplete}
        />
      )}
    </div>
  );
}
