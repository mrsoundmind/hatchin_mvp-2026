# Phase 1.3: UI Routing Invariant Fix for "Start with an Idea" Projects

**Date**: 2025-12-26  
**Status**: ✅ **Successfully Implemented**  
**Purpose**: Fix UI routing so that "Start with an idea" projects land in PROJECT scope by default, not agent scope

---

## Executive Summary

Successfully fixed the UI routing bug where "Start with an idea" projects were incorrectly routing to agent scope instead of project scope. The fix enforces the core product invariant: **newly created projects must land in PROJECT scope by default**.

**Key Achievement**:
- ✅ Fixed 1-line bug in `handleEggHatchingComplete`
- ✅ Enforced project scope invariant
- ✅ Preserved existing behavior (team/agent selection)
- ✅ All stress tests pass
- ✅ Zero regressions

---

## Problem Statement

### Observed Bug

When a user created a project using "Start with an idea":
1. ❌ The UI routed the user into **agent scope** (AI Idea Partner / Maya)
2. ❌ Instead of **project scope**
3. ❌ The send button became disabled
4. ❌ The chat header showed an agent instead of PM Maya at project level

### Root Cause

**File**: `client/src/pages/home.tsx`  
**Function**: `handleEggHatchingComplete`  
**Line**: 281

**The Bug**:
```typescript
setActiveAgentId(mayaAgent?.id || null);  // ❌ WRONG: Sets agent scope
```

**Why This Was Wrong**:
- After creating an idea project, the code was setting `activeAgentId` to Maya's ID
- This caused the chat context computation in `CenterPanel.tsx` to detect agent scope
- The chat mode was computed as `'agent'` instead of `'project'`
- This violated the core invariant: **projects own the conversation by default**

### Chat Context Computation Logic

The chat context is computed in `CenterPanel.tsx` (lines 847-861):

```typescript
if (activeAgentId) {
  // Agent mode: Talk to specific agent (1-on-1)
  newMode = 'agent';
  conversationId = buildConversationId('agent', activeProject.id, activeAgentId);
} else if (activeTeamId) {
  // Team mode: Talk to all agents under specific team
  newMode = 'team';
  conversationId = buildConversationId('team', activeProject.id, activeTeamId);
} else {
  // Project mode: Talk to all teams and agents under project
  newMode = 'project';
  conversationId = buildConversationId('project', activeProject.id);
}
```

**The Logic**:
- If `activeAgentId` is set → agent scope
- Else if `activeTeamId` is set → team scope
- Else → project scope

**The Fix**:
- Set `activeAgentId` to `null` after project creation
- This ensures the chat context computes as `'project'` mode

---

## The Fix

### Code Change

**File**: `client/src/pages/home.tsx`  
**Function**: `handleEggHatchingComplete`  
**Lines Changed**: 278-290

**Before** (❌ Bug):
```typescript
// Set this project as active and expand it, and expand the Core Team to show Maya
setActiveProjectId(newProject.id);
setActiveTeamId(null);
setActiveAgentId(mayaAgent?.id || null);  // ❌ BUG: Forces agent scope

devLog('POST_CREATE_AUTO_SELECTION', {
  projectId: newProject.id,
  activeTeamId: null,
  activeAgentId: mayaAgent?.id || null,  // ❌ BUG: Logs agent ID
  mayaAgentFound: !!mayaAgent,
  coreTeamFound: !!coreTeam,
  selectionReason: 'egg_hatching_complete_auto_select_maya'
});
```

**After** (✅ Fixed):
```typescript
// Set this project as active in PROJECT scope (not agent scope)
// Core invariant: Newly created projects must land in project scope by default
setActiveProjectId(newProject.id);
setActiveTeamId(null);
setActiveAgentId(null);  // ✅ FIX: Explicitly null to enforce project scope

devLog('POST_CREATE_AUTO_SELECTION', {
  projectId: newProject.id,
  activeTeamId: null,
  activeAgentId: null,  // ✅ FIX: Logs null (project scope)
  mayaAgentFound: !!mayaAgent,
  coreTeamFound: !!coreTeam,
  selectionReason: 'egg_hatching_complete_project_scope'  // ✅ FIX: Updated reason
});
```

### Change Summary

- **Lines Changed**: 3 lines (1 state set, 1 log value, 1 log reason)
- **Complexity**: Minimal (single-line fix)
- **Risk**: Low (only affects post-creation auto-selection)

---

## Why This Fix Works

### 1. Enforces Core Invariant

**Product Truth**: Projects own the conversation by default. Agents participate — they do not hijack scope.

**Before Fix**:
- Idea project creation → `activeAgentId = mayaAgent.id`
- Chat context computes → `mode = 'agent'`
- ❌ Violates invariant

**After Fix**:
- Idea project creation → `activeAgentId = null`
- Chat context computes → `mode = 'project'`
- ✅ Enforces invariant

### 2. Preserves Existing Behavior

**Team Chat**:
- User selects team → `activeTeamId` set → `mode = 'team'` ✅
- Unchanged by this fix

**Agent Chat**:
- User selects agent → `activeAgentId` set → `mode = 'agent'` ✅
- Unchanged by this fix

**Normal Project Creation**:
- Already sets `activeAgentId = null` ✅
- Unchanged by this fix

### 3. Future-Proof

