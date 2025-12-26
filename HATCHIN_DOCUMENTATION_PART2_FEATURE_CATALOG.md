# Hatchin Documentation - Part 2: Complete Feature Catalog

**Part of**: Complete Hatchin Documentation  
**See Main Document**: [HATCHIN_COMPLETE_DOCUMENTATION.md](./HATCHIN_COMPLETE_DOCUMENTATION.md)

---

## Table of Contents

1. [Feature Index](#feature-index)
2. [Chat System Architecture](#1-chat-system-architecture)
3. [AI Intelligence System](#2-ai-intelligence-system)
4. [Task Management Integration](#3-task-management-integration)
5. [Onboarding & Project Creation](#4-onboarding--project-creation)
6. [Project Brain & Memory System](#5-project-brain--memory-system)
7. [Right Sidebar Intelligence](#6-right-sidebar-intelligence)
8. [Real-Time Systems](#7-real-time-systems)
9. [UI/UX Components & Animations](#8-uiux-components--animations)
10. [Feature Maturity Status](#9-feature-maturity-status)
11. [Limitations & Known Issues](#10-limitations--known-issues)
12. [Accessibility Features](#11-accessibility-features)
13. [Internationalization Support](#12-internationalization-support)

---

# Feature Index

This index helps you quickly find any feature in the catalog. Features are listed alphabetically with page references.

## A
- **Agent Chat** → Section 1.1.3
- **Agent Handoff System** → Section 2.6
- **Agent Profile View** → Section 6.3
- **Animated Counters** → Section 8.2
- **Animated Progress Bars** → Section 8.2
- **Animated Timeline** → Section 8.2
- **Animation System** → Section 8.3
- **API Integration (OpenAI)** → Section 2.1
- **Archiving Conversations** → Section 1.5

## B
- **Backend Developer Role** → Section 2.2
- **Business Value Mapping** → Part 5

## C
- **Chat History** → Section 1.4
- **Chat Modes (Project/Team/Agent)** → Section 1.1
- **Code Block Formatting** → Section 1.3.4
- **Confetti Animation** → Section 8.3
- **Connection Status Indicators** → Section 7.2
- **Conversation Memory** → Section 5.2
- **Copy Message** → Section 1.3.2
- **Cross-Agent Memory** → Section 2.4

## D
- **Data Persistence** → Section 1.4
- **Database Schema** → Part 3
- **Decision Memory** → Section 5.2
- **Developer Training Tools** → Section 2.8

## E
- **Egg Hatching Animation** → Section 8.3
- **Empty States** → Section 1.6
- **Error Handling** → Section 1.3.5
- **Expertise Matching** → Section 2.5
- **Export Conversations** → Planned (not implemented)

## F
- **Feature Flags** → Part 3
- **Feedback System** → Section 1.3.1
- **File Attachments** → Planned (not implemented)
- **First-Time User Onboarding** → Section 4.1

## G
- **Getting Started Guide** → Part 6

## H
- **Handoff System** → Section 2.6
- **Hierarchical Tasks** → Section 3.3

## I
- **Idea Project Creation** → Section 4.3
- **Information Architecture** → Part 1, Section 7

## K
- **Key Points Memory** → Section 5.2
- **Keyboard Navigation** → Section 11.1

## L
- **LangGraph Integration** → Section 2.1
- **LangSmith Tracing** → Section 2.1
- **Link Previews** → Planned (not implemented)
- **Loading Skeletons** → Section 8.1

## M
- **Markdown Support** → Section 1.3.4
- **Maya Special Agent** → Section 4.3
- **Message Grouping** → Section 1.3.3
- **Message Reactions** → Section 1.3.1
- **Message Status Indicators** → Section 1.3.5
- **Message Threading** → Section 1.2
- **Message Timestamps** → Section 1.3.3
- **Multi-Agent Coordination** → Section 2.5
- **Multi-Agent Response** → Section 2.5

## O
- **Onboarding Modal** → Section 4.1
- **Onboarding System** → Section 4

## P
- **Pagination (Messages)** → Section 1.4
- **Parent Task System** → Section 3.3
- **Path Selection** → Section 4.1
- **Peer Notes** → Section 2.1
- **Performance Benchmarks** → Part 3
- **Personality Evolution** → Section 2.3
- **Product Designer Role** → Section 2.2
- **Product Manager Role** → Section 2.2
- **Project Brain** → Section 5
- **Project Chat** → Section 1.1.1
- **Project Creation** → Section 4.2
- **Project Overview** → Section 6.1
- **Progress Tracking** → Section 6.4

## Q
- **QA Lead Role** → Section 2.2
- **Quick Start Modal** → Section 4.1

## R
- **Real-Time Metrics** → Section 7.3
- **Real-Time Updates** → Section 7
- **Reply to Message** → Section 1.2
- **Response Streaming** → Section 1.3.6
- **Returning User Welcome** → Section 4.1
- **Right Sidebar** → Section 6
- **Role Profiles** → Section 2.2

## S
- **Screen Reader Support** → Section 11.2
- **Search Messages** → Planned (not implemented)
- **Shared Memory** → Section 5.1
- **Starter Packs** → Section 4.4
- **Streaming Responses** → Section 1.3.6
- **Summary Memory** → Section 5.2
- **Syntax Highlighting** → Section 1.3.4

## T
- **Task Approval Modal** → Section 3.2
- **Task Detection** → Section 3.1
- **Task Extraction** → Section 3.1
- **Task Manager** → Section 3.3
- **Task Suggestion Modal** → Section 3.2
- **Task Suggestions** → Section 3.1
- **Team Chat** → Section 1.1.2
- **Team Dashboard** → Section 6.2
- **Template Selection** → Section 4.4
- **Thread Container** → Section 1.2
- **Thread Navigation** → Section 1.2
- **Thread Notifications** → Section 1.2
- **Thread Unread Count** → Section 1.2
- **Three-Panel Layout** → Part 1
- **Toast Notifications** → Section 8.1
- **Typing Indicators** → Section 1.3.7

## U
- **UI Engineer Role** → Section 2.2
- **User Behavior Detection** → Section 2.3
- **User Name Extraction** → Section 5.3

## W
- **WebSocket Communication** → Section 7.1
- **Welcome Modal** → Section 4.1

---

# 1. Chat System Architecture

## Overview

Hatchin's chat system is the core communication interface between users and AI agents. It supports three levels of conversation (Project, Team, Agent), real-time messaging, message threading, reactions, and comprehensive history management.

**Key Concept**: Unlike traditional chat applications, Hatchin's chat is context-aware. The chat interface automatically adapts based on what the user has selected in the left sidebar (project, team, or agent), and all conversations within a project share memory.

---

## 1.1 Three Chat Modes

### What Are Chat Modes?

Chat modes determine the scope and participants of a conversation. Hatchin has three modes that correspond to the three-layer hierarchy (Project → Team → Agent).

**Important**: Users don't manually select chat modes. The mode is automatically determined by what the user selects in the left sidebar:
- Select a project → Project chat mode
- Select a team → Team chat mode  
- Select an agent → Agent chat mode

### 1.1.1 Project Chat Mode

**What It Is**: Project chat is the broadest conversation scope. It includes all teams and all agents within a project.

**When It Activates**: When a user selects a project in the left sidebar (but doesn't select a specific team or agent).

**Who Can Participate**:
- **All agents** in all teams within the project
- **User** (the person using Hatchin)

**Who Responds**: 
- Any agent in the project can respond
- System uses expertise matching to determine best responder(s)
- Multiple agents can respond for complex questions
- Product Manager often coordinates responses

**Memory Context**:
- Uses **project-level memory** (shared by all teams and agents)
- All agents see the same project context
- Decisions and context are stored at project level

**Use Cases**:
- Strategic planning for the entire project
- Cross-team coordination
- Project-wide announcements
- High-level questions that need multiple perspectives
- Questions that don't fit a specific team's domain

**Example Conversation**:
```
User: "What's our overall product strategy?"
→ Product Manager responds with strategic overview
→ Designer adds UX perspective
→ Engineer adds technical feasibility
→ Consensus response combines all perspectives
```

**Conversation ID Format**: `project-{projectId}`

**Example**: `project-saas-startup`

**UI Indicators**:
- Chat header shows project name
- Header shows "All teams and agents" as participants
- Empty state: "Start a conversation with your project team"

---

### 1.1.2 Team Chat Mode

**What It Is**: Team chat is a focused conversation with all agents within a specific team.

**When It Activates**: When a user selects a team in the left sidebar (but doesn't select a specific agent).

**Who Can Participate**:
- **All agents** in the selected team
- **User**

**Who Responds**:
- Agents within the team
- System uses expertise matching within team
- Multiple team agents can collaborate
- Team lead often coordinates

**Memory Context**:
- Uses **project-level memory** (inherited from project)
- Adds **team-specific context** (team goals, team decisions)
- All team agents see same context

**Use Cases**:
- Team-specific planning
- Coordination within a team
- Domain-specific questions (design questions to Design Team)
- Team execution and workflow

**Example Conversation**:
```
User (in Design Team chat): "How should we approach the login UI?"
→ Product Designer responds with UX approach
→ UI Engineer adds technical implementation details
→ Team consensus on approach
```

**Conversation ID Format**: `team-{projectId}-{teamId}`

**Example**: `team-saas-startup-design-team`

**UI Indicators**:
- Chat header shows team name
- Header shows team agents as participants
- Empty state: "Start a conversation with your [Team Name] team"

---

### 1.1.3 Agent Chat Mode

**What It Is**: Agent chat is a one-on-one conversation with a specific AI agent.

**When It Activates**: When a user selects a specific agent in the left sidebar.

**Who Can Participate**:
- **The selected agent** only
- **User**

**Who Responds**:
- Only the selected agent responds
- Agent uses full personal context
- Deep expertise in agent's domain

**Memory Context**:
- Uses **project-level memory** (inherited)
- Uses **team-level memory** (inherited, if agent is in a team)
- Uses **agent-level memory** (personal to this agent-user relationship)
- Agent's personality is adapted to this user

**Use Cases**:
- Expert consultation
- Deep dive into specific domain
- Personal relationship building
- Specialized questions
- Getting detailed advice from a specific expert

**Example Conversation**:
```
User (chatting with Product Manager): "Help me prioritize our roadmap"
→ Product Manager provides detailed prioritization framework
→ References previous conversations
→ Adapts communication style to user preferences
```

**Conversation ID Format**: `agent-{projectId}-{agentId}`

**Example**: `agent-saas-startup-product-manager`

**UI Indicators**:
- Chat header shows agent name and role
- Header shows single agent as participant
- Empty state: "Start a conversation with [Agent Name]"

---

### How Chat Mode Switching Works

**Automatic Switching**: Chat mode switches automatically when user selects different items in left sidebar.

**Process**:
1. User selects project/team/agent in left sidebar
2. System determines chat mode based on selection
3. System generates conversation ID based on mode
4. System loads or creates conversation for that context
5. System loads relevant memory for that context
6. Chat interface updates to show correct participants
7. Previous messages for that context are displayed

**State Management**:
- Chat mode stored in component state
- Conversation ID derived from mode and selection
- Messages organized by conversation ID
- Memory retrieved based on conversation ID

**Example Flow**:
```
1. User selects "SaaS Startup" project
   → Mode: project
   → Conversation ID: project-saas-startup
   → Loads project messages and memory

2. User selects "Design Team" within project
   → Mode: team
   → Conversation ID: team-saas-startup-design-team
   → Loads team messages and memory (inherits project memory)

3. User selects "Product Designer" agent
   → Mode: agent
   → Conversation ID: agent-saas-startup-product-designer
   → Loads agent messages and memory (inherits project + team memory)
```

---

## 1.2 Message Threading

### What Is Message Threading?

Message threading allows users to reply to specific messages, creating nested conversation threads. This helps organize discussions and keep related messages together.

**Key Concept**: Threads are conversations within conversations. A root message can have multiple replies, and replies can have their own replies, creating a tree structure.

### How Threading Works

**Thread Structure**:
- **Root Message**: Original message that starts a thread (threadDepth = 0)
- **Reply**: Message that replies to root or another reply (threadDepth > 0)
- **Thread Root**: All messages in a thread reference the same threadRootId
- **Parent Message**: Each reply references its parentMessageId

**Example Thread Structure**:
```
Message 1 (Root)
├── Reply 1.1 (to Message 1)
│   └── Reply 1.1.1 (to Reply 1.1)
└── Reply 1.2 (to Message 1)
```

**Database Structure**:
- `parentMessageId`: ID of message this replies to
- `threadRootId`: ID of root message in thread
- `threadDepth`: How many levels deep (0 = root, 1 = first reply, etc.)

### Threading Features

#### 1. Reply to Message

**What It Is**: Users can click a "Reply" button on any message to reply to it.

**How It Works**:
1. User clicks "Reply" button on a message
2. System stores reply context (message ID, content, sender)
3. Input area shows "Replying to [Sender]: [Message preview]"
4. User types reply
5. Reply is sent with parentMessageId and threadRootId
6. Reply appears nested under original message

**UI Implementation**:
- Reply button appears on hover (for agent messages)
- Reply preview shows in input area
- Reply can be cancelled
- Reply indicator shows in message bubble

#### 2. Thread Display

**What It Is**: Threads are visually nested in the chat interface.

**How It Works**:
- Root messages appear normally
- Replies are indented and connected with visual line
- Threads can be collapsed/expanded
- Thread depth is indicated by indentation level

**Visual Design**:
- Root message: Full width, normal styling
- Reply level 1: Indented, connected with line
- Reply level 2+: Further indented
- Visual thread line connects messages

#### 3. Thread Navigation

**What It Is**: Users can navigate threads, see thread structure, and jump between threads.

**Features**:
- **Thread Container**: Visual container for each thread
- **Collapse/Expand**: Hide or show thread replies
- **Thread Badge**: Shows number of replies
- **Thread Indicator**: Visual line connecting messages

**Implementation**:
- `ThreadContainer` component wraps root message and replies
- Collapse state managed per thread
- Thread badge shows unread count
- Click to expand/collapse

#### 4. Thread Notifications

**What It Is**: System tracks unread replies in threads.

**Features**:
- **Unread Count**: Number of unread replies in thread
- **Notification Badge**: Visual indicator on thread
- **Activity Indicator**: Shows when thread has new activity

**Implementation**:
- Tracks unread count per thread
- Badge appears when unread > 0
- Updates in real-time
- Clears when thread is viewed

---

## 1.3 Message Features

### 1.3.1 Message Reactions

**What It Is**: Users can react to AI messages with thumbs up or thumbs down. This provides feedback to improve AI responses.

**Purpose**:
- **User Feedback**: Users express satisfaction or dissatisfaction
- **AI Training**: Reactions help improve AI responses
- **Personality Evolution**: Reactions influence personality adaptation
- **Quality Improvement**: System learns what users like

**How It Works**:
1. User hovers over AI message
2. Reaction buttons appear (thumbs up, thumbs down)
3. User clicks reaction
4. Reaction is saved to database
5. Reaction is sent to personality evolution system
6. Future responses adapt based on feedback

**Reaction Types**:
- **Thumbs Up** (`thumbs_up`): Positive feedback, response was good
- **Thumbs Down** (`thumbs_down`): Negative feedback, response could be better

**UI Implementation**:
- Buttons appear on hover (for agent messages only)
- Smooth animations
- Toast notification confirms feedback sent
- Reactions stored per message per user

**Backend Integration**:
- Reaction stored in `messageReactions` table
- Linked to message, user, and agent
- Integrated with personality evolution engine
- Used for AI training and improvement

**Data Structure**:
```typescript
interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  agentId: string; // Which agent the feedback is about
  reactionType: 'thumbs_up' | 'thumbs_down';
  feedbackData: {
    responseQuality?: number; // 1-5 scale
    helpfulness?: number; // 1-5 scale
    accuracy?: number; // 1-5 scale
    notes?: string;
  };
  createdAt: Date;
}
```

**Business Value** (for BAs):
- **User Satisfaction**: Reactions indicate user satisfaction
- **Quality Metrics**: Track response quality over time
- **Improvement Tracking**: See how AI improves with feedback
- **User Engagement**: Reactions show user engagement

**Technical Details** (for Developers):
- API endpoint: `POST /api/messages/:messageId/reactions`
- WebSocket event: Reaction saved and broadcast
- Personality evolution: Automatic integration
- Storage: Persistent in database

---

### 1.3.2 Copy Message to Clipboard

**What It Is**: Users can copy any message to their clipboard with one click.

**Purpose**: 
- Quick copying of AI responses
- Sharing messages outside Hatchin
- Saving important information
- Reference for later use

**How It Works**:
1. User hovers over message
2. Copy button appears (or right-click context menu)
3. User clicks copy
4. Message content copied to clipboard
5. Toast notification confirms copy

**UI Implementation**:
- Copy button in message actions (on hover)
- Also available in context menu (right-click)
- Icon: Copy icon from lucide-react
- Toast notification on success

**Technical Details**:
- Uses `navigator.clipboard.writeText()`
- Handles errors gracefully
- Works in all modern browsers
- Fallback for older browsers

---

### 1.3.3 Message Display Enhancements

#### Message Grouping

**What It Is**: Messages from the same sender are grouped together to reduce visual clutter.

**How It Works**:
- Consecutive messages from same sender are grouped
- First message in group shows sender info
- Subsequent messages in group don't show sender info
- Group ends when different sender or time gap

**Visual Design**:
- Grouped messages have reduced spacing (`mt-1` instead of `mt-4`)
- Only first message shows sender name and avatar
- Timestamp shown on last message in group
- Visual connection between grouped messages

**Benefits**:
- Cleaner interface
- Easier to read conversations
- Less visual noise
- Better conversation flow

#### Relative Timestamps

**What It Is**: Messages show relative time ("2 minutes ago") instead of absolute time.

**How It Works**:
- Calculate time difference from now
- Format based on duration:
  - < 1 minute: "Just now"
  - < 1 hour: "X minutes ago"
  - < 24 hours: "X hours ago"
  - >= 24 hours: "X days ago"

**Implementation**:
```typescript
const formatRelativeTime = (timestamp: string) => {
  const now = new Date();
  const messageTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - messageTime.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};
```

**Benefits**:
- More intuitive than absolute time
- Updates automatically (shows "Just now" for new messages)
- Less cognitive load
- Better user experience

#### Message Status Indicators

**What It Is**: Messages show their delivery status (sending, sent, delivered, failed).

**Status Types**:
- **sending**: Message is being sent (optimistic UI)
- **sent**: Message sent to server
- **delivered**: Message delivered and saved
- **failed**: Message failed to send
- **streaming**: AI response is being streamed

**Visual Indicators**:
- Sending: Loading indicator or subtle animation
- Sent: Checkmark or subtle indicator
- Delivered: Double checkmark or stronger indicator
- Failed: Error icon with retry button
- Streaming: Typing indicator with stop button

**Implementation**:
- Status stored in message object
- Updated as message progresses
- Visual indicators in UI
- Retry functionality for failed messages

---

### 1.3.4 Markdown Support & Code Formatting

**What It Is**: Messages support Markdown formatting, including code blocks with syntax highlighting.

**Purpose**:
- Rich text formatting in messages
- Code sharing with proper formatting
- Better readability
- Professional appearance

**Supported Markdown Features**:
- **Headers**: H1, H2, H3
- **Bold**: `**text**`
- **Italic**: `*text*`
- **Lists**: Ordered and unordered
- **Code**: Inline code and code blocks
- **Blockquotes**: For quotes or callouts
- **Links**: Automatic link detection

**Code Block Features**:
- **Syntax Highlighting**: Code blocks are syntax-highlighted
- **Language Detection**: Automatic language detection
- **Copy Code**: Users can copy code from blocks
- **Styled Display**: Code blocks have special styling

**Implementation**:
- Uses `react-markdown` library
- `remark-gfm` for GitHub Flavored Markdown
- `rehype-highlight` for syntax highlighting
- Custom styling for all markdown elements

**Code Block Styling**:
- Dark background (`bg-gray-800`)
- Green text color (`text-green-400`)
- Monospace font
- Rounded corners
- Padding for readability
- Horizontal scroll for long lines

**Inline Code Styling**:
- Dark background
- Green text
- Rounded corners
- Padding
- Smaller font size

**Example**:
```markdown
Here's some **bold text** and `inline code`.

```typescript
function example() {
  return "Hello, World!";
}
```

This creates a properly formatted code block with syntax highlighting.
```

**Business Value** (for BAs):
- **Professional Appearance**: Rich formatting looks professional
- **Better Communication**: Code sharing is easier
- **User Satisfaction**: Users appreciate formatting support

**Technical Details** (for Developers):
- Library: `react-markdown`, `remark-gfm`, `rehype-highlight`
- Custom component overrides for styling
- Performance: Efficient rendering
- Accessibility: Proper semantic HTML

---

### 1.3.5 Error Handling

**What It Is**: System handles errors gracefully with user-friendly messages and recovery options.

**Error Types**:
1. **Message Send Failure**: Message fails to send
2. **Streaming Error**: AI response streaming fails
3. **Connection Error**: WebSocket connection lost
4. **API Error**: Backend API errors
5. **Network Error**: Network connectivity issues

**Error Handling Strategy**:

#### Message Send Failure
- **Detection**: Message status becomes "failed"
- **UI**: Error icon and message shown
- **Recovery**: Retry button to resend
- **Persistence**: Failed messages queued for retry

#### Streaming Error
- **Detection**: Streaming stops unexpectedly
- **UI**: Error message with retry option
- **Recovery**: User can retry streaming
- **Fallback**: System attempts to complete response

#### Connection Error
- **Detection**: WebSocket disconnects
- **UI**: Connection status indicator shows "disconnected"
- **Recovery**: Automatic reconnection with exponential backoff
- **Message Queuing**: Messages queued during disconnect, sent on reconnect

#### API Error
- **Detection**: API returns error status
- **UI**: Error toast notification
- **Recovery**: User can retry action
- **Logging**: Errors logged for debugging

**Error UI Components**:
- **Error Icons**: Visual indicators for errors
- **Error Messages**: User-friendly error descriptions
- **Retry Buttons**: Options to retry failed operations
- **Status Indicators**: Connection and message status

**Implementation**:
- Try-catch blocks around critical operations
- Error boundaries for React components
- Graceful degradation
- User-friendly error messages

---

### 1.3.6 Response Streaming

**What It Is**: AI responses appear word-by-word as they're generated, instead of waiting for the complete response.

**Purpose**:
- **Immediate Feedback**: Users see response immediately
- **Natural Feel**: Feels like real-time conversation
- **Reduced Perceived Latency**: Feels faster than waiting
- **Better UX**: More engaging experience

**How It Works**:

#### Streaming Process
1. User sends message
2. Server sends `streaming_started` event
3. AI generates response word-by-word
4. Each word sent as `streaming_chunk` event
5. Client displays chunks as they arrive
6. Server sends `streaming_completed` when done
7. Final message saved to database

#### Technical Flow
```
User Message
    ↓
WebSocket: send_message_streaming
    ↓
Server: Save user message
    ↓
Server: Generate AI response (streaming)
    ↓
Server: Send streaming_started
    ↓
Server: Stream chunks (word-by-word)
    ↓
Client: Display chunks in real-time
    ↓
Server: Send streaming_completed
    ↓
Server: Save complete message
```

#### Streaming State Management

**Client Side**:
- `isStreaming`: Boolean flag for streaming state
- `streamingMessageId`: ID of message being streamed
- `streamingContent`: Accumulated content
- `streamingAgent`: Which agent is streaming

**Server Side**:
- Tracks active streaming responses
- Prevents duplicate streams
- Manages streaming timeouts
- Handles streaming cancellation

#### Streaming Cancellation

**What It Is**: Users can cancel ongoing streaming responses.

**How It Works**:
1. User clicks "Stop" button during streaming
2. Client sends `cancel_streaming` message
3. Server aborts streaming generation
4. Server sends `streaming_cancelled` event
5. Client stops displaying new chunks
6. Partial response saved (optional)

**UI Implementation**:
- Stop button appears during streaming
- Clicking stop cancels generation
- Visual feedback on cancellation
- Partial response may be saved

#### Streaming Error Handling

**Error Types**:
- **Generation Error**: AI fails to generate response
- **Connection Error**: WebSocket disconnects during streaming
- **Timeout**: Streaming takes too long

**Error Recovery**:
- Show error message
- Offer retry option
- Save partial response if possible
- Log error for debugging

**Timeout Handling**:
- 20-second watchdog timer
- Clears streaming state if timeout
- Marks message as failed
- Allows retry

---

### 1.3.7 Typing Indicators

**What It Is**: Shows when AI agents are "typing" a response, similar to human chat applications.

**Purpose**:
- **User Feedback**: Users know AI is working
- **Human-Like Feel**: Makes AI feel more alive
- **Expectation Setting**: Users know response is coming
- **Better UX**: Reduces perceived wait time

**How It Works**:
1. User sends message
2. Server determines which agent(s) will respond
3. Server sends `typing_started` event with agent ID
4. Client shows typing indicator for that agent
5. AI generates response
6. Server sends `typing_stopped` event
7. Client hides typing indicator
8. Response is displayed

**Typing Indicator Display**:
- Shows agent name: "[Agent Name] is typing..."
- Animated dots or cursor
- Appears below last message
- Disappears when response arrives

**Multiple Agents Typing**:
- If multiple agents respond, shows all typing
- Format: "Product Manager, UI Engineer are typing..."
- Each agent has own indicator
- Indicators disappear as responses arrive

**Typing Duration**:
- Estimated based on response complexity
- Actual duration may vary
- System adjusts estimates over time
- Realistic delays for natural feel

**Implementation**:
- WebSocket events: `typing_started`, `typing_stopped`
- Stored in `typingIndicators` table
- Real-time updates via WebSocket
- Automatic cleanup when response arrives

---

## 1.4 Chat History & Persistence

### What Is Chat History?

Chat history is the complete record of all messages in all conversations. Hatchin stores all messages permanently, allowing users to access conversation history at any time.

**Key Concept**: Unlike some chat applications that only show recent messages, Hatchin maintains complete history. Users can scroll back through months of conversations, and AI agents can reference any past conversation.

### History Features

#### 1. Message Persistence

**What It Is**: All messages are saved to the database and persist across sessions.

**Storage**:
- Messages stored in `messages` table
- Linked to conversations
- Includes metadata (timestamps, status, etc.)
- Never deleted (unless user explicitly deletes conversation)

**Persistence Guarantees**:
- Messages saved before sending to other clients
- Messages saved even if WebSocket fails
- Messages persist across browser sessions
- Messages persist across devices (if user logs in)

#### 2. Pagination & Lazy Loading

**What It Is**: Messages are loaded in pages, not all at once, for performance.

**How It Works**:
- Initial load: Last 50 messages
- Scroll up: Load more messages (previous page)
- Efficient: Only loads what's needed
- Smooth: Infinite scroll experience

**Pagination Parameters**:
- `page`: Page number (1-based)
- `limit`: Messages per page (default 50)
- `before`: Load messages before this timestamp
- `after`: Load messages after this timestamp
- `messageType`: Filter by type (user/agent/system)

**API Endpoint**:
```
GET /api/conversations/:conversationId/messages?page=1&limit=50
```

**Implementation**:
- TanStack Query for data fetching
- Infinite scroll for loading more
- Caching for performance
- Optimistic updates for new messages

#### 3. Conversation Archiving

**What It Is**: Users can archive conversations to hide them without deleting them.

**Purpose**:
- **Organization**: Hide old or completed conversations
- **Clean Interface**: Keep active conversations visible
- **Preservation**: Keep history without clutter
- **Recovery**: Archived conversations can be unarchived

**How It Works**:
1. User archives a conversation
2. Conversation `isActive` flag set to `false`
3. Conversation hidden from main list
4. Conversation accessible in archived list
5. User can unarchive to restore

**Archiving Features**:
- Archive individual conversations
- View archived conversations
- Unarchive conversations
- Archive doesn't delete messages or memory

**API Endpoints**:
- `PUT /api/conversations/:id/archive` - Archive conversation
- `PUT /api/conversations/:id/unarchive` - Unarchive conversation
- `GET /api/projects/:projectId/conversations/archived` - Get archived conversations

#### 4. Conversation Deletion

**What It Is**: Users can delete conversations, which removes all associated data.

**What Gets Deleted**:
- Conversation record
- All messages in conversation
- All memory associated with conversation
- All reactions to messages
- All typing indicators

**Deletion Process**:
1. User confirms deletion
2. System deletes conversation and all associated data
3. Cleanup is complete and permanent
4. Cannot be undone

**Safety**:
- Confirmation dialog before deletion
- Clear warning about permanent deletion
- No accidental deletions

**API Endpoint**:
- `DELETE /api/conversations/:id` - Delete conversation and all data

---

## 1.5 Conversation Management

### Conversation Lifecycle

**Creation**:
- Conversations created automatically when first message sent
- Conversation ID generated based on context
- Conversation linked to project (and team/agent if applicable)

**Active State**:
- Conversations are active by default
- Active conversations appear in conversation list
- Messages can be sent to active conversations

**Archived State**:
- Conversations can be archived
- Archived conversations hidden from main list
- Can be unarchived to restore

**Deleted State**:
- Conversations can be deleted
- Deletion is permanent
- All associated data is removed

### Conversation Types

**Project Conversations**:
- Type: `project`
- Scope: Entire project
- Participants: All agents in project
- Memory: Project-level memory

**Team Conversations**:
- Type: `team`
- Scope: Specific team
- Participants: Agents in team
- Memory: Project + team memory

**Agent Conversations**:
- Type: `hatch` (in database, but represents agent chat)
- Scope: Single agent
- Participants: One agent + user
- Memory: Project + team + agent memory

---

## 1.6 Empty States

### What Are Empty States?

Empty states are helpful messages and UI shown when there's no content to display. They guide users on what to do next.

### Empty State Types

#### 1. No Projects Empty State

**When Shown**: When user has no projects.

**Message**: "Create your first project"

**UI Elements**:
- Large emoji (🐣)
- Heading: "Create your first project"
- Subheading: "Your dreams await"
- "Add Project" button

**Purpose**: Guide first-time users to create their first project.

#### 2. No Messages Empty State

**When Shown**: When conversation has no messages yet.

**Context-Specific Messages**:
- **Project Chat**: "Start a conversation with your project team"
- **Team Chat**: "Start a conversation with your [Team Name] team"
- **Agent Chat**: "Start a conversation with [Agent Name]"

**UI Elements**:
- Context-appropriate message
- Subtle visual design
- Encourages first message

**Purpose**: Guide users to start conversations.

#### 3. No Tasks Empty State

**When Shown**: When task list is empty.

**Message**: "No tasks yet"

**UI Elements**:
- Simple message
- Option to create task
- Or wait for AI suggestions

**Purpose**: Indicate empty state, suggest next action.

---

*[Continue with remaining sections: AI Intelligence System, Task Management, Onboarding, etc...]*

