# 🚀 Complete Onboarding System Documentation
**Exhaustive Technical Reference for Hatchin's Complete Onboarding Implementation**

**Source**: App.tsx - Complete line-by-line implementation analysis  
**Purpose**: Complete technical documentation for every aspect of the onboarding system  
**Scope**: Every state variable, function, animation, interaction, UI element, and data flow  
**Target**: Developers implementing the exact onboarding system

---

## 📋 **TABLE OF CONTENTS**

1. [Complete System Architecture](#complete-system-architecture)
2. [State Management Implementation](#state-management-implementation)
3. [Initialization Sequence Complete Breakdown](#initialization-sequence-complete-breakdown)
4. [Dark Mode Enforcement System](#dark-mode-enforcement-system)
5. [Default Data Creation Complete Process](#default-data-creation-complete-process)
6. [OnboardingModal Integration](#onboardingmodal-integration)
7. [ReturningUserWelcome Integration](#returninguserwelcome-integration)
8. [Project Creation Functions Complete Implementation](#project-creation-functions-complete-implementation)
9. [Template System Integration](#template-system-integration)
10. [Animation System Complete Integration](#animation-system-complete-integration)
11. [Event Handlers Complete Implementation](#event-handlers-complete-implementation)
12. [Mobile System Integration](#mobile-system-integration)
13. [Keyboard Shortcuts Implementation](#keyboard-shortcuts-implementation)
14. [LocalStorage Management System](#localstorage-management-system)
15. [Error Handling Complete System](#error-handling-complete-system)
16. [Data Flow Complete Mapping](#data-flow-complete-mapping)
17. [Component Props and Integration](#component-props-and-integration)
18. [Safe Rendering Implementation](#safe-rendering-implementation)

---

## 🏗️ **COMPLETE SYSTEM ARCHITECTURE**

### **Root Application Structure**
```typescript
// App.tsx - Complete export structure
export default function App(): JSX.Element {
  return (
    <ErrorBoundary>                    // Global error protection layer
      <AnimationProvider>              // Animation context provider for egg hatching & confetti
        <AppContent />                 // Main application logic container
      </AnimationProvider>
    </ErrorBoundary>
  );
}
```

### **AppContent Component Complete Structure**
```typescript
// AppContent - Complete function signature and implementation
function AppContent({}: AppContentProps): JSX.Element {
  // === ALL STATE DECLARATIONS ===
  // Panel visibility states
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);           // Desktop left sidebar visibility
  const [brainOpen, setBrainOpen] = useState<boolean>(true);               // Desktop right brain panel visibility
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);      // Mobile sidebar overlay visibility
  
  // Core data arrays
  const [projects, setProjects] = useState<Project[]>([]);                 // All projects in application
  const [agents, setAgents] = useState<Agent[]>([]);                       // All agents across all projects
  const [teams, setTeams] = useState<Team[]>([]);                          // All teams across all projects
  
  // Active selection states
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);    // Currently selected project ID
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);        // Currently selected agent ID
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);          // Currently selected team ID
  
  // View control states
  const [showTeamDashboard, setShowTeamDashboard] = useState<boolean>(false);     // Team dashboard modal visibility
  
  // Onboarding system states - CORE OF ONBOARDING
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);            // First-time user onboarding modal
  const [showReturningUserWelcome, setShowReturningUserWelcome] = useState<boolean>(false);  // Returning user welcome modal
  
  // Welcome message states
  const [teamJustAdded, setTeamJustAdded] = useState<boolean>(false);             // Team creation welcome message trigger
  const [mayaWelcomeMessage, setMayaWelcomeMessage] = useState<string | null>(null);  // Maya welcome message content
  
  // Brain panel data states
  const [projectBrainData, setProjectBrainData] = useState<Record<string, ProjectBrainData>>({});  // Project brain data by project ID
  const [teamMetrics, setTeamMetrics] = useState<TeamMetricsRecord>({});          // Team performance metrics by team ID
  
  // Animation hooks
  const { showEggHatching, showConfetti } = useAnimation();                       // Animation trigger functions from context
  
  // === DERIVED STATE CALCULATIONS ===
  // All use safe access patterns to prevent runtime errors
  const activeProject = activeProjectId ? safeArray(projects).find(p => p.id === activeProjectId) ?? null : null;
  const projectAgents = activeProjectId ? safeArray(agents).filter(a => a.projectId === activeProjectId) : [];
  const projectTeams = activeProjectId ? safeArray(teams).filter(t => t.projectId === activeProjectId) : [];
  const activeAgent = activeAgentId && safeArray(agents).length > 0 
    ? safeArray(agents).find(a => a.id === activeAgentId) ?? null 
    : null;
  const activeTeam = activeTeamId && safeArray(teams).length > 0 
    ? safeArray(teams).find(t => t.id === activeTeamId) ?? null 
    : null;
  
  // === ALL USEEFFECT HOOKS AND FUNCTIONS FOLLOW ===
  // [Complete implementation details in following sections]
}
```

### **Component Hierarchy with Error Boundaries**
```typescript
// Complete rendering structure with error boundary placement
return (
  <ErrorBoundary>                                    // Root error boundary
    <DndProvider backend={HTML5Backend}>             // Drag & drop context
      <div className="size-full bg-[#37383B] flex flex-col md:flex-row overflow-hidden">
        
        {/* Mobile Header - Conditional rendering */}
        <ErrorBoundary>
          <div className="md:hidden flex items-center bg-[#23262B] p-3 border-b border-[#43444B]">
            {/* Mobile header implementation */}
          </div>
        </ErrorBoundary>
        
        {/* Mobile Sidebar Overlay - Transform-based visibility */}
        <ErrorBoundary>
          <div className={`fixed inset-0 z-40 transition-transform duration-300 md:hidden ${
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            {/* Mobile sidebar with backdrop dismiss */}
          </div>
        </ErrorBoundary>
        
        {/* Desktop Slim Sidebar - Width-based conditional rendering */}
        <ErrorBoundary>
          <div className={`h-full transition-all duration-300 ease-out flex-shrink-0 hidden md:block ${
            sidebarOpen ? 'w-0' : 'w-14'
          }`}>
            {!sidebarOpen && <SlimSidebar setSidebarOpen={setSidebarOpen} />}
          </div>
        </ErrorBoundary>
        
        {/* Desktop Main Sidebar - Width and opacity-based visibility */}
        <ErrorBoundary>
          <div className={`h-full transition-all duration-300 ease-out bg-[#23262B] flex-shrink-0 hidden md:block ${
            sidebarOpen ? 'w-[260px] opacity-100' : 'w-0 opacity-0'
          }`}>
            {sidebarOpen && <ProjectSidebar /* all props */ />}
          </div>
        </ErrorBoundary>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden p-[10px]">
          {/* Chat interface or team dashboard */}
        </div>
        
        {/* Animation System */}
        <AnimationWrapper />
        
        {/* ONBOARDING MODAL - CORE ONBOARDING COMPONENT */}
        <ErrorBoundary>
          <OnboardingModal 
            isOpen={showOnboarding}                    // Controlled by onboarding state
            onClose={() => setShowOnboarding(false)}   // Direct state update
            onComplete={handleOnboardingComplete}      // Completion handler
            /* all other props */
          />
        </ErrorBoundary>

        {/* RETURNING USER WELCOME - RETURNING USER FLOW */}
        <ErrorBoundary>
          <ReturningUserWelcome
            isOpen={showReturningUserWelcome}          // Controlled by returning user state
            onClose={() => setShowReturningUserWelcome(false)}  // Direct state update
            onContinueLastProject={handleContinueLastProject}   // Continue handler
            onStartWithIdea={handleStartWithIdea}      // New idea handler
            onUseStarterPack={handleUseStarterPack}    // Starter pack handler
            /* all other props */
          />
        </ErrorBoundary>
      </div>
    </DndProvider>
  </ErrorBoundary>
);
```

---

## 🗃️ **STATE MANAGEMENT IMPLEMENTATION**

### **Onboarding-Specific State Variables**
```typescript
// === PRIMARY ONBOARDING CONTROL STATES ===
const [showOnboarding, setShowOnboarding] = useState<boolean>(true);
// Purpose: Controls first-time user onboarding modal visibility
// Initial value: true (shows onboarding by default)
// Modified by: handleOnboardingComplete(), debug shortcut
// Used by: OnboardingModal isOpen prop

const [showReturningUserWelcome, setShowReturningUserWelcome] = useState<boolean>(false);
// Purpose: Controls returning user welcome modal visibility
// Initial value: false (hidden by default)
// Modified by: initialization effect, returning user handlers
// Used by: ReturningUserWelcome isOpen prop

// === WELCOME MESSAGE STATES ===
const [mayaWelcomeMessage, setMayaWelcomeMessage] = useState<string | null>(null);
// Purpose: Stores Maya's welcome message content for display in chat
// Initial value: null (no message)
// Modified by: createIdeaProject(), handleMayaWelcomeShown()
// Used by: EnhancedMultiAgentChat for displaying Maya welcome

const [teamJustAdded, setTeamJustAdded] = useState<boolean>(false);
// Purpose: Triggers team welcome message display after team creation
// Initial value: false (no team just added)
// Modified by: createProjectFromStarterPack(), handleCreateTeam(), handleTeamMessageShown()
// Used by: EnhancedMultiAgentChat for displaying team welcome
```

### **State Dependencies and Cascading Updates**
```typescript
// === PROJECT SELECTION CASCADE ===
// When activeProjectId changes, clear child selections to prevent orphaned references
useEffect(() => {
  setActiveAgentId(null);                             // Clear agent selection
  setActiveTeamId(null);                              // Clear team selection
}, [activeProjectId]);                                // Dependency: activeProjectId changes

// This ensures that when a user switches projects:
// 1. Any selected agent from the previous project is deselected
// 2. Any selected team from the previous project is deselected
// 3. The UI reflects the correct context for the new project
```

### **Derived State with Safe Access Patterns**
```typescript
// === SAFE DERIVED STATE CALCULATIONS ===
// All derived state uses safeArray() and safeObject() to prevent runtime errors

// Active project - handles null activeProjectId and missing projects
const activeProject = activeProjectId 
  ? safeArray(projects).find(p => p.id === activeProjectId) ?? null 
  : null;

// Project agents - filters agents safely, returns empty array if no active project
const projectAgents = activeProjectId 
  ? safeArray(agents).filter(a => a.projectId === activeProjectId) 
  : [];

// Project teams - filters teams safely, returns empty array if no active project
const projectTeams = activeProjectId 
  ? safeArray(teams).filter(t => t.projectId === activeProjectId) 
  : [];

// Active agent - handles null activeAgentId and empty agents array
const activeAgent = activeAgentId && safeArray(agents).length > 0 
  ? safeArray(agents).find(a => a.id === activeAgentId) ?? null 
  : null;

// Active team - handles null activeTeamId and empty teams array
const activeTeam = activeTeamId && safeArray(teams).length > 0 
  ? safeArray(teams).find(t => t.id === activeTeamId) ?? null 
  : null;
```

---

## 🔄 **INITIALIZATION SEQUENCE COMPLETE BREAKDOWN**

### **Complete Initialization Effect Implementation**
```typescript
// Initialize with default projects and agents on first load
useEffect(() => {
  try {
    // === STEP 1: DEFAULT PROJECTS CREATION ===
    const defaultProjects: Project[] = [
      {
        id: "1",                                      // Fixed ID for consistency
        name: "SaaS Startup",                         // Fixed name
        description: "Building and launching a software-as-a-service product",  // Fixed description
        color: "amber",                               // Fixed color theme
        dateCreated: new Date(),                      // Current timestamp
        agents: []                                    // Will be populated after agent creation
      },
      {
        id: "2", 
        name: "Creative Studio",
        description: "Full-service creative agency managing client projects",
        color: "green",
        dateCreated: new Date(),
        agents: []
      },
      {
        id: "3",
        name: "Influencer Brand", 
        description: "Personal brand and content creation business",
        color: "blue",
        dateCreated: new Date(),
        agents: []
      },
      {
        id: "4",
        name: "Consulting Firm",
        description: "Strategic consulting and advisory services",
        color: "purple", 
        dateCreated: new Date(),
        agents: []
      },
      {
        id: "5",
        name: "Tech Incubator",
        description: "Supporting early-stage startups and MVP development",
        color: "blue",
        dateCreated: new Date(),
        agents: []
      }
    ];
    
    // === STEP 2: DEFAULT TEAMS CREATION ===
    const defaultTeams: Team[] = [
      {
        id: "team-1",                                 // Fixed team ID
        name: "Design Team",                          // Team name
        description: "User experience and interface design",  // Team description
        projectId: "1",                               // Links to SaaS Startup project
        color: "amber",                               // Matches project color
        dateCreated: new Date()                       // Current timestamp
      },
      {
        id: "team-2", 
        name: "Product Team",
        description: "Product development and quality assurance",
        projectId: "1",                               // Also links to SaaS Startup project
        color: "amber",
        dateCreated: new Date()
      },
      {
        id: "team-3",
        name: "Content Team", 
        description: "Creative content and brand strategy",
        projectId: "2",                               // Links to Creative Studio project
        color: "green",
        dateCreated: new Date()
      },
      {
        id: "team-4",
        name: "Client Strategy",
        description: "Account management and marketing strategy", 
        projectId: "2",                               // Also links to Creative Studio project
        color: "green",
        dateCreated: new Date()
      },
      {
        id: "team-5",
        name: "Social Team",
        description: "Social media management and content creation",
        projectId: "3",                               // Links to Influencer Brand project
        color: "blue", 
        dateCreated: new Date()
      },
      {
        id: "team-6",
        name: "Operations",
        description: "Business operations and community management",
        projectId: "3",                               // Also links to Influencer Brand project
        color: "blue", 
        dateCreated: new Date()
      },
      {
        id: "team-7",
        name: "Advisory Team",
        description: "Strategic consulting and data analysis",
        projectId: "4",                               // Links to Consulting Firm project
        color: "purple",
        dateCreated: new Date()
      },
      {
        id: "team-8", 
        name: "Support Team",
        description: "Research and client coordination",
        projectId: "4",                               // Also links to Consulting Firm project
        color: "purple",
        dateCreated: new Date()
      },
      {
        id: "team-9",
        name: "MVP Team",
        description: "Product development and user research",
        projectId: "5",                               // Links to Tech Incubator project
        color: "blue",
        dateCreated: new Date()
      },
      {
        id: "team-10",
        name: "Launch Ops", 
        description: "Growth strategy and launch management",
        projectId: "5",                               // Also links to Tech Incubator project
        color: "blue",
        dateCreated: new Date()
      }
    ];
    
    // === STEP 3: DEFAULT AGENTS CREATION ===
    const defaultAgents: Agent[] = [
      {
        id: "a1",                                     // Fixed agent ID
        name: "Product Designer",                     // Agent name
        role: "Lead Designer",                        // Agent role
        description: "Expert in user experience design and product strategy",  // Agent description
        color: "amber",                               // Color matches project
        projectId: "1",                               // Links to SaaS Startup project
        teamId: "team-1"                              // Links to Design Team
      },
      {
        id: "a2",
        name: "UI Engineer",
        role: "Frontend Developer",
        description: "Specializes in user interface implementation and design systems",
        color: "amber",
        projectId: "1", 
        teamId: "team-1"                              // Also links to Design Team
      },
      {
        id: "a3",
        name: "Product Manager", 
        role: "Product Lead",
        description: "Product strategy, roadmapping, and feature planning",
        color: "amber",
        projectId: "1",
        teamId: "team-2"                              // Links to Product Team
      },
      {
        id: "a4",
        name: "Backend Developer",
        role: "Engineering Lead",
        description: "Server-side development and system architecture",
        color: "amber", 
        projectId: "1",
        teamId: "team-2"                              // Also links to Product Team
      },
      {
        id: "a5",
        name: "QA Lead",
        role: "Quality Assurance",
        description: "Testing strategy and quality control processes",
        color: "amber",
        projectId: "1",
        teamId: "team-2"                              // Also links to Product Team
      }
    ];
    
    // === STEP 4: PROJECT AGENT SUMMARY UPDATE ===
    // Update projects with agent summaries for display purposes
    const updatedProjects = defaultProjects.map(project => {
      const projectAgents = defaultAgents.filter(agent => agent.projectId === project.id);
      return {
        ...project,
        agents: projectAgents.map(agent => ({
          name: safeString(agent.name),               // Safe string conversion
          role: safeString(agent.role),               // Safe string conversion
          color: safeString(agent.color)              // Safe string conversion
        }))
      };
    });
    
    // === STEP 5: DEFAULT BRAIN DATA CREATION ===
    const defaultBrainData: Record<string, ProjectBrainData> = {
      "1": {                                          // Data for SaaS Startup project
        documents: [
          {
            title: "Product Roadmap",
            description: "SaaS product development roadmap with feature priorities and timeline.",
            color: "amber",
            icon: "file"
          },
          {
            title: "User Research",
            description: "Target customer interviews, personas, and market validation data.",
            color: "amber", 
            icon: "clipboard"
          },
          {
            title: "Technical Specs",
            description: "System architecture, API documentation, and development standards.",
            color: "amber",
            icon: "book-open"
          }
        ],
        progress: 45,                                 // Initial progress percentage
        timeSpent: "32h 15m",                         // Initial time spent
        timeline: [
          {
            title: "MVP Planning",
            date: "May 20, 2025",
            status: "Completed",
            color: "amber"
          },
          {
            title: "Design & Development", 
            date: "May 21 - Jun 5, 2025",
            status: "In Progress",
            color: "amber"
          },
          {
            title: "Beta Launch",
            date: "June 10, 2025",
            status: "Upcoming",
            color: "gray"
          }
        ]
      }
    };
    
    // === STEP 6: TEAM METRICS INITIALIZATION ===
    // Initialize team metrics for all teams with randomized realistic data
    const defaultTeamMetrics: typeof teamMetrics = {};
    defaultTeams.forEach(team => {
      const teamAgents = defaultAgents.filter(agent => agent.teamId === team.id);
      defaultTeamMetrics[team.id] = {
        performance: Math.floor(Math.random() * 30) + 70,           // Random 70-100%
        tasksCompleted: Math.floor(Math.random() * 20) + 10,        // Random 10-30 tasks
        tasksInProgress: Math.floor(Math.random() * 8) + 2,         // Random 2-10 tasks
        responseTime: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9)}h`,  // Random 1.0-3.9h
        messagesSent: Math.floor(Math.random() * 100) + 50,         // Random 50-150 messages
        lastActive: `${Math.floor(Math.random() * 4) + 1}h ago`,    // Random 1-4h ago
        memberPerformance: teamAgents.map(agent => ({
          name: safeString(agent.name),
          performance: Math.floor(Math.random() * 25) + 75,         // Random 75-100%
          tasksCompleted: Math.floor(Math.random() * 15) + 5        // Random 5-20 tasks
        })),
        activityTimeline: [
          { date: "May 20", count: Math.floor(Math.random() * 10) + 5 },   // Random activity data
          { date: "May 21", count: Math.floor(Math.random() * 15) + 8 },
          { date: "May 22", count: Math.floor(Math.random() * 12) + 6 },
          { date: "May 23", count: Math.floor(Math.random() * 18) + 10 },
          { date: "May 24", count: Math.floor(Math.random() * 14) + 7 },
          { date: "May 25", count: Math.floor(Math.random() * 16) + 9 },
          { date: "May 26", count: Math.floor(Math.random() * 13) + 8 }
        ]
      };
    });
    
    // === STEP 7: ATOMIC STATE UPDATES ===
    // All state updates happen atomically to ensure consistency
    setProjects(updatedProjects);                     // Set projects with agent summaries
    setTeams(defaultTeams);                           // Set all teams
    setAgents(defaultAgents);                         // Set all agents
    setProjectBrainData(defaultBrainData);            // Set brain data
    setTeamMetrics(defaultTeamMetrics);               // Set team metrics
    setActiveProjectId("1");                          // Set first project as active
    
    // === STEP 8: ONBOARDING STATE DETERMINATION ===
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    
    if (hasCompletedOnboarding) {
      // Returning user flow
      setShowOnboarding(false);                       // Hide first-time onboarding
      setShowReturningUserWelcome(true);              // Show returning user welcome
    }
    // If hasCompletedOnboarding is null/undefined, showOnboarding remains true (first-time user)
    
  } catch (error) {
    console.error('Error initializing app data:', error);
    // Error handling: If initialization fails, app continues with empty state
  }
}, []); // Empty dependency array - runs once on component mount
```

---

## 🌚 **DARK MODE ENFORCEMENT SYSTEM**

### **Complete Dark Mode Implementation**
```typescript
// Enhanced dark mode enforcement with Safari-specific handling
useEffect(() => {
  if (typeof document !== 'undefined') {            // Browser environment check
    try {
      // === SAFARI DETECTION ===
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      // === LAYER 1: CSS CLASS ENFORCEMENT ===
      document.documentElement.classList.add('dark'); // Add dark class to html element
      
      // === LAYER 2: INLINE STYLE BACKUP ===
      // Set inline styles as backup for browser compatibility
      document.documentElement.style.backgroundColor = '#37383B';
      document.documentElement.style.color = '#F1F1F3';
      
      // === LAYER 3: BODY STYLING ===
      document.body.style.backgroundColor = '#37383B';
      document.body.style.color = '#F1F1F3';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.minHeight = '100vh';
      
      // === LAYER 4: ROOT DIV STYLING ===
      const rootDiv = document.getElementById('root');
      if (rootDiv) {
        rootDiv.style.backgroundColor = '#37383B';
        rootDiv.style.color = '#F1F1F3';
        rootDiv.style.minHeight = '100vh';
      }
      
      // === LAYER 5: SAFARI-SPECIFIC ADDITIONAL ENFORCEMENT ===
      if (isSafari) {
        const safariStyle = document.createElement('style');
        safariStyle.innerHTML = `
          * {
            -webkit-appearance: none !important;
          }
          html, body, #root {
            background-color: #37383B !important;
            color: #F1F1F3 !important;
          }
          div {
            border-color: #43444B !important;
          }
        `;
        document.head.appendChild(safariStyle);
        
        // === SAFARI FORCE REPAINT ===
        // Force repaint in Safari to ensure styles apply correctly
        setTimeout(() => {
          document.body.style.display = 'none';
          document.body.offsetHeight; // Trigger reflow
          document.body.style.display = '';
        }, 0);
      }
      
      // === LAYER 6: META THEME TAG ===
      const metaTheme = document.createElement('meta');
      metaTheme.name = 'theme-color';
      metaTheme.content = '#37383B';
      document.head.appendChild(metaTheme);
      
      // === DEBUG KEYBOARD SHORTCUT FOR ONBOARDING RESET ===
      const handleKeyDown = (e: KeyboardEvent): void => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
          e.preventDefault();                         // Prevent browser reload
          localStorage.removeItem('hasCompletedOnboarding');    // Clear onboarding flag
          setShowOnboarding(true);                    // Show onboarding modal
          setShowReturningUserWelcome(false);         // Hide returning user modal
          console.log('Onboarding reset! Refresh to see onboarding modal.');
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);        // Add global listener
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);   // Cleanup listener
      };
    } catch (error) {
      console.error('Error in dark mode setup:', error);
    }
  }
}, []); // Empty dependency array - runs once on mount
```

---

## 📱 **DEFAULT DATA CREATION COMPLETE PROCESS**

### **Project Creation Specifications**
```typescript
// === PROJECT STRUCTURE BREAKDOWN ===
// Each project follows this exact structure:
interface ProjectStructure {
  id: string;                    // Fixed ID for consistency across sessions
  name: string;                  // Display name for the project
  description: string;           // Project description for context
  color: ProjectColor;           // Theme color: "amber" | "green" | "blue" | "purple"
  dateCreated: Date;             // Timestamp of creation
  agents: AgentSummary[];        // Array of agent summaries for display
}

// Default projects represent different business archetypes:
// 1. "SaaS Startup" (amber) - Technology product development
// 2. "Creative Studio" (green) - Creative services and design
// 3. "Influencer Brand" (blue) - Personal brand and content
// 4. "Consulting Firm" (purple) - Professional services
// 5. "Tech Incubator" (blue) - Startup support and development
```

### **Team Organization Structure**
```typescript
// === TEAM STRUCTURE PER PROJECT ===
// Each project has 2 teams (except where noted):

// SaaS Startup (Project ID: "1"):
//   - Design Team (team-1): UI/UX focused team
//   - Product Team (team-2): Development and QA focused team

// Creative Studio (Project ID: "2"):
//   - Content Team (team-3): Creative content and brand strategy
//   - Client Strategy (team-4): Account management and marketing

// Influencer Brand (Project ID: "3"):
//   - Social Team (team-5): Social media and content creation
//   - Operations (team-6): Business operations and community

// Consulting Firm (Project ID: "4"):
//   - Advisory Team (team-7): Strategic consulting and analysis
//   - Support Team (team-8): Research and client coordination

// Tech Incubator (Project ID: "5"):
//   - MVP Team (team-9): Product development and user research
//   - Launch Ops (team-10): Growth strategy and launch management
```

### **Agent Assignment Logic**
```typescript
// === AGENT DISTRIBUTION ===
// Currently only SaaS Startup project has agents (5 agents across 2 teams):

// Design Team (team-1):
//   - Product Designer (a1): Lead Designer role
//   - UI Engineer (a2): Frontend Developer role

// Product Team (team-2):
//   - Product Manager (a3): Product Lead role
//   - Backend Developer (a4): Engineering Lead role
//   - QA Lead (a5): Quality Assurance role

// Other projects have teams but no agents initially
// Agents are added through onboarding (Maya) or template creation
```

---

## 🎨 **ONBOARDINGMODAL INTEGRATION**

### **Complete OnboardingModal Props**
```typescript
// === ONBOARDINGMODAL PROPS BINDING ===
<OnboardingModal 
  isOpen={showOnboarding}                    // Boolean: Controls modal visibility
  onClose={() => setShowOnboarding(false)}   // Function: Direct state update to hide modal
  onComplete={handleOnboardingComplete}      // Function: Completion handler with path logic
  activeProject={activeProject}             // Project | null: Currently active project object
  existingAgents={projectAgents}             // Agent[]: Agents in active project (derived state)
  onAddAgent={handleCreateAgent}             // Function: Agent creation handler
  onAddTeam={handleCreateTeam}               // Function: Team creation handler
  showAnimation={showEggHatching}            // Function: Animation trigger from context
/>
```

### **OnboardingModal State Control Logic**
```typescript
// === MODAL VISIBILITY CONTROL ===
// showOnboarding state controls OnboardingModal visibility:

// Initial state: true (modal shows on first load)
// State changes:
// 1. User completes onboarding → handleOnboardingComplete() → setShowOnboarding(false)
// 2. User closes modal → onClose callback → setShowOnboarding(false)
// 3. Debug shortcut → setShowOnboarding(true) (for testing)

// The modal is conditionally rendered:
{showOnboarding && <OnboardingModal /* props */ />}

// Modal is wrapped in ErrorBoundary to prevent crashes:
<ErrorBoundary>
  <OnboardingModal /* props */ />
</ErrorBoundary>
```

### **OnboardingModal Completion Flow**
```typescript
// === COMPLETION HANDLER IMPLEMENTATION ===
const handleOnboardingComplete = (
  path: 'idea' | 'template' | 'scratch', 
  templateName?: string, 
  templateData?: TemplateData
): void => {
  try {
    // === STEP 1: HIDE MODAL ===
    setShowOnboarding(false);                 // Close onboarding modal
    
    // === STEP 2: MARK AS COMPLETED ===
    localStorage.setItem('hasCompletedOnboarding', 'true');  // Persist completion status
    
    // === STEP 3: PATH-SPECIFIC LOGIC ===
    switch (path) {
      case 'idea':
        createIdeaProject();                  // Create Maya project
        break;
      case 'template':
        if (templateData) {                   // Validate template data exists
          createProjectFromStarterPack(templateData);  // Create template project
        }
        break;
      case 'scratch':
      default:
        // No action - user continues with existing default projects
        break;
    }
  } catch (error) {
    console.error('Error completing onboarding:', error);
    // Error handling: If completion fails, modal remains open
  }
};
```

---

## 🎪 **RETURNINGUSERWELCOME INTEGRATION**

### **Complete ReturningUserWelcome Props**
```typescript
// === RETURNINGUSERWELCOME PROPS BINDING ===
<ReturningUserWelcome
  isOpen={showReturningUserWelcome}          // Boolean: Controls modal visibility
  onClose={() => setShowReturningUserWelcome(false)}  // Function: Direct state update to hide modal
  onContinueLastProject={handleContinueLastProject}   // Function: Continue with current state
  onStartWithIdea={handleStartWithIdea}      // Function: Create new Maya project
  onUseStarterPack={handleUseStarterPack}    // Function: Template selection flow
  lastActiveProject={activeProject ? {       // Object | null: Active project info for display
    name: safeString(activeProject.name),
    description: safeString(activeProject.description)
  } : null}
/>
```

### **ReturningUserWelcome State Control Logic**
```typescript
// === MODAL VISIBILITY CONTROL ===
// showReturningUserWelcome state controls ReturningUserWelcome visibility:

// Initial state: false (modal hidden by default)
// State changes:
// 1. Initialization with hasCompletedOnboarding → setShowReturningUserWelcome(true)
// 2. User selects action → handler functions → setShowReturningUserWelcome(false)
// 3. User closes modal → onClose callback → setShowReturningUserWelcome(false)

// The modal is conditionally rendered:
{showReturningUserWelcome && <ReturningUserWelcome /* props */ />}

// Modal is wrapped in ErrorBoundary to prevent crashes:
<ErrorBoundary>
  <ReturningUserWelcome /* props */ />
</ErrorBoundary>
```

### **ReturningUserWelcome Event Handlers**
```typescript
// === CONTINUE LAST PROJECT HANDLER ===
const handleContinueLastProject = (): void => {
  try {
    setShowReturningUserWelcome(false);       // Close welcome modal
    // No other action - user continues with current application state
    // Active project, agents, teams remain as initialized
  } catch (error) {
    console.error('Error continuing last project:', error);
  }
};

// === START WITH IDEA HANDLER ===
const handleStartWithIdea = (): void => {
  try {
    createIdeaProject();                      // Create new Maya project (same as onboarding idea path)
    setShowReturningUserWelcome(false);       // Close welcome modal
    // Creates Maya agent, sets up brain data, triggers animation
  } catch (error) {
    console.error('Error starting with idea:', error);
  }
};

// === USE STARTER PACK HANDLER ===
const handleUseStarterPack = (): void => {
  try {
    setShowReturningUserWelcome(false);       // Close welcome modal
    // Note: This could open template selection modal
    // Currently just closes the welcome modal
    // Future implementation could open StarterPacksModal
  } catch (error) {
    console.error('Error using starter pack:', error);
  }
};
```

---

## 🏗️ **PROJECT CREATION FUNCTIONS COMPLETE IMPLEMENTATION**

### **createIdeaProject Complete Function**
```typescript
// Function to create Maya and "Start with an Idea" project
const createIdeaProject = useCallback((): string | null => {
  try {
    // === STEP 1: ID GENERATION ===
    const projectId = uuidv4();                // Generate unique project ID using UUID
    const mayaId = uuidv4();                   // Generate unique Maya agent ID using UUID
    
    // === STEP 2: PROJECT OBJECT CREATION ===
    const newProject: Project = {
      id: projectId,                           // UUID project ID
      name: "My Idea",                         // Fixed project name for idea projects
      description: "Developing and structuring my raw idea with Maya's help",  // Fixed description
      color: "blue",                           // Fixed blue color theme
      dateCreated: new Date(),                 // Current timestamp
      agents: [                                // Agent summary for project display
        { 
          name: "Maya", 
          role: "Product Manager", 
          color: "blue" 
        }
      ]
    };
    
    // === STEP 3: MAYA AGENT CREATION ===
    const maya: Agent = {
      id: mayaId,                              // UUID agent ID
      name: "Maya",                            // Fixed agent name
      role: "Product Manager",                 // Fixed agent role
      description: "Expert in product strategy, roadmapping, and turning ideas into actionable plans. Maya helps clarify concepts and build the right team.",  // Fixed description
      color: "blue",                           // Fixed blue color
      projectId: projectId                     // Links agent to project
      // Note: No teamId - Maya is independent, not part of a team
    };
    
    // === STEP 4: BRAIN DATA CREATION ===
    const newBrainData: ProjectBrainData = {
      documents: [
        {
          title: "Idea Development",            // Fixed document title
          description: "Working with Maya to structure and develop your raw idea into a concrete plan.",  // Fixed description
          color: "blue",                        // Matches project color
          icon: "lightbulb"                     // Fixed icon type
        }
      ],
      progress: 0,                             // Starting progress percentage
      timeSpent: "0h 0m",                      // Starting time spent
      timeline: [
        {
          title: "Idea Exploration",           // Initial milestone title
          date: new Date().toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),                                   // Today's date in "May 20, 2025" format
          status: "In Progress",                // Initial status
          color: "blue"                         // Matches project color
        }
      ]
    };
    
    // === STEP 5: ATOMIC STATE UPDATES ===
    setProjects(prev => [...prev, newProject]);                    // Add project to projects array
    setAgents(prev => [...prev, maya]);                            // Add Maya to agents array
    setProjectBrainData(prev => ({                                 // Add brain data for project
      ...prev,
      [projectId]: newBrainData
    }));
    
    // === STEP 6: SELECTION UPDATES ===
    setActiveProjectId(projectId);             // Set new project as active
    setActiveAgentId(mayaId);                  // Set Maya as active agent
    setActiveTeamId(null);                     // Clear team selection (Maya has no team)
    
    // === STEP 7: WELCOME MESSAGE SETUP ===
    setMayaWelcomeMessage("Hi! I'm Maya, your Product Manager Hatch 👋 Ready to unpack your idea and build your dream team step by step. Just tell me what's on your mind.");
    // This message will be displayed in EnhancedMultiAgentChat
    
    // === STEP 8: ANIMATION TRIGGER ===
    showEggHatching();                         // Trigger egg hatching animation
    
    return projectId;                          // Return project ID for success indication
  } catch (error) {
    console.error('Error creating idea project:', error);
    return null;                               // Return null for failure indication
  }
}, [showEggHatching]);                         // Dependency: animation function from context
```

### **createProjectFromStarterPack Complete Function**
```typescript
// Function to create a project from StarterPacksModal template data
const createProjectFromStarterPack = useCallback((templateData: TemplateData): string | null => {
  try {
    // === STEP 1: ID GENERATION ===
    const projectId = uuidv4();                // Generate unique project ID
    const teamId = uuidv4();                   // Generate unique team ID
    
    // === STEP 2: COLOR SELECTION ===
    const colors: ProjectColor[] = ["blue", "green", "purple", "amber"];  // Available color options
    const projectColor = (colors.includes(templateData.color as ProjectColor) 
      ? templateData.color 
      : colors[Math.floor(Math.random() * colors.length)]) as ProjectColor;  // Use template color or random fallback
    
    // === STEP 3: PROJECT CREATION ===
    const newProject: Project = {
      id: projectId,                           // UUID project ID
      name: safeString(templateData.title) || "New Project",               // Safe template title or fallback
      description: safeString(templateData.description) || "Project description",  // Safe template description or fallback
      color: projectColor,                     // Selected color
      dateCreated: new Date(),                 // Current timestamp
      agents: []                               // Will be populated after agent creation
    };
    
    // === STEP 4: TEAM CREATION ===
    const newTeam: Team = {
      id: teamId,                              // UUID team ID
      name: safeString(templateData.title) || "New Team",                  // Same as project name
      description: safeString(templateData.description) || "Team description",  // Same as project description
      projectId: projectId,                    // Links team to project
      color: projectColor,                     // Same as project color
      dateCreated: new Date()                  // Current timestamp
    };
    
    // === STEP 5: AGENTS CREATION FROM TEMPLATE ===
    const newAgents: Agent[] = safeArray(templateData.members).map((memberName) => {
      // Find corresponding hatch template definition
      const hatchTemplate = safeArray(allHatchTemplates).find(h => h.name === memberName);
      
      return {
        id: uuidv4(),                          // Generate unique agent ID
        name: safeString(memberName) || "New Agent",                       // Safe member name or fallback
        role: safeString(hatchTemplate?.role) || "Team Member",            // Hatch role or fallback
        description: safeString(hatchTemplate?.description) || `Member of the ${safeString(templateData.title)} team`,  // Hatch description or generated fallback
        color: safeString(hatchTemplate?.color) || projectColor,           // Hatch color or project color
        projectId: projectId,                  // Links agent to project
        teamId: teamId                         // Links agent to team
      };
    });
    
    // === STEP 6: PROJECT AGENT SUMMARY UPDATE ===
    newProject.agents = newAgents.map(agent => ({
      name: safeString(agent.name),            // Safe conversion for display
      role: safeString(agent.role),            // Safe conversion for display
      color: safeString(agent.color)           // Safe conversion for display
    }));
    
    // === STEP 7: BRAIN DATA CREATION ===
    const newBrainData: ProjectBrainData = {
      documents: [
        {
          title: "Project Brief",              // Fixed document title
          description: safeString(templateData.description) || "Project description",  // Template description or fallback
          color: projectColor,                 // Project color
          icon: "file"                         // Fixed icon type
        }
      ],
      progress: 0,                             // Starting progress percentage
      timeSpent: "0h 0m",                      // Starting time spent
      timeline: [
        {
          title: "Project Start",              // Initial milestone title
          date: new Date().toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),                                   // Today's date in "May 20, 2025" format
          status: "In Progress",                // Initial status
          color: projectColor                   // Project color
        }
      ]
    };
    
    // === STEP 8: TEAM METRICS CREATION ===
    const newTeamMetrics = {
      [teamId]: {                              // Metrics keyed by team ID
        performance: 0,                        // Starting performance percentage
        tasksCompleted: 0,                     // Starting tasks completed count
        tasksInProgress: 0,                    // Starting tasks in progress count
        responseTime: "0h",                    // Starting response time
        messagesSent: 0,                       // Starting messages count
        lastActive: "just now",                // Initial activity status
        memberPerformance: newAgents.map(agent => ({
          name: safeString(agent.name),        // Safe agent name
          performance: 0,                      // Starting member performance
          tasksCompleted: 0                    // Starting member tasks
        })),
        activityTimeline: [
          { date: "Today", count: 1 }          // Initial activity entry
        ]
      }
    };
    
    // === STEP 9: ATOMIC STATE UPDATES ===
    setProjects(prev => [...prev, newProject]);                           // Add project to array
    setTeams(prev => [...prev, newTeam]);                                 // Add team to array
    setAgents(prev => [...prev, ...newAgents]);                           // Add all agents to array
    setProjectBrainData(prev => ({                                        // Add brain data
      ...prev,
      [projectId]: newBrainData
    }));
    setTeamMetrics(prev => ({                                             // Add team metrics
      ...prev,
      ...newTeamMetrics
    }));
    
    // === STEP 10: SELECTION UPDATES ===
    setActiveProjectId(projectId);            // Set new project as active
    setActiveTeamId(teamId);                  // Set new team as active
    // Note: activeAgentId remains null - focus is on team, not individual agent
    
    // === STEP 11: WELCOME MESSAGE SETUP ===
    setTeamJustAdded(true);                   // Trigger team welcome message display
    // This flag will be used by EnhancedMultiAgentChat to show team introduction
    
    // === STEP 12: ANIMATION TRIGGER ===
    showEggHatching();                        // Trigger egg hatching animation
    
    return projectId;                         // Return project ID for success indication
  } catch (error) {
    console.error('Error creating project from starter pack:', error);
    return null;                              // Return null for failure indication
  }
}, [showEggHatching, allHatchTemplates]);     // Dependencies: animation function and hatch templates
```

---

## 🎬 **TEMPLATE SYSTEM INTEGRATION**

### **Template Import and Usage**
```typescript
// === TEMPLATE DATA IMPORTS ===
import { teamTemplates, allHatchTemplates } from './components/HatchTemplates';

// teamTemplates: TemplateData[] - Array of business template definitions
// allHatchTemplates: HatchTemplate[] - Array of individual agent/hatch definitions

// Template system is used in:
// 1. OnboardingModal - for template selection step
// 2. createProjectFromStarterPack - for agent creation
// 3. ReturningUserWelcome - potential future template selection
```

### **Template Data Structure Integration**
```typescript
// === TEMPLATEDATA INTERFACE ===
interface TemplateData {
  id: string;                                 // Unique template identifier
  title: string;                              // Template display name
  description: string;                        // Template description
  category: 'business' | 'creative' | 'tech' | 'consulting';  // Template category
  color: string;                              // Template color theme
  icon: string;                               // Template icon emoji
  members: string[];                          // Array of hatch member names
  tags?: string[];                            // Optional tags for filtering
}

// === HATCHTEMPLATE INTERFACE ===
interface HatchTemplate {
  name: string;                               // Agent name (matches templateData.members)
  role: string;                               // Agent role/job title
  description: string;                        // Agent description and expertise
  color: string;                              // Agent color theme
  expertise?: string[];                       // Optional expertise areas
}
```

### **Template to Project Creation Flow**
```typescript
// === TEMPLATE INTEGRATION PROCESS ===
// 1. User selects template in OnboardingModal
// 2. OnboardingModal calls onComplete with templateData
// 3. handleOnboardingComplete calls createProjectFromStarterPack(templateData)
// 4. createProjectFromStarterPack maps templateData.members to allHatchTemplates
// 5. Each member name finds corresponding hatch template
// 6. Agent objects created with hatch template data
// 7. All agents linked to same team and project
// 8. Team metrics initialized for the new team
// 9. Animation and welcome messages triggered

// Template member mapping example:
templateData.members = ["Maya", "Alex", "Jordan"];
// Maya maps to allHatchTemplates.find(h => h.name === "Maya")
// Alex maps to allHatchTemplates.find(h => h.name === "Alex")
// Jordan maps to allHatchTemplates.find(h => h.name === "Jordan")
```

---

## ✨ **ANIMATION SYSTEM COMPLETE INTEGRATION**

### **Animation Context Integration**
```typescript
// === ANIMATION CONTEXT USAGE ===
const { showEggHatching, showConfetti } = useAnimation();

// showEggHatching: () => void - Function to trigger egg hatching animation
// showConfetti: () => void - Function to trigger confetti animation

// Animation functions are called from:
// 1. createIdeaProject() - Always triggers egg hatching
// 2. createProjectFromStarterPack() - Always triggers egg hatching
// 3. handleCreateAgent() - Triggers egg hatching for first agent in project
// 4. handleCreateTeam() - Triggers egg hatching (via setTeamJustAdded)
// 5. handleCompleteMilestone() - Triggers confetti for milestone completion
```

### **Egg Hatching Animation Triggers**
```typescript
// === EGG HATCHING TRIGGER CONDITIONS ===

// 1. Maya Project Creation (createIdeaProject)
showEggHatching();                            // Always triggered when Maya project is created

// 2. Template Project Creation (createProjectFromStarterPack)
showEggHatching();                            // Always triggered when template project is created

// 3. First Agent in Project (handleCreateAgent)
const isFirstAgentInProject = !safeArray(agents).some(a => a.projectId === agent.projectId);
if (isFirstAgentInProject) {
  showEggHatching();                          // Only triggered for first agent in a project
}

// 4. Team Creation (handleCreateTeam)
setTeamJustAdded(true);                       // Sets flag that could trigger animation
// Note: Team creation indirectly triggers through setTeamJustAdded flag
```

### **Animation Wrapper Integration**
```typescript
// === ANIMATIONWRAPPER COMPONENT ===
function AnimationWrapper({}: AnimationWrapperProps): JSX.Element {
  const { isEggHatchingVisible, isConfettiVisible, hideEggHatching, hideConfetti } = useAnimation();
  
  return (
    <ErrorBoundary>
      {/* Egg Hatching Animation - Fixed overlay with backdrop */}
      {isEggHatchingVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <EggHatchingAnimation 
            size="lg" 
            onComplete={hideEggHatching}        // Cleanup callback to hide animation
          />
        </div>
      )}
      
      {/* Confetti Animation - Full screen overlay */}
      {isConfettiVisible && (
        <ConfettiAnimation onComplete={hideConfetti} />  // Cleanup callback to hide animation
      )}
    </ErrorBoundary>
  );
}

// Animation wrapper is rendered in AppContent:
<AnimationWrapper />

// Positioned after all other content to ensure animations appear on top
// Uses z-50 for maximum z-index to overlay all content
```

### **Confetti Animation Integration**
```typescript
// === CONFETTI TRIGGER IMPLEMENTATION ===
const handleCompleteMilestone = (projectId: string, milestoneIndex: number): void => {
  try {
    setProjectBrainData(prev => {
      const projectData = safeObject(prev[projectId]);
      if (projectData?.timeline && projectData.timeline[milestoneIndex]) {
        const updatedTimeline = [...projectData.timeline];
        updatedTimeline[milestoneIndex] = {
          ...updatedTimeline[milestoneIndex],
          status: "Completed"                   // Update milestone status
        };
        
        showConfetti();                         // Trigger confetti animation
        
        return {
          ...prev,
          [projectId]: {
            ...projectData,
            timeline: updatedTimeline
          }
        };
      }
      return prev;
    });
  } catch (error) {
    console.error('Error completing milestone:', error);
  }
};
```

---

## 🔧 **EVENT HANDLERS COMPLETE IMPLEMENTATION**

### **Core Onboarding Event Handlers**
```typescript
// === ONBOARDING COMPLETION HANDLER ===
const handleOnboardingComplete = (
  path: 'idea' | 'template' | 'scratch', 
  templateName?: string, 
  templateData?: TemplateData
): void => {
  try {
    // Step 1: Close onboarding modal
    setShowOnboarding(false);                 // Hide modal immediately
    
    // Step 2: Mark onboarding as completed
    localStorage.setItem('hasCompletedOnboarding', 'true');  // Persist completion
    
    // Step 3: Execute path-specific logic
    switch (path) {
      case 'idea':
        createIdeaProject();                  // Create Maya + "My Idea" project
        break;
      case 'template':
        if (templateData) {                   // Validate template data exists
          createProjectFromStarterPack(templateData);  // Create full team project
        }
        break;
      case 'scratch':
      default:
        // No action - user continues with existing default projects
        break;
    }
  } catch (error) {
    console.error('Error completing onboarding:', error);
    // If error occurs, modal remains closed but completion may have failed
  }
};

// === RETURNING USER EVENT HANDLERS ===
const handleContinueLastProject = (): void => {
  try {
    setShowReturningUserWelcome(false);       // Close welcome modal
    // No state changes - user continues with current application state
  } catch (error) {
    console.error('Error continuing last project:', error);
  }
};

const handleStartWithIdea = (): void => {
  try {
    createIdeaProject();                      // Same logic as onboarding idea path
    setShowReturningUserWelcome(false);       // Close welcome modal
  } catch (error) {
    console.error('Error starting with idea:', error);
  }
};

const handleUseStarterPack = (): void => {
  try {
    setShowReturningUserWelcome(false);       // Close welcome modal
    // Future implementation: could open template selection modal
  } catch (error) {
    console.error('Error using starter pack:', error);
  }
};
```

### **Welcome Message Handlers**
```typescript
// === MAYA WELCOME MESSAGE HANDLER ===
const handleMayaWelcomeShown = (): void => {
  setMayaWelcomeMessage(null);                // Clear Maya welcome message
  // Called by EnhancedMultiAgentChat when user dismisses welcome message
};

// === TEAM WELCOME MESSAGE HANDLER ===
const handleTeamMessageShown = (): void => {
  setTeamJustAdded(false);                    // Clear team welcome trigger flag
  // Called by EnhancedMultiAgentChat when user dismisses team welcome message
};
```

### **Project and Agent Selection Handlers**
```typescript
// === PROJECT SELECTION HANDLER ===
const handleSelectProject = (projectId: string): void => {
  try {
    setActiveProjectId(projectId);            // Set new active project
    setActiveTeamId(null);                    // Clear team selection (cascade)
    setActiveAgentId(null);                   // Clear agent selection (cascade)
    setShowTeamDashboard(false);              // Close team dashboard if open
  } catch (error) {
    console.error('Error selecting project:', error);
  }
};

// === AGENT SELECTION HANDLER ===
const handleSelectAgent = (agentId: string | null): void => {
  try {
    setActiveAgentId(agentId);                // Set active agent (or null to clear)
    
    if (agentId) {
      const agent = safeArray(agents).find(a => a.id === agentId);
      if (!agent?.teamId) {                   // If agent has no team
        setActiveTeamId(null);                // Clear team selection
      }
      // If agent has team, team selection could be updated elsewhere
    }
  } catch (error) {
    console.error('Error selecting agent:', error);
  }
};

// === TEAM SELECTION HANDLER ===
const handleSelectTeam = (teamId: string, projectId: string): void => {
  try {
    if (activeProjectId !== projectId) {     // Switch project if different
      setActiveProjectId(projectId);
    }
    
    setActiveTeamId(teamId);                  // Set active team
    setActiveAgentId(null);                   // Clear agent selection
    setShowTeamDashboard(false);              // Close team dashboard if open
  } catch (error) {
    console.error('Error selecting team from sidebar:', error);
  }
};

// === SIDEBAR AGENT SELECTION HANDLER ===
const handleSidebarSelectAgent = (agentId: string, projectId: string): void => {
  try {
    if (activeProjectId !== projectId) {     // Switch project if different
      setActiveProjectId(projectId);
    }
    
    setActiveAgentId(agentId);                // Set active agent
    
    const agent = safeArray(agents).find(a => a.id === agentId);
    if (agent?.teamId) {                      // If agent belongs to a team
      setActiveTeamId(agent.teamId);          // Set team context
    } else {
      setActiveTeamId(null);                  // Clear team selection
    }
    
    setShowTeamDashboard(false);              // Close team dashboard if open
  } catch (error) {
    console.error('Error selecting agent from sidebar:', error);
  }
};
```

### **Creation Handlers**
```typescript
// === PROJECT CREATION HANDLER ===
const handleCreateProject = (project: Project): void => {
  try {
    setProjects(prev => [...prev, project]); // Add project to array
    setActiveProjectId(project.id);          // Set as active
    setActiveTeamId(null);                    // Clear team selection
    setActiveAgentId(null);                   // Clear agent selection
  } catch (error) {
    console.error('Error creating project:', error);
  }
};

// === AGENT CREATION HANDLER ===
const handleCreateAgent = (agent: Agent): void => {
  try {
    // Check if this is the first agent in the project
    const isFirstAgentInProject = !safeArray(agents).some(a => a.projectId === agent.projectId);
    if (isFirstAgentInProject) {
      showEggHatching();                      // Trigger animation for first agent
    }
    
    setAgents(prev => [...prev, agent]);     // Add agent to array
    
    // Update project's agent summary
    setProjects(prev => prev.map(project => {
      if (project.id === agent.projectId) {
        return {
          ...project,
          agents: [
            ...project.agents, 
            { 
              name: safeString(agent.name), 
              role: safeString(agent.role), 
              color: safeString(agent.color) 
            }
          ]
        };
      }
      return project;
    }));
  } catch (error) {
    console.error('Error creating agent:', error);
  }
};

// === TEAM CREATION HANDLER ===
const handleCreateTeam = (team: Team, teamAgents: Agent[]): void => {
  try {
    setTeams(prev => [...prev, team]);       // Add team to array
    
    const safeAgents: Agent[] = [];
    
    if (teamAgents && Array.isArray(teamAgents)) {
      try {
        setAgents(prev => [...prev, ...teamAgents]);  // Add all team agents
        safeAgents.push(...teamAgents);
        
        if (safeAgents.length > 0) {
          // Update project's agent summary
          setProjects(prev => prev.map(project => {
            if (project.id === team.projectId) {
              const newAgentEntries = safeAgents.map(agent => ({
                name: safeString(agent.name),
                role: safeString(agent.role),
                color: safeString(agent.color)
              }));
              
              return {
                ...project,
                agents: [...project.agents, ...newAgentEntries]
              };
            }
            return project;
          }));
        }
        
        // Initialize team metrics
        setTeamMetrics(prev => ({
          ...prev,
          [team.id]: {
            performance: 0,
            tasksCompleted: 0,
            tasksInProgress: 0,
            responseTime: "0h",
            messagesSent: 0,
            lastActive: "just now",
            memberPerformance: safeAgents.map(agent => ({
              name: safeString(agent.name),
              performance: 0,
              tasksCompleted: 0
            })),
            activityTimeline: [
              { date: "Today", count: 1 }
            ]
          }
        }));
      } catch (error) {
        console.error("Error processing team agents:", error);
      }
    }
    
    setTeamJustAdded(true);                   // Trigger team welcome message
  } catch (error) {
    console.error('Error creating team:', error);
  }
};
```

---

## 📱 **MOBILE SYSTEM INTEGRATION**

### **Mobile Navigation State**
```typescript
// === MOBILE-SPECIFIC STATE ===
const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
// Purpose: Controls mobile sidebar overlay visibility
// Separate from desktop sidebarOpen to handle different behaviors
// Mobile sidebar slides over content, desktop sidebar pushes content
```

### **Mobile Header Implementation**
```typescript
// === MOBILE TOP NAVIGATION ===
// Rendered only on mobile devices (md:hidden class)
<div className="md:hidden flex items-center bg-[#23262B] p-3 border-b border-[#43444B]">
  {/* Hamburger menu button */}
  <button 
    onClick={() => setMobileNavOpen(!mobileNavOpen)}    // Toggle mobile sidebar
    className="p-2 text-[#A6A7AB] hover:text-[#F1F1F3]"
  >
    {/* SVG hamburger icon */}
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />    {/* Top line */}
      <line x1="3" y1="6" x2="21" y2="6" />      {/* Middle line */}
      <line x1="3" y1="18" x2="21" y2="18" />    {/* Bottom line */}
    </svg>
  </button>
  
  {/* App title */}
  <span className="text-[#F1F1F3] ml-3 text-lg">Hatchin</span>
  
  {/* Right side actions */}
  <div className="ml-auto flex gap-2">
    {/* Brain panel toggle button */}
    <button 
      onClick={() => setBrainOpen(!brainOpen)}          // Toggle brain panel
      className="p-2 text-[#A6A7AB] hover:text-[#F1F1F3]"
    >
      {/* SVG brain icon */}
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </button>
  </div>
</div>
```

### **Mobile Sidebar Overlay Implementation**
```typescript
// === MOBILE SIDEBAR OVERLAY ===
// Uses transform-based slide animation
<div 
  className={`fixed inset-0 z-40 transition-transform duration-300 md:hidden ${
    mobileNavOpen ? 'translate-x-0' : '-translate-x-full'    // Slide animation
  }`}
>
  {/* Backdrop - Click to close */}
  <div 
    className="absolute inset-0 bg-black/50" 
    onClick={() => setMobileNavOpen(false)}                  // Backdrop dismiss
  ></div>
  
  {/* Sidebar content */}
  <div className="absolute top-0 left-0 h-full w-64 bg-[#23262B] shadow-xl">
    {/* Sidebar header with close button */}
    <div className="p-4 border-b border-[#43444B] flex justify-between items-center">
      <h2 className="text-[#F1F1F3]">Projects</h2>
      <button 
        onClick={() => setMobileNavOpen(false)}             // Explicit close button
        className="text-[#A6A7AB] hover:text-[#F1F1F3]"
      >
        {/* SVG close icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />           {/* X close icon */}
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
    
    {/* ProjectSidebar content */}
    <div className="overflow-y-auto h-[calc(100%-60px)]">   {/* Scrollable content area */}
      <ProjectSidebar 
        setSidebarOpen={() => setMobileNavOpen(false)}     // Close mobile nav instead of desktop sidebar
        /* ... all other props ... */
        onSelectProject={(id) => {                         // Auto-close on project selection
          handleSelectProject(id);
          setMobileNavOpen(false);                          // Close mobile sidebar
        }}
        /* ... other handlers with auto-close behavior ... */
      />
    </div>
  </div>
</div>
```

### **Mobile Brain Panel Implementation**
```typescript
// === MOBILE BRAIN PANEL ===
// Brain panel becomes full-screen overlay on mobile
<div 
  className={`transition-all duration-300 ease-out flex-shrink-0 rounded-xl overflow-hidden bg-[#23262B] shadow-lg
    ${brainOpen ? 'md:w-[280px] opacity-100' : 'md:w-0 opacity-0'}              // Desktop behavior
    ${brainOpen ? 'fixed inset-0 z-30 md:static' : 'hidden md:block md:w-0'}    // Mobile: full-screen overlay
  `}
>
  {brainOpen && (
    <>
      {/* Mobile-only close button */}
      <button 
        className="absolute top-4 right-4 p-2 rounded-full bg-[#37383B] text-[#F1F1F3] md:hidden"
        onClick={() => setBrainOpen(false)}                // Close brain panel
      >
        {/* SVG close icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      
      {/* DynamicSidebar content */}
      <DynamicSidebar
        brainOpen={brainOpen}
        setBrainOpen={setBrainOpen}
        /* ... all other props ... */
      />
    </>
  )}
</div>
```

---

## ⌨️ **KEYBOARD SHORTCUTS IMPLEMENTATION**

### **Keyboard Shortcuts Effect**
```typescript
// Add keyboard shortcuts for toggling sidebar (Ctrl+B) and brain (Ctrl+P)
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent): void => {
    try {
      // === SIDEBAR TOGGLE SHORTCUT ===
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();                   // Prevent browser bookmark shortcut
        setSidebarOpen(prev => !prev);       // Toggle desktop sidebar state
      }
      
      // === BRAIN PANEL TOGGLE SHORTCUT ===
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();                   // Prevent browser print shortcut
        setBrainOpen(prev => !prev);         // Toggle brain panel state
      }
    } catch (error) {
      console.error('Error in keyboard handler:', error);
    }
  };

  window.addEventListener('keydown', handleKeyDown);        // Add global listener
  
  return () => {
    window.removeEventListener('keydown', handleKeyDown);   // Cleanup listener
  };
}, []); // Empty dependency array - runs once on mount
```

### **Debug Keyboard Shortcut**
```typescript
// === DEBUG ONBOARDING RESET SHORTCUT ===
// Implemented in dark mode effect for consolidated keyboard handling
const handleKeyDown = (e: KeyboardEvent): void => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
    e.preventDefault();                       // Prevent browser refresh
    localStorage.removeItem('hasCompletedOnboarding');    // Clear completion flag
    setShowOnboarding(true);                  // Show onboarding modal
    setShowReturningUserWelcome(false);       // Hide returning user modal
    console.log('Onboarding reset! Refresh to see onboarding modal.');
  }
};

// Added to dark mode effect's event listener
window.addEventListener('keydown', handleKeyDown);
```

### **Keyboard Shortcut Summary**
```typescript
// === KEYBOARD SHORTCUTS REFERENCE ===
// Ctrl+B / Cmd+B: Toggle left sidebar (desktop only)
// Ctrl+P / Cmd+P: Toggle right brain panel (desktop and mobile)
// Ctrl+Shift+R / Cmd+Shift+R: Reset onboarding (debug only)

// Notes:
// - All shortcuts check for both Ctrl (Windows/Linux) and Cmd (Mac)
// - preventDefault() called to override browser default behaviors
// - Shortcuts are global and work from anywhere in the application
// - Error handling prevents shortcuts from crashing the app
```

---

## 💾 **LOCALSTORAGE MANAGEMENT SYSTEM**

### **LocalStorage Key and Operations**
```typescript
// === LOCALSTORAGE KEY DEFINITION ===
const ONBOARDING_COMPLETION_KEY = 'hasCompletedOnboarding';
// Single key used for tracking onboarding completion status
// Value: 'true' when completed, null/undefined when not completed

// === READING LOCALSTORAGE ===
const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
// Returns: 'true' if onboarding completed, null if not completed
// Used in initialization effect to determine first-time vs returning user

// === WRITING LOCALSTORAGE ===
localStorage.setItem('hasCompletedOnboarding', 'true');
// Called in handleOnboardingComplete() when user completes onboarding
// Marks user as having completed the onboarding process

// === CLEARING LOCALSTORAGE ===
localStorage.removeItem('hasCompletedOnboarding');
// Called in debug shortcut (Ctrl+Shift+R) to reset onboarding status
// Allows testing of onboarding flow by resetting to first-time user state
```

### **LocalStorage Logic Flow**
```typescript
// === INITIALIZATION LOGIC ===
// In initialization effect:
const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');

if (hasCompletedOnboarding) {
  // User has completed onboarding before (returning user)
  setShowOnboarding(false);                   // Hide first-time onboarding
  setShowReturningUserWelcome(true);          // Show returning user welcome
} else {
  // User has not completed onboarding (first-time user)
  // showOnboarding remains true (initial state)
  // showReturningUserWelcome remains false (initial state)
}

// === COMPLETION LOGIC ===
// In handleOnboardingComplete():
localStorage.setItem('hasCompletedOnboarding', 'true');    // Mark as completed
setShowOnboarding(false);                     // Hide onboarding modal

// === RESET LOGIC ===
// In debug shortcut:
localStorage.removeItem('hasCompletedOnboarding');        // Clear completion flag
setShowOnboarding(true);                      // Show onboarding modal
setShowReturningUserWelcome(false);           // Hide returning user modal
```

### **LocalStorage Error Handling**
```typescript
// === LOCALSTORAGE ACCESS SAFETY ===
// All localStorage operations are wrapped in try-catch blocks
// localStorage may not be available in some environments (SSR, private browsing)

try {
  const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
  // Process onboarding state
} catch (error) {
  console.error('Error accessing localStorage:', error);
  // Fallback: treat as first-time user if localStorage unavailable
}

try {
  localStorage.setItem('hasCompletedOnboarding', 'true');
} catch (error) {
  console.error('Error setting localStorage:', error);
  // Non-critical: onboarding completion state may not persist
}
```

---

## 🚨 **ERROR HANDLING COMPLETE SYSTEM**

### **ErrorBoundary Component Usage**
```typescript
// === ERROR BOUNDARY HIERARCHY ===
// Multi-level error boundaries to contain failures

// Root Level - App component
<ErrorBoundary>                               // Catches any uncaught errors
  <AnimationProvider>
    <AppContent />
  </AnimationProvider>
</ErrorBoundary>

// AppContent Level - Major sections
<ErrorBoundary>                               // App content root
  <DndProvider backend={HTML5Backend}>
    // Main application content
  </DndProvider>
</ErrorBoundary>

// Component Level - Individual components
<ErrorBoundary>                               // Mobile header
  <div className="md:hidden">/* Mobile header content */</div>
</ErrorBoundary>

<ErrorBoundary>                               // Mobile sidebar
  <div className="fixed inset-0">/* Mobile sidebar content */</div>
</ErrorBoundary>

<ErrorBoundary>                               // Desktop sidebars
  <div className="h-full">/* Sidebar content */</div>
</ErrorBoundary>

<ErrorBoundary>                               // Animation wrapper
  <AnimationWrapper />
</ErrorBoundary>

<ErrorBoundary>                               // Onboarding modal
  <OnboardingModal /* props */ />
</ErrorBoundary>

<ErrorBoundary>                               // Returning user welcome
  <ReturningUserWelcome /* props */ />
</ErrorBoundary>
```

### **Try-Catch Error Handling**
```typescript
// === FUNCTION-LEVEL ERROR HANDLING ===
// All major functions wrapped in try-catch blocks

// Initialization effect
useEffect(() => {
  try {
    // Default data initialization
  } catch (error) {
    console.error('Error initializing app data:', error);
    // Graceful degradation: app continues with empty state
  }
}, []);

// Project creation functions
const createIdeaProject = useCallback((): string | null => {
  try {
    // Project creation logic
    return projectId;                         // Success: return project ID
  } catch (error) {
    console.error('Error creating idea project:', error);
    return null;                              // Failure: return null
  }
}, [showEggHatching]);

// Event handlers
const handleSelectProject = (projectId: string): void => {
  try {
    // Selection logic
  } catch (error) {
    console.error('Error selecting project:', error);
    // Error logged, but app continues functioning
  }
};

// === ERROR HANDLING PATTERNS ===
// 1. Log errors with descriptive messages
// 2. Return null/false for functions that should indicate failure
// 3. Use defensive programming with safe accessors
// 4. Graceful degradation rather than crashes
// 5. User experience preserved even when errors occur
```

### **Safe Data Access Patterns**
```typescript
// === SAFE RENDERING UTILITIES ===
import { safeString, safeArray, safeObject } from './lib/safeRender';

// All data access uses safe utilities to prevent runtime errors

// Safe array access
const projectAgents = activeProjectId 
  ? safeArray(agents).filter(a => a.projectId === activeProjectId) 
  : [];
// safeArray() ensures agents is always an array, even if undefined/null

// Safe object access
const projectData = safeObject(projectBrainData[projectId]);
// safeObject() ensures object exists before property access

// Safe string access
const agentName = safeString(agent.name);
// safeString() ensures string value, converts null/undefined to empty string

// === DEFENSIVE PROGRAMMING ===
// Check for existence before operations
if (activeProjectId && safeArray(projects).length > 0) {
  const project = projects.find(p => p.id === activeProjectId);
  if (project) {
    // Safe to access project properties
  }
}

// Use optional chaining for nested properties
const teamData = teamMetrics[activeTeam?.id];
if (teamData?.memberPerformance) {
  // Safe to access member performance data
}
```

---

## 🔄 **DATA FLOW COMPLETE MAPPING**

### **First-Time User Complete Flow**
```typescript
// === FIRST-TIME USER JOURNEY ===
// 1. App.tsx loads → AppContent component mounts
// 2. useEffect (initialization) runs:
//    └── localStorage.getItem('hasCompletedOnboarding') → null (first visit)
//    └── showOnboarding remains true (initial state)
//    └── showReturningUserWelcome remains false (initial state)
//    └── Default projects, teams, agents created
//    └── setActiveProjectId("1") - SaaS Startup active

// 3. AppContent renders:
//    └── OnboardingModal renders (isOpen={showOnboarding} → true)
//    └── ReturningUserWelcome hidden (isOpen={showReturningUserWelcome} → false)

// 4. User interacts with OnboardingModal:
//    └── Selects path (idea/template/scratch)
//    └── Optionally selects template (if template path)
//    └── Clicks completion action

// 5. OnboardingModal calls onComplete callback:
//    └── handleOnboardingComplete(path, templateName?, templateData?) called
//    └── setShowOnboarding(false) - modal closes
//    └── localStorage.setItem('hasCompletedOnboarding', 'true') - mark completed
//    └── Path-specific logic:
//        ├── case 'idea': createIdeaProject() called
//        ├── case 'template': createProjectFromStarterPack(templateData) called
//        └── case 'scratch': no action

// 6A. If idea path (createIdeaProject):
//     └── Create "My Idea" project with Maya agent
//     └── setActiveProjectId(projectId) - switch to new project
//     └── setActiveAgentId(mayaId) - Maya becomes active
//     └── setMayaWelcomeMessage(...) - set welcome message
//     └── showEggHatching() - trigger animation

// 6B. If template path (createProjectFromStarterPack):
//     └── Create project with full team from template
//     └── setActiveProjectId(projectId) - switch to new project
//     └── setActiveTeamId(teamId) - team becomes active
//     └── setTeamJustAdded(true) - trigger team welcome
//     └── showEggHatching() - trigger animation

// 7. App re-renders with new state:
//    └── OnboardingModal hidden
//    └── New project/agents visible in sidebar
//    └── Chat interface shows new context
//    └── Brain panel shows new project data
//    └── Animation plays over everything

// 8. Welcome messages display:
//    └── Maya welcome (if idea path) or team welcome (if template path)
//    └── User can dismiss messages to clear them
```

### **Returning User Complete Flow**
```typescript
// === RETURNING USER JOURNEY ===
// 1. App.tsx loads → AppContent component mounts
// 2. useEffect (initialization) runs:
//    └── localStorage.getItem('hasCompletedOnboarding') → 'true' (returning user)
//    └── setShowOnboarding(false) - hide first-time onboarding
//    └── setShowReturningUserWelcome(true) - show returning user welcome
//    └── Default projects, teams, agents created (same as first-time)
//    └── setActiveProjectId("1") - SaaS Startup active

// 3. AppContent renders:
//    └── OnboardingModal hidden (isOpen={showOnboarding} → false)
//    └── ReturningUserWelcome renders (isOpen={showReturningUserWelcome} → true)

// 4. User selects action in ReturningUserWelcome:
//    ├── "Continue Last Project" → handleContinueLastProject()
//    ├── "Start with New Idea" → handleStartWithIdea()
//    └── "Use Starter Pack" → handleUseStarterPack()

// 5A. Continue Last Project:
//     └── setShowReturningUserWelcome(false) - close modal
//     └── No other changes - user continues with current state

// 5B. Start with New Idea:
//     └── createIdeaProject() - same as onboarding idea path
//     └── setShowReturningUserWelcome(false) - close modal

// 5C. Use Starter Pack:
//     └── setShowReturningUserWelcome(false) - close modal
//     └── Could open template selection (future implementation)

// 6. App continues with selected flow
//    └── Default projects remain available
//    └── New projects added if created
//    └── Animations trigger if applicable
```

### **State Update Cascade Patterns**
```typescript
// === PROJECT SELECTION CASCADE ===
// When activeProjectId changes:
handleSelectProject(newProjectId) →
  setActiveProjectId(newProjectId) →        // Primary state change
  useEffect dependency trigger →            // Side effect
    setActiveAgentId(null) →                // Clear child selection
    setActiveTeamId(null) →                 // Clear child selection
  Derived state recalculation →             // Automatic updates
    activeProject = projects.find(...) →   // New active project
    projectAgents = agents.filter(...) →   // New project agents
    projectTeams = teams.filter(...) →     // New project teams
  Component re-renders →                    // UI updates
    Sidebar highlights new project →       // Visual feedback
    Chat interface switches context →      // Content updates
    Brain panel shows new data →           // Data updates

// === AGENT SELECTION CASCADE ===
// When agent selected from sidebar:
handleSidebarSelectAgent(agentId, projectId) →
  Project switch check →
    if (activeProjectId !== projectId) →
      setActiveProjectId(projectId) →      // Switch project first
      Project cascade triggers (above) →   // Full project cascade
  setActiveAgentId(agentId) →              // Set agent
  Team context check →
    if (agent.teamId) →
      setActiveTeamId(agent.teamId) →      // Set team context
    else →
      setActiveTeamId(null) →              // Clear team context
  setShowTeamDashboard(false) →            // Close dashboard
  Component re-renders →                   // UI updates
    Chat switches to 1:1 agent mode →     // Chat context
    Brain panel shows agent data →        // Agent insights
```

### **Animation Coordination Flow**
```typescript
// === ANIMATION TRIGGER COORDINATION ===
// Project creation triggers animation sequence:
createIdeaProject() OR createProjectFromStarterPack() →
  State updates (atomic) →                 // All project/agent/team state
    setProjects([...prev, newProject]) →
    setAgents([...prev, ...newAgents]) →
    setTeams([...prev, newTeam]) →         // (if template)
  Selection updates →                      // Set as active
    setActiveProjectId(projectId) →
    setActiveAgentId(...) OR setActiveTeamId(...) →
  Welcome message setup →                  // Prepare messages
    setMayaWelcomeMessage(...) OR setTeamJustAdded(true) →
  Animation trigger →                      // Start animation
    showEggHatching() →
  Animation context state update →         // Animation context
    setIsEggHatchingVisible(true) →
  AnimationWrapper re-renders →            // Animation component
    EggHatchingAnimation displays →        // Visual animation
  Animation completion →                   // After ~3 seconds
    onComplete={hideEggHatching} →
    setIsEggHatchingVisible(false) →
  Animation cleanup →                      // Animation hidden
    AnimationWrapper re-renders (empty) →
  Welcome messages display →               // In chat interface
    EnhancedMultiAgentChat checks states →
    Maya welcome OR team welcome shows →
  User dismisses messages →                // User interaction
    handleMayaWelcomeShown() OR handleTeamMessageShown() →
    setMayaWelcomeMessage(null) OR setTeamJustAdded(false) →
  Complete state normalized →              // Final state
    No active animations or messages →
    User continues with new project/agents
```

This complete documentation provides every technical detail needed to understand and implement the entire onboarding system exactly as it exists in the App.tsx file.