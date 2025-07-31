# 🎨 Hatchin Figma Design Specification

**Application**: Hatchin - No-Code AI Creation Workspace  
**Layout**: 3-Panel Responsive Interface  
**Theme**: Dark Mode Only  
**Target**: Desktop Primary, Mobile Responsive  

---

## 🎯 **DESIGN OVERVIEW**

### **Core Layout Structure**
```
┌─────────────────────────────────────────────────────────────────┐
│                    Mobile Header (768px-)                      │
├─────────────────────────────────────────────────────────────────┤
│ Sidebar │              Main Content              │ Brain Panel │
│ (260px) │               (Flex-1)                │   (280px)   │
│         │                                       │             │
│ Project │        Multi-Agent Chat               │  Project    │
│ Nav &   │         Interface                     │  Brain &    │
│ Teams   │                                       │  Insights   │
│         │                                       │             │
├─────────────────────────────────────────────────────────────────┤
│                     Animations Overlay                         │
└─────────────────────────────────────────────────────────────────┘
```

### **Responsive Behavior**
- **Desktop (1024px+)**: Full 3-panel layout
- **Tablet (768px-1024px)**: Collapsible panels with overlays
- **Mobile (375px-768px)**: Single panel with slide-out navigation

---

## 🎨 **DESIGN TOKENS**

### **Color Palette**
```css
/* Primary Background */
--cortex-bg: #37383B              /* Main app background */
--cortex-panel-bg: #23262B        /* Panel/card backgrounds */
--cortex-hover: #43444B           /* Hover states */
--cortex-border: #43444B          /* Borders and dividers */

/* Typography */
--cortex-text-primary: #F1F1F3    /* Primary text */
--cortex-text-secondary: #A6A7AB  /* Secondary/muted text */

/* Accent Colors */
--cortex-accent-blue: #6C82FF     /* Primary actions, selected states */
--cortex-accent-green: #47DB9A    /* Success, positive states */
--cortex-accent-purple: #9F7BFF   /* Secondary accent */
--cortex-accent-red: #FF4E6A      /* Destructive actions, errors */

/* Project Colors */
--project-amber: #F59E0B          /* Amber project theme */
--project-green: #10B981          /* Green project theme */
--project-blue: #3B82F6           /* Blue project theme */
--project-purple: #8B5CF6         /* Purple project theme */
```

### **Typography Scale**
```css
/* Font Sizes */
--text-xs: 12px      /* Small labels, badges */
--text-sm: 14px      /* Body text, inputs */
--text-base: 16px    /* Default text size */ 
--text-lg: 18px      /* Section headers */
--text-xl: 20px      /* Panel titles */
--text-2xl: 24px     /* Page headers */

/* Font Weights */
--font-normal: 400   /* Body text */
--font-medium: 500   /* Labels, buttons */
--font-semibold: 600 /* Headers */
```

### **Spacing System**
```css
/* Padding/Margin Scale */
--space-1: 4px       /* Tight spacing */
--space-2: 8px       /* Small spacing */
--space-3: 12px      /* Medium spacing */
--space-4: 16px      /* Standard spacing */
--space-6: 24px      /* Large spacing */
--space-8: 32px      /* Extra large spacing */

/* Component Dimensions */
--sidebar-width: 260px
--brain-width: 280px
--slim-sidebar: 56px
--mobile-header: 60px
```

### **Border Radius**
```css
--radius-sm: 6px     /* Small elements */
--radius-md: 8px     /* Cards, buttons */
--radius-lg: 12px    /* Panels, modals */
--radius-xl: 16px    /* Large containers */
```

---

## 📱 **COMPONENT SPECIFICATIONS**

### **1. Left Sidebar (ProjectSidebar)**
**Dimensions**: 260px width × 100vh height  
**Background**: #23262B  
**Border**: Right border #43444B 1px  

**Header Section** (60px height):
- Logo/Title: "Hatchin" - 18px medium, #F1F1F3
- Collapse button: 32px × 32px, #A6A7AB hover #F1F1F3

**Projects List**:
- Project Card: Full width × 56px height
- Background: Transparent, hover #43444B
- Selected: #6C82FF/10 background, #6C82FF left border 3px
- Project dot: 12px circle with project color
- Title: 14px medium #F1F1F3
- Description: 12px normal #A6A7AB

