# Complete Hatchin UI Specification

## 🏗️ **Application Architecture Overview**

Hatchin is an AI collaboration platform with a dark theme interface featuring modular panels, dynamic content areas, and extensive interactive components. The interface follows a hierarchical structure with contextual navigation and real-time collaboration features.

---

## 🎨 **GLOBAL DESIGN SYSTEM**

### Core Color Palette
```css
/* Background Layers */
--primary-bg: #37383B          /* Main application background */
--secondary-bg: #23262B        /* Cards, panels, modals */
--tertiary-bg: #43444B         /* Hover states, borders */

/* Text Colors */
--text-primary: #F1F1F3        /* Primary text, headings */
--text-secondary: #A6A7AB      /* Secondary text, descriptions */

/* Accent Colors */
--accent-blue: #6C82FF         /* Primary actions, links */
--accent-green: #47DB9A        /* Success, completed states */
--accent-purple: #9F7BFF       /* Alternative accent */
--accent-amber: #FF9A47        /* Warning states */
--accent-red: #FF4E6A          /* Error, destructive actions */

/* Special UI Colors */
--border-color: #43444B        /* All borders and dividers */
--hover-bg: #43444B           /* Interactive hover states */
--active-indicator: #6C82FF    /* Active state indicators */

/* Transparent Overlays */
--modal-backdrop: rgba(0, 0, 0, 0.6)
--card-hover: rgba(108, 130, 255, 0.1)
--success-bg: rgba(71, 219, 154, 0.1)
--error-bg: rgba(255, 78, 106, 0.1)
```

### Typography Scale
```css
/* Font Sizes */
--text-xs: 12px      /* Meta information, timestamps */
--text-sm: 14px      /* Body text, labels */
--text-base: 16px    /* Standard text size */
--text-lg: 18px      /* Section headers */
--text-xl: 20px      /* Panel titles */
--text-2xl: 24px     /* Page titles */

/* Font Weights */
--weight-normal: 400
--weight-medium: 500
--weight-semibold: 600

/* Line Heights */
--leading-tight: 1.2
--leading-normal: 1.5
--leading-relaxed: 1.7
```

### Spacing System
```css
/* Standard Spacing Units */
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
--space-8: 32px
--space-12: 48px
--space-16: 64px

/* Component Specific */
--sidebar-width: 320px
--sidebar-collapsed: 56px
--header-height: 48px
--panel-padding: 24px
--card-padding: 16px
```

---

## 🏢 **MAIN APPLICATION LAYOUT**

### App Container Structure
```
┌─────────────────────────────────────────────────────────────────┐
│ Header (48px height) - macOS style controls + global nav       │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────────────────┬─────────────────────┐ │
│ │ Sidebar     │ Main Chat/Work Area     │ Dynamic Panel       │ │
│ │ (320px)     │ (flexible width)        │ (400px)            │ │
│ │             │                         │                     │ │
│ │ - Projects  │ - Chat Interface        │ - Project Overview  │ │
│ │ - Teams     │ - Multi-Agent Chat      │ - Team Dashboard    │ │
│ │ - Agents    │ - Command Palette       │ - Hatch Profile     │ │
│ │ - Search    │ - Onboarding Flows      │ - Settings Panels   │ │
│ │             │                         │                     │ │
│ └─────────────┴─────────────────────────┴─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Header Component
```css
/* Header Specifications */
Height: 48px
Background: #23262B
Border: 1px solid #43444B (bottom)
Padding: 0 12px

/* macOS Window Controls */
- Three dots: 12px circles
- Colors: #FF5F57, #FEBC2E, #28C840
- Spacing: 6px between dots
- Left margin: 16px

/* Center Title */
- Text: "Hatchin" or dynamic project name
- Color: #F1F1F3
- Size: 16px medium weight
- Position: Center aligned

/* Right Controls */
- Notification bell (16px icon)
- User avatar (24px circular)
- Settings gear (16px icon)
- Spacing: 8px between items
```

---

## 📱 **CHAT INTERFACE COMPONENTS**

### Main Chat Area
```css
/* Chat Container */
Background: Linear gradient from #f8fafc to #f1f5f9 (light theme)
Background: #23262B (dark theme - current)
Border: None
Padding: 0

