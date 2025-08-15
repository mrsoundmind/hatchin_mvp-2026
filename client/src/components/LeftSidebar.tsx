import { useState, useEffect, useRef } from "react";
import { ProjectTree } from "@/components/ProjectTree";
import { ChevronDown, Search, Settings, LogOut, User, X, Brain } from "lucide-react";
import type { Project, Team, Agent } from "@shared/schema";
import QuickStartModal from "@/components/QuickStartModal";
import StarterPacksModal from "@/components/StarterPacksModal";
import ProjectNameModal from "@/components/ProjectNameModal";

// Temporary type definition until import issues are resolved
interface StarterPack {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  members: string[];
  welcomeMessage: string;
}

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
  onCreateProject?: (name: string, description?: string) => void;
  onCreateProjectFromTemplate?: (pack: StarterPack, name: string, description?: string) => void;
  onCreateIdeaProject?: (name: string, description?: string) => void;
  onDeleteTeam?: (teamId: string) => void;
  onDeleteAgent?: (agentId: string) => void;
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
  onCreateProject,
  onCreateProjectFromTemplate,
  onCreateIdeaProject,
  onDeleteTeam,
  onDeleteAgent,
}: LeftSidebarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Add Project flow modals
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showStarterPacks, setShowStarterPacks] = useState(false);
  const [showProjectName, setShowProjectName] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<StarterPack | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [searchQuery]);

  // Filter projects, teams, and agents based on search
  const filterData = () => {
    if (!searchQuery.trim()) {
      return { filteredProjects: projects, filteredTeams: teams, filteredAgents: agents };
    }

    const query = searchQuery.toLowerCase();
    
    const filteredAgents = agents.filter(agent =>
      agent.name.toLowerCase().includes(query) ||
      agent.role.toLowerCase().includes(query)
    );
    
    const filteredTeams = teams.filter(team =>
      team.name.toLowerCase().includes(query) ||
      filteredAgents.some(agent => agent.teamId === team.id)
    );
    
    const filteredProjects = projects.filter(project =>
      project.name.toLowerCase().includes(query) ||
      filteredTeams.some(team => team.projectId === project.id)
    );

    return { filteredProjects, filteredTeams, filteredAgents };
  };

  const { filteredProjects, filteredTeams, filteredAgents } = filterData();

  // Add Project flow handlers
  const handleAddProjectClick = () => {
    setShowQuickStart(true);
  };

  const handleStartWithIdea = () => {
    setShowQuickStart(false);
    setShowProjectName(true);
    setSelectedTemplate(null);
  };

  const handleUseStarterPack = () => {
    setShowQuickStart(false);
    setShowStarterPacks(true);
  };

  const handleTemplateSelect = (pack: StarterPack) => {
    setSelectedTemplate(pack);
    setShowStarterPacks(false);
    setShowProjectName(true);
  };

  const handleProjectNameConfirm = async (name: string, description?: string) => {
    if (!name.trim()) return;
    
    setIsCreatingProject(true);
    
    try {
      if (selectedTemplate && onCreateProjectFromTemplate) {
        await onCreateProjectFromTemplate(selectedTemplate, name, description);
      } else if (selectedTemplate === null && onCreateIdeaProject) {
        // This is the "Start with an idea" flow
        await onCreateIdeaProject(name, description);
      } else if (onCreateProject) {
        await onCreateProject(name, description);
      }
      
      // Close all modals and reset state
      setShowProjectName(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleCloseModals = () => {
    setShowQuickStart(false);
    setShowStarterPacks(false);
    setShowProjectName(false);
    setSelectedTemplate(null);
  };



  return (
    <aside className="w-64 hatchin-bg-panel overflow-y-auto p-4 ml-[0px] mr-[0px] pl-[5px] pr-[5px]">
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
          ref={searchInputRef}
          type="text" 
          placeholder="Search projects or hatches (⌘K)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full hatchin-bg-card hatchin-border border rounded-lg py-2.5 text-sm hatchin-text placeholder-hatchin-text-muted focus:outline-none focus:ring-2 focus:ring-hatchin-blue focus:border-transparent pl-[32px] pr-[32px]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 hatchin-text-muted hover:hatchin-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {/* Projects Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium hatchin-text-muted uppercase tracking-wide text-[12px]">
            Projects
          </h2>
          <button 
            onClick={handleAddProjectClick}
            className="hatchin-blue hover:bg-hatchin-card px-2 py-1 rounded text-xs font-medium transition-colors"
          >
            + ADD PROJECT
          </button>
        </div>
        
        {filteredProjects.length > 0 ? (
          <ProjectTree
            projects={filteredProjects}
            teams={filteredTeams}
            agents={filteredAgents}
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
            onDeleteTeam={onDeleteTeam}
            onDeleteAgent={onDeleteAgent}
            searchQuery={searchQuery}
          />
        ) : searchQuery ? (
          <div className="text-center py-8">
            <div className="hatchin-text-muted text-sm">
              No results found for "{searchQuery}"
            </div>
            <button 
              onClick={() => setSearchQuery("")}
              className="hatchin-blue text-sm hover:underline mt-2"
            >
              Clear search
            </button>
          </div>
        ) : null}
      </div>
      {/* Add Project Modals */}
      <QuickStartModal
        isOpen={showQuickStart}
        onClose={handleCloseModals}
        onStartWithIdea={handleStartWithIdea}
        onUseStarterPack={handleUseStarterPack}
      />
      <StarterPacksModal
        isOpen={showStarterPacks}
        onClose={handleCloseModals}
        onBack={() => {
          setShowStarterPacks(false);
          setShowQuickStart(true);
        }}
        onSelectTemplate={handleTemplateSelect}
        isLoading={isCreatingProject}
      />
      <ProjectNameModal
        isOpen={showProjectName}
        onClose={handleCloseModals}
        onBack={() => {
          setShowProjectName(false);
          if (selectedTemplate) {
            setShowStarterPacks(true);
          } else {
            setShowQuickStart(true);
          }
        }}
        onConfirm={handleProjectNameConfirm}
        templateName={selectedTemplate?.title}
        templateDescription={selectedTemplate?.description}
        isLoading={isCreatingProject}
      />
    </aside>
  );
}