**Why It's Future-Proof**:
- ✅ No hardcoded project names
- ✅ No special-case hacks
- ✅ No boolean flags like `isIdeaProject`
- ✅ Logic is explicit and deterministic
- ✅ Works for any project type (idea, normal, future types)

**Agent Presence Does Not Hijack Scope**:
- Even if Maya agent exists
- Even if "helper" agents exist
- Even if agents are auto-created during onboarding
- The project scope is enforced by default

---

## Test Results

### Stress Test Results

**Test File**: `scripts/stress-test-ui-routing-fix.ts`

**Results**:
- ✅ **8/8 tests passed**
- ✅ Chat context computation logic validated
- ✅ Agent scope hijacking prevention validated
- ✅ Existing behavior preservation validated

**Test Coverage**:
1. ✅ Project scope (no team, no agent)
2. ✅ Team scope (team selected, no agent)
3. ✅ Agent scope (agent selected)
4. ✅ Project scope after idea creation (FIXED)
5. ✅ Idea project with Maya agent present (hijacking prevention)
6. ✅ Normal project creation
7. ✅ User explicitly selects agent (preservation)
8. ✅ User explicitly selects team (preservation)

### Build Verification

- ✅ **Build succeeds**: `npm run build` completes without errors
- ✅ **TypeScript compiles**: No type errors
- ✅ **No linting errors**: All files pass linting

---

## Acceptance Criteria Validation

### ✅ After the Fix

**Creating a "Start with an idea" project results in**:
- ✅ `mode === 'project'` (verified by stress test)
- ✅ `conversationId === project-{projectId}` (verified by stress test)
- ✅ PM Maya speaks as project PM, not as an agent chat (enforced by backend speaking authority)
- ✅ Send button is enabled immediately (no longer blocked by agent scope)
- ✅ No regressions in:
  - ✅ Team chat (preserved)
  - ✅ Agent chat (preserved)
  - ✅ Existing projects (unchanged)

### Instrumentation Logs Validation

**Expected Log Output** (after fix):
```
[HATCHIN_UI_AUDIT] IDEA_PROJECT_CREATED { projectId: '...', projectName: '...', creationType: 'idea' }
[HATCHIN_UI_AUDIT] POST_CREATE_AUTO_SELECTION { 
  projectId: '...', 
  activeTeamId: null, 
  activeAgentId: null,  // ✅ Now null (was mayaAgent.id)
  selectionReason: 'egg_hatching_complete_project_scope'  // ✅ Updated reason
}
[HATCHIN_UI_AUDIT] CHAT_CONTEXT_COMPUTING { activeProjectId: '...', activeTeamId: null, activeAgentId: null }
[HATCHIN_UI_AUDIT] CHAT_CONTEXT_COMPUTED { 
  mode: 'project',  // ✅ Now 'project' (was 'agent')
  conversationId: 'project-...',  // ✅ Correct format
  projectId: '...',
  teamId: null,
  agentId: null
}
```

---

## Files Changed

### Modified Files

1. **`client/src/pages/home.tsx`** (3 lines changed)
   - Line 281: Changed `setActiveAgentId(mayaAgent?.id || null)` → `setActiveAgentId(null)`
   - Line 286: Changed log `activeAgentId: mayaAgent?.id || null` → `activeAgentId: null`
   - Line 289: Changed log `selectionReason: 'egg_hatching_complete_auto_select_maya'` → `'egg_hatching_complete_project_scope'`
   - Added comment explaining the core invariant

### New Files

1. **`scripts/stress-test-ui-routing-fix.ts`** (New file, 180 lines)
   - Comprehensive stress test for UI routing fix
   - Validates chat context computation
   - Validates agent scope hijacking prevention
   - Validates existing behavior preservation

---

## Phase 1 Invariants Status

### ✅ All Invariants Remain Intact

1. **✅ Momentum Invariant**: Unchanged (backend handles this)
2. **✅ Ownership Invariant**: Unchanged (backend handles this)
3. **✅ PM Authority**: Unchanged (backend handles this)
4. **✅ Agent Speaking Rules**: Unchanged (backend handles this)
5. **✅ Message Persistence**: Unchanged (Phase 1.2.a)
6. **✅ Conversation Bootstrap**: Unchanged (Phase 1.2.b)
7. **✅ UI Routing Invariant**: ✅ **NOW ENFORCED** (this fix)

---

## What This Fix Does NOT Do

This fix does NOT:
- ❌ Change backend code
- ❌ Change conversation ID formats
- ❌ Force-enable send button without fixing root cause
- ❌ Add new concepts or abstractions
- ❌ Remove PM Maya or agent logic
- ❌ Break existing team/agent chat behavior

This fix ONLY:
- ✅ Sets `activeAgentId = null` after idea project creation
- ✅ Enforces project scope by default
- ✅ Preserves existing behavior

---

## Summary

**Status**: ✅ **COMPLETE**

The UI routing fix is successfully implemented and tested. It:
- ✅ Fixes the root cause (1-line change)
- ✅ Enforces the core invariant (projects own conversation by default)
- ✅ Preserves existing behavior (team/agent selection)
- ✅ Is future-proof (no hacks, explicit logic)
- ✅ Passes all stress tests (8/8)

**Confidence Level**: **HIGH** ✅

---

**Report Generated**: 2025-12-26  
**Implementation Time**: ~15 minutes  
**Build Status**: ✅ Success  
**Files Changed**: 1 file (3 lines), 1 new test file  
**Test Results**: 8/8 passed

