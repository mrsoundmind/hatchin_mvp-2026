# Memory Scoping Investigation Report

## Executive Summary

This report documents the current memory scoping behavior across the Hatchin codebase. The investigation reveals **critical risks** in how project memory is retrieved, particularly around the use of `conversationId.includes(projectId)` for scoping and inconsistent use of `projectName` vs `projectId` in memory retrieval calls.

---

## Memory Retrieval Entry Points

### 1. `getProjectMemory(projectId: string)`
**File:** `server/storage.ts`  
**Lines:** 727-751  
**Function Signature:**
```typescript
async getProjectMemory(projectId: string): Promise<any[]>
```

**What it receives:**
- `projectId`: A string identifier for the project (e.g., `"saas-startup"`)

**How it determines which conversation IDs belong to a project:**
- **Exact logic:** Iterates through all entries in `this.conversationMemories` Map
- **Scoping check:** Uses `conversationId.includes(projectId)` (line 733)
- **No parsing:** Does not parse `conversationId` structure
- **No validation:** Does not verify that the conversationId actually belongs to the project

**Exact code:**
```typescript
for (const [conversationId, memories] of this.conversationMemories) {
  // Check if conversation ID belongs to this project
  if (conversationId.includes(projectId)) {
    projectMemories.push(...memories);
  }
}
```

**Assumptions made:**
1. All conversation IDs that contain `projectId` as a substring belong to that project
2. `projectId` will never be a substring of another `projectId`
3. The `conversationId` format always embeds `projectId` somewhere in the string

**Who calls this function:**
- `getSharedMemoryForAgent(agentId, projectId)` (line 754) - **Direct caller**

**What could go wrong:**
1. **False positives:** If `projectId = "saas"` and there's a conversation `"project-saas-enterprise"`, it would incorrectly match
2. **False negatives:** If `projectId` contains special characters or is encoded differently, matching fails
3. **Ambiguous matches:** If `projectId = "a"` and conversation is `"project-abc"`, it matches incorrectly
4. **No scope validation:** A conversation `"team-other-project-design"` would match if `projectId = "project"` (substring match)

---

### 2. `getSharedMemoryForAgent(agentId: string, projectId: string)`
**File:** `server/storage.ts`  
**Lines:** 753-792  
**Function Signature:**
```typescript
async getSharedMemoryForAgent(agentId: string, projectId: string): Promise<string>
```

**What it receives:**
- `agentId`: Agent identifier
- `projectId`: **Expected to be a project ID string, but sometimes receives `projectName` instead** (see call sites below)

**How it determines which conversation IDs belong to a project:**
- **Delegates to `getProjectMemory(projectId)`** (line 754)
- Does not perform any conversationId parsing or validation itself
- Formats the returned memories into a context string for the AI

**Assumptions made:**
1. `projectId` parameter is actually a project ID (not a name)
2. `getProjectMemory` will correctly scope memories
3. Agent exists and can be retrieved

**Who calls this function:**
1. **`handleMultiAgentResponse`** (line 841) - **⚠️ BUG: Passes `chatContext.projectName` instead of `projectId`**
2. **`handleMultiAgentResponse`** (line 895) - **⚠️ BUG: Passes `chatContext.projectName` instead of `projectId`** (handoff scenario)
3. **`handleStreamingColleagueResponse`** (line 1170) - **✅ CORRECT: Passes `projectId` from parsed conversationId**

**What could go wrong:**
1. **Type mismatch:** When `projectName` (e.g., `"SaaS Startup"`) is passed instead of `projectId` (e.g., `"saas-startup"`), the `includes()` check in `getProjectMemory` will fail
2. **Memory not found:** If `projectName` contains spaces or different casing, no memories will be matched
3. **Inconsistent behavior:** Some code paths work (line 1170) while others fail (lines 841, 895)

---

### 3. `getConversationMemory(conversationId: string)`
**File:** `server/storage.ts`  
**Lines:** 723-725  
**Function Signature:**
```typescript
async getConversationMemory(conversationId: string): Promise<any[]>
```