**Teams & Agents**:
- Nested under projects with 16px left indent
- Team/Agent item: 40px height
- Avatar: 24px circle with accent color
- Name: 14px medium #F1F1F3
- Role: 12px normal #A6A7AB

**Bottom Actions**:
- Add Project button: Full width, 40px height
- Background: #6C82FF hover #5A6FE8
- Text: 14px medium #FFFFFF
- Plus icon: 16px

### **2. Main Content (EnhancedMultiAgentChat)**
**Background**: #23262B  
**Border radius**: 16px  
**Margin**: 10px (desktop), 0px (mobile)  

**Chat Header** (80px height):
- Background: #23262B
- Border bottom: #43444B 1px
- Mode selector: Tab-style buttons
- Active tab: #6C82FF background
- Inactive: #43444B background, #A6A7AB text

**Message Area**:
- Background: #23262B
- Padding: 24px
- Messages: Max width 768px, left-aligned
- Spacing: 16px between messages

**Message Bubble**:
- User messages: Right-aligned, #6C82FF background
- AI messages: Left-aligned, #43444B background
- Padding: 12px 16px
- Border radius: 16px
- Max width: 80%

**Input Area** (120px height):
- Background: #37383B
- Border top: #43444B 1px
- Input field: #23262B background, #43444B border
- Send button: 40px circle, #6C82FF background
- Attachment button: 32px square, #A6A7AB

### **3. Right Panel (DynamicSidebar/ProjectBrain)**
**Dimensions**: 280px width × 100vh height  
**Background**: #23262B  
**Border**: Left border #43444B 1px  
**Border radius**: 16px (desktop), 0px (mobile overlay)

**Header** (60px height):
- Title: "Project Brain" - 16px medium #F1F1F3
- Collapse button: 24px × 24px #A6A7AB

**Content Sections**:
- Section spacing: 24px between
- Section header: 14px medium #F1F1F3, 8px bottom margin
- Cards: #43444B background, 12px radius, 16px padding

**Progress Ring**:
- Size: 80px diameter
- Stroke: 4px width
- Background: #43444B
- Progress: #47DB9A
- Center text: 18px medium #F1F1F3

**Timeline Items**:
- Height: 48px each
- Left indicator: 8px circle with status color
- Connecting line: 2px #43444B
- Title: 14px medium #F1F1F3
- Date: 12px normal #A6A7AB

---

## 📲 **MOBILE ADAPTATIONS**

### **Mobile Header** (375px-768px)
**Height**: 60px  
**Background**: #23262B  
**Border bottom**: #43444B 1px  

**Left side**:
- Hamburger menu: 24px × 24px lines, #A6A7AB
- App title: "Hatchin" 16px medium #F1F1F3

**Right side**:
- Brain toggle: 24px brain icon, #A6A7AB
- Notifications: 24px bell icon, #A6A7AB

### **Mobile Sidebar Overlay**
**Dimensions**: 280px width × 100vh height  
**Background**: #23262B  
**Shadow**: 0 0 20px rgba(0,0,0,0.5)  
**Animation**: Slide in from left, 300ms ease  

**Backdrop**:
- Background: rgba(0,0,0,0.5)
- Tap to close functionality

---

## 🎭 **ANIMATIONS & INTERACTIONS**

### **Egg Hatching Animation**
**Trigger**: New agent/team creation  
**Duration**: 3 seconds  
**Style**: Centered modal overlay  

**Elements**:
- Backdrop: rgba(0,0,0,0.3)
- Egg: 120px × 140px SVG illustration
- Crack effects: Progressive SVG path animation
- Particle effects: Small #47DB9A dots, fade out
- Completion: Scale up agent card from center

### **Confetti Animation**
**Trigger**: Milestone completion  
**Duration**: 2.5 seconds  
**Style**: Full-screen overlay  

**Elements**:
- Particles: Mixed colors from project palette
- Shapes: Rectangles, circles, triangles
- Physics: Gravity fall with rotation
- Quantity: 50-80 particles
- Launch: From top of screen

### **Panel Transitions**
**Duration**: 300ms  
**Easing**: cubic-bezier(0.4, 0, 0.2, 1)  
**Properties**: width, opacity, transform  

---

## 🎨 **MODAL SPECIFICATIONS**

