# 🎯 Complete Interaction System Guide
**Comprehensive Technical Reference for All Hatchin Interactions**

**Source**: App.tsx + Complete System Analysis  
**Purpose**: Complete documentation of every interaction, logic flow, and user experience pattern  
**Scope**: Every click, hover, keyboard shortcut, animation, state change, and data flow  
**Target**: Developers implementing the complete interaction system

---

## 📋 **TABLE OF CONTENTS**

1. [System Architecture & Component Hierarchy](#system-architecture--component-hierarchy)
2. [State Management & Data Flow](#state-management--data-flow)
3. [Panel Management System Complete](#panel-management-system-complete)
4. [Navigation & Selection Logic Complete](#navigation--selection-logic-complete)
5. [Mobile Interaction System Complete](#mobile-interaction-system-complete)
6. [Component-Level Interactions](#component-level-interactions)
7. [Modal & Dialog System Complete](#modal--dialog-system-complete)
8. [Animation System Integration](#animation-system-integration)
9. [Keyboard Shortcuts & Accessibility](#keyboard-shortcuts--accessibility)
10. [Event Handlers Complete Implementation](#event-handlers-complete-implementation)
11. [Error Handling & Safe Patterns](#error-handling--safe-patterns)
12. [Responsive Behavior & Breakpoints](#responsive-behavior--breakpoints)
13. [Data Persistence & LocalStorage](#data-persistence--localstorage)
14. [Complete Interaction Flows](#complete-interaction-flows)
15. [Implementation Patterns & Best Practices](#implementation-patterns--best-practices)

---

## 🏗️ **SYSTEM ARCHITECTURE & COMPONENT HIERARCHY**

### **Application Structure with Interaction Points**
```typescript
App (Root)
├── ErrorBoundary (Global error handling)
├── AnimationProvider (Animation context)
└── AppContent (Main interaction container)
    ├── Mobile Header (768px-) [INTERACTION POINT]
    │   ├── Hamburger Menu → toggles mobileNavOpen
    │   ├── App Title → non-interactive display
    │   └── Brain Toggle → toggles brainOpen
    ├── Mobile Sidebar Overlay (768px-) [INTERACTION POINT]
    │   ├── Backdrop → closes on click
    │   ├── Close Button → closes sidebar
    │   └── ProjectSidebar Content → full navigation
    ├── Desktop Slim Sidebar [INTERACTION POINT]
    │   └── Expand Button → opens main sidebar
    ├── Desktop Main Sidebar [INTERACTION POINT]
    │   ├── Collapse Button → closes to slim sidebar
    │   ├── Project Navigation → selection & creation
    │   ├── Team Navigation → selection & management
    │   └── Agent Navigation → selection & management
    ├── Main Content Area [INTERACTION POINT]
    │   ├── Team Dashboard (conditional) → team management
    │   └── Enhanced Multi-Agent Chat (default) → messaging
    ├── Desktop Slim Brain [INTERACTION POINT]
    │   └── Expand Button → opens brain panel
    ├── Desktop Brain Panel [INTERACTION POINT]
    │   ├── Collapse Button → closes to slim brain
    │   ├── Project Brain → insights & documents
    │   ├── Progress Ring → milestone tracking
    │   └── Timeline → milestone management
    ├── Animation Wrapper [INTERACTION POINT]
    │   ├── Egg Hatching Animation → project/agent creation
    │   └── Confetti Animation → milestone completion
    ├── Onboarding Modal [INTERACTION POINT]
    │   ├── Multi-step flow → path selection
    │   ├── Template selection → team creation
    │   └── Completion actions → project creation
    └── Returning User Welcome [INTERACTION POINT]
        ├── Continue Last Project → resume state
        ├── Start with Idea → Maya creation
        └── Use Starter Pack → template selection
```

### **State Management Architecture**
```typescript
// === CORE STATE VARIABLES ===
const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);           // Desktop sidebar state
const [brainOpen, setBrainOpen] = useState<boolean>(true);               // Desktop brain panel state
const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);      // Mobile sidebar overlay

// === DATA STATES ===
const [projects, setProjects] = useState<Project[]>([]);                 // All projects
const [agents, setAgents] = useState<Agent[]>([]);                       // All agents
const [teams, setTeams] = useState<Team[]>([]);                          // All teams

// === SELECTION STATES ===
const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
const [activeTeamId, setActiveTeamId] = useState<string | null>(null);

// === VIEW STATES ===
const [showTeamDashboard, setShowTeamDashboard] = useState<boolean>(false);
const [showOnboarding, setShowOnboarding] = useState<boolean>(true);
const [showReturningUserWelcome, setShowReturningUserWelcome] = useState<boolean>(false);

// === INTERACTION STATES ===
const [teamJustAdded, setTeamJustAdded] = useState<boolean>(false);      // Welcome message trigger
const [mayaWelcomeMessage, setMayaWelcomeMessage] = useState<string | null>(null);  // Maya welcome content

// === DERIVED STATES WITH SAFE ACCESS ===
const activeProject = activeProjectId ? safeArray(projects).find(p => p.id === activeProjectId) ?? null : null;
const projectAgents = activeProjectId ? safeArray(agents).filter(a => a.projectId === activeProjectId) : [];
const projectTeams = activeProjectId ? safeArray(teams).filter(t => t.projectId === activeProjectId) : [];
const activeAgent = activeAgentId && safeArray(agents).length > 0 
  ? safeArray(agents).find(a => a.id === activeAgentId) ?? null : null;
const activeTeam = activeTeamId && safeArray(teams).length > 0 
  ? safeArray(teams).find(t => t.id === activeTeamId) ?? null : null;
```

---

## 🗃️ **STATE MANAGEMENT & DATA FLOW**

### **State Dependencies & Cascading Logic**
```typescript
// === PROJECT SELECTION CASCADE ===
// When project changes, clear all child selections to prevent orphaned references
useEffect(() => {
  setActiveAgentId(null);    // Clear agent selection
  setActiveTeamId(null);     // Clear team selection
}, [activeProjectId]);       // Dependency: project ID changes

// WHY: When switching projects, agents and teams from the previous project
// should not remain selected as they don't belong to the new project
// HOW: useEffect with activeProjectId dependency automatically clears children
// WHEN: Immediately after activeProjectId state update
// WHERE: AppContent component, line ~200 in App.tsx
```

### **Safe Data Access Patterns**
```typescript
// === DEFENSIVE PROGRAMMING ===
// All data access uses safe utilities to prevent runtime errors

// Safe array access - prevents undefined/null array operations
const projectAgents = activeProjectId 
  ? safeArray(agents).filter(a => a.projectId === activeProjectId) 
  : [];
// WHY: agents could be undefined during initialization or error states
// HOW: safeArray() utility ensures agents is always an array
// WHEN: On every render when projectAgents is calculated
// WHERE: Derived state calculation in AppContent

// Safe object access - prevents property access on undefined objects
const activeProject = activeProjectId 
  ? safeArray(projects).find(p => p.id === activeProjectId) ?? null 
  : null;
// WHY: projects array might be empty or project might not exist
// HOW: Optional chaining (?.) and nullish coalescing (??) operators
// WHEN: On every render when activeProject is calculated
// WHERE: Derived state calculation in AppContent

// Safe string conversion - prevents null/undefined string errors
const projectName = safeString(activeProject?.name);
// WHY: Project name could be undefined or null
// HOW: safeString() utility converts null/undefined to empty string
// WHEN: When displaying project names in UI components
// WHERE: Used throughout component prop passing
```

### **Data Flow Patterns**
```typescript
// === USER ACTION → STATE UPDATE → UI REFRESH PATTERN ===

// 1. User clicks project in sidebar
handleSelectProject(projectId) →
  // 2. State updates occur atomically
  setActiveProjectId(projectId) →
  setActiveTeamId(null) →
  setActiveAgentId(null) →
  setShowTeamDashboard(false) →
  // 3. useEffect triggers cascade
  useEffect([activeProjectId]) →
  // 4. Derived state recalculates
  activeProject = projects.find(...) →
  projectAgents = agents.filter(...) →
  // 5. Components re-render with new state
  ProjectSidebar highlights new project →
  EnhancedMultiAgentChat switches context →
  DynamicSidebar shows new project data →
  // 6. Visual feedback confirms action
  UI reflects new project selection

// WHY: This pattern ensures consistent state across all components
// HOW: React's state management and useEffect hooks coordinate updates
// WHEN: Every user interaction that changes application state
// WHERE: All selection handlers follow this pattern
```

---

## 🎛️ **PANEL MANAGEMENT SYSTEM COMPLETE**

### **Desktop Sidebar Management**
```typescript
// === SIDEBAR TOGGLE LOGIC ===
const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

// INTERACTION: User clicks collapse button in main sidebar
// WHAT HAPPENS:
// 1. setSidebarOpen(false) called
// 2. Main sidebar width animates: w-[260px] → w-0
// 3. Main sidebar opacity animates: opacity-100 → opacity-0
// 4. Slim sidebar width animates: w-0 → w-14
// 5. Slim sidebar opacity animates: opacity-0 → opacity-100
// 6. Content area expands to fill space

// CSS CLASSES & TRANSITIONS:
const sidebarClasses = `
  h-full transition-all duration-300 ease-out bg-[#23262B] flex-shrink-0 hidden md:block
  ${sidebarOpen ? 'w-[260px] opacity-100' : 'w-0 opacity-0'}
`;

const slimSidebarClasses = `
  h-full transition-all duration-300 ease-out flex-shrink-0 hidden md:block
  ${sidebarOpen ? 'w-0' : 'w-14'}
`;

// TIMING: 300ms ease-out transition
// TRIGGER ELEMENTS:
// - Collapse button in ProjectSidebar header
// - Expand button in SlimSidebar
// - Keyboard shortcut Ctrl+B / Cmd+B

// INTERACTION: User clicks expand button in slim sidebar
// WHAT HAPPENS:
// 1. setSidebarOpen(true) called
// 2. Slim sidebar width animates: w-14 → w-0
// 3. Slim sidebar opacity animates: opacity-100 → opacity-0
// 4. Main sidebar width animates: w-0 → w-[260px]
// 5. Main sidebar opacity animates: opacity-0 → opacity-100
// 6. Content area contracts to accommodate sidebar

// WHY THIS PATTERN:
// - Provides maximum screen real estate when collapsed
// - Maintains quick access to expand functionality
// - Smooth animations provide visual feedback
// - Consistent with desktop application patterns
```

### **Desktop Brain Panel Management**
```typescript
// === BRAIN PANEL TOGGLE LOGIC ===
const [brainOpen, setBrainOpen] = useState<boolean>(true);

// INTERACTION: User clicks collapse button in brain panel
// WHAT HAPPENS:
// 1. setBrainOpen(false) called
// 2. Brain panel width animates: md:w-[280px] → md:w-0
// 3. Brain panel opacity animates: opacity-100 → opacity-0
// 4. Slim brain width animates: w-0 → w-10
// 5. Slim brain opacity animates: opacity-0 → opacity-100
// 6. Main content area expands

// CSS CLASSES & TRANSITIONS:
const brainPanelClasses = `
  transition-all duration-300 ease-out flex-shrink-0 rounded-xl overflow-hidden bg-[#23262B] shadow-lg
  ${brainOpen ? 'md:w-[280px] opacity-100' : 'md:w-0 opacity-0'}
  ${brainOpen ? 'fixed inset-0 z-30 md:static' : 'hidden md:block md:w-0'}
`;

const slimBrainClasses = `
  transition-all duration-300 ease-out flex-shrink-0 rounded-xl overflow-hidden hidden md:block
  ${brainOpen ? 'w-0 opacity-0' : 'w-10 opacity-100'}
`;

// MOBILE BEHAVIOR DIFFERENCE:
// Desktop: Animates width and shows slim version
// Mobile: Becomes full-screen overlay with close button

// INTERACTION: User clicks expand button in slim brain
// WHAT HAPPENS:
// 1. setBrainOpen(true) called
// 2. Slim brain animates to hidden
// 3. Brain panel animates to visible
// 4. On mobile: becomes full-screen overlay
// 5. Content adjusts to accommodate panel

// TRIGGER ELEMENTS:
// - Collapse button in DynamicSidebar header
// - Expand button in SlimBrain
// - Brain toggle in mobile header
// - Keyboard shortcut Ctrl+P / Cmd+P
```

### **Panel State Coordination**
```typescript
// === INDEPENDENT PANEL STATES ===
// Sidebar and brain panel operate independently
// User can have any combination:
// - Both open (default): Full workspace view
// - Sidebar only: Focus on project navigation
// - Brain only: Focus on project insights
// - Both closed: Maximum content area

// LAYOUT CALCULATIONS:
// Content width = Total width - (sidebar width + brain width + gaps)
// Sidebar: 260px (open) or 56px (slim) or 0px (mobile)
// Brain: 280px (open) or 40px (slim) or 0px (mobile overlay)
// Gaps: 12px between main content and brain panel

// RESPONSIVE BEHAVIOR:
// Desktop (≥768px): Side-by-side panels with animations
// Mobile (<768px): Overlay panels with backdrop dismiss
```

---

## 🧭 **NAVIGATION & SELECTION LOGIC COMPLETE**

### **Project Selection System**
```typescript
// === PROJECT SELECTION HANDLER ===
const handleSelectProject = (projectId: string): void => {
  try {
    // STEP 1: Set new active project
    setActiveProjectId(projectId);
    
    // STEP 2: Clear child selections (cascade effect)
    setActiveTeamId(null);
    setActiveAgentId(null);
    
    // STEP 3: Close overlays
    setShowTeamDashboard(false);
    
    // WHY CASCADE CLEARING:
    // Teams and agents belong to specific projects
    // Selecting a new project should clear selections from previous project
    // Prevents orphaned references and inconsistent UI state
    
    // VISUAL FEEDBACK:
    // - Previous project loses selection highlight
    // - New project gains selection highlight (accent border/background)
    // - Chat interface updates to show new project context
    // - Brain panel switches to new project data
    // - Sidebar agent/team lists update to new project
    
  } catch (error) {
    console.error('Error selecting project:', error);
    // Error handling ensures app continues functioning even if selection fails
  }
};

// TRIGGER SOURCES:
// - Project card click in ProjectSidebar
// - Project selection in mobile sidebar
// - Onboarding completion (auto-selection)
// - Template creation completion (auto-selection)

// INTERACTION FLOW:
// User clicks project → handleSelectProject() → state updates → useEffect cascade → 
// derived state recalculation → component re-renders → UI updates → visual feedback
```

### **Agent Selection System**
```typescript
// === AGENT SELECTION HANDLER ===
const handleSelectAgent = (agentId: string | null): void => {
  try {
    // STEP 1: Set active agent
    setActiveAgentId(agentId);
    
    // STEP 2: Team context logic
    if (agentId) {
      const agent = safeArray(agents).find(a => a.id === agentId);
      if (!agent?.teamId) {
        // Agent has no team association - clear team selection
        setActiveTeamId(null);
      }
      // If agent has team, team selection could be set elsewhere (handleSidebarSelectAgent)
    }
    
    // WHY CONDITIONAL TEAM CLEARING:
    // Some agents are independent (like Maya)
    // Some agents belong to teams
    // UI should reflect the correct context based on agent's team association
    
  } catch (error) {
    console.error('Error selecting agent:', error);
  }
};

// === SIDEBAR AGENT SELECTION (INCLUDES PROJECT SWITCHING) ===
const handleSidebarSelectAgent = (agentId: string, projectId: string): void => {
  try {
    // STEP 1: Cross-project navigation
    if (activeProjectId !== projectId) {
      setActiveProjectId(projectId);  // Switch project first
    }
    
    // STEP 2: Set agent as active
    setActiveAgentId(agentId);
    
    // STEP 3: Set team context if agent belongs to team
    const agent = safeArray(agents).find(a => a.id === agentId);
    if (agent?.teamId) {
      setActiveTeamId(agent.teamId);  // Set team context
    } else {
      setActiveTeamId(null);          // Clear team context
    }
    
    // STEP 4: Close overlays
    setShowTeamDashboard(false);
    
    // WHY PROJECT SWITCHING:
    // Agents are nested under projects in sidebar
    // User should be able to click any agent and switch to that project
    // Provides seamless navigation across project boundaries
    
    // VISUAL CHANGES:
    // - Project highlighting switches
    // - Agent becomes highlighted
    // - Chat switches to 1:1 agent mode
    // - Brain panel shows agent-specific insights
    
  } catch (error) {
    console.error('Error selecting agent from sidebar:', error);
  }
};

// TRIGGER SOURCES:
// - Agent item click in ProjectSidebar (handleSidebarSelectAgent)
// - Agent selector in chat interface (handleSelectAgent)
// - Maya creation completion (auto-selection)
```

### **Team Selection System**
```typescript
// === TEAM SELECTION HANDLER ===
const handleSelectTeam = (teamId: string, projectId: string): void => {
  try {
    // STEP 1: Cross-project navigation
    if (activeProjectId !== projectId) {
      setActiveProjectId(projectId);  // Switch project if different
    }
    
    // STEP 2: Set team as active
    setActiveTeamId(teamId);
    
    // STEP 3: Clear individual agent selection
    setActiveAgentId(null);  // Focus on team, not individual
    
    // STEP 4: Close overlays
    setShowTeamDashboard(false);
    
    // WHY CLEAR AGENT SELECTION:
    // Team selection represents group conversation
    // Individual agent selection represents 1:1 conversation
    // These are mutually exclusive interaction modes
    
    // VISUAL CHANGES:
    // - Team becomes highlighted in sidebar
    // - Chat switches to team conversation mode
    // - Brain panel shows team metrics and performance
    // - Agent list shows team members
    
  } catch (error) {
    console.error('Error selecting team from sidebar:', error);
  }
};

// TEAM DASHBOARD INTERACTION:
// Teams can also be opened in dashboard mode for detailed management
// This is separate from chat selection and provides team administration UI
```

### **Selection Hierarchy & Rules**
```typescript
// === SELECTION HIERARCHY ===
// Project (Top Level)
// ├── Teams (Project Children)
// │   └── Agents (Team Members)
// └── Agents (Direct Project Members)

// HIERARCHY RULES:
// 1. Selecting parent clears children
// 2. Selecting child can set parent context
// 3. Cross-project selection switches project first
// 4. Orphaned selections are prevented by cascade clearing

// SELECTION STATES & COMBINATIONS:
// - Project only: General project context
// - Project + Team: Team conversation mode
// - Project + Agent: 1:1 agent conversation
// - Project + Agent + Team: Agent in team context (agent has team)

// FORBIDDEN COMBINATIONS:
// - Team + Agent from different team
// - Agent + Team where agent is not member
// - Selection from non-active project (auto-corrected)
```

---

## 📱 **MOBILE INTERACTION SYSTEM COMPLETE**

### **Mobile Navigation State**
```typescript
// === MOBILE-SPECIFIC STATE ===
const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

// WHY SEPARATE MOBILE STATE:
// - Mobile sidebar is overlay, desktop sidebar is inline
// - Different animation behaviors (slide vs width change)
// - Different dismissal patterns (backdrop vs button only)
// - Independent from desktop sidebar state
```

### **Mobile Header Interactions**
```typescript
// === MOBILE HEADER COMPONENT ===
// VISIBILITY: Only shown on mobile (md:hidden class)
// HEIGHT: Fixed 60px
// BACKGROUND: #23262B with bottom border

// INTERACTION 1: Hamburger Menu Button
// ELEMENT: <button onClick={() => setMobileNavOpen(!mobileNavOpen)}>
// ICON: Three horizontal lines (hamburger)
// SIZE: 24px × 24px icon, 44px touch target
// POSITION: Left side of header

// WHAT HAPPENS ON CLICK:
// 1. setMobileNavOpen(true) called
// 2. Mobile sidebar overlay slides in from left
// 3. Backdrop appears with semi-transparent overlay
// 4. Page content becomes non-scrollable
// 5. Focus moves to sidebar for keyboard navigation

// CSS TRANSITION:
// transform: translateX(-100%) → translateX(0)
// duration: 300ms ease-out

// INTERACTION 2: Brain Panel Toggle
// ELEMENT: <button onClick={() => setBrainOpen(!brainOpen)}>
// ICON: Brain/circle icon
// SIZE: 20px × 20px icon, 44px touch target
// POSITION: Right side of header

// WHAT HAPPENS ON CLICK:
// 1. setBrainOpen(!brainOpen) called
// 2. Brain panel becomes full-screen overlay (mobile behavior)
// 3. Close button appears in top-right corner
// 4. Content is scrollable within overlay

// VISUAL STATES:
// Normal: text-[#A6A7AB]
// Hover: text-[#F1F1F3]
// Active: Same as hover (no special active state)
```

### **Mobile Sidebar Overlay**
```typescript
// === MOBILE SIDEBAR OVERLAY SYSTEM ===
// STRUCTURE: Fixed overlay with backdrop and content

// OVERLAY CONTAINER:
// Classes: fixed inset-0 z-40 transition-transform duration-300 md:hidden
// Transform: translateX(-100%) when closed, translateX(0) when open
// Z-index: 40 (above content, below modals)

// BACKDROP INTERACTION:
// ELEMENT: <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNavOpen(false)} />
// PURPOSE: Click-to-dismiss functionality
// VISUAL: Semi-transparent black overlay

// WHAT HAPPENS ON BACKDROP CLICK:
// 1. setMobileNavOpen(false) called
// 2. Sidebar slides out: translateX(0) → translateX(-100%)
// 3. Backdrop fades out
// 4. Page scrolling re-enabled
// 5. Focus returns to main content

// SIDEBAR CONTENT CONTAINER:
// SIZE: 256px width (w-64)
// POSITION: absolute top-0 left-0 h-full
// BACKGROUND: #23262B with shadow

// SIDEBAR HEADER:
// HEIGHT: 60px
// CONTENT: "Projects" title + close button
// BORDER: Bottom border for visual separation

// CLOSE BUTTON INTERACTION:
// ELEMENT: <button onClick={() => setMobileNavOpen(false)}>
// ICON: X close icon
// SIZE: 20px × 20px icon, 44px touch target
// PURPOSE: Explicit close action

// CONTENT AREA:
// HEIGHT: calc(100% - 60px) (remaining height after header)
// SCROLL: overflow-y-auto for long project lists
// CONTENT: Full ProjectSidebar component

// AUTO-CLOSE BEHAVIOR:
// All ProjectSidebar selection handlers are wrapped to close mobile nav:
// onSelectProject={(id) => {
//   handleSelectProject(id);
//   setMobileNavOpen(false);  // Auto-close after selection
// }}

// WHY AUTO-CLOSE:
// - Mobile screen space is limited
// - User expects to return to main content after selection
// - Follows mobile app conventions
// - Reduces cognitive load
```

### **Mobile Brain Panel**
```typescript
// === MOBILE BRAIN PANEL BEHAVIOR ===
// DESKTOP: Side panel with width animations
// MOBILE: Full-screen overlay

// CSS CLASSES FOR RESPONSIVE BEHAVIOR:
const brainPanelClasses = `
  transition-all duration-300 ease-out flex-shrink-0 rounded-xl overflow-hidden bg-[#23262B] shadow-lg
  ${brainOpen ? 'md:w-[280px] opacity-100' : 'md:w-0 opacity-0'}      // Desktop behavior
  ${brainOpen ? 'fixed inset-0 z-30 md:static' : 'hidden md:block md:w-0'}  // Mobile: full-screen overlay
`;

// MOBILE BEHAVIOR WHEN OPEN:
// 1. Becomes fixed positioned overlay (fixed inset-0)
// 2. Z-index 30 (above content, below modals)
// 3. No backdrop - direct content interaction
// 4. Close button appears in top-right corner
// 5. Content is scrollable within overlay

// MOBILE CLOSE BUTTON:
// ELEMENT: <button className="absolute top-4 right-4 p-2 rounded-full bg-[#37383B] text-[#F1F1F3] md:hidden">
// VISIBILITY: Only on mobile (md:hidden)
// POSITION: Fixed top-right corner
// BACKGROUND: Contrasting background for visibility
// SIZE: 44px touch target

// INTERACTION DIFFERENCES:
// Desktop: Width animation with slim version
// Mobile: Full overlay with direct close
// Tablet: Same as mobile (768px breakpoint)

// WHY FULL-SCREEN ON MOBILE:
// - Brain panel content is information-dense
// - Small screen needs maximum space for readability
// - Side panels are too narrow on mobile
// - Full-screen provides better user experience
```

### **Mobile Touch Interactions**
```typescript
// === TOUCH TARGET REQUIREMENTS ===
// Minimum touch target: 44px × 44px (Apple/Google guidelines)
// Preferred touch target: 48px × 48px

// BUTTON SIZING PATTERNS:
// Icon buttons: p-2 (8px padding) + 24px icon = 40px total
// Enhanced touch targets: p-3 (12px padding) + 24px icon = 48px total
// Mobile header buttons: Explicitly sized for 44px+ touch area

// TOUCH FEEDBACK:
// Hover states work on touch devices as "active" states
// No separate touch-specific styling needed
// CSS transitions provide visual feedback

// GESTURE SUPPORT:
// Backdrop tap: Dismisses overlays
// Scroll/swipe: Within overlay content areas
// No custom swipe gestures implemented
```

---

## 🧩 **COMPONENT-Level INTERACTIONS**

### **ProjectSidebar Complete Interactions**
```typescript
// === COMPONENT STRUCTURE ===
interface ProjectSidebarProps {
  setSidebarOpen: (open: boolean) => void;
  projects: Project[];
  teams: Team[];
  agents: Agent[];
  activeProjectId: string | null;
  activeAgentId: string | null;
  activeTeamId: string | null;
  onSelectProject: (id: string) => void;
  onSelectAgent: (agentId: string, projectId: string) => void;
  onSelectTeam: (teamId: string, projectId: string) => void;
  // ... additional handlers
}

// === HEADER SECTION INTERACTIONS ===

// COLLAPSE BUTTON:
// LOCATION: Top-right corner of sidebar header
// ELEMENT: <button onClick={() => setSidebarOpen(false)}>
// ICON: Chevron pointing left
// SIZE: 32px × 32px
// HOVER: Background changes to hover:bg-[#43444B]

// WHAT HAPPENS ON CLICK:
// 1. setSidebarOpen(false) called (prop function)
// 2. Parent component (AppContent) updates sidebarOpen state
// 3. Sidebar animates closed, slim sidebar appears
// 4. Focus management handled by parent

// ADD PROJECT BUTTON:
// LOCATION: Bottom of sidebar
// ELEMENT: <button className="w-full px-4 py-2 bg-[#6C82FF] hover:bg-[#5A6FE8] text-white rounded-lg">
// TEXT: "Add Project" with plus icon
// SIZE: Full width, 40px height

// INTERACTION STATES:
// Default: bg-[#6C82FF] (accent blue)
// Hover: bg-[#5A6FE8] (darker blue)
// Click: Triggers project creation modal/flow

// === PROJECT LIST INTERACTIONS ===

// PROJECT CARD STRUCTURE:
// HEIGHT: 72px per card
// PADDING: 12px internal spacing
// MARGIN: 8px bottom margin between cards
// BORDER RADIUS: 8px rounded corners

// PROJECT CARD STATES:
// Default: Transparent background, border-transparent
// Hover: bg-[#43444B] (hover overlay)
// Selected: bg-[#6C82FF]/10 (accent background) + border-l-3 border-[#6C82FF] (left accent border)
// Focus: Ring outline for keyboard navigation

// PROJECT CARD CONTENT:
// Color Indicator: 12px circle with project theme color (left side)
// Project Name: 14px font-medium text-[#F1F1F3] (primary text)
// Description: 12px font-normal text-[#A6A7AB] (secondary text)
// Agent Count: 12px font-normal text-[#A6A7AB] (right-aligned)

// PROJECT CARD INTERACTION:
// TRIGGER: Click anywhere on card
// HANDLER: onSelectProject(project.id)
// RESULT: Project becomes active, child selections clear

// === NESTED TEAM/AGENT INTERACTIONS ===

// TEAM ITEM STRUCTURE:
// INDENTATION: 16px left margin from project edge
// HEIGHT: 44px per item
// ICON: Users icon (6×6 grid icon)
// BADGE: Member count badge

// TEAM ITEM STATES:
// Default: Transparent background
// Hover: bg-[#43444B]
// Selected: bg-[#6C82FF]/10

// TEAM ITEM INTERACTION:
// TRIGGER: Click on team item
// HANDLER: onSelectTeam(team.id, team.projectId)
// RESULT: Team becomes active, switches project if needed

// AGENT ITEM STRUCTURE:
// INDENTATION: 16px left margin from project edge
// HEIGHT: 40px per item
// AVATAR: 24px circle with agent color + initials
// ONLINE INDICATOR: 8px green dot (bottom-right of avatar)

// AGENT ITEM STATES:
// Default: Transparent background
// Hover: bg-[#43444B]
// Selected: bg-[#6C82FF]/10

// AGENT ITEM INTERACTION:
// TRIGGER: Click on agent item
// HANDLER: onSelectAgent(agent.id, agent.projectId)
// RESULT: Agent becomes active, sets team context if agent has team

// === EXPANSION/COLLAPSE LOGIC ===
// Projects can be expanded/collapsed to show/hide teams and agents
// Default: Projects are expanded if they are the active project
// State: Managed internally with expandedProjects Set<string>

const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

const toggleProjectExpansion = (projectId: string) => {
  setExpandedProjects(prev => {
    const newSet = new Set(prev);
    if (newSet.has(projectId)) {
      newSet.delete(projectId);    // Collapse
    } else {
      newSet.add(projectId);       // Expand
    }
    return newSet;
  });
};

// EXPANSION TRIGGER:
// Click on expand/collapse icon (chevron)
// Located next to project name
// Points right when collapsed, down when expanded

// WHY EXPANSION:
// - Long project lists need space management
// - User can focus on relevant projects
// - Provides hierarchical information architecture
// - Reduces cognitive load
```

### **EnhancedMultiAgentChat Complete Interactions**
```typescript
// === COMPONENT MODES ===
type ChatMode = 'project' | 'team' | 'agent';

// The chat interface adapts based on current selection:
// Project mode: General project conversation
// Team mode: Team-specific conversation
// Agent mode: 1:1 agent conversation

// === CHAT HEADER INTERACTIONS ===

// MODE SELECTOR TABS:
// STRUCTURE: Three tab-style buttons in row
// CONTAINER: bg-[#43444B] rounded container with 1px gap
// INDIVIDUAL TABS: px-3 py-1 rounded text-sm

// TAB STATES:
// Active: bg-[#6C82FF] text-white
// Inactive: text-[#A6A7AB] hover:text-[#F1F1F3]
// Transition: transition-colors duration-200

// TAB INTERACTION:
// TRIGGER: Click on mode tab
// HANDLER: setChatMode(mode)
// RESULT: Chat interface switches to selected mode

// AGENT/TEAM SELECTOR:
// APPEARS: When in agent or team mode
// COMPONENT: Select dropdown with agent/team options
// WIDTH: w-48 (192px)

// SELECTOR CONTENT:
// Agent option: Avatar (xs size) + Name + Role badge
// Team option: Team icon + Name + Member count

// === MESSAGE AREA INTERACTIONS ===

// MESSAGE FILTERING:
// Messages are filtered based on current mode:
const getMessagesForContext = () => {
  switch (chatMode) {
    case 'project':
      return messages.filter(m => m.projectId === activeProjectId);
    case 'team':
      return messages.filter(m => m.teamId === selectedTeam);
    case 'agent':
      return messages.filter(m => 
        m.agentId === selectedAgent || 
        (m.senderId === currentUserId && m.recipientId === selectedAgent)
      );
  }
};

// MESSAGE BUBBLE INTERACTIONS:

// USER MESSAGE BUBBLE:
// ALIGNMENT: Right-aligned (justify-end)
// BACKGROUND: bg-[#6C82FF] (accent blue)
// TEXT: text-white
// BORDER RADIUS: rounded-lg rounded-br-sm (sharp bottom-right corner)
// MAX WIDTH: max-w-[70%]

// AI MESSAGE BUBBLE:
// ALIGNMENT: Left-aligned (justify-start)
// BACKGROUND: bg-[#43444B] (secondary background)
// TEXT: text-[#F1F1F3] (primary text)
// BORDER RADIUS: rounded-lg rounded-bl-sm (sharp bottom-left corner)
// MAX WIDTH: max-w-[70%]

// MESSAGE HOVER INTERACTIONS:
// TRIGGER: Mouse enter/leave message bubble
// EFFECT: Shows/hides action buttons (Reply, Copy, More)
// TIMING: Timestamp display on hover
// ACTIONS: Reply, Copy to clipboard, More options menu

const MessageBubble = ({ message, isUser }) => {
  const [showActions, setShowActions] = useState(false);
  
  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Message content */}
      {showActions && (
        <div className="flex gap-2 mt-2 text-xs opacity-70">
          <span>{formatTimestamp(message.timestamp)}</span>
          <button onClick={() => handleReply(message)}>Reply</button>
          <button onClick={() => copyToClipboard(message.content)}>Copy</button>
          <button onClick={() => showMoreOptions(message)}>More</button>
        </div>
      )}
    </div>
  );
};

// TYPING INDICATORS:
// DISPLAY: When other participants are typing
// ANIMATION: Three bouncing dots with staggered animation delays
// COLORS: Different colors for different agents
// TIMEOUT: Disappears after 3 seconds of no typing activity

// === INPUT AREA INTERACTIONS ===

// MESSAGE INPUT FIELD:
// COMPONENT: Auto-expanding textarea
// PLACEHOLDER: Dynamic based on chat mode
// BACKGROUND: bg-[#37383B]
// BORDER: border-[#43444B] focus:border-[#6C82FF]
// HEIGHT: Auto-expands with content

// PLACEHOLDER TEXT LOGIC:
const getPlaceholder = () => {
  switch (chatMode) {
    case 'project':
      return `Message ${activeProject?.name}...`;
    case 'team':
      return selectedTeam ? `Message ${selectedTeam.name}...` : 'Select a team...';
    case 'agent':
      return selectedAgent ? `Message ${selectedAgent.name}...` : 'Select an agent...';
  }
};

// INPUT INTERACTIONS:
// TYPING: Updates placeholder, triggers typing indicators
// ENTER: Submits message (Shift+Enter for new line)
// FOCUS: Border color changes to accent
// DISABLED: When no valid target selected

// SEND BUTTON:
// SIZE: 40px circle
// BACKGROUND: bg-[#6C82FF] hover:bg-[#5A6FE8]
// ICON: Send/arrow icon (18px)
// STATE: Disabled when input empty or no target

// ATTACHMENT BUTTON:
// SIZE: 32px square
// ICON: Paperclip (16px)
// FUNCTION: Opens file picker
// ACCEPTS: images, PDFs, documents

// === WELCOME MESSAGE INTERACTIONS ===

// MAYA WELCOME MESSAGE:
// TRIGGER: After creating Maya project
// APPEARANCE: Special gradient background with Maya avatar
// DISMISSIBLE: X button in top-right corner
// CONTENT: Dynamic welcome message from state

// TEAM WELCOME MESSAGE:
// TRIGGER: After creating team from template
// APPEARANCE: Success-themed background with team member list
// AUTO-DISMISS: After 10 seconds or manual dismiss
// CONTENT: Team introduction with member roles
```

### **DynamicSidebar (Brain Panel) Complete Interactions**
```typescript
// === PANEL HEADER INTERACTIONS ===

// COLLAPSE BUTTON:
// LOCATION: Top-right corner of brain panel header
// ELEMENT: <button onClick={() => setBrainOpen(false)}>
// ICON: Chevron pointing right
// SIZE: 24px × 24px
// HOVER: text-[#A6A7AB] → text-[#F1F1F3]

// WHAT HAPPENS ON CLICK:
// Desktop: Panel collapses to slim brain (width animation)
// Mobile: Panel closes completely (overlay dismissal)

// PANEL TITLE:
// TEXT: "Project Brain"
// SIZE: text-lg font-medium
// COLOR: text-[#F1F1F3]
// POSITION: Left side of header

// === PROGRESS RING INTERACTIONS ===

// PROGRESS RING COMPONENT:
// SIZE: 84px diameter
// STROKE WIDTH: 6px
// COLORS: Background #43444B, Progress #47DB9A
// CENTER TEXT: Progress percentage (20px font-semibold)

// PROGRESS RING BEHAVIOR:
// ANIMATION: Smooth arc animation with CSS transition
// DURATION: 500ms ease-out when progress updates
// HOVER: Could show detailed breakdown tooltip
// CLICK: Could open progress detail modal

const ProgressRing = ({ progress, size = 84 }) => {
  const radius = (size - 12) / 2;  // Account for stroke width
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#43444B"
          strokeWidth="6"
          fill="transparent"
        />
        {/* Progress circle with animation */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#47DB9A"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-semibold text-[#F1F1F3]">{progress}%</span>
      </div>
    </div>
  );
};

// === DOCUMENTS SECTION INTERACTIONS ===

// DOCUMENT CARD STRUCTURE:
// BACKGROUND: bg-[#37383B] (card background)
// PADDING: p-3 (12px all sides)
// BORDER RADIUS: rounded-lg (8px)
// HOVER: bg-[#43444B] (hover state)

// DOCUMENT CARD CONTENT:
// ICON: 32px circle with document type icon
// TITLE: font-medium text-[#F1F1F3]
// DESCRIPTION: text-sm text-[#A6A7AB] line-clamp-2

// DOCUMENT CARD INTERACTIONS:
const DocumentCard = ({ document, onOpen, onPreview }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className="bg-[#37383B] rounded-lg p-3 cursor-pointer hover:bg-[#43444B] transition-colors"
      onClick={() => onOpen(document)}
      onMouseEnter={() => {
        setIsHovered(true);
        onPreview?.(document);  // Optional preview on hover
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded flex items-center justify-center bg-${document.color}-500/20`}>
          <FileIcon className={`w-4 h-4 text-${document.color}-400`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-[#F1F1F3] truncate">{document.title}</h4>
          <p className="text-sm text-[#A6A7AB] line-clamp-2">{document.description}</p>
        </div>
        {isHovered && (
          <ExternalLinkIcon className="w-4 h-4 text-[#A6A7AB]" />
        )}
      </div>
    </div>
  );
};

// DOCUMENT INTERACTIONS:
// HOVER: Shows external link icon, triggers preview
// CLICK: Opens document in modal or new tab
// PREVIEW: Shows quick preview on hover (optional)

// === TIMELINE SECTION INTERACTIONS ===

// TIMELINE ITEM STRUCTURE:
// HEIGHT: 48px per item
// LAYOUT: Status indicator (left) + content (right)
// SPACING: 16px between items

// STATUS INDICATOR:
// SIZE: 16px circle
// POSITION: Left side with connecting line
// COLORS: 
//   - Completed: #47DB9A (green)
//   - In Progress: #6C82FF (blue) 
//   - Upcoming: #A6A7AB (gray)

// TIMELINE ITEM INTERACTIONS:
const TimelineItem = ({ item, index, onComplete, onEdit }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className="relative flex items-start gap-3 pb-4 last:pb-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Timeline connector line */}
      <div className="absolute left-2 top-6 bottom-0 w-px bg-[#43444B]" />
      
      {/* Status indicator - clickable for completion */}
      <button
        onClick={() => item.status !== 'Completed' && onComplete(index)}
        className={`
          relative z-10 w-4 h-4 rounded-full border-2 transition-colors
          ${item.status === 'Completed' 
            ? 'bg-[#47DB9A] border-[#47DB9A]' 
            : 'bg-[#23262B] border-[#43444B] hover:border-[#6C82FF]'
          }
        `}
      >
        {item.status === 'Completed' && (
          <CheckIcon className="w-2 h-2 text-white absolute inset-0.5" />
        )}
      </button>
      
      {/* Content with hover actions */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-[#F1F1F3]">{item.title}</h4>
          {isHovered && (
            <button
              onClick={() => onEdit(index)}
              className="p-1 text-[#A6A7AB] hover:text-[#F1F1F3] rounded"
            >
              <EditIcon className="w-3 h-3" />
            </button>
          )}
        </div>
        <p className="text-xs text-[#A6A7AB] mt-1">{item.date}</p>
      </div>
    </div>
  );
};

// TIMELINE INTERACTIONS:
// STATUS CLICK: Mark milestone as complete (triggers confetti)
// HOVER: Shows edit button
// EDIT CLICK: Opens milestone edit modal
// COMPLETE: Updates status and triggers celebration animation

// === ADD MILESTONE INTERACTION ===

// ADD MILESTONE BUTTON:
// APPEARANCE: Dashed border button at bottom of timeline
// STYLE: Full width, dashed border-2 border-[#43444B]
// HOVER: border-[#6C82FF] text-[#6C82FF]
// CONTENT: Plus icon + "Add Milestone" text

// INLINE EDITING MODE:
// TRIGGERS: Click add milestone button
// FORM FIELDS: Title input + Date input
// ACTIONS: Add button (primary) + Cancel button (secondary)
// VALIDATION: Title required, date optional

const AddMilestoneButton = ({ onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  
  const handleSubmit = () => {
    if (title.trim() && date.trim()) {
      onAdd({ 
        title: title.trim(), 
        date: date.trim(), 
        status: 'Upcoming',
        color: 'gray'
      });
      setTitle('');
      setDate('');
      setIsAdding(false);
    }
  };
  
  if (isAdding) {
    return (
      <div className="bg-[#37383B] rounded-lg p-3 space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Milestone title..."
          className="w-full bg-[#23262B] border border-[#43444B] rounded px-2 py-1 text-sm text-[#F1F1F3] placeholder-[#A6A7AB]"
          autoFocus
        />
        <input
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="Target date..."
          className="w-full bg-[#23262B] border border-[#43444B] rounded px-2 py-1 text-sm text-[#F1F1F3] placeholder-[#A6A7AB]"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            className="px-3 py-1 bg-[#6C82FF] hover:bg-[#5A6FE8] text-white rounded text-sm"
          >
            Add
          </button>
          <button
            onClick={() => setIsAdding(false)}
            className="px-3 py-1 bg-[#43444B] hover:bg-[#37383B] text-[#F1F1F3] rounded text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <button
      onClick={() => setIsAdding(true)}
      className="w-full p-3 border-2 border-dashed border-[#43444B] hover:border-[#6C82FF] hover:text-[#6C82FF] rounded-lg text-[#A6A7AB] transition-colors"
    >
      <PlusIcon className="w-4 h-4 mx-auto mb-1" />
      <span className="text-sm">Add Milestone</span>
    </button>
  );
};

// === AGENT CONTEXT PANEL ===
// When an agent is selected, brain panel shows agent-specific information

// AGENT HEADER:
// AVATAR: Large avatar with agent color (size-lg)
// NAME: Agent name (font-medium text-[#F1F1F3])
// ROLE: Agent role (text-sm text-[#A6A7AB])

// PERFORMANCE METRICS:
// LAYOUT: 2-column grid
// CARDS: bg-[#37383B] rounded-lg p-3
// METRICS: Tasks completed, average response time, etc.

// RECENT ACTIVITY:
// LIST: Recent agent actions and updates
// FORMAT: Action description + timestamp
// SCROLL: Scrollable list if many items
```

---

## 🎭 **MODAL & DIALOG SYSTEM COMPLETE**

### **OnboardingModal Complete Flow**
```typescript
// === MODAL STRUCTURE ===
interface OnboardingModalProps {
  isOpen: boolean;                    // Modal visibility state
  onClose: () => void;                // Close modal callback
  onComplete: (                       // Completion callback with path branching
    path: 'idea' | 'template' | 'scratch', 
    templateName?: string, 
    templateData?: TemplateData
  ) => void;
  activeProject: Project | null;      // Currently active project
  existingAgents: Agent[];            // Agents in active project
  onAddAgent: (agent: Agent) => void; // Agent creation callback
  onAddTeam: (team: Team, teamAgents: Agent[]) => void;  // Team creation callback
  showAnimation: () => void;          // Animation trigger callback
}

// === INTERNAL MODAL STATE ===
const OnboardingModal = ({ isOpen, onClose, onComplete, ...props }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedPath, setSelectedPath] = useState<'idea' | 'template' | 'scratch' | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  
  // Step configuration adapts based on selected path
  const steps = [
    'Welcome',
    'Choose Your Path',
    ...(selectedPath === 'template' ? ['Select Template'] : []),
    'Complete'
  ];
  
  // Navigation functions with bounds checking
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));
};

// === STEP 1: WELCOME SCREEN ===
// PURPOSE: Introduction and motivation
// DURATION: User-controlled (no auto-advance)
// INTERACTION: Single "Let's Start" button

// VISUAL ELEMENTS:
// - Hero illustration: 128px circle with gradient background + egg emoji
// - Welcome text: Large heading + descriptive paragraph
// - Progress indicator: Dot indicators showing step 1 of total
// - Action button: Primary CTA to begin flow

// BUTTON INTERACTION:
// TRIGGER: Click "Let's Start"
// ACTION: nextStep() called
// RESULT: Advances to path selection

// === STEP 2: PATH SELECTION ===
// PURPOSE: Let user choose their onboarding path
// OPTIONS: Three distinct paths with different outcomes

// PATH OPTION 1: "Start with an Idea"
// ICON: 💡 (lightbulb emoji)
// COLOR THEME: Blue
// OUTCOME: Creates Maya + "My Idea" project
// BENEFITS: Immediate guidance, structured development, team building

// PATH OPTION 2: "Use a Starter Pack"  
// ICON: 🚀 (rocket emoji)
// COLOR THEME: Green
// OUTCOME: Template selection → full team creation
// BENEFITS: Ready-made teams, industry templates, immediate collaboration

// PATH OPTION 3: "Continue from Scratch"
// ICON: 🔧 (wrench emoji)  
// COLOR THEME: Purple
// OUTCOME: No new creation, explore existing projects
// BENEFITS: Full control, exploration, self-paced learning

// PATH CARD INTERACTIONS:
// DEFAULT STATE: border-[#43444B] transparent background
// HOVER STATE: border-[#6C82FF]/50 + hover:scale-[1.02] transform
// SELECTED STATE: border-[#6C82FF] + bg-[#6C82FF]/10 background

// PATH SELECTION LOGIC:
const handlePathSelection = () => {
  if (selectedPath === 'template') {
    nextStep(); // Go to template selection step
  } else {
    setCurrentStep(steps.length - 1); // Skip directly to completion
  }
};

// NAVIGATION INTERACTIONS:
// BACK BUTTON: Returns to welcome screen
// CONTINUE BUTTON: Disabled until path selected, advances flow

// === STEP 3: TEMPLATE SELECTION (CONDITIONAL) ===
// VISIBILITY: Only shown if user selected "template" path
// PURPOSE: Choose specific business template

// SEARCH AND FILTER:
// SEARCH INPUT: Live filtering by template title/description
// CATEGORY FILTER: Dropdown with business/creative/tech/consulting
// CLEAR FUNCTIONALITY: Reset search and filters

// TEMPLATE GRID:
// LAYOUT: 2-column grid on desktop, 1-column on mobile
// SCROLLING: max-h-80 overflow-y-auto for long lists
// CARD SIZE: Full width within grid cell

// TEMPLATE CARD STRUCTURE:
// HEADER: Icon (32px) + Title + Category badge
// DESCRIPTION: 2-line clamped description text
// MEMBERS: First 3 member names + "N more" indicator
// SELECTION: Border and background change when selected

// TEMPLATE CARD INTERACTIONS:
// CLICK: setSelectedTemplate(template)
// HOVER: Subtle hover effect
// SELECTED: Visual distinction with accent colors

// FILTER INTERACTIONS:
const filteredTemplates = templates.filter(template => {
  const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
  return matchesSearch && matchesCategory;
});

// NAVIGATION INTERACTIONS:
// BACK BUTTON: Returns to path selection
// CREATE TEAM BUTTON: Disabled until template selected, advances to completion

// === STEP 4: COMPLETION SCREEN ===
// PURPOSE: Final confirmation and action execution
// CONTENT: Dynamic based on selected path

// COMPLETION MESSAGES:
// IDEA PATH: "Let's bring your idea to life! 💡" + Maya introduction
// TEMPLATE PATH: "Your [Template Name] team is ready! 🚀" + team preview
// SCRATCH PATH: "Welcome to your workspace! 🔧" + exploration message

// VISUAL ELEMENTS:
// - Success animation: Large icon with gradient background
// - Dynamic title: Path-specific success message
// - Progress indicator: All dots filled (complete state)
// - Action button: Path-specific CTA text

// COMPLETION LOGIC:
const handleComplete = async () => {
  setIsCompleting(true);  // Show loading state
  
  // Simulate processing time for better perceived performance
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Call parent completion handler with path data
  if (selectedPath === 'template' && selectedTemplate) {
    onComplete(selectedPath, selectedTemplate.title, selectedTemplate);
  } else {
    onComplete(selectedPath);
  }
};

// LOADING STATE:
// BUTTON TEXT: Changes to "Setting up..." with spinner
// BUTTON DISABLED: Prevents double-clicks
// VISUAL FEEDBACK: Spinner animation in button

// === MODAL BACKDROP AND OVERLAY ===
// BACKDROP: Semi-transparent overlay (bg-black/30)
// DISMISS: Modal can be closed via onClose callback
// Z-INDEX: High z-index to appear above all content
// FOCUS TRAP: Focus remains within modal during interaction
```

### **ReturningUserWelcome Complete Flow**
```typescript
// === MODAL PURPOSE ===
// Shown to users who have completed onboarding before
// Provides quick actions to resume work or start new projects
// Shorter flow than full onboarding

// === MODAL STRUCTURE ===
interface ReturningUserWelcomeProps {
  isOpen: boolean;                          // Modal visibility
  onClose: () => void;                      // Close callback
  onContinueLastProject: () => void;        // Resume current state
  onStartWithIdea: () => void;              // Create Maya project
  onUseStarterPack: () => void;             // Template selection
  lastActiveProject: {                      // Project info for display
    name: string;
    description: string;
  } | null;
}

// === VISUAL STRUCTURE ===
// SIZE: max-w-lg (512px width)
// BACKGROUND: bg-[#23262B] with border-[#43444B]
// LAYOUT: Centered content with welcome message

// WELCOME ELEMENTS:
// - Avatar: 80px circle with gradient + wave emoji
// - Title: "Welcome back! 🎉"
// - Description: "Ready to continue where you left off?"

// LAST PROJECT DISPLAY:
// VISIBILITY: Only shown if lastActiveProject exists
// CONTAINER: bg-[#37383B] rounded card with border
// CONTENT: "Last active project:" label + name + description
// PURPOSE: Reminds user of their recent work

// === ACTION BUTTONS ===

// BUTTON 1: "Continue Last Project"
// STYLE: Primary button (full width, accent background)
// ACTION: onContinueLastProject()
// RESULT: Closes modal, resumes current state
// PRIORITY: Primary action (most prominent)

// BUTTON 2: "Start with New Idea"
// STYLE: Secondary button (full width, secondary background with border)
// ACTION: onStartWithIdea()
// RESULT: Creates Maya project, closes modal
// PRIORITY: Secondary action

// BUTTON 3: "Use Starter Pack"
// STYLE: Tertiary button (full width, text-only)
// ACTION: onUseStarterPack()
// RESULT: Could open template selection (future enhancement)
// PRIORITY: Tertiary action

// === INTERACTION FLOW ===
// 1. Modal appears on app load for returning users
// 2. User sees last project context
// 3. User selects desired action
// 4. Modal closes and action executes
// 5. User continues with chosen flow

// === BUTTON IMPLEMENTATIONS ===
const ReturningUserWelcome = ({ isOpen, onClose, ...handlers, lastActiveProject }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-[#23262B] border-[#43444B]">
        <div className="text-center space-y-6 p-6">
          {/* Welcome visual */}
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#6C82FF] to-[#9F7BFF] rounded-full flex items-center justify-center">
            <div className="text-2xl">👋</div>
          </div>
          
          {/* Welcome text */}
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-[#F1F1F3]">Welcome back! 🎉</h2>
            <p className="text-[#A6A7AB]">Ready to continue where you left off?</p>
          </div>
          
          {/* Conditional last project display */}
          {lastActiveProject && (
            <div className="p-4 bg-[#37383B] rounded-lg border border-[#43444B]">
              <div className="text-left">
                <div className="text-sm text-[#A6A7AB] mb-1">Last active project:</div>
                <div className="font-medium text-[#F1F1F3]">{lastActiveProject.name}</div>
                <div className="text-sm text-[#A6A7AB] mt-1">{lastActiveProject.description}</div>
              </div>
            </div>
          )}
          
          {/* Action buttons in priority order */}
          <div className="space-y-3 mt-6">
            <button
              onClick={handlers.onContinueLastProject}
              className="w-full px-6 py-3 bg-[#6C82FF] hover:bg-[#5A6FE8] text-white rounded-lg font-medium transition-colors"
            >
              Continue Last Project
            </button>
            
            <button
              onClick={handlers.onStartWithIdea}
              className="w-full px-6 py-3 bg-[#37383B] hover:bg-[#43444B] text-[#F1F1F3] border border-[#43444B] rounded-lg font-medium transition-colors"
            >
              Start with New Idea
            </button>
            
            <button
              onClick={handlers.onUseStarterPack}
              className="w-full px-6 py-3 text-[#A6A7AB] hover:text-[#F1F1F3] transition-colors"
            >
              Use Starter Pack
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

---

## ✨ **ANIMATION SYSTEM INTEGRATION**

### **Animation Context Architecture**
```typescript
// === ANIMATION PROVIDER STRUCTURE ===
const { showEggHatching, showConfetti } = useAnimation();

// Animation functions are trigger-only (no parameters)
// Animation state is managed in AnimationContext
// Animation cleanup is handled automatically

// ANIMATION TRIGGER LOCATIONS:
// 1. createIdeaProject() → showEggHatching()
// 2. createProjectFromStarterPack() → showEggHatching()  
// 3. handleCreateAgent() → showEggHatching() (first agent only)
// 4. handleCompleteMilestone() → showConfetti()
```

### **Egg Hatching Animation Complete System**
```typescript
// === TRIGGER CONDITIONS ===

// CONDITION 1: Maya Project Creation
// TRIGGER: createIdeaProject() completion
// TIMING: After all state updates complete
// PURPOSE: Celebrate new "idea" project creation
// CONTEXT: Always triggers (Maya is always first agent)

// CONDITION 2: Template Team Creation  
// TRIGGER: createProjectFromStarterPack() completion
// TIMING: After project, team, and agents created
// PURPOSE: Celebrate new team creation
// CONTEXT: Always triggers (new team with multiple agents)

// CONDITION 3: First Agent in Existing Project
// TRIGGER: handleCreateAgent() with first agent check
// LOGIC: !safeArray(agents).some(a => a.projectId === agent.projectId)
// PURPOSE: Celebrate first agent addition to project
// CONTEXT: Only triggers for first agent, not subsequent ones

// WHY FIRST AGENT ONLY:
// - First agent is special milestone for project
// - Prevents animation spam with multiple agent additions
// - Maintains significance of animation moments
// - Provides clear visual feedback for meaningful events

// === ANIMATION DISPLAY SYSTEM ===
function AnimationWrapper() {
  const { isEggHatchingVisible, isConfettiVisible, hideEggHatching, hideConfetti } = useAnimation();
  
  return (
    <ErrorBoundary>
      {/* Egg Hatching Animation */}
      {isEggHatchingVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <EggHatchingAnimation 
            size="lg" 
            onComplete={hideEggHatching}  // Cleanup callback
          />
        </div>
      )}
      
      {/* Confetti Animation */}
      {isConfettiVisible && (
        <ConfettiAnimation onComplete={hideConfetti} />  // Cleanup callback
      )}
    </ErrorBoundary>
  );
}

// OVERLAY SPECIFICATIONS:
// Z-INDEX: 50 (above all content and panels)
// BACKDROP: bg-black/30 (semi-transparent overlay)
// POSITIONING: fixed inset-0 (full screen)
// CENTERING: flex items-center justify-center
// INTERACTION: Non-interactive overlay (click-through)

// === ANIMATION SEQUENCE TIMING ===
const animationPhases = [
  { phase: 'egg-appear', duration: 500 },      // Egg fades in from center
  { phase: 'cracking', duration: 1500 },      // Crack lines appear progressively  
  { phase: 'hatching', duration: 1000 },      // Shell pieces separate and fall
  { phase: 'emergence', duration: 500 },      // Agent/team icon emerges
  { phase: 'particles', duration: 1000 }      // Celebration particles burst
];

// TOTAL DURATION: ~4.5 seconds
// AUTO-CLEANUP: hideEggHatching() called automatically on completion
// USER INTERACTION: Animation is non-interactive (cannot be skipped)
```

### **Confetti Animation Complete System**
```typescript
// === CONFETTI TRIGGER CONDITIONS ===

// CONDITION 1: Milestone Completion
// TRIGGER: handleCompleteMilestone() function
// LOGIC: User clicks timeline item status indicator
// PURPOSE: Celebrate project progress achievements
// CONTEXT: Only for incomplete → complete status changes

// MILESTONE COMPLETION FLOW:
const handleCompleteMilestone = (projectId: string, milestoneIndex: number): void => {
  try {
    setProjectBrainData(prev => {
      const projectData = safeObject(prev[projectId]);
      if (projectData?.timeline && projectData.timeline[milestoneIndex]) {
        const updatedTimeline = [...projectData.timeline];
        updatedTimeline[milestoneIndex] = {
          ...updatedTimeline[milestoneIndex],
          status: "Completed"    // Update status
        };
        
        showConfetti();         // Trigger celebration
        
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

// === CONFETTI ANIMATION SPECS ===
// PARTICLE COUNT: 80-120 particles
// PARTICLE TYPES: Rectangles and circles
// COLORS: Project theme colors + accent colors
// PHYSICS: Gravity, air resistance, rotation
// DURATION: 2.5 seconds total
// CLEANUP: Automatic via onComplete callback

// PARTICLE PHYSICS:
// INITIAL VELOCITY: Random horizontal + upward vertical
// GRAVITY: 0.1 acceleration downward
// AIR RESISTANCE: 0.99 velocity multiplier per frame  
// ROTATION: Random rotation speed per particle
// BOUNDS: Off-screen detection for cleanup

// VISUAL EFFECT:
// LAUNCH: Particles emit from top of screen
// MOVEMENT: Realistic falling motion with rotation
// COLORS: Multi-colored celebration effect
// CLEANUP: Particles removed when off-screen or after duration
```

### **Animation Coordination with State Changes**
```typescript
// === ANIMATION → STATE COORDINATION PATTERN ===

// TYPICAL FLOW:
// 1. User action triggers state change
// 2. State update functions execute
// 3. Animation trigger called at end of state updates
// 4. Animation displays while user sees state changes
// 5. Animation completes and cleans up automatically

// EXAMPLE: Template Project Creation
createProjectFromStarterPack(templateData) →
  // Atomic state updates
  setProjects([...prev, newProject]) →
  setTeams([...prev, newTeam]) →  
  setAgents([...prev, ...newAgents]) →
  setProjectBrainData(prev => ({ ...prev, [projectId]: newBrainData })) →
  setTeamMetrics(prev => ({ ...prev, ...newTeamMetrics })) →
  // Selection updates
  setActiveProjectId(projectId) →
  setActiveTeamId(teamId) →
  // Welcome message setup
  setTeamJustAdded(true) →
  // Animation trigger (last)
  showEggHatching() →
  // UI updates with animation overlay
  Components re-render with new state →
  Animation plays over updated UI →
  User sees complete transformation + celebration

// WHY THIS ORDER:
// - State updates complete before animation
// - User sees immediate feedback (new content)
// - Animation provides celebratory punctuation
// - No jarring state changes during animation
// - Clean separation of concerns
```

---

## ⌨️ **KEYBOARD SHORTCUTS & ACCESSIBILITY**

### **Global Keyboard Shortcuts**
```typescript
// === KEYBOARD SHORTCUT IMPLEMENTATION ===
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent): void => {
    try {
      // SIDEBAR TOGGLE: Ctrl+B or Cmd+B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();                   // Prevent browser bookmark
        setSidebarOpen(prev => !prev);       // Toggle sidebar state
      }
      
      // BRAIN PANEL TOGGLE: Ctrl+P or Cmd+P  
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();                   // Prevent browser print
        setBrainOpen(prev => !prev);         // Toggle brain panel state
      }
    } catch (error) {
      console.error('Error in keyboard handler:', error);
    }
  };

  window.addEventListener('keydown', handleKeyDown);        // Global listener
  
  return () => {
    window.removeEventListener('keydown', handleKeyDown);   // Cleanup
  };
}, []); // Run once on mount

// === CROSS-PLATFORM COMPATIBILITY ===
// Windows/Linux: e.ctrlKey (Ctrl key)
// macOS: e.metaKey (Cmd key)  
// Both: Checked with || operator for universal compatibility

// === BROWSER DEFAULT PREVENTION ===
// Ctrl+B: Normally opens bookmarks bar
// Ctrl+P: Normally opens print dialog
// preventDefault() stops browser behavior
// Custom action executes instead
```

### **Debug Keyboard Shortcuts**
```typescript
// === DEBUG ONBOARDING RESET ===
// COMBINATION: Ctrl+Shift+R or Cmd+Shift+R
// PURPOSE: Development and testing workflow
// INTEGRATION: Within dark mode effect for consolidated keyboard handling

const handleKeyDown = (e: KeyboardEvent): void => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
    e.preventDefault();                       // Prevent browser refresh
    localStorage.removeItem('hasCompletedOnboarding');    // Clear completion flag
    setShowOnboarding(true);                  // Show onboarding modal
    setShowReturningUserWelcome(false);       // Hide returning user modal
    console.log('Onboarding reset! Refresh to see onboarding modal.');
  }
};

// WHY IN DARK MODE EFFECT:
// - Consolidates keyboard event handling
// - Ensures single global listener
// - Prevents multiple event listener registrations
// - Maintains clean event handling architecture

// USAGE SCENARIO:
// 1. Developer testing onboarding flows
// 2. Demo preparation and reset
// 3. QA testing different user paths
// 4. Design review with clean slate
```

### **Accessibility Implementation**
```typescript
// === FOCUS MANAGEMENT ===
// Tab navigation through interactive elements
// Focus visible outlines on keyboard navigation
// Skip links for screen readers (could be added)

// === ARIA LABELS AND ROLES ===
// Modal dialogs: role="dialog" aria-labelledby aria-describedby
// Buttons: Descriptive aria-label attributes
// Form controls: Associated labels with htmlFor
// Status indicators: aria-live regions for dynamic updates

// === SCREEN READER SUPPORT ===
// Semantic HTML structure (headings, lists, buttons)
// Alt text for images and icons
// Status announcements for important state changes
// Keyboard-only navigation support

// === COLOR CONTRAST ===
// Primary text: #F1F1F3 on #37383B (high contrast)
// Secondary text: #A6A7AB on #37383B (adequate contrast)
// Interactive elements: Clear visual distinction
// Focus indicators: High contrast outlines

// === KEYBOARD NAVIGATION ===
// All interactive elements reachable via Tab
// Logical tab order follows visual layout
// Enter/Space activate buttons and controls
// Escape closes modals and overlays
// Arrow keys for custom navigation (could be enhanced)

// ACCESSIBILITY CHECKLIST:
// ✅ Keyboard navigation
// ✅ Screen reader compatibility  
// ✅ High contrast colors
// ✅ Focus indicators
// ✅ Semantic markup
// 🔄 Enhanced ARIA labels (ongoing improvement)
// 🔄 Skip navigation links (future enhancement)
// 🔄 Reduced motion preferences (future enhancement)
```

---

## 🔧 **EVENT HANDLERS COMPLETE IMPLEMENTATION**

### **Project Management Event Handlers**
```typescript
// === PROJECT CREATION HANDLER ===
const handleCreateProject = (project: Project): void => {
  try {
    // STEP 1: Add project to state
    setProjects(prev => [...prev, project]);
    
    // STEP 2: Set as active project
    setActiveProjectId(project.id);
    
    // STEP 3: Clear conflicting selections
    setActiveTeamId(null);
    setActiveAgentId(null);
    
    // WHY THIS PATTERN:
    // - New project should become active immediately
    // - Previous selections from other projects should clear
    // - User focus shifts to newly created project
    // - Provides immediate visual feedback
    
  } catch (error) {
    console.error('Error creating project:', error);
    // Error handling ensures app continues functioning
    // User could retry or continue with existing projects
  }
};

// === AGENT CREATION HANDLER ===
const handleCreateAgent = (agent: Agent): void => {
  try {
    // STEP 1: Check if this is first agent in project (animation trigger)
    const isFirstAgentInProject = !safeArray(agents).some(a => a.projectId === agent.projectId);
    if (isFirstAgentInProject) {
      showEggHatching();  // Celebrate first agent
    }
    
    // STEP 2: Add agent to agents array
    setAgents(prev => [...prev, agent]);
    
    // STEP 3: Update project agent summary (for display)
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
    
    // WHY PROJECT SUMMARY UPDATE:
    // - Projects store agent summaries for quick display
    // - Sidebar shows agent count and basic info
    // - Avoids expensive filtering on every render
    // - Maintains data consistency between arrays
    
  } catch (error) {
    console.error('Error creating agent:', error);
  }
};

// === TEAM CREATION HANDLER ===
const handleCreateTeam = (team: Team, teamAgents: Agent[]): void => {
  try {
    // STEP 1: Add team to teams array
    setTeams(prev => [...prev, team]);
    
    // STEP 2: Process team agents safely
    const safeAgents: Agent[] = [];
    
    if (teamAgents && Array.isArray(teamAgents)) {
      try {
        // Add agents to agents array
        setAgents(prev => [...prev, ...teamAgents]);
        safeAgents.push(...teamAgents);
        
        // Update project agent summary if agents exist
        if (safeAgents.length > 0) {
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
        
        // STEP 3: Initialize team metrics
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
    
    // STEP 4: Set team welcome trigger
    setTeamJustAdded(true);
    
    // WHY NESTED TRY-CATCH:
    // - Team creation is core functionality (must succeed)
    // - Agent processing is secondary (can partially fail)
    // - Metrics initialization is enhancement (can fail safely)
    // - Error boundaries prevent cascading failures
    
  } catch (error) {
    console.error('Error creating team:', error);
  }
};
```

### **Onboarding Event Handlers**
```typescript
// === ONBOARDING COMPLETION HANDLER ===
const handleOnboardingComplete = (path: 'idea' | 'template' | 'scratch', templateName?: string, templateData?: TemplateData): void => {
  try {
    // STEP 1: Close onboarding modal
    setShowOnboarding(false);
    
    // STEP 2: Mark onboarding as completed (persistence)
    localStorage.setItem('hasCompletedOnboarding', 'true');
    
    // STEP 3: Execute path-specific logic
    switch (path) {
      case 'idea':
        createIdeaProject();                  // Create Maya + "My Idea" project
        break;
      case 'template':
        if (templateData) {                   // Template data validation
          createProjectFromStarterPack(templateData);  // Create full team project
        }
        break;
      case 'scratch':
      default:
        // No action - user continues with existing default projects
        break;
    }
    
    // WHY SWITCH PATTERN:
    // - Clear separation of onboarding paths
    // - Easy to add new paths in future
    // - Validation for template path data
    // - Fallback for unexpected values
    
  } catch (error) {
    console.error('Error completing onboarding:', error);
    // If error occurs, onboarding is marked complete but path action may fail
    // User can still use app with existing projects
  }
};

// === RETURNING USER EVENT HANDLERS ===
const handleContinueLastProject = (): void => {
  try {
    setShowReturningUserWelcome(false);       // Close welcome modal
    // No other state changes - user continues with current state
    // Active project, agents, teams remain as initialized
  } catch (error) {
    console.error('Error continuing last project:', error);
  }
};

const handleStartWithIdea = (): void => {
  try {
    createIdeaProject();                      // Same logic as onboarding idea path
    setShowReturningUserWelcome(false);       // Close welcome modal
    // Creates new Maya project alongside existing projects
  } catch (error) {
    console.error('Error starting with idea:', error);
  }
};

const handleUseStarterPack = (): void => {
  try {
    setShowReturningUserWelcome(false);       // Close welcome modal
    // Future enhancement: could open template selection modal
    // Currently just closes modal and returns to main interface
  } catch (error) {
    console.error('Error using starter pack:', error);
  }
};
```

### **Welcome Message Event Handlers**
```typescript
// === MAYA WELCOME MESSAGE HANDLER ===
const handleMayaWelcomeShown = (): void => {
  setMayaWelcomeMessage(null);                // Clear Maya welcome message
  // Called by EnhancedMultiAgentChat when user dismisses welcome message
  // Simple state cleanup - no additional logic needed
};

// === TEAM WELCOME MESSAGE HANDLER ===
const handleTeamMessageShown = (): void => {
  setTeamJustAdded(false);                    // Clear team welcome trigger flag
  // Called by EnhancedMultiAgentChat when user dismisses team welcome message
  // Allows normal chat functionality to resume
};

// WHY SEPARATE HANDLERS:
// - Different state variables for different message types
// - Clear separation of concerns
// - Easy to add logic specific to message type
// - Explicit cleanup of temporary states
```

### **Brain Panel Event Handlers**
```typescript
// === BRAIN DATA UPDATE HANDLER ===
const handleUpdateBrainData = (projectId: string, data: ProjectBrainData): void => {
  try {
    setProjectBrainData(prev => ({
      ...prev,
      [projectId]: data                       // Replace entire project brain data
    }));
    
    // WHY FULL REPLACEMENT:
    // - Brain data is cohesive unit (documents, progress, timeline)
    // - Prevents partial update inconsistencies
    // - Simpler than deep merging complex objects
    // - Clear data ownership model
    
  } catch (error) {
    console.error('Error updating brain data:', error);
  }
};

// === MILESTONE COMPLETION HANDLER ===
const handleCompleteMilestone = (projectId: string, milestoneIndex: number): void => {
  try {
    setProjectBrainData(prev => {
      const projectData = safeObject(prev[projectId]);
      if (projectData?.timeline && projectData.timeline[milestoneIndex]) {
        const updatedTimeline = [...projectData.timeline];  // Create new array
        updatedTimeline[milestoneIndex] = {
          ...updatedTimeline[milestoneIndex],
          status: "Completed"                   // Update only status
        };
        
        showConfetti();                       // Trigger celebration animation
        
        return {
          ...prev,
          [projectId]: {
            ...projectData,
            timeline: updatedTimeline           // Replace timeline array
          }
        };
      }
      return prev;                            // No change if validation fails
    });
    
    // WHY IMMUTABLE UPDATE PATTERN:
    // - React state requires immutable updates
    // - Spreading creates new objects/arrays
    // - Prevents unintended mutations
    // - Enables React's change detection
    
  } catch (error) {
    console.error('Error completing milestone:', error);
  }
};
```

---

## 🚨 **ERROR HANDLING & SAFE PATTERNS**

### **Error Boundary Hierarchy**
```typescript
// === MULTI-LEVEL ERROR BOUNDARIES ===
// Pattern: Wrap components at different levels to isolate failures

// ROOT LEVEL: App Component
<ErrorBoundary>                               // Catches catastrophic errors
  <AnimationProvider>                         // Provides animation context
    <AppContent />                           // Main application logic
  </AnimationProvider>
</ErrorBoundary>

// APP CONTENT LEVEL: Major Sections  
<ErrorBoundary>                               // App content container
  <DndProvider backend={HTML5Backend}>        // Drag & drop functionality
    {/* Main application layout */}
  </DndProvider>
</ErrorBoundary>

// COMPONENT LEVEL: Individual Features
<ErrorBoundary>                               // Mobile header
  <div className="md:hidden">/* Mobile header */</div>
</ErrorBoundary>

<ErrorBoundary>                               // Mobile sidebar
  <div className="fixed inset-0">/* Mobile sidebar */</div>
</ErrorBoundary>

<ErrorBoundary>                               // Desktop sidebars
  <div className="h-full">/* Sidebar content */</div>
</ErrorBoundary>

<ErrorBoundary>                               // Main chat interface
  <EnhancedMultiAgentChat />
</ErrorBoundary>

<ErrorBoundary>                               // Brain panel
  <DynamicSidebar />
</ErrorBoundary>

<ErrorBoundary>                               // Animation system
  <AnimationWrapper />
</ErrorBoundary>

<ErrorBoundary>                               // Modal components
  <OnboardingModal />
</ErrorBoundary>

<ErrorBoundary>                               // Returning user welcome
  <ReturningUserWelcome />
</ErrorBoundary>

// WHY HIERARCHICAL BOUNDARIES:
// - Isolates failures to specific components
// - Prevents entire app crashes from single component errors
// - Allows partial functionality when components fail
// - Provides granular error reporting and recovery
// - Maintains user experience even with component failures
```

### **Try-Catch Error Handling**
```typescript
// === FUNCTION-LEVEL ERROR HANDLING ===
// All critical functions wrapped in try-catch blocks

// INITIALIZATION FUNCTIONS:
useEffect(() => {
  try {
    // Default data initialization
    const defaultProjects = [...];
    const defaultTeams = [...];
    const defaultAgents = [...];
    // ... initialization logic
  } catch (error) {
    console.error('Error initializing app data:', error);
    // Graceful degradation: app continues with empty state
    // User can still access functionality, just without default data
  }
}, []);

// STATE UPDATE FUNCTIONS:
const handleSelectProject = (projectId: string): void => {
  try {
    setActiveProjectId(projectId);
    setActiveTeamId(null);
    setActiveAgentId(null);
    setShowTeamDashboard(false);
  } catch (error) {
    console.error('Error selecting project:', error);
    // Error logged but app continues functioning
    // Previous selection state maintained
    // User can retry or select different project
  }
};

// CREATION FUNCTIONS:
const createIdeaProject = useCallback((): string | null => {
  try {
    // Project creation logic
    const projectId = uuidv4();
    // ... creation steps
    return projectId;                         // Success indicator
  } catch (error) {
    console.error('Error creating idea project:', error);
    return null;                              // Failure indicator
  }
}, [showEggHatching]);

// WHY TRY-CATCH PATTERNS:
// - Prevents unhandled exceptions from crashing app
// - Provides specific error context in console
// - Allows graceful failure handling
// - Maintains app stability
// - Enables error reporting and debugging
```

### **Safe Data Access Patterns**
```typescript
// === SAFE RENDERING UTILITIES ===
import { safeString, safeArray, safeObject } from './lib/safeRender';

// All data access uses safe utilities to prevent runtime errors

// SAFE ARRAY ACCESS:
const projectAgents = activeProjectId 
  ? safeArray(agents).filter(a => a.projectId === activeProjectId) 
  : [];

// WHY: agents array could be undefined during initialization
// HOW: safeArray() ensures array is always defined
// FALLBACK: Returns empty array if input is null/undefined
// BENEFIT: Prevents "cannot read property of undefined" errors

// SAFE OBJECT ACCESS:
const projectData = safeObject(projectBrainData[projectId]);

// WHY: projectBrainData[projectId] could be undefined
// HOW: safeObject() ensures object is always defined  
// FALLBACK: Returns empty object if input is null/undefined
// BENEFIT: Prevents property access errors on undefined objects

// SAFE STRING ACCESS:
const agentName = safeString(agent?.name);

// WHY: agent.name could be null, undefined, or non-string
// HOW: safeString() ensures string value
// FALLBACK: Returns empty string if input is null/undefined
// BENEFIT: Prevents string method errors and display issues

// === DEFENSIVE PROGRAMMING PATTERNS ===

// NULL/UNDEFINED CHECKS:
if (activeProjectId && safeArray(projects).length > 0) {
  const project = projects.find(p => p.id === activeProjectId);
  if (project) {
    // Safe to access project properties
    const projectName = safeString(project.name);
  }
}

// OPTIONAL CHAINING:
const teamData = teamMetrics[activeTeam?.id];
if (teamData?.memberPerformance) {
  // Safe to access member performance data
}

// ARRAY LENGTH CHECKS:
const activeAgent = activeAgentId && safeArray(agents).length > 0 
  ? safeArray(agents).find(a => a.id === activeAgentId) ?? null 
  : null;

// FALLBACK VALUES:
const activeProject = activeProjectId 
  ? safeArray(projects).find(p => p.id === activeProjectId) ?? null 
  : null;

// WHY DEFENSIVE PROGRAMMING:
// - Prevents runtime errors from unexpected data states
// - Provides predictable behavior under all conditions
// - Enables graceful handling of loading/error states
// - Improves app reliability and user experience
// - Reduces debugging time and support issues
```

### **Error Recovery Strategies**
```typescript
// === GRACEFUL DEGRADATION PATTERNS ===

// PATTERN 1: Function Return Values
// Success: Return meaningful value (ID, object, etc.)
// Failure: Return null or false to indicate failure
const createProject = (): string | null => {
  try {
    // Creation logic
    return projectId;
  } catch (error) {
    console.error('Error creating project:', error);
    return null;  // Caller can check for null and handle accordingly
  }
};

// PATTERN 2: State Preservation
// On error: Maintain previous valid state
// User experience: App continues functioning with last known good state
const handleUpdate = (newData: any): void => {
  try {
    setState(newData);
  } catch (error) {
    console.error('Error updating state:', error);
    // State remains unchanged - user can retry or continue
  }
};

// PATTERN 3: Fallback UI Content
// On error: Show meaningful fallback instead of broken UI
const SafeComponent = ({ data }) => {
  try {
    return <ComplexComponent data={data} />;
  } catch (error) {
    console.error('Error rendering component:', error);
    return <div>Unable to load content. Please try refreshing.</div>;
  }
};

// PATTERN 4: Progressive Enhancement
// Core functionality works even if enhanced features fail
const EnhancedFeature = () => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return <BasicFeature />;  // Fallback to basic version
  }
  
  try {
    return <AdvancedFeature onError={() => setHasError(true)} />;
  } catch (error) {
    console.error('Enhanced feature failed:', error);
    return <BasicFeature />;
  }
};

// === ERROR REPORTING AND MONITORING ===

// CONSOLE LOGGING:
// All errors logged with context
// Includes function name, error details, and relevant state
console.error('Error in handleSelectProject:', error, { projectId, currentState });

// FUTURE ENHANCEMENTS:
// - Error tracking service integration (Sentry, LogRocket)
// - User feedback collection for errors
// - Automatic error recovery attempts
// - Performance monitoring for error patterns
```

---

## 📱 **RESPONSIVE BEHAVIOR & BREAKPOINTS**

### **Breakpoint System**
```typescript
// === TAILWIND BREAKPOINT DEFINITIONS ===
// sm: 640px   - Small devices (landscape phones)
// md: 768px   - Medium devices (tablets)
// lg: 1024px  - Large devices (laptops)
// xl: 1280px  - Extra large devices (desktops)
// 2xl: 1536px - 2X Extra large devices (large desktops)

// === APPLICATION BREAKPOINTS ===
// Mobile: < 768px (md breakpoint)
// Desktop: ≥ 768px (md breakpoint and above)

// WHY SINGLE BREAKPOINT:
// - Simplifies responsive logic
// - Clear mobile vs desktop distinction  
// - Reduces complexity in component logic
// - Matches common device usage patterns
```

### **Mobile-First Responsive Patterns**
```typescript
// === MOBILE HEADER ===
// VISIBILITY: Mobile only (hidden on desktop)
// CLASSES: md:hidden (hidden on medium screens and up)
// HEIGHT: Fixed 60px for consistent touch targets
// LAYOUT: Flex with space-between for left/right content

<div className="md:hidden flex items-center bg-[#23262B] p-3 border-b border-[#43444B]">
  {/* Mobile-only header content */}
</div>

// === DESKTOP SIDEBARS ===
// VISIBILITY: Desktop only (hidden on mobile)
// CLASSES: hidden md:block (hidden on small, visible on medium+)
// LAYOUT: Side-by-side with main content
// TRANSITIONS: Width and opacity animations

<div className="h-full transition-all duration-300 ease-out bg-[#23262B] flex-shrink-0 hidden md:block">
  {/* Desktop-only sidebar content */}
</div>

// === MOBILE OVERLAYS ===
// POSITIONING: Fixed overlays on mobile, static panels on desktop
// Z-INDEX: High z-index for overlay behavior
// ANIMATION: Transform-based slide animations

<div className={`
  fixed inset-0 z-40 transition-transform duration-300 md:hidden
  ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}
`}>
  {/* Mobile overlay content */}
</div>

// === BRAIN PANEL RESPONSIVE BEHAVIOR ===
// DESKTOP: Side panel with width animations
// MOBILE: Full-screen overlay
// TRANSITION: Same component, different positioning

<div className={`
  transition-all duration-300 ease-out flex-shrink-0 rounded-xl overflow-hidden bg-[#23262B] shadow-lg
  ${brainOpen ? 'md:w-[280px] opacity-100' : 'md:w-0 opacity-0'}        // Desktop behavior
  ${brainOpen ? 'fixed inset-0 z-30 md:static' : 'hidden md:block md:w-0'}  // Mobile: overlay
`}>
  {/* Responsive panel content */}
</div>
```

### **Touch and Interaction Adaptations**
```typescript
// === TOUCH TARGET REQUIREMENTS ===
// MINIMUM SIZE: 44px × 44px (Apple Human Interface Guidelines)
// PREFERRED SIZE: 48px × 48px (Material Design Guidelines)
// SPACING: Minimum 8px between touch targets

// === BUTTON SIZING PATTERNS ===
// Small buttons: p-2 (8px) + 24px icon = 40px (acceptable for desktop)
// Touch buttons: p-3 (12px) + 24px icon = 48px (preferred for mobile)
// Header buttons: Explicitly sized for 44px+ touch area

// MOBILE HEADER BUTTONS:
<button className="p-2 text-[#A6A7AB] hover:text-[#F1F1F3]">
  <svg width="24" height="24">/* Icon */</svg>
</button>
// Total size: 8px + 24px + 8px = 40px (minimum acceptable)

// === HOVER STATES ON TOUCH DEVICES ===
// CSS hover states work as "active" states on touch
// No separate touch-specific styling needed
// Transition effects provide visual feedback for taps

// === GESTURE SUPPORT ===
// TAP: Primary interaction method
// BACKDROP TAP: Dismisses overlays and modals
// SCROLL/SWIPE: Within scrollable content areas
// NO CUSTOM GESTURES: Relies on standard web interactions

// === RESPONSIVE TEXT AND SPACING ===
// TEXT SIZES: Consistent across breakpoints (no responsive text scaling)
// SPACING: Consistent spacing system across breakpoints
// CONTENT: Same content structure on mobile and desktop
// LAYOUT: Only layout changes, not content or sizing
```

### **Layout Adaptation Patterns**
```typescript
// === LAYOUT TRANSFORMATION PATTERNS ===

// PATTERN 1: Visibility Toggle
// Desktop: Always visible
// Mobile: Hidden by default, shown via overlay
// Implementation: md:hidden and md:block classes

// PATTERN 2: Positioning Change
// Desktop: Static positioned side panels
// Mobile: Fixed positioned overlays
// Implementation: md:static and fixed classes

// PATTERN 3: Size Adaptation
// Desktop: Fixed widths (260px sidebar, 280px brain)
// Mobile: Full screen or partial overlays
// Implementation: Responsive width classes

// PATTERN 4: Interaction Method Change
// Desktop: Hover interactions and keyboard shortcuts
// Mobile: Touch interactions and gesture support
// Implementation: CSS hover states and touch-friendly targets

// === SPECIFIC RESPONSIVE IMPLEMENTATIONS ===

// SIDEBAR RESPONSIVE BEHAVIOR:
// Desktop: width-based show/hide with slim fallback
// Mobile: overlay-based show/hide with backdrop

// BRAIN PANEL RESPONSIVE BEHAVIOR:
// Desktop: width-based collapse with slim version
// Mobile: full-screen overlay with close button

// CONTENT AREA RESPONSIVE BEHAVIOR:
// Desktop: flexible width based on panel states
// Mobile: full width with overlays on top

// NAVIGATION RESPONSIVE BEHAVIOR:
// Desktop: always visible in sidebar
// Mobile: hamburger menu → overlay sidebar

// === RESPONSIVE STATE MANAGEMENT ===
// DESKTOP STATE: sidebarOpen, brainOpen (width-based)
// MOBILE STATE: mobileNavOpen (overlay-based)
// COORDINATION: Independent states prevent conflicts
// CLEANUP: Mobile states reset on desktop resize (could be enhanced)
```

---

## 💾 **DATA PERSISTENCE & LOCALSTORAGE**

### **LocalStorage Implementation**
```typescript
// === STORAGE KEY DEFINITION ===
const ONBOARDING_COMPLETION_KEY = 'hasCompletedOnboarding';

// Single key used for onboarding completion tracking
// Value stored: 'true' (string) when completed
// Value read: 'true' | null (null when not set)

// === READING LOCALSTORAGE ===
// Location: Initialization useEffect in AppContent
const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');

if (hasCompletedOnboarding) {
  // User has completed onboarding before → returning user flow
  setShowOnboarding(false);                   // Hide first-time onboarding
  setShowReturningUserWelcome(true);          // Show returning user welcome
} else {
  // User has not completed onboarding → first-time user flow
  // showOnboarding remains true (initial state)
  // showReturningUserWelcome remains false (initial state)
}

// WHY CHECK FOR TRUTHINESS:
// - localStorage.getItem() returns null if key doesn't exist
// - We only care if it exists (any truthy value indicates completion)
// - Simple boolean logic for flow determination

// === WRITING LOCALSTORAGE ===
// Location: handleOnboardingComplete function
localStorage.setItem('hasCompletedOnboarding', 'true');

// TIMING: After user completes any onboarding path
// PURPOSE: Mark user as having seen onboarding
// PERSISTENCE: Survives browser refresh, tab close, device restart
// SCOPE: Per-origin (only affects this app's domain)

// === CLEARING LOCALSTORAGE ===
// Location: Debug keyboard shortcut (Ctrl+Shift+R)
localStorage.removeItem('hasCompletedOnboarding');

// PURPOSE: Reset onboarding state for testing
// USAGE: Development, QA testing, demo preparation
// EFFECT: Next app load will show first-time onboarding
// SAFETY: Debug feature, not exposed to normal users
```

### **Data Persistence Strategy**
```typescript
// === CURRENT PERSISTENCE SCOPE ===
// PERSISTED:
// - Onboarding completion status
// - Browser session data (automatic)

// NOT PERSISTED:
// - Projects, agents, teams (reset on page load)
// - Active selections (reset on page load)  
// - Panel states (reset on page load)
// - Welcome message states (reset on page load)

// WHY LIMITED PERSISTENCE:
// - App is currently demo/prototype focused
// - Default data provides consistent starting point
// - Simplifies testing and development
// - Reduces complexity of data synchronization

// === FUTURE PERSISTENCE CONSIDERATIONS ===
// COULD BE PERSISTED:
// - User-created projects and agents
// - Panel preferences (sidebar/brain open states)
// - Last active project selection
// - User preferences and settings

// STORAGE OPTIONS:
// - localStorage: Simple, browser-only, synchronous
// - sessionStorage: Per-tab, cleared on tab close
// - IndexedDB: Complex data, asynchronous, larger capacity
// - Server-side: User accounts, cross-device sync

// IMPLEMENTATION PATTERN:
const persistUserData = () => {
  try {
    const userData = {
      projects,
      agents,
      teams,
      activeProjectId,
      panelStates: { sidebarOpen, brainOpen }
    };
    localStorage.setItem('hatchin_user_data', JSON.stringify(userData));
  } catch (error) {
    console.error('Error persisting user data:', error);
  }
};

const loadUserData = () => {
  try {
    const saved = localStorage.getItem('hatchin_user_data');
    if (saved) {
      const userData = JSON.parse(saved);
      // Restore state from saved data
      setProjects(userData.projects || []);
      setAgents(userData.agents || []);
      // ... restore other states
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    // Fall back to default data initialization
  }
};
```

### **Storage Error Handling**
```typescript
// === LOCALSTORAGE ERROR HANDLING ===
// localStorage may not be available in some environments

// READING WITH ERROR HANDLING:
const getOnboardingStatus = (): boolean => {
  try {
    const hasCompleted = localStorage.getItem('hasCompletedOnboarding');
    return hasCompleted === 'true';
  } catch (error) {
    console.error('Error reading localStorage:', error);
    return false;  // Default to first-time user if storage fails
  }
};

// WRITING WITH ERROR HANDLING:
const setOnboardingComplete = (): void => {
  try {
    localStorage.setItem('hasCompletedOnboarding', 'true');
  } catch (error) {
    console.error('Error writing localStorage:', error);
    // Non-critical: onboarding completion may not persist
    // User experience continues normally
  }
};

// CLEARING WITH ERROR HANDLING:
const resetOnboarding = (): void => {
  try {
    localStorage.removeItem('hasCompletedOnboarding');
    console.log('Onboarding reset successfully');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    // Debug feature: log error but don't block operation
  }
};

// === STORAGE AVAILABILITY SCENARIOS ===
// PRIVATE BROWSING: localStorage may throw on write operations
// STORAGE QUOTA: localStorage may be full (rare but possible)
// SECURITY POLICIES: Some environments disable localStorage
// BROWSER COMPATIBILITY: Very old browsers may not support localStorage

// === GRACEFUL DEGRADATION ===
// If localStorage fails:
// - App continues functioning normally
// - Onboarding shows every session (acceptable fallback)
// - User can still use all app features
// - No data loss or functionality loss
// - Error logging helps with debugging
```

---

## 🔄 **COMPLETE INTERACTION FLOWS**

### **First-Time User Complete Journey**
```typescript
// === COMPLETE FIRST-TIME USER FLOW ===

// STEP 1: Application Initialization
// TRIGGER: User opens app for first time
// STATE: localStorage.getItem('hasCompletedOnboarding') → null

App loads →
  useEffect (dark mode setup) →
    Document styling applied →
    Keyboard shortcuts registered →
  useEffect (data initialization) →
    Default projects created →
    Default teams created →
    Default agents created →
    Brain data initialized →
    Team metrics initialized →
    State updates: setProjects(), setTeams(), setAgents() →
    setActiveProjectId("1") →
    Check localStorage: hasCompletedOnboarding = null →
    showOnboarding remains true →
    showReturningUserWelcome remains false →

// STEP 2: UI Render and Onboarding Display
AppContent renders →
  Desktop/mobile layout determined →
  OnboardingModal renders (isOpen={showOnboarding} = true) →
  User sees onboarding welcome screen →

// STEP 3: Onboarding Interaction
User reads welcome message →
User clicks "Let's Start" →
  OnboardingModal nextStep() →
  currentStep: 0 → 1 →
  Path selection screen displays →

User evaluates three paths →
User clicks path (idea/template/scratch) →
  setSelectedPath(pathId) →
  Path card shows selected state →
User clicks "Continue" →
  handlePathSelection() →
    if (template) → nextStep() to template selection
    else → setCurrentStep(final) to completion

// STEP 4A: Idea Path Completion
User on completion screen →
User clicks "Start with Maya" →
  handleComplete() →
    setIsCompleting(true) →
    Button shows loading state →
    await delay (UX improvement) →
    onComplete('idea') called →

// STEP 5A: Idea Path Execution  
handleOnboardingComplete('idea') →
  setShowOnboarding(false) →
  localStorage.setItem('hasCompletedOnboarding', 'true') →
  createIdeaProject() →
    Generate projectId and mayaId →
    Create project object →
    Create Maya agent object →
    Create brain data object →
    setProjects([...prev, newProject]) →
    setAgents([...prev, maya]) →
    setProjectBrainData({...prev, [projectId]: brainData}) →
    setActiveProjectId(projectId) →
    setActiveAgentId(mayaId) →
    setActiveTeamId(null) →
    setMayaWelcomeMessage("Hi! I'm Maya...") →
    showEggHatching() →

// STEP 6A: Post-Creation Experience
State updates trigger re-renders →
  OnboardingModal disappears →
  ProjectSidebar shows new "My Idea" project →
  "My Idea" project highlighted as active →
  Maya agent highlighted in agent list →
  EnhancedMultiAgentChat switches to Maya context →
  DynamicSidebar shows new project brain data →
  Egg hatching animation plays over UI →
    Animation duration: ~4.5 seconds →
    User sees project creation celebration →
    Animation completes and cleans up →
  Maya welcome message appears in chat →
    User sees personalized greeting →
    User can dismiss message or begin conversation →

// STEP 4B: Template Path Flow
User selects "Use Starter Pack" →
Template selection screen displays →
User searches/filters templates →
User selects template →
  setSelectedTemplate(templateData) →
User clicks "Create Team" →
  handleComplete() with templateData →

// STEP 5B: Template Path Execution
handleOnboardingComplete('template', templateName, templateData) →
  setShowOnboarding(false) →
  localStorage.setItem('hasCompletedOnboarding', 'true') →
  createProjectFromStarterPack(templateData) →
    Generate projectId and teamId →
    Create project, team, and multiple agents →
    Set up brain data and team metrics →
    Multiple state updates (atomic) →
    setActiveProjectId(projectId) →
    setActiveTeamId(teamId) →
    setTeamJustAdded(true) →
    showEggHatching() →

// STEP 6B: Template Post-Creation Experience
UI updates with new team project →
  Full team visible in sidebar →
  Team highlighted as active →
  Multiple agents listed under team →
  Chat switches to team conversation mode →
  Brain panel shows team metrics →
  Egg hatching animation celebrates team creation →
  Team welcome message appears with member introductions →

// STEP 4C: Scratch Path Flow
User selects "Continue from Scratch" →
Completion screen shows exploration message →
User clicks "Explore Projects" →
  handleComplete() with 'scratch' →

// STEP 5C: Scratch Path Execution
handleOnboardingComplete('scratch') →
  setShowOnboarding(false) →
  localStorage.setItem('hasCompletedOnboarding', 'true') →
  No additional project creation →

// STEP 6C: Scratch Post-Completion Experience
Onboarding modal disappears →
User sees default projects and teams →
First project ("SaaS Startup") remains active →
User can explore existing projects and teams →
No animations or welcome messages →
User begins exploration of features →

// === COMMON POST-ONBOARDING STATE ===
// Regardless of path chosen:
// - Onboarding marked as complete in localStorage
// - User can access all app functionality
// - Future app loads will show ReturningUserWelcome
// - Full workspace available for project management
```

### **Returning User Complete Journey**
```typescript
// === COMPLETE RETURNING USER FLOW ===

// STEP 1: Application Initialization (Returning User)
// TRIGGER: User opens app after completing onboarding
// STATE: localStorage.getItem('hasCompletedOnboarding') → 'true'

App loads →
  useEffect (dark mode setup) →
  useEffect (data initialization) →
    Default projects, teams, agents created →
    setActiveProjectId("1") →
    Check localStorage: hasCompletedOnboarding = 'true' →
    setShowOnboarding(false) →
    setShowReturningUserWelcome(true) →

// STEP 2: Returning User Welcome Display
AppContent renders →
  OnboardingModal hidden (isOpen = false) →
  ReturningUserWelcome renders (isOpen = true) →
  User sees welcome back message →
  Last active project info displayed →

// STEP 3: Action Selection
User evaluates three options →
  "Continue Last Project" (primary action) →
  "Start with New Idea" (secondary action) →
  "Use Starter Pack" (tertiary action) →

// STEP 4A: Continue Last Project
User clicks "Continue Last Project" →
  handleContinueLastProject() →
    setShowReturningUserWelcome(false) →
    No other state changes →

Modal disappears →
User continues with current application state →
  Active project: "SaaS Startup" (default) →
  Existing teams and agents available →
  Full workspace ready for use →

// STEP 4B: Start with New Idea (Returning User)
User clicks "Start with New Idea" →
  handleStartWithIdea() →
    createIdeaProject() → [Same logic as first-time idea path]
    setShowReturningUserWelcome(false) →

New Maya project created alongside existing projects →
Maya becomes active agent →
Egg hatching animation plays →
Maya welcome message appears →
User has new idea project plus all existing projects →

// STEP 4C: Use Starter Pack (Returning User)
User clicks "Use Starter Pack" →
  handleUseStarterPack() →
    setShowReturningUserWelcome(false) →
    // Future: could open template selection
    
Modal disappears →
User returns to main interface →
// Current implementation: just closes modal
// Future: could launch template selection flow
```

### **Project Selection and Navigation Flows**
```typescript
// === COMPLETE PROJECT SELECTION FLOW ===

// TRIGGER: User clicks project in sidebar
User clicks "Creative Studio" project →
  handleSelectProject("2") →
    setActiveProjectId("2") →
    setActiveTeamId(null) →           // Clear previous team selection
    setActiveAgentId(null) →          // Clear previous agent selection
    setShowTeamDashboard(false) →     // Close any open dashboard
    
// CASCADE EFFECT: useEffect([activeProjectId]) triggers
useEffect runs →
  setActiveAgentId(null) →            // Redundant but ensures cleanup
  setActiveTeamId(null) →             // Redundant but ensures cleanup

// DERIVED STATE RECALCULATION
activeProject recalculates →
  projects.find(p => p.id === "2") →
  Creative Studio project object returned →

projectAgents recalculates →
  agents.filter(a => a.projectId === "2") →
  Empty array (Creative Studio has no default agents) →

projectTeams recalculates →
  teams.filter(t => t.projectId === "2") →
  ["Content Team", "Client Strategy"] teams returned →

// UI UPDATES (React re-render)
ProjectSidebar updates →
  Previous project ("SaaS Startup") loses highlight →
  New project ("Creative Studio") gains highlight →
  Team list updates to show Creative Studio teams →

EnhancedMultiAgentChat updates →
  Context switches to Creative Studio project →
  Chat placeholder updates to "Message Creative Studio..." →
  Previous conversation context clears →

DynamicSidebar updates →
  Brain panel switches to Creative Studio data →
  Progress ring shows Creative Studio progress (if any) →
  Documents and timeline update to project context →

// VISUAL FEEDBACK COMPLETE
User sees immediate response to selection →
All UI components reflect new project context →
Previous selections cleanly cleared →
Ready for further interaction (team/agent selection) →

// === AGENT SELECTION WITH PROJECT SWITCHING ===

// TRIGGER: User clicks agent from different project
User currently in "Creative Studio" project →
User clicks "Product Manager" agent from "SaaS Startup" →
  handleSidebarSelectAgent("a3", "1") →
    
// STEP 1: Project switch check
if (activeProjectId !== "1") → true →
  setActiveProjectId("1") →           // Switch to SaaS Startup project
  
// STEP 2: Agent selection  
setActiveAgentId("a3") →              // Select Product Manager agent

// STEP 3: Team context setting
const agent = agents.find(a => a.id === "a3") →
agent.teamId = "team-2" →             // Product Manager is in Product Team
setActiveTeamId("team-2") →           // Set team context

// STEP 4: Cleanup
setShowTeamDashboard(false) →

// CASCADE EFFECTS
Project selection cascade triggers →
  Previous agent/team selections cleared →
  Derived state recalculates for new project →

// UI UPDATES  
ProjectSidebar updates →
  Creative Studio loses highlight →
  SaaS Startup gains highlight →
  Product Manager agent gains highlight →
  Product Team context shown →

EnhancedMultiAgentChat updates →
  Switches to 1:1 agent conversation mode →
  Product Manager becomes conversation target →
  Chat placeholder: "Message Product Manager..." →

DynamicSidebar updates →
  Shows agent-specific insights and metrics →
  Agent performance data displayed →
  Recent activity for Product Manager shown →

// COMPLETE CONTEXT SWITCH
User seamlessly navigated from Creative Studio project →
to Product Manager agent in SaaS Startup project →
All UI components updated consistently →
Team context preserved (agent is team member) →
Ready for agent conversation or further navigation →
```

### **Mobile Interaction Complete Flows**
```typescript
// === COMPLETE MOBILE NAVIGATION FLOW ===

// INITIAL STATE: Mobile user sees main content with header
Mobile viewport (< 768px) →
Header visible with hamburger menu and brain toggle →
Sidebars hidden (desktop-only) →
Main content takes full width →

// TRIGGER: User wants to navigate projects
User taps hamburger menu in header →
  setMobileNavOpen(true) →
  
// ANIMATION SEQUENCE
Mobile sidebar overlay animates in →
  transform: translateX(-100%) → translateX(0) →
  duration: 300ms ease-out →
  Backdrop appears: bg-black/50 →

// SIDEBAR CONTENT LOADS
ProjectSidebar renders in overlay →
  Full project navigation available →
  Same functionality as desktop →
  Scrollable content area →

// USER INTERACTION
User scrolls through projects →
User taps "Influencer Brand" project →
  handleSelectProject("3") called →
  Mobile-specific auto-close: setMobileNavOpen(false) →
  
// CLEANUP ANIMATION  
Sidebar animates out →
  transform: translateX(0) → translateX(-100%) →
  Backdrop fades out →
  
// RESULT STATE
User back to main content →
Influencer Brand project now active →
All derived state updated →
UI reflects new project selection →

// === MOBILE BRAIN PANEL FLOW ===

// TRIGGER: User wants project insights
User taps brain icon in mobile header →
  setBrainOpen(true) →

// MOBILE OVERLAY BEHAVIOR
Brain panel becomes full-screen overlay →
  CSS: fixed inset-0 z-30 →
  No backdrop (direct content interaction) →
  Close button appears in top-right →

// CONTENT INTERACTION
User scrolls through brain panel content →
User interacts with progress ring, documents, timeline →
Full functionality available in overlay →

// DISMISSAL
User taps close button in corner →
  setBrainOpen(false) →
  
Full-screen overlay disappears →
User returns to main content →
Mobile header remains visible →

// === MOBILE TOUCH INTERACTIONS ===

// TOUCH TARGET OPTIMIZATION
All interactive elements minimum 44px touch target →
Adequate spacing between touch targets →
Visual feedback on tap (hover states) →

// GESTURE SUPPORT
Tap: Primary interaction method →
Backdrop tap: Dismisses overlays →
Scroll: Within overlay content →
Swipe: Natural browser scrolling →

// NO CUSTOM GESTURES
App relies on standard web interactions →
No swipe-to-dismiss or custom gesture recognition →
Follows web platform conventions →
Compatible with assistive technologies →
```

This complete interaction system guide provides developers with every detail needed to understand and implement all interactions in the Hatchin application, from high-level architecture to specific component behaviors and user flows.