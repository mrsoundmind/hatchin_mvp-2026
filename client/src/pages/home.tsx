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
  const [activeChatMode, setActiveChatMode] = useState<'project' | 'team' | 'hatch' | null>('project');
  // All projects should always be expanded, and teams should be expanded by default
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [isEggHatching, setIsEggHatching] = useState(false);
  const [ideaProjectData, setIdeaProjectData] = useState<{
    name: string;
    description?: string;
  } | null>(null);
  const [starterPackProjectData, setStarterPackProjectData] = useState<{
    name: string;
    description?: string;
    starterPackId: string;
    starterPackTitle: string;
  } | null>(null);
  const [isPackHatching, setIsPackHatching] = useState(false);

  const { data: projects = [], refetch: refetchProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: teams = [], refetch: refetchTeams } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const { data: agents = [], refetch: refetchAgents } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeProjectTeams = teams.filter(t => t.projectId === activeProjectId);
  const activeProjectAgents = agents.filter(a => a.projectId === activeProjectId);

  // Auto-expand all projects and teams when data loads
  useEffect(() => {
    if (projects.length > 0) {
      setExpandedProjects(new Set(projects.map(p => p.id)));
    }
  }, [projects]);

  useEffect(() => {
    if (teams.length > 0) {
      setExpandedTeams(new Set(teams.map(t => t.id)));
    }
  }, [teams]);

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
        
        // Auto-expand the new project 
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
    
    // Wait a moment for data to sync, then find the most recent project with Maya
    setTimeout(async () => {
      try {
        // Refresh all data first
        await Promise.all([refetchProjects(), refetchTeams(), refetchAgents()]);
        
        // Get the latest projects data
        const [projectsRes, teamsRes, agentsRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/teams'),
          fetch('/api/agents')
        ]);
        
        const latestProjects = await projectsRes.json();
        const latestTeams = await teamsRes.json();
        const latestAgents = await agentsRes.json();
        
        // Find the most recently created project (highest timestamp or by name match)
        const newProject = latestProjects.find((p: any) => 
          ideaProjectData && p.name === ideaProjectData.name
        ) || latestProjects[latestProjects.length - 1];
        
        if (newProject) {
          // Find Maya agent for this project
          const mayaAgent = latestAgents.find((a: any) => 
            a.projectId === newProject.id && a.name === "Maya" && a.isSpecialAgent
          );
          
          // Find the Core Team for this project
          const coreTeam = latestTeams.find((t: any) => 
            t.projectId === newProject.id && t.name === "Core Team"
          );
          
          // Set this project as active and expand it, and expand the Core Team to show Maya
          setActiveProjectId(newProject.id);
          setActiveTeamId(null);
          setActiveAgentId(mayaAgent?.id || null);
          
          // Expand both project and core team to show Maya
          setExpandedProjects(prev => {
            const newSet = new Set(prev);
            newSet.add(newProject.id);
            return newSet;
          });
          
          if (coreTeam) {
            setExpandedTeams(prev => {
              const newSet = new Set(prev);
              newSet.add(coreTeam.id);
              return newSet;
            });
          }
        }
        
        setIdeaProjectData(null);
      } catch (error) {
        console.error('Error in handleEggHatchingComplete:', error);
        setIdeaProjectData(null);
      }
    }, 500);
  };

  const handleCreateProjectFromTemplate = async (pack: any, name: string, description?: string) => {
    try {
      setStarterPackProjectData({ 
        name, 
        description, 
        starterPackId: pack.id,
        starterPackTitle: pack.title 
      });
      setIsPackHatching(true);
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: description || pack.description,
          emoji: pack.emoji,
          color: pack.color,
          starterPackId: pack.id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create project');
      }
      
      const project = await response.json();
      console.log("Project created from template:", project);
      
      // Immediately refresh all data to get the new teams and agents
      await Promise.all([refetchProjects(), refetchTeams(), refetchAgents()]);
      
    } catch (error) {
      console.error('Error creating project from template:', error);
      setIsPackHatching(false);
      setStarterPackProjectData(null);
    }
  };

  // Pack hatching completion handler
  const handlePackHatchingComplete = async () => {
    setTimeout(async () => {
      try {
        // Close animation first
        setIsPackHatching(false);

        if (starterPackProjectData) {
          // Refresh all data to get the new project with teams and agents
          await Promise.all([refetchProjects(), refetchTeams(), refetchAgents()]);
          
          // Find the newly created project
          const projects = (await fetch('/api/projects').then(res => res.json())) as Project[];
          const newProject = projects.find(p => p.name === starterPackProjectData.name);
          
          if (newProject) {
            // Set the new project as active and expand it
            setActiveProjectId(newProject.id);
            setActiveTeamId(null);
            setActiveAgentId(null);
            
            // Auto-expand the new project and all its teams
            setExpandedProjects(prev => {
              const newSet = new Set(prev);
              newSet.add(newProject.id);
              return newSet;
            });
            
            // Get teams for this project and auto-expand them
            const teams = (await fetch(`/api/projects/${newProject.id}/teams`).then(res => res.json())) as Team[];
            setExpandedTeams(prev => {
              const newSet = new Set(prev);
              teams.forEach(team => newSet.add(team.id));
              return newSet;
            });
          }
        }
        
        // Reset the starter pack project data
        setStarterPackProjectData(null);
      } catch (error) {
        console.error('Error in handlePackHatchingComplete:', error);
        setStarterPackProjectData(null);
      }
    }, 500);
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
          activeChatMode={activeChatMode}
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
      
      {/* Starter Pack Hatching Animation */}
      {isPackHatching && starterPackProjectData && (
        <EggHatchingAnimation
          projectName={starterPackProjectData.name}
          completionTitle={`${starterPackProjectData.starterPackTitle} is Ready!`}
          completionSubtitle="Your team is assembled and ready to work."
          onComplete={handlePackHatchingComplete}
        />
      )}
    </div>
  );
}