/* Chat Header */
Height: 56px
Background: #23262B
Border: 1px solid #43444B (bottom)
Padding: 16px
Backdrop-filter: blur(8px)

Content:
- Project title (16px medium)
- Agent avatars stack (28px each, -8px overlap)
- More actions button (40px circular hover area)
```

### Message Components
```css
/* User Message */
.user-message {
  background: #37383B;
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
  max-width: 80%;
  margin-left: auto;
  color: #F1F1F3;
  font-size: 14px;
  line-height: 1.5;
}

/* Agent Message */
.agent-message {
  background: #23262B;
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
  max-width: 85%;
  border: 1px solid #43444B;
}

.agent-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.agent-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #43444B;
}

.agent-name {
  color: #F1F1F3;
  font-size: 14px;
  font-weight: 500;
}

.timestamp {
  color: #A6A7AB;
  font-size: 12px;
  margin-left: auto;
}
```

### Chat Input Area
```css
/* Input Container */
Background: #23262B
Border: 1px solid #43444B (top)
Padding: 16px
Backdrop-filter: blur(8px)

/* Input Field */
Height: 44px
Background: rgba(255,255,255,0.1)
Border: 1px solid #43444B
Border-radius: 12px
Padding: 12px 120px 12px 16px
Font-size: 14px
Color: #F1F1F3
Placeholder: #A6A7AB

/* Action Buttons (Right side) */
- Attachment (20px icon)
- Voice record (20px icon) 
- Add agent (20px icon)
- Send button (32px rounded, #6C82FF background)
- Spacing: 4px between icons, 8px before send
```

### Message Suggestions
```css
/* Suggestions Container */
Margin: 16px 0
Display: flex
Gap: 8px
Flex-wrap: wrap

/* Suggestion Chip */
Background: rgba(108, 130, 255, 0.1)
Border: 1px solid rgba(108, 130, 255, 0.2)
Border-radius: 20px
Padding: 8px 16px
Font-size: 12px
Color: #6C82FF
Cursor: pointer

Hover:
Background: rgba(108, 130, 255, 0.2)
Border: 1px solid rgba(108, 130, 255, 0.3)
```

---

## 📊 **PROJECT OVERVIEW PANEL**

### Panel Structure
```css
/* Panel Container */
Width: 400px
Background: #23262B
Border: 1px solid #43444B (left)
Height: 100vh
Overflow-y: auto
Padding: 24px

/* Section Headers */
Font-size: 18px
Font-weight: 500
Color: #F1F1F3
Margin-bottom: 16px
```

### Project Progress Section
```css
/* Progress Bar Container */
Margin-bottom: 24px

/* Progress Bar */
Height: 8px
Background: #37383B
Border-radius: 4px
Overflow: hidden

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6C82FF, #8B9BFF);
  border-radius: 4px;
  transition: width 300ms ease;
}

/* Progress Text */
Font-size: 12px
Color: #A6A7AB
Margin-top: 8px
Display: flex
Justify-content: space-between
```

### Timeline Visualization
```css
/* Timeline Container */
Background: #37383B
Border: 1px solid #43444B
Border-radius: 8px
Padding: 16px
Margin-bottom: 24px

/* Timeline Header */
.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.timeline-icon {
  width: 16px;
  height: 16px;
  color: #6C82FF;
}

.timeline-title {
  font-size: 14px;
  font-weight: 500;
  color: #F1F1F3;
}

/* Phase Bar */
.phase-bar {
  height: 8px;
  background: #23262B;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  margin: 16px 0;
}

.phase-segment {
  position: absolute;
  height: 100%;
  border-radius: 4px;
}