**What it receives:**
- `conversationId`: Full conversation ID string (e.g., `"project-saas-startup"`)

**How it determines which conversation IDs belong to a project:**
- **Direct Map lookup:** `this.conversationMemories.get(conversationId)`
- **No scoping logic:** Does not filter by project
- **No parsing:** Direct key lookup only

**Assumptions made:**
1. `conversationId` is the exact key used when storing memories
2. No project-level aggregation needed

**Who calls this function:**
- **Not currently called anywhere in the codebase** (based on grep results)

**What could go wrong:**
- None (direct lookup is safe, but function is unused)

---

### 4. `addConversationMemory(conversationId, memoryType, content, importance)`
**File:** `server/storage.ts`  
**Lines:** 704-721  
**Function Signature:**
```typescript
async addConversationMemory(
  conversationId: string,
  memoryType: 'context' | 'summary' | 'key_points' | 'decisions',
  content: string,
  importance: number = 5
): Promise<void>
```

**What it receives:**
- `conversationId`: Full conversation ID where memory should be stored
- Memory metadata (type, content, importance)

**How it determines which conversation IDs belong to a project:**
- **No scoping logic:** Stores memory directly under the provided `conversationId`
- **No validation:** Does not verify that `conversationId` is valid or belongs to a project

**Assumptions made:**
1. `conversationId` is correctly formatted and valid
2. Caller has already determined the correct `conversationId` for storage

**Who calls this function:**
- `extractAndStoreMemory` (lines 1394, 1404, 1414, 1425) - **Called from `handleStreamingColleagueResponse`**

**What could go wrong:**
- If `conversationId` is malformed or incorrect, memory is stored under wrong key
- No validation that the conversationId format matches expected patterns

---

## Scoping Logic Per Entry Point

### Summary Table

| Function | Scoping Method | Parsing Used? | Validation? | Risk Level |
|----------|---------------|---------------|-------------|------------|
| `getProjectMemory` | `conversationId.includes(projectId)` | ❌ No | ❌ No | 🔴 **HIGH** |
| `getSharedMemoryForAgent` | Delegates to `getProjectMemory` | ❌ No | ❌ No | 🔴 **HIGH** |
| `getConversationMemory` | Direct Map lookup | ❌ No | ❌ No | 🟢 **LOW** (unused) |
| `addConversationMemory` | Direct Map storage | ❌ No | ❌ No | 🟡 **MEDIUM** |

---

## Risks and Failure Modes

### 🔴 Critical Risk 1: Substring Matching in `getProjectMemory`

**Location:** `server/storage.ts:733`

**Problem:**
```typescript
if (conversationId.includes(projectId)) {
```

**Failure scenarios:**
1. **False positive:** `projectId = "saas"` matches `"project-saas-enterprise"` (wrong project)
2. **False positive:** `projectId = "a"` matches `"project-abc"` (wrong project)
3. **False positive:** `projectId = "project"` matches `"team-other-project-design"` (wrong project)
4. **False negative:** If `projectId` is encoded or transformed, matching fails silently

**Impact:**
- Memories from wrong projects included in context
- AI receives incorrect context
- Data leakage between projects

---

### 🔴 Critical Risk 2: `projectName` vs `projectId` Mismatch

**Location:** `server/routes.ts:841, 895`

**Problem:**
```typescript
// In handleMultiAgentResponse:
const agentMemory = await storage.getSharedMemoryForAgent(agent.id, chatContext.projectName);
//                                                                    ^^^^^^^^^^^^^^^^^^^^
//                                                                    Should be projectId!
```

**Where `chatContext.projectName` is set:**
- `server/routes.ts:1194`: `projectName: project.name` (e.g., `"SaaS Startup"`)

**Expected vs Actual:**
- **Expected:** `projectId` (e.g., `"saas-startup"`)
- **Actual:** `projectName` (e.g., `"SaaS Startup"`)

**Failure scenario:**
1. `getSharedMemoryForAgent` receives `"SaaS Startup"` instead of `"saas-startup"`
2. `getProjectMemory` tries to match `conversationId.includes("SaaS Startup")`
3. No conversation IDs contain `"SaaS Startup"` (they contain `"saas-startup"`)
4. **Result:** Zero memories returned, AI has no context

