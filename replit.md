# Hatchin - AI Collaboration Platform

## Overview

Hatchin is a no-code AI creation workspace that enables users to design custom AI teammates ("Hatches") inside creative projects. The application features a 3-panel dark-themed interface where users can manage projects, interact with AI agents through chat, and track project progress through a shared "brain" system.

## User Preferences

Preferred communication style: Simple, everyday language.
Always ask for permission before implementing any changes - this is a system requirement.

## System Architecture

### Frontend Architecture
- **React 19** with TypeScript for modern component-based UI
- **Vite** as the build tool and development server
- **Tailwind CSS v4** for utility-first styling with custom dark theme
- **shadcn/ui** component library for consistent, accessible UI components
- **Framer Motion** for smooth animations and transitions
- **TanStack Query** for server state management and API data fetching

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design with proper error handling
- **In-memory storage** (development) with MongoDB-compatible schema structure
- **Drizzle ORM** with PostgreSQL dialect for production database interactions

### 3-Panel Layout Structure
```
┌─────────────────────────────────────────────────────────────────┐
│ Sidebar │              Main Content              │ Brain Panel │
│ (280px) │               (Flex-1)                │   (320px)   │
│         │                                       │             │
│ Project │        Multi-Agent Chat               │  Project    │
│ Nav &   │         Interface                     │  Brain &    │
│ Teams   │                                       │  Insights   │
│         │                                       │             │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components

### Core Layout Components
- **LeftSidebar**: Project navigation with hierarchical team/agent structure
- **CenterPanel**: Primary content area for AI chat interactions
- **RightSidebar**: Project overview and shared brain functionality
- **AppHeader**: Top navigation with user controls

### Data Management
- **Projects**: Top-level containers with goals, progress tracking, and metadata
- **Teams**: Functional groups within projects (e.g., Development, Marketing)
- **Agents**: Individual AI teammates with specific roles and personalities
- **Shared Memory**: Project-wide context that all AI agents can access

### UI Components
- Extensive use of Radix UI primitives for accessibility
- Custom styling with CSS variables for consistent theming
- Responsive design with mobile-first approach
- Error boundaries and loading states throughout

## Data Flow

### Project Hierarchy
```
Project
├── Core Direction (what building, why matters, who for)
├── Execution Rules & Team Culture
├── Teams
│   ├── Team A (e.g., Development)
│   │   ├── Agent 1 (e.g., Backend Developer)
│   │   └── Agent 2 (e.g., Frontend Developer)
│   └── Team B (e.g., Marketing)
│       ├── Agent 3 (e.g., Content Writer)
│       └── Agent 4 (e.g., Designer)
└── Shared Memory & Progress Tracking
```

### Memory Sharing Architecture
- **Project Memory**: Global context shared by all teams and agents
- **Team Memory**: Team-specific goals and coordination
- **Agent Memory**: Individual conversation history and personality traits
- Memory flows from Project → Team → Agent with inheritance

### API Data Flow
- Frontend components use TanStack Query for data fetching
- RESTful endpoints for CRUD operations on projects, teams, and agents
- Real-time updates through optimistic UI updates
- Error handling with user-friendly fallbacks

## External Dependencies

### Frontend Dependencies
- **@radix-ui/***: Accessible UI primitives (dialogs, dropdowns, etc.)
- **@tanstack/react-query**: Server state management
- **clsx** and **tailwind-merge**: Utility class management
- **wouter**: Lightweight routing
- **framer-motion**: Animation library

### Backend Dependencies
- **express**: Web framework
- **drizzle-orm**: Database ORM
- **@neondatabase/serverless**: Database driver
- **zod**: Schema validation
- **connect-pg-simple**: Session storage

### Development Tools
- **TypeScript**: Type safety across the stack
- **Vite**: Build tool with hot reload
- **ESBuild**: Fast bundling for production
- **PostCSS**: CSS processing for Tailwind

## Deployment Strategy

### Development Environment
- Uses Vite dev server with HMR (Hot Module Replacement)
- In-memory storage for rapid prototyping
- Environment-specific configuration through NODE_ENV

### Production Build
- Vite builds optimized frontend bundle
- ESBuild bundles server code with external packages
- Static files served from dist/public directory
- Express server serves both API and static content

### Database Strategy
- Development uses in-memory storage with sample data
- Production ready for PostgreSQL via Drizzle ORM
- Neon Database integration configured for serverless deployment
- Schema migration support through drizzle-kit

### Configuration Management
- Environment variables for database connections
- Separate TypeScript configs for client/server/shared code
- Path aliases for clean imports (@/, @shared/)
- Tailwind configuration with custom design tokens

The application is architected for scalability with clear separation between frontend, backend, and shared code, making it suitable for both development and production environments.