.phase-completed { background: #47DB9A; }
.phase-current { background: #6C82FF; }
.phase-upcoming { background: #A6A7AB; opacity: 0.3; }

/* Phase Labels */
.phase-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.phase-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #A6A7AB;
}

.phase-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
```

### Collapsible Sections
```css
/* Collapsible Trigger */
.collapsible-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 200ms;
}

.collapsible-trigger:hover {
  background: #37383B;
}

/* Expand Icon */
.expand-icon {
  width: 16px;
  height: 16px;
  color: #A6A7AB;
  transition: transform 200ms ease;
}

.expanded .expand-icon {
  transform: rotate(90deg);
}

/* Section Content */
.section-content {
  padding: 16px 0;
  border-left: 2px solid #43444B;
  margin-left: 8px;
  padding-left: 16px;
}

/* Form Fields */
.form-field {
  margin-bottom: 16px;
}

.field-label {
  font-size: 12px;
  font-weight: 500;
  color: #F1F1F3;
  margin-bottom: 8px;
  display: block;
}

.field-textarea {
  width: 100%;
  min-height: 60px;
  background: #37383B;
  border: 1px solid #43444B;
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  color: #F1F1F3;
  line-height: 1.5;
  resize: vertical;
}

.field-textarea::placeholder {
  color: #A6A7AB;
}

.field-textarea:focus {
  outline: none;
  border-color: #6C82FF;
  box-shadow: 0 0 0 2px rgba(108, 130, 255, 0.2);
}
```

---

## 👥 **TEAM DASHBOARD PANEL**

### Team Progress Section
```css
/* Progress Header */
.progress-header {
  display: flex;
  align-items: center;
  justify-content: between;
  margin-bottom: 16px;
}

.progress-title {
  font-size: 18px;
  font-weight: 500;
  color: #F1F1F3;
}

/* Progress Bar with Status */
.progress-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #37383B;
  border-radius: 4px;
  overflow: hidden;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid;
}

.status-on-track {
  background: rgba(71, 219, 154, 0.1);
  color: #47DB9A;
  border-color: rgba(71, 219, 154, 0.2);
}

.status-at-risk {
  background: rgba(255, 154, 71, 0.1);
  color: #FF9A47;
  border-color: rgba(255, 154, 71, 0.2);
}

.status-behind {
  background: rgba(255, 78, 106, 0.1);
  color: #FF4E6A;
  border-color: rgba(255, 78, 106, 0.2);
}
```

### Team Activity Section
```css
/* Activity List */
.activity-list {
  margin-bottom: 24px;
}

.activity-item {
  padding: 12px 0;
  border-bottom: 1px solid rgba(67, 68, 75, 0.3);
}

.activity-item:last-child {
  border-bottom: none;
}

/* Role Display */
.role-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.role-emoji {
  font-size: 16px;
  flex-shrink: 0;
}

.role-name {
  font-size: 14px;
  font-weight: 500;
  color: #F1F1F3;
}

/* Task Description */
.task-description {
  margin-left: 24px;
  font-size: 14px;
  color: #A6A7AB;
  line-height: 1.6;
}

.add-task-button {
  margin-left: 24px;
  font-size: 14px;
  color: #A6A7AB;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 200ms;
}

.add-task-button:hover {
  color: #6C82FF;
}
```

### Team Goal Section
```css
/* Goal Container */
.team-goal {
  background: #37383B;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.goal-text {
  font-size: 14px;
  color: #F1F1F3;
  line-height: 1.6;
  margin-bottom: 12px;
}

.goal-timestamp {
  font-size: 12px;
  color: #A6A7AB;
}
```

### Milestone Cards
```css
/* Milestone Container */
.milestone-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Individual Milestone Card */
.milestone-card {
  background: #37383B;
  border: 1px solid #43444B;
  border-radius: 8px;
  padding: 16px;
}

.milestone-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.milestone-icon {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  flex-shrink: 0;
}

.milestone-content {
  flex: 1;
  min-width: 0;
}

.milestone-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.milestone-title {
  font-size: 14px;
  font-weight: 500;
  color: #F1F1F3;
}

.milestone-description {
  font-size: 12px;
  color: #A6A7AB;
  margin-top: 4px;
}

.milestone-status {
  font-size: 12px;
  font-weight: 500;
}

