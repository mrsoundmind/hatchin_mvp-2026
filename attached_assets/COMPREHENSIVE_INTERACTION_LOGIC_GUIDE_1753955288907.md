# 🎯 Comprehensive Interaction Logic Guide
**Hatchin No-Code AI Creation Workspace**

**Purpose**: Complete developer reference for all interactions, state management, and user flows  
**Scope**: Every click, keyboard shortcut, modal, animation, and state change in the application  
**Target**: Frontend developers implementing the Figma design

---

## 📋 **TABLE OF CONTENTS**

1. [Application Architecture](#application-architecture)
2. [Panel Management System](#panel-management-system)
3. [Navigation & Selection Logic](#navigation--selection-logic)
4. [Modal & Dialog Flows](#modal--dialog-flows)
5. [Animation System](#animation-system)
6. [Keyboard Shortcuts](#keyboard-shortcuts)
7. [Mobile Interactions](#mobile-interactions)
8. [State Management](#state-management)
9. [Error Handling](#error-handling)
10. [Data Flow Patterns](#data-flow-patterns)

---

## 🏗️ **APPLICATION ARCHITECTURE**

### **Component Hierarchy**
```
App (Root)
├── AnimationProvider (Context)
├── ErrorBoundary (Global error handling)
├── DndProvider (Drag & drop context)
└── AppContent (Main application logic)
    ├── Mobile Header (768px-)
    ├── Mobile Sidebar Overlay (768px-)
    ├── SlimSidebar (Desktop collapsed state)
    ├── ProjectSidebar (Desktop expanded state)
    ├── Main Content Area
    │   ├── TeamDashboard (Conditional)
    │   └── EnhancedMultiAgentChat (Default)
    ├── SlimBrain (Desktop collapsed state)
    ├── DynamicSidebar (Desktop expanded state)
    ├── AnimationWrapper (Overlays)
    ├── OnboardingModal (First visit)
    └── ReturningUserWelcome (Returning users)
```

### **State Architecture**
```typescript
// Panel visibility states
const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
const [brainOpen, setBrainOpen] = useState<boolean>(true);
const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

// Content selection states
const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
const [activeTeamId, setActiveTeamId] = useState<string | null>(null);

// View states
const [showTeamDashboard, setShowTeamDashboard] = useState<boolean>(false);
const [showOnboarding, setShowOnboarding] = useState<boolean>(true);
const [showReturningUserWelcome, setShowReturningUserWelcome] = useState<boolean>(false);

// Data states
const [projects, setProjects] = useState<Project[]>([]);
const [agents, setAgents] = useState<Agent[]>([]);
const [teams, setTeams] = useState<Team[]>([]);
const [teamMetrics, setTeamMetrics] = useState<TeamMetricsRecord>({});
const [projectBrainData, setProjectBrainData] = useState<Record<string, ProjectBrainData>>({});

// Temporary states
const [teamJustAdded, setTeamJustAdded] = useState<boolean>(false);
const [mayaWelcomeMessage, setMayaWelcomeMessage] = useState<string | null>(null);
```

---

## 🎛️ **PANEL MANAGEMENT SYSTEM**

### **1. Left Sidebar (ProjectSidebar) Logic**

#### **Desktop Behavior**
```typescript
// Initial state: sidebarOpen = true (260px width)
// Collapsed state: sidebarOpen = false (56px SlimSidebar)

// Toggle Logic
const toggleSidebar = () => setSidebarOpen(prev => !prev);

// Triggering Events:
// 1. SlimSidebar expand button click
// 2. ProjectSidebar collapse button click  
// 3. Keyboard: Ctrl/Cmd + B
// 4. Mobile: Hamburger menu (different state)
```

**Interaction Flow:**
1. **User clicks collapse button in ProjectSidebar**
   - `setSidebarOpen(false)` triggered
   - ProjectSidebar width animates: `w-[260px] opacity-100` → `w-0 opacity-0`
   - SlimSidebar appears: `w-0` → `w-14`
   - Transition duration: `300ms ease-out`
   - Content area expands to fill space

2. **User clicks expand button in SlimSidebar**
   - `setSidebarOpen(true)` triggered
   - SlimSidebar width animates: `w-14` → `w-0`
   - ProjectSidebar appears: `w-0 opacity-0` → `w-[260px] opacity-100`
   - Transition duration: `300ms ease-out`
   - Content area contracts

#### **Mobile Behavior (768px and below)**
```typescript
// Mobile uses separate state: mobileNavOpen
// Desktop sidebar hidden: `hidden md:block`
// Mobile overlay shown: `fixed inset-0 z-40`

// Toggle Logic
const toggleMobileNav = () => setMobileNavOpen(prev => !prev);

// Triggering Events:
// 1. Mobile header hamburger button
// 2. Backdrop click (outside sidebar)
// 3. Close button in mobile sidebar
// 4. Item selection (auto-close)
```

**Interaction Flow:**
1. **User clicks hamburger menu**
   - `setMobileNavOpen(true)` triggered
   - Backdrop appears: `bg-black/50` with fade-in
   - Sidebar slides in: `translate-x-0` from `translate-x-full`
   - Animation: `duration-300 ease-out`

2. **User clicks backdrop or close button**
   - `setMobileNavOpen(false)` triggered
   - Sidebar slides out: `translate-x-0` → `translate-x-full`
   - Backdrop fades out
   - Animation: `duration-300 ease-out`

### **2. Right Panel (Brain Panel) Logic**

#### **Desktop Behavior**
```typescript
// Initial state: brainOpen = true (280px width)
// Collapsed state: brainOpen = false (40px SlimBrain)

// Toggle Logic
const toggleBrain = () => setBrainOpen(prev => !prev);

// Triggering Events:
// 1. SlimBrain expand button click
// 2. DynamicSidebar collapse button click
// 3. Keyboard: Ctrl/Cmd + P
// 4. Mobile: Brain icon in header
```

**Interaction Flow:**
1. **User clicks collapse button in DynamicSidebar**
   - `setBrainOpen(false)` triggered
   - DynamicSidebar width animates: `md:w-[280px] opacity-100` → `md:w-0 opacity-0`
   - SlimBrain appears: `w-0 opacity-0` → `w-10 opacity-100`
   - Transition duration: `300ms ease-out`

2. **User clicks expand button in SlimBrain**
   - `setBrainOpen(true)` triggered
   - SlimBrain width animates: `w-10 opacity-100` → `w-0 opacity-0`
   - DynamicSidebar appears: `md:w-0 opacity-0` → `md:w-[280px] opacity-100`
   - Transition duration: `300ms ease-out`

#### **Mobile Behavior**
```typescript
// Mobile brain panel becomes full-screen overlay
// Classes: `fixed inset-0 z-30 md:static`

// When brainOpen = true on mobile:
// - Full screen overlay with close button
// - Close button: absolute top-4 right-4
// - Background: #23262B (solid, not transparent)
```

**Interaction Flow:**
1. **User clicks brain icon in mobile header**
   - `setBrainOpen(true)` triggered
   - Brain panel appears as full-screen overlay
   - Close button visible in top-right

2. **User clicks close button**
   - `setBrainOpen(false)` triggered
   - Brain panel disappears
   - Returns to main content view

---

## 🧭 **NAVIGATION & SELECTION LOGIC**

### **1. Project Selection**

#### **Selection Sources**
- ProjectSidebar project cards
- Mobile sidebar project items
- Onboarding completion
- Template creation

#### **Selection Logic**
```typescript
const handleSelectProject = (projectId: string): void => {
  // 1. Set active project
  setActiveProjectId(projectId);
  
  // 2. Clear child selections
  setActiveTeamId(null);
  setActiveAgentId(null);
  
  // 3. Close team dashboard if open
  setShowTeamDashboard(false);
  
  // 4. On mobile: close sidebar
  if (mobile) setMobileNavOpen(false);
};
```

**Interaction Flow:**
1. **User clicks project card in sidebar**
   - Project becomes active (visual indicator: accent border/background)
   - Chat interface switches to project context
   - Brain panel updates to show project data
   - Any active agent/team selections are cleared
   - Team dashboard closes if open

2. **State Updates Triggered**
   - `activeProjectId` → new project ID
   - `activeAgentId` → null
   - `activeTeamId` → null
   - `showTeamDashboard` → false

3. **Visual Changes**
   - Selected project: accent color border/background
   - Previously selected project: returns to default styling
   - Chat header updates to show project name
   - Brain panel shows project-specific data

### **2. Agent Selection**

#### **Selection Sources**
- ProjectSidebar agent items (nested under projects)
- Chat interface agent selector
- Agent creation completion

#### **Selection Logic**
```typescript
const handleSelectAgent = (agentId: string | null): void => {
  // 1. Set active agent
  setActiveAgentId(agentId);
  
  // 2. If agent has team, set team context
  if (agentId) {
    const agent = agents.find(a => a.id === agentId);
    if (agent?.teamId) {
      setActiveTeamId(agent.teamId);
    } else {
      setActiveTeamId(null);
    }
  }
  
  // 3. Close team dashboard
  setShowTeamDashboard(false);
};

const handleSidebarSelectAgent = (agentId: string, projectId: string): void => {
  // 1. Switch project if different
  if (activeProjectId !== projectId) {
    setActiveProjectId(projectId);
  }
  
  // 2. Apply agent selection logic
  handleSelectAgent(agentId);
  
  // 3. Close mobile nav
  if (mobile) setMobileNavOpen(false);
};
```

**Interaction Flow:**
1. **User clicks agent in sidebar**
   - Agent becomes active
   - If agent belongs to different project → project switches
   - If agent has team → team context set
   - Chat switches to 1:1 agent conversation
   - Brain panel shows agent-specific insights

2. **State Updates**
   - `activeAgentId` → selected agent ID
   - `activeProjectId` → agent's project (if different)
   - `activeTeamId` → agent's team (if exists)
   - `showTeamDashboard` → false

### **3. Team Selection**

#### **Selection Sources**
- ProjectSidebar team items
- Team creation completion
- Team dashboard navigation

#### **Selection Logic**
```typescript
const handleSelectTeam = (teamId: string, projectId: string): void => {
  // 1. Switch project if needed
  if (activeProjectId !== projectId) {
    setActiveProjectId(projectId);
  }
  
  // 2. Set team context
  setActiveTeamId(teamId);
  
  // 3. Clear agent selection
  setActiveAgentId(null);
  
  // 4. Close team dashboard
  setShowTeamDashboard(false);
  
  // 5. Close mobile nav
  if (mobile) setMobileNavOpen(false);
};
```

**Interaction Flow:**
1. **User clicks team in sidebar**
   - Team becomes active
   - Project switches if needed
   - Agent selection clears
   - Chat switches to team conversation
   - Brain panel shows team metrics

---

## 📝 **MODAL & DIALOG FLOWS**

### **1. Onboarding Modal Flow**

#### **Initial State Logic**
```typescript
// Check localStorage on app init
const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');

if (hasCompletedOnboarding) {
  setShowOnboarding(false);
  setShowReturningUserWelcome(true);
} else {
  setShowOnboarding(true);
  setShowReturningUserWelcome(false);
}
```

#### **Onboarding Paths**
```typescript
const handleOnboardingComplete = (
  path: 'idea' | 'template' | 'scratch',
  templateName?: string,
  templateData?: TemplateData
): void => {
  // 1. Close onboarding
  setShowOnboarding(false);
  
  // 2. Mark as completed
  localStorage.setItem('hasCompletedOnboarding', 'true');
  
  // 3. Execute path-specific logic
  switch (path) {
    case 'idea':
      createIdeaProject(); // Creates Maya + "My Idea" project
      break;
    case 'template':
      if (templateData) {
        createProjectFromStarterPack(templateData);
      }
      break;
    case 'scratch':
      // User continues with existing projects
      break;
  }
};
```

**Interaction Flow:**

1. **Path: "Start with an Idea"**
   - User selects idea path in onboarding
   - `createIdeaProject()` called
   - Creates new project with Maya agent
   - Sets Maya as active agent
   - Shows egg hatching animation
   - Displays Maya welcome message
   - User taken to 1:1 chat with Maya

2. **Path: "Use Starter Pack"**
   - User selects template in onboarding
   - `createProjectFromStarterPack()` called
   - Creates project with full team
   - Sets team as active
   - Shows egg hatching animation
   - Sets `teamJustAdded = true`
   - User taken to team chat

3. **Path: "Continue from Scratch"**
   - User skips guided setup
   - Onboarding closes
   - Default projects remain active
   - User continues with existing setup

### **2. Returning User Welcome**

#### **Display Logic**
```typescript
// Shown when hasCompletedOnboarding = true
// Displays last active project info
// Provides quick action options
```

**Interaction Flow:**

1. **"Continue Last Project"**
   - `handleContinueLastProject()` called
   - Welcome modal closes
   - User returns to last active state
   - No data changes

2. **"Start with New Idea"**
   - `handleStartWithIdea()` called
   - Creates new Maya project
   - Same flow as onboarding idea path
   - Welcome modal closes

3. **"Use Starter Pack"**
   - `handleUseStarterPack()` called
   - Welcome modal closes
   - Could open starter pack selection (not implemented)

### **3. Project Creation Flows**

#### **Maya Project Creation**
```typescript
const createIdeaProject = (): string | null => {
  const projectId = uuidv4();
  const mayaId = uuidv4();
  
  // 1. Create project
  const newProject: Project = {
    id: projectId,
    name: "My Idea",
    description: "Developing and structuring my raw idea with Maya's help",
    color: "blue",
    dateCreated: new Date(),
    agents: [{ name: "Maya", role: "Product Manager", color: "blue" }]
  };
  
  // 2. Create Maya agent
  const maya: Agent = {
    id: mayaId,
    name: "Maya",
    role: "Product Manager",
    description: "Expert in product strategy...",
    color: "blue",
    projectId: projectId
  };
  
  // 3. Create brain data
  const newBrainData: ProjectBrainData = { /* ... */ };
  
  // 4. Update all state
  setProjects(prev => [...prev, newProject]);
  setAgents(prev => [...prev, maya]);
  setProjectBrainData(prev => ({ ...prev, [projectId]: newBrainData }));
  
  // 5. Set as active
  setActiveProjectId(projectId);
  setActiveAgentId(mayaId);
  setActiveTeamId(null);
  
  // 6. Show welcome message
  setMayaWelcomeMessage("Hi! I'm Maya...");
  
  // 7. Trigger animation
  showEggHatching();
  
  return projectId;
};
```

#### **Template Project Creation**
```typescript
const createProjectFromStarterPack = (templateData: TemplateData): string | null => {
  const projectId = uuidv4();
  const teamId = uuidv4();
  
  // 1. Create project
  // 2. Create team
  // 3. Create all agents from template
  // 4. Set up team metrics
  // 5. Set up brain data
  // 6. Update all state
  // 7. Set team as active
  // 8. Trigger team welcome flow
  
  setTeamJustAdded(true);
  showEggHatching();
  
  return projectId;
};
```

---

## 🎭 **ANIMATION SYSTEM**

### **Animation Context**
```typescript
// Animation state managed in AnimationContext
const { 
  isEggHatchingVisible, 
  isConfettiVisible, 
  showEggHatching, 
  showConfetti, 
  hideEggHatching, 
  hideConfetti 
} = useAnimation();
```

### **Egg Hatching Animation**

#### **Trigger Conditions**
1. First agent added to project
2. Maya project creation
3. Template project creation
4. Manual team creation

#### **Logic**
```typescript
// In handleCreateAgent
const isFirstAgentInProject = !agents.some(a => a.projectId === agent.projectId);
if (isFirstAgentInProject) {
  showEggHatching();
}

// In createIdeaProject
showEggHatching();

// In createProjectFromStarterPack
showEggHatching();
```

**Interaction Flow:**
1. **Animation Trigger**
   - `showEggHatching()` called
   - Sets `isEggHatchingVisible = true`
   - Overlay appears: `fixed inset-0 z-50`
   - Background: `bg-black/30`

2. **Animation Sequence**
   - Egg appears in center
   - Cracking animation plays
   - Hatching effect
   - Duration: ~3 seconds

3. **Animation Complete**
   - `onComplete={hideEggHatching}` called
   - Sets `isEggHatchingVisible = false`
   - Overlay disappears

### **Confetti Animation**

#### **Trigger Conditions**
1. Milestone completion
2. Major achievement completion

#### **Logic**
```typescript
const handleCompleteMilestone = (projectId: string, milestoneIndex: number): void => {
  // Update milestone status
  setProjectBrainData(prev => {
    // ... update timeline status to "Completed"
  });
  
  // Trigger confetti
  showConfetti();
};
```

**Interaction Flow:**
1. **User marks milestone complete**
   - Milestone status updates to "Completed"
   - `showConfetti()` triggered
   - Full-screen confetti animation plays
   - Duration: ~2.5 seconds

---

## ⌨️ **KEYBOARD SHORTCUTS**

### **Global Shortcuts**
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent): void => {
    // Sidebar toggle: Ctrl/Cmd + B
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      setSidebarOpen(prev => !prev);
    }
    
    // Brain panel toggle: Ctrl/Cmd + P
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      setBrainOpen(prev => !prev);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### **Debug Shortcuts**
```typescript
// Development/testing shortcut for onboarding reset
// Ctrl/Cmd + Shift + R
if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
  e.preventDefault();
  localStorage.removeItem('hasCompletedOnboarding');
  setShowOnboarding(true);
  setShowReturningUserWelcome(false);
}
```

**Interaction Flow:**
1. **User presses Ctrl+B**
   - Prevents default browser behavior
   - Toggles sidebar state
   - Animation plays (300ms transition)

2. **User presses Ctrl+P**
   - Prevents default browser behavior
   - Toggles brain panel state
   - Animation plays (300ms transition)

---

## 📱 **MOBILE INTERACTIONS**

### **Responsive Breakpoints**
- **Desktop**: 1024px+ (Full 3-panel layout)
- **Tablet**: 768px-1024px (Collapsible panels)
- **Mobile**: 375px-768px (Single panel + overlays)

### **Mobile Header Interactions**

#### **Hamburger Menu**
```typescript
// Mobile header component (shown only on mobile)
<button onClick={() => setMobileNavOpen(!mobileNavOpen)}>
  {/* Hamburger icon */}
</button>
```

**Interaction Flow:**
1. **User taps hamburger menu**
   - `setMobileNavOpen(true)` triggered
   - Backdrop appears with fade-in
   - Sidebar slides in from left
   - Backdrop tap-to-close enabled

#### **Brain Icon**
```typescript
// Brain toggle in mobile header
<button onClick={() => setBrainOpen(!brainOpen)}>
  {/* Brain icon */}
</button>
```

**Interaction Flow:**
1. **User taps brain icon**
   - `setBrainOpen(true)` triggered
   - Brain panel opens as full-screen overlay
   - Close button appears in top-right
   - Content scrollable if needed

### **Mobile Navigation Patterns**

#### **Auto-Close Behavior**
```typescript
// Sidebar closes automatically after selection
const handleSelectProject = (projectId: string): void => {
  setActiveProjectId(projectId);
  // ... other logic
  setMobileNavOpen(false); // Auto-close on mobile
};
```

#### **Gesture Support**
- **Backdrop tap**: Closes overlays
- **Swipe/scroll**: Within overlay content
- **Escape key**: Could close overlays (not implemented)

---

## 🗃️ **STATE MANAGEMENT**

### **State Dependencies**

#### **Selection Hierarchy**
```
Project (Top Level)
├── Teams (Project Children)
│   └── Agents (Team Members)
└── Agents (Direct Project Members)
```

#### **State Cascade Logic**
```typescript
// When project changes → clear children
useEffect(() => {
  setActiveAgentId(null);
  setActiveTeamId(null);
}, [activeProjectId]);

// When agent selected → set team context if exists
const agent = agents.find(a => a.id === agentId);
if (agent?.teamId) {
  setActiveTeamId(agent.teamId);
}
```

### **Derived State Calculations**

#### **Active Data Retrieval**
```typescript
// Active project
const activeProject = activeProjectId 
  ? safeArray(projects).find(p => p.id === activeProjectId) ?? null 
  : null;

// Project agents
const projectAgents = activeProjectId 
  ? safeArray(agents).filter(a => a.projectId === activeProjectId) 
  : [];

// Project teams
const projectTeams = activeProjectId 
  ? safeArray(teams).filter(t => t.projectId === activeProjectId) 
  : [];

// Active agent
const activeAgent = activeAgentId && safeArray(agents).length > 0 
  ? safeArray(agents).find(a => a.id === activeAgentId) ?? null 
  : null;

// Active team
const activeTeam = activeTeamId && safeArray(teams).length > 0 
  ? safeArray(teams).find(t => t.id === activeTeamId) ?? null 
  : null;
```

### **State Persistence**

#### **LocalStorage Usage**
```typescript
// Onboarding completion status
localStorage.setItem('hasCompletedOnboarding', 'true');
const hasCompleted = localStorage.getItem('hasCompletedOnboarding');

// Potential future additions:
// - Last active project
// - Panel preferences
// - User settings
```

---

## 🚨 **ERROR HANDLING**

### **Error Boundary Strategy**
```typescript
// Multi-level error boundaries
<ErrorBoundary> {/* Global */}
  <ErrorBoundary> {/* Mobile Header */}
  <ErrorBoundary> {/* Sidebar */}
  <ErrorBoundary> {/* Main Content */}
  <ErrorBoundary> {/* Brain Panel */}
  <ErrorBoundary> {/* Modals */}
</ErrorBoundary>
```

### **Safe Data Access**
```typescript
// Using safe render utilities
const projectAgents = activeProjectId 
  ? safeArray(agents).filter(a => a.projectId === activeProjectId) 
  : [];

const teamData = safeObject(teamMetrics[activeTeam?.id]);
```

### **Try-Catch Patterns**
```typescript
const handleCreateProject = (project: Project): void => {
  try {
    setProjects(prev => [...prev, project]);
    setActiveProjectId(project.id);
    // ... other operations
  } catch (error) {
    console.error('Error creating project:', error);
    // Could show error toast/notification
  }
};
```

---

## 🔄 **DATA FLOW PATTERNS**

### **CRUD Operations**

#### **Create Flows**
1. **User initiates creation** (button click, modal trigger)
2. **Data validation** (in component/form)
3. **State update** (add to arrays, update related data)
4. **Side effects** (set as active, trigger animations)
5. **UI updates** (close modals, show notifications)

#### **Update Flows**
1. **User modifies data** (inline edit, modal form)
2. **Optimistic update** (immediate UI change)
3. **State propagation** (update all affected state)
4. **Derived state recalculation** (automatic via useMemo/useEffect)

#### **Delete Flows**
1. **User confirms deletion** (confirmation dialog)
2. **Cascade deletion** (remove related data)
3. **State cleanup** (clear selections if deleted item was active)
4. **UI refresh** (update lists, clear panels)

### **Selection Propagation**
```typescript
// Selection change triggers multiple updates
handleSelectProject(projectId) →
  activeProjectId changes →
  derived projectAgents recalculates →
  chat interface updates →
  brain panel updates →
  sidebar highlights update
```

### **Animation Coordination**
```typescript
// Animation triggers coordinate with state changes
createProject() →
  add to projects state →
  set as active →
  trigger egg hatching →
  show welcome message →
  user sees completed flow
```

---

## 📝 **IMPLEMENTATION CHECKLIST**

### **Panel Management**
- [ ] Desktop sidebar collapse/expand with 300ms transition
- [ ] Brain panel collapse/expand with 300ms transition
- [ ] Mobile sidebar overlay with backdrop dismiss
- [ ] Mobile brain panel full-screen overlay
- [ ] Keyboard shortcuts (Ctrl+B, Ctrl+P)
- [ ] Auto-close mobile nav on selection

### **Navigation Logic**
- [ ] Project selection clears child selections
- [ ] Agent selection sets team context if applicable
- [ ] Team selection clears agent selection
- [ ] Cross-project navigation updates all context
- [ ] Visual selection indicators

### **Modal Flows**
- [ ] Onboarding path branching
- [ ] LocalStorage persistence
- [ ] Returning user welcome
- [ ] Template project creation
- [ ] Maya project creation

### **Animation System**
- [ ] Egg hatching on first agent/team creation
- [ ] Confetti on milestone completion
- [ ] Animation overlay z-index management
- [ ] Animation completion cleanup

### **Mobile Responsiveness**
- [ ] 768px breakpoint behavior
- [ ] Touch-friendly button sizes (44px minimum)
- [ ] Swipe gestures (if implemented)
- [ ] Proper viewport handling

### **Error Handling**
- [ ] Error boundaries at all major component levels
- [ ] Safe data access patterns
- [ ] Try-catch in all async operations
- [ ] User-friendly error messages

### **State Management**
- [ ] Selection hierarchy enforcement
- [ ] Derived state calculations
- [ ] State persistence (onboarding status)
- [ ] Memory leak prevention (cleanup effects)

---

## 🎯 **DEVELOPER IMPLEMENTATION NOTES**

### **Critical Interaction Patterns**
1. **Always use safe data access** - wrap arrays/objects with safety utilities
2. **Maintain selection hierarchy** - project > team/agent relationships
3. **Handle mobile separately** - different state for mobile overlays
4. **Animation coordination** - trigger animations with state changes
5. **Error boundaries everywhere** - prevent cascading failures

### **Performance Considerations**
1. **Debounce rapid state changes** - especially during animations
2. **Memoize expensive calculations** - derived state with many dependencies
3. **Lazy load heavy components** - modals, complex panels
4. **Optimize re-renders** - careful useEffect dependencies

### **Accessibility Requirements**
1. **Keyboard navigation** - all interactive elements
2. **Screen reader support** - proper ARIA labels
3. **Focus management** - modal trapping, panel focus
4. **High contrast support** - dark theme considerations

This comprehensive guide covers every interaction in the Hatchin application. Each section provides the exact logic, state changes, and user flows needed to implement the design system correctly.