### **Onboarding Modal**
**Dimensions**: 600px width × 700px height (max)  
**Background**: #23262B  
**Border radius**: 16px  
**Shadow**: 0 20px 40px rgba(0,0,0,0.3)  

**Header** (80px):
- Background: Linear gradient #6C82FF to #9F7BFF
- Title: 24px medium #FFFFFF
- Progress dots: 8px circles, active #FFFFFF, inactive #FFFFFF/30

**Content** (520px min):
- Padding: 32px
- Illustration: 240px × 160px centered
- Title: 20px medium #F1F1F3
- Description: 14px normal #A6A7AB, 1.5 line-height

**Footer** (100px):
- Padding: 24px 32px
- Buttons: Full width or side-by-side
- Primary: #6C82FF background, #FFFFFF text
- Secondary: #43444B background, #F1F1F3 text

### **Project Creation Dialog**
**Dimensions**: 500px width × 600px height  
**Background**: #23262B  
**Border radius**: 12px  

**Form Fields**:
- Label: 14px medium #F1F1F3, 8px bottom margin
- Input: #37383B background, #43444B border, 40px height
- Focus: #6C82FF border, 0 0 0 3px #6C82FF/20 shadow
- Error: #FF4E6A border, error text 12px #FF4E6A

**Color Picker**:
- Swatches: 32px circles in 4×2 grid
- Selected: 4px #FFFFFF border
- Colors: Amber, Green, Blue, Purple variants

---

## 🔧 **FIGMA CREATION GUIDE**

### **Step 1: Setup**
1. Create new Figma file: 1440px × 900px frame
2. Setup color styles from design tokens
3. Create text styles for typography scale
4. Setup grid: 8px baseline, 12-column layout

### **Step 2: Components**
1. Create master components for:
   - Project Card (with variants for states)
   - Agent Card (with color variants)
   - Message Bubble (user/AI variants)
   - Button (primary/secondary/ghost variants)
   - Input Field (default/focus/error states)

### **Step 3: Layout**
1. Create main frame with 3-panel structure
2. Use auto-layout for flex behavior
3. Setup responsive constraints
4. Create mobile breakpoint variants

### **Step 4: Interactive Prototype**
1. Add panel collapse/expand interactions
2. Create mobile navigation flow
3. Add modal overlays with backdrop dismiss
4. Setup hover states for interactive elements

### **Assets Needed**
- App logo/icon
- Agent avatars (circular placeholders)
- Project type icons
- Navigation icons (menu, close, brain, etc.)
- Illustration assets for onboarding
- Egg hatching animation frames

---

## 📋 **COMPONENT CHECKLIST**

### **Core Layout**
- [ ] Main application frame (1440×900)
- [ ] Left sidebar panel (260px)
- [ ] Main content area (flex-1)
- [ ] Right brain panel (280px)
- [ ] Mobile header bar (60px)

### **Sidebar Components**
- [ ] Project list container
- [ ] Project card component (+ states)
- [ ] Team/agent nested items
- [ ] Add project button
- [ ] Collapse/expand controls

### **Chat Interface**
- [ ] Chat header with mode tabs
- [ ] Message container
- [ ] Message bubble (user variant)
- [ ] Message bubble (AI variant)
- [ ] Input field with attachments
- [ ] Send button

### **Brain Panel**
- [ ] Panel header
- [ ] Progress ring component
- [ ] Document cards
- [ ] Timeline component
- [ ] Timeline item (+ status variants)

### **Modals**
- [ ] Onboarding modal (3 steps)
- [ ] Project creation dialog
- [ ] Agent creation dialog
- [ ] Settings modal
- [ ] Modal backdrop overlay

### **Mobile Adaptations**
- [ ] Mobile header component
- [ ] Hamburger menu
- [ ] Mobile sidebar overlay
- [ ] Mobile chat interface
- [ ] Mobile brain panel overlay

---

**📁 Recommended Figma File Structure:**
```
🎨 Hatchin Design System
├── 📚 Design Tokens (Colors, Typography, Spacing)
├── 🧩 Components (Buttons, Cards, Forms, etc.)
├── 📱 Templates (Desktop, Tablet, Mobile layouts)
├── 🔄 Interactions (Animations, Transitions)
└── 🎯 Prototypes (User flows, Demo scenarios)
```

This specification provides everything needed to recreate your Hatchin application in Figma with pixel-perfect accuracy and proper component architecture.