.milestone-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #A6A7AB;
  margin-bottom: 8px;
}

.milestone-progress {
  height: 4px;
  background: #23262B;
  border-radius: 2px;
  overflow: hidden;
}
```

---

## 🤖 **HATCH PROFILE PANEL**

### Profile Header
```css
/* Header Container */
.profile-header {
  padding: 24px;
  border-bottom: 1px solid #43444B;
  text-align: center;
}

/* Avatar */
.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6C82FF, #9F7BFF);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 32px;
  font-weight: 600;
  color: white;
}

/* Name and Role */
.profile-name {
  font-size: 20px;
  font-weight: 600;
  color: #F1F1F3;
  margin-bottom: 4px;
}

.profile-role {
  font-size: 14px;
  color: #A6A7AB;
  margin-bottom: 16px;
}

/* Status Badge */
.status-active {
  background: rgba(71, 219, 154, 0.1);
  color: #47DB9A;
  border: 1px solid rgba(71, 219, 154, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
```

### Profile Sections
```css
/* Section Container */
.profile-section {
  padding: 24px;
  border-bottom: 1px solid #43444B;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #F1F1F3;
  margin-bottom: 16px;
}

/* Skills List */
.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  background: rgba(108, 130, 255, 0.1);
  color: #6C82FF;
  border: 1px solid rgba(108, 130, 255, 0.2);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

/* Recent Activity */
.activity-item {
  padding: 12px 0;
  border-bottom: 1px solid rgba(67, 68, 75, 0.3);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-time {
  font-size: 12px;
  color: #A6A7AB;
  margin-bottom: 4px;
}

.activity-description {
  font-size: 14px;
  color: #F1F1F3;
  line-height: 1.5;
}
```

---

## 🎯 **MODAL COMPONENTS**

### Modal Overlay
```css
/* Backdrop */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

/* Modal Container */
.modal-container {
  background: #23262B;
  border: 1px solid #43444B;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

/* Modal Header */
.modal-header {
  padding: 24px 24px 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #F1F1F3;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: none;
  border: none;
  color: #A6A7AB;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 200ms;
}

.modal-close:hover {
  background: #43444B;
  color: #F1F1F3;
}

/* Modal Content */
.modal-content {
  padding: 24px;
}

/* Modal Footer */
.modal-footer {
  padding: 0 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
```

### Form Elements
```css
/* Form Group */
.form-group {
  margin-bottom: 20px;
}

/* Label */
.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #F1F1F3;
  margin-bottom: 8px;
}

/* Input Field */
.form-input {
  width: 100%;
  height: 44px;
  background: #37383B;
  border: 1px solid #43444B;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 14px;
  color: #F1F1F3;
  transition: all 200ms;
}

.form-input:focus {
  outline: none;
  border-color: #6C82FF;
  box-shadow: 0 0 0 2px rgba(108, 130, 255, 0.2);
}

.form-input::placeholder {
  color: #A6A7AB;
}

/* Textarea */
.form-textarea {
  width: 100%;
  min-height: 80px;
  background: #37383B;
  border: 1px solid #43444B;
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  color: #F1F1F3;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

/* Select Dropdown */
.form-select {
  width: 100%;
  height: 44px;
  background: #37383B;
  border: 1px solid #43444B;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 14px;
  color: #F1F1F3;
  cursor: pointer;
}
```

---

## 🔘 **BUTTON COMPONENTS**

### Primary Buttons
```css
.btn-primary {
  background: #6C82FF;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  background: #5A70E8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(108, 130, 255, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  background: #37383B;
  color: #A6A7AB;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

### Secondary Buttons
```css
.btn-secondary {
  background: #37383B;
  color: #F1F1F3;
  border: 1px solid #43444B;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms;
}

.btn-secondary:hover {
  background: #43444B;
  border-color: #6C82FF;
}
```

### Icon Buttons
```css
.btn-icon {
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: 6px;
  color: #A6A7AB;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 200ms;
}

.btn-icon:hover {
  background: #43444B;
  color: #F1F1F3;
}

/* Size Variants */
.btn-icon-sm { width: 24px; height: 24px; }
.btn-icon-lg { width: 40px; height: 40px; }
```

### Destructive Buttons
```css
.btn-destructive {
  background: #FF4E6A;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms;
}

.btn-destructive:hover {
  background: #E63E5A;
}
```

---

## 🔍 **SEARCH COMPONENTS**

### Search Bar
```css
/* Search Container */
.search-container {
  position: relative;
  margin-bottom: 24px;
}

/* Search Input */
.search-input {
  width: 100%;
  height: 44px;
  background: #37383B;
  border: 1px solid #43444B;
  border-radius: 22px;
  padding: 0 16px 0 44px;
  font-size: 14px;
  color: #F1F1F3;
  transition: all 200ms;
}

.search-input:focus {
  outline: none;
  border-color: #6C82FF;
  box-shadow: 0 0 0 2px rgba(108, 130, 255, 0.2);
}

.search-input::placeholder {
  color: #A6A7AB;
}

/* Search Icon */
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #A6A7AB;
}

/* Clear Button */
.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  background: none;
  border: none;
  color: #A6A7AB;
  cursor: pointer;
  border-radius: 4px;
  transition: all 200ms;
}

.search-clear:hover {
  background: #43444B;
  color: #F1F1F3;
}
```

### Search Results
```css
/* Results Container */
.search-results {
  background: #23262B;
  border: 1px solid #43444B;
  border-radius: 8px;
  margin-top: 8px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* Result Item */
.search-result {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #43444B;
  transition: background 200ms;
}

.search-result:hover {
  background: #37383B;
}

.search-result:last-child {
  border-bottom: none;
}

/* Result Content */
.result-title {
  font-size: 14px;
  font-weight: 500;
  color: #F1F1F3;
  margin-bottom: 4px;
}

.result-breadcrumb {
  font-size: 12px;
  color: #A6A7AB;
}

.result-highlight {
  background: rgba(108, 130, 255, 0.3);
  padding: 0 2px;
  border-radius: 2px;
}

/* Empty State */
.search-empty {
  padding: 24px;
  text-align: center;
  color: #A6A7AB;
  font-size: 14px;
}
```

---

## 🎨 **ANIMATION SPECIFICATIONS**

### Transition Durations
```css
/* Standard Transitions */
--duration-fast: 150ms
--duration-normal: 200ms
--duration-slow: 300ms

/* Easing Functions */
--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1)
--ease-in: cubic-bezier(0.4, 0.0, 1, 1)
--ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1)
```

### Common Animations
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide In from Right */
@keyframes slideInRight {
  from { 
    opacity: 0;
    transform: translateX(20px);
  }
  to { 
    opacity: 1;
    transform: translateX(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from { 
    opacity: 0;
    transform: scale(0.95);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

/* Gentle Glow (for notifications) */
@keyframes gentleGlow {
  0% { box-shadow: 0 0 5px rgba(108, 130, 255, 0.3); }
  100% { box-shadow: 0 0 15px rgba(108, 130, 255, 0.6); }
}

/* Loading Shimmer */
@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}

.shimmer {
  background: linear-gradient(
    90deg,
    #37383B 0px,
    #43444B 40px,
    #37383B 80px
  );
  background-size: 200px;
  animation: shimmer 1.5s infinite;
}
```

### Micro-interactions
```css
/* Button Hover Lift */
.btn:hover {
  transform: translateY(-1px);
  transition: transform 150ms ease-out;
}

/* Card Hover Glow */
.card:hover {
  box-shadow: 0 4px 20px rgba(108, 130, 255, 0.1);
  transition: box-shadow 200ms ease;
}

/* Icon Rotation */
.expandable-icon {
  transition: transform 200ms ease;
}

.expanded .expandable-icon {
  transform: rotate(90deg);
}

/* Active State Pulse */
.active-indicator {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

---

## ♿ **ACCESSIBILITY SPECIFICATIONS**

### Focus Management
```css
/* Focus Ring */
.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(108, 130, 255, 0.5);
  border-color: #6C82FF;
}

/* Skip Links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #6C82FF;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  z-index: 100;
  transition: top 200ms;
}

.skip-link:focus {
  top: 6px;
}
```

### ARIA Labels and Roles
```html
<!-- Examples of ARIA implementation -->
<nav role="navigation" aria-label="Main navigation">
<div role="tree" aria-label="Project hierarchy">
<button aria-expanded="true" aria-controls="project-content">
<div role="status" aria-live="polite" aria-label="Loading">
<input aria-describedby="field-help" aria-required="true">
```

### Keyboard Navigation
```css
/* Tab Order Enhancement */
.tab-focus:focus {
  z-index: 10;
  position: relative;
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .btn-primary {
    border: 2px solid #6C82FF;
  }
  
  .text-secondary {
    color: #FFFFFF;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📱 **RESPONSIVE DESIGN**

### Breakpoints
```css
/* Mobile First Approach */
.container {
  width: 100%;
  padding: 0 16px;
}

/* Tablet: 768px and up */
@media (min-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 48px;
    height: calc(100vh - 48px);
    width: 320px;
    transform: translateX(-100%);
    transition: transform 300ms ease;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .main-content {
    margin-left: 0;
    transition: margin-left 300ms ease;
  }
  
  .main-content.sidebar-open {
    margin-left: 320px;
  }
}

/* Desktop: 1024px and up */
@media (min-width: 1024px) {
  .sidebar {
    position: static;
    transform: none;
    transition: width 300ms ease;
  }
  
  .sidebar.collapsed {
    width: 56px;
  }
  
  .main-content {
    margin-left: 320px;
  }
  
  .main-content.sidebar-collapsed {
    margin-left: 56px;
  }
}

/* Large Desktop: 1440px and up */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .dynamic-panel {
    width: 480px;
  }
}
```

### Touch Interactions
```css
/* Minimum Touch Target Size */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Touch-friendly spacing */
@media (hover: none) and (pointer: coarse) {
  .btn {
    padding: 12px 20px;
    margin: 4px;
  }
  
  .nav-item {
    padding: 16px 12px;
  }
  
  .form-input {
    height: 52px;
    font-size: 16px; /* Prevents zoom on iOS */
  }
}
```

---

## 🎭 **THEME VARIATIONS**

### Dark Theme (Default)
```css
:root {
  --bg-primary: #37383B;
  --bg-secondary: #23262B;
  --bg-tertiary: #43444B;
  --text-primary: #F1F1F3;
  --text-secondary: #A6A7AB;
  --accent: #6C82FF;
}
```

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  :root {
    --bg-primary: #000000;
    --bg-secondary: #1A1A1A;
    --text-primary: #FFFFFF;
    --text-secondary: #CCCCCC;
    --accent: #0066FF;
    --border: #666666;
  }
  
  .card {
    border: 2px solid var(--border);
  }
  
  .btn {
    border: 2px solid currentColor;
  }
}
```

---

## 🔧 **IMPLEMENTATION NOTES**

### Required Dependencies
```json
{
  "react": "^18.0.0",
  "framer-motion": "^10.0.0",
  "lucide-react": "^0.244.0",
  "tailwindcss": "^3.3.0",
  "@radix-ui/react-dialog": "^1.0.0",
  "@radix-ui/react-dropdown-menu": "^2.0.0",
  "react-dnd": "^16.0.0"
}
```

### Performance Considerations
```typescript
// Virtual scrolling for large lists
const VirtualizedList = React.memo(({ items }) => {
  // Implementation with react-window or similar
});

// Debounced search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};

// Lazy loading for components
const LazyComponent = React.lazy(() => import('./Component'));
```

### State Management Patterns
```typescript
// Context for global state
interface AppContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
  theme: 'dark' | 'light';
}

// Custom hooks for common operations
const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'b':
            event.preventDefault();
            toggleSidebar();
            break;
          case 'k':
            event.preventDefault();
            openCommandPalette();
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
};
```

This comprehensive specification provides a complete foundation for implementing the Hatchin application with consistent design patterns, proper accessibility, and modern user experience standards.