**Impact:**
- Multi-agent responses have no shared memory context
- Agent handoffs have no shared memory context
- AI responses lack project history and context

**Note:** Single-agent streaming response (line 1170) works correctly because it uses `projectId` from parsed `conversationId`.

---

### 🟡 Medium Risk 3: No Parsing in Memory Scoping

**Location:** `server/storage.ts:727-751`

**Problem:**
- `getProjectMemory` does not use `parseConversationId` utility
- Relies on brittle substring matching instead of structured parsing

**Impact:**
- Cannot reliably handle multi-hyphen project IDs
- Cannot distinguish between `project-{id}`, `team-{id}-{id}`, `agent-{id}-{id}` formats
- Ambiguous conversation IDs cannot be handled safely

---

### 🟡 Medium Risk 4: Other Brittle Parsing Sites (Not Memory-Related)

**Locations:**
1. `server/routes.ts:668` - `conversationId.split('-')` for metrics broadcasting
2. `server/routes.ts:1356` - `conversationId.split('-')` for metrics broadcasting
3. `server/routes.ts:1475` - Regex match for non-streaming handler

**Impact:**
- These are not memory-related but indicate broader parsing brittleness
- Could affect metrics and non-streaming responses
- Should be addressed in future refactoring

---

## Answers to Specific Questions

### Q: Is `includes(projectId)` used anywhere for memory scoping?
**A: Yes.**  
- **Location:** `server/storage.ts:733` in `getProjectMemory()`
- **Usage:** `if (conversationId.includes(projectId))`
- **Risk:** High - substring matching is unreliable

---

### Q: Are conversation IDs parsed or pattern-matched anywhere else for memory?
**A: No.**  
- Memory scoping does not use parsing
- Only `getProjectMemory` uses pattern matching (`includes()`)
- `getConversationMemory` uses direct Map lookup (no scoping)
- `addConversationMemory` uses direct Map storage (no scoping)

---

### Q: Is there any logic that assumes conversationId structure implicitly?
**A: Yes, multiple places:**

1. **`getProjectMemory`** assumes `projectId` appears as a substring in `conversationId`
2. **`handleMultiAgentResponse`** assumes `chatContext.projectName` is a valid `projectId` (it's not)
3. **Metrics broadcasting** (lines 668, 1356) assumes `conversationId.split('-')` works reliably
4. **Non-streaming handler** (line 1475) assumes regex pattern matches all valid formats

---

## Current Memory Scoping Contract

**Summary:**

The current memory scoping system uses a **brittle substring matching strategy** (`conversationId.includes(projectId)`) to determine which memories belong to a project. This approach has no validation, no parsing, and makes unsafe assumptions about conversationId structure. Additionally, **two critical call sites pass `projectName` instead of `projectId`**, causing memory retrieval to fail silently in multi-agent scenarios. The system does not leverage the existing `parseConversationId` utility for safe, structured parsing, instead relying on error-prone string inclusion checks that can produce false positives (matching wrong projects) or false negatives (missing correct projects). The contract is **implicit and unreliable**, with no guarantees about correctness when project IDs contain hyphens, are substrings of other IDs, or when project names are mistakenly used instead of IDs.

---

## Files Referenced

- `server/storage.ts` - Memory storage and retrieval implementation
- `server/routes.ts` - API routes and WebSocket handlers
- `shared/conversationId.ts` - Canonical parsing utility (not used by memory scoping)

---

## Next Steps (Analysis Only - No Implementation)

1. **Replace `includes()` with `parseConversationId()`** in `getProjectMemory`
2. **Fix `projectName` → `projectId` bug** in `handleMultiAgentResponse` call sites
3. **Add validation** to ensure `conversationId` belongs to the specified `projectId`
4. **Consider scope-aware memory retrieval** (project vs team vs agent scoping)

---

**Report Generated:** Investigation-only analysis  
**Code Changes:** None  
**Status:** Ready for Phase 0.1.c.2 (Safe Fix Implementation)

