# Bug Changes Reports

This directory contains all reports documenting bug fixes, investigations, and related changes made to the Hatchin codebase.

## 📋 Index of Reports

### Conversation ID Related Fixes

1. **[Conversation ID Contract Report](./CONVERSATION_ID_CONTRACT_REPORT.md)**
   - **Date**: Created during Phase 0.1.c
   - **Purpose**: Analysis of conversation ID lifecycle and contract compliance
   - **Status**: Investigation report
   - **Key Findings**: Documented formats, generation points, parsing sites, and risks

2. **[Handler Parsing Replacement Report](./HANDLER_PARSING_REPLACEMENT_REPORT.md)**
   - **Date**: Created during Phase 0.1.b
   - **Purpose**: Replaced brittle `conversationId.split('-')` logic with safe parsing utility
   - **Status**: ✅ Successfully implemented
   - **Files Changed**: `server/routes.ts`
   - **Key Changes**: Integrated `parseConversationId` utility in `handleStreamingColleagueResponse`

### Memory Scoping Fixes

3. **[Memory Scoping Investigation Report](./MEMORY_SCOPING_INVESTIGATION_REPORT.md)**
   - **Date**: Created during Phase 0.1.c.1
   - **Purpose**: Investigation of current memory scoping behavior
   - **Status**: Analysis report
   - **Key Findings**: Identified `conversationId.includes(projectId)` as high-risk, found `projectName` vs `projectId` mismatch bugs

4. **[Memory Scoping Fix Report](./MEMORY_SCOPING_FIX_REPORT.md)**
   - **Date**: Created during Phase 0.1.c.2
   - **Purpose**: Fixed `getProjectMemory` to use contract-based parsing
   - **Status**: ✅ Successfully implemented
   - **Files Changed**: `server/storage.ts`
   - **Key Changes**: Replaced substring matching with `parseConversationId`, added prefix validation

5. **[Shared Memory ProjectId Fix Report](./SHARED_MEMORY_PROJECTID_FIX_REPORT.md)**
   - **Date**: Created during Phase 0.1.c.3
   - **Purpose**: Fixed `getSharedMemoryForAgent` calls using `projectName` instead of `projectId`
   - **Status**: ✅ Successfully implemented
   - **Files Changed**: `server/routes.ts`
   - **Key Changes**: Replaced `chatContext.projectName` with parsed `projectId` from `conversationId`, added safe degradation

### WebSocket Fixes

5. **[WebSocket URL Fix Report](./WEBSOCKET_URL_FIX_REPORT.md)**
   - **Date**: Created during WebSocket debugging
   - **Purpose**: Fixed WebSocket URL construction to prevent `:undefined` port
   - **Status**: ✅ Successfully implemented
   - **Files Changed**: `client/src/lib/websocket.ts`
   - **Key Changes**: Safe port handling, fallback logic, dev-only diagnostic logs

6. **[WebSocket Stability Fix Report](./WEBSOCKET_STABILITY_FIX_REPORT.md)**
   - **Date**: Created during WebSocket debugging
   - **Purpose**: Fixed early WebSocket initialization instability
   - **Status**: ✅ Successfully implemented
   - **Files Changed**: `client/src/components/CenterPanel.tsx`
   - **Key Changes**: Used `useMemo` to stabilize WebSocket URL computation

7. **[Phase 0 Foundation Stress Audit Report](./PHASE_0_FOUNDATION_STRESS_AUDIT.md)**
   - **Date**: 2025-12-26
   - **Purpose**: Comprehensive read-only stress audit of all Phase 0 foundational fixes
   - **Status**: ✅ Audit complete
   - **Key Findings**: All critical fixes verified, 3 non-critical migration recommendations
   - **Recommendation**: **SAFE TO PROCEED TO NEXT PHASE**

8. **[Storage Mode Declaration Report](./STORAGE_MODE_DECLARATION_REPORT.md)**
   - **Date**: 2025-12-26
   - **Purpose**: Phase 0.6.a - Make storage durability truth explicit and inspectable
   - **Status**: ✅ Successfully implemented
   - **Files Changed**: `server/storage.ts`, `server/index.ts`, `server/routes.ts`
   - **Key Changes**: Added storage mode declaration, startup banner, status endpoint

### Phase 1 Behavioral Contracts

9. **[Phase 1 Behavioral Contracts Audit Report](./PHASE_1_BEHAVIORAL_CONTRACTS_AUDIT.md)**
   - **Date**: 2025-12-26
   - **Purpose**: Comprehensive read-only audit against Phase 1 Behavioral Contracts
   - **Status**: ⚠️ Audit complete - 3 critical gaps identified
   - **Key Findings**: PM authority not enforced, agents speak without delegation, momentum not maintained
   - **Recommendation**: **PROCEED WITH FIXES** (3 critical, 4 medium risks)

10. **[Phase 1.0 Team Lead Resolution Report](./PHASE_1_0_TEAM_LEAD_RESOLUTION_REPORT.md)**
    - **Date**: 2025-12-26
    - **Purpose**: Phase 1.0 - Implement deterministic Team Lead resolution mechanism
    - **Status**: ✅ Successfully implemented
    - **Files Created**: `server/orchestration/resolveTeamLead.ts`, `scripts/test-resolve-team-lead.ts`, `scripts/stress-test-resolve-team-lead.ts`
    - **Key Changes**: Deterministic Team Lead resolution with explicit lead, role priority, PM exclusion, and fallback rules
    - **Test Results**: 25/25 tests passed (10 unit + 15 stress tests)

11. **[Phase 1.1.a Speaking Authority Resolution Report](./PHASE_1_1_A_SPEAKING_AUTHORITY_RESOLUTION_REPORT.md)**
    - **Date**: 2025-12-26
    - **Purpose**: Phase 1.1.a - Implement deterministic speaking authority resolution mechanism
    - **Status**: ✅ Successfully implemented (not yet integrated)
    - **Files Created**: `server/orchestration/resolveSpeakingAuthority.ts`, `scripts/test-resolve-speaking-authority.ts`, `scripts/stress-test-resolve-speaking-authority.ts`
    - **Key Changes**: Deterministic speaking authority resolution with explicit addressing, direct agent, project PM, team lead, and fallback rules
    - **Test Results**: 23/23 tests passed (11 unit + 12 stress tests)
    - **Integration Status**: ❌ Not yet integrated (ready for Phase 1.1.b)

12. **[Phase 1.1.b Speaking Authority Enforcement Report](./PHASE_1_1_B_SPEAKING_AUTHORITY_ENFORCEMENT_REPORT.md)**
    - **Date**: 2025-12-26
    - **Purpose**: Phase 1.1.b - Integrate speaking authority resolution into backend handlers
    - **Status**: ✅ Successfully implemented and integrated
    - **Files Modified**: `server/routes.ts`
    - **Files Created**: `scripts/stress-test-speaking-authority-enforcement.ts`
    - **Key Changes**: Integrated `resolveSpeakingAuthority` into `handleStreamingColleagueResponse`, enforced authority before agent selection
    - **Test Results**: 9/9 stress tests passed
    - **Integration Status**: ✅ **FULLY INTEGRATED** (orchestration utilities active in handlers)

13. **[Phase 1.1.c Step 1 Project Conversation Bootstrap Report](./PHASE_1_1_C_STEP1_PROJECT_CONVERSATION_BOOTSTRAP_REPORT.md)**
    - **Date**: 2025-12-26
    - **Purpose**: Phase 1.1.c Step 1 - Ensure every project has a canonical project conversation from creation
    - **Status**: ✅ Successfully implemented
    - **Files Modified**: `server/routes.ts`, `server/storage.ts`
    - **Files Created**: `scripts/stress-test-project-conversation-bootstrap.ts`
    - **Key Changes**: Automatic conversation creation on project creation with ID `project-{projectId}`, idempotent creation, ready to accept messages
    - **Test Results**: 7/7 stress tests passed
    - **Key Achievement**: Users can now send first message immediately without requiring teams/hatches

14. **[Phase 1.2.a Persistence Invariant Enforcement Report](./PHASE_1_2_A_PERSISTENCE_INVARIANT_ENFORCEMENT_REPORT.md)**
    - **Date**: 2025-12-26
    - **Purpose**: Phase 1.2.a - Enforce that agent messages are always persisted, regardless of agent availability
    - **Status**: ✅ Successfully implemented
    - **Files Modified**: `server/routes.ts`
    - **Files Created**: `scripts/stress-test-persistence-invariant.ts`
    - **Key Changes**: Removed early return that prevented agent message persistence, added graceful fallback for no-agents scenario, ensured symmetric persistence
    - **Test Results**: 7/7 stress tests passed
    - **Key Achievement**: Agent messages now always persist, even when no agents are available (symmetric persistence enforced)

15. **[Phase 1.2.a PM Maya Fallback Report](./PHASE_1_2_A_PM_MAYA_FALLBACK_REPORT.md)**
    - **Date**: 2025-12-26
    - **Purpose**: Phase 1.2.a - Remove "System Agent" fallback and use PM Maya fallback instead
    - **Status**: ✅ Successfully implemented
    - **Files Modified**: `server/routes.ts`
    - **Files Created**: `scripts/stress-test-no-system-agent-fallback.ts`
    - **Key Changes**: Removed fake "System" agent creation, added PM fallback helper function, scope-specific fallback messages, system fallback only as last resort with explicit metadata flag
    - **Test Results**: 5/5 stress tests passed
    - **Key Achievement**: No "System" agent used when PM is available; all fallback messages attributed to real PM agent

16. **[Phase 1.2.b Canonical Conversation Bootstrap Report](./PHASE_1_2_B_CONVERSATION_BOOTSTRAP_REPORT.md)**
    - **Date**: 2025-12-26
    - **Purpose**: Phase 1.2.b - Ensure canonical conversations exist for all scopes (team, agent) before messages are saved
    - **Status**: ✅ Successfully implemented
    - **Files Modified**: `server/routes.ts`, `server/storage.ts`
    - **Files Created**: `scripts/stress-test-conversation-bootstrap.ts`
    - **Key Changes**: Added `ensureConversationExists` helper, conversation bootstrap for team/agent scopes, idempotent conversation creation, canonical ID enforcement
    - **Test Results**: 7/7 stress tests passed
    - **Key Achievement**: All scopes now have conversations before messages; Phase 1 foundation complete and sealed

17. **[Phase 1.2.c UI Instrumentation Report](./PHASE_1_2_C_UI_INSTRUMENTATION_REPORT.md)**
    - **Date**: 2025-12-26
    - **Purpose**: Phase 1.2.c - Add dev-only instrumentation logs to diagnose UI routing issues
    - **Status**: ✅ Successfully implemented
    - **Files Modified**: `client/src/pages/home.tsx`, `client/src/components/CenterPanel.tsx`, `client/src/lib/websocket.ts`
    - **Files Created**: `client/src/lib/devLog.ts`
    - **Key Changes**: Dev logger utility with payload sanitization, selection state logs, project creation logs, chat context logs, send blocking logs, WebSocket logs
    - **Build Status**: ✅ Success
    - **Key Achievement**: Comprehensive instrumentation to diagnose why "Start with an idea" projects route to wrong scope and why send is blocked

18. **[Phase 1.3 UI Routing Fix Report](./PHASE_1_3_UI_ROUTING_FIX_REPORT.md)**
    - **Date**: 2025-12-26
    - **Purpose**: Phase 1.3 - Fix UI routing so "Start with an idea" projects land in PROJECT scope by default
    - **Status**: ✅ Successfully implemented
    - **Files Modified**: `client/src/pages/home.tsx`
    - **Files Created**: `scripts/stress-test-ui-routing-fix.ts`
    - **Key Changes**: Fixed `handleEggHatchingComplete` to set `activeAgentId = null` instead of `mayaAgent.id`, enforcing project scope invariant
    - **Test Results**: 8/8 stress tests passed
    - **Key Achievement**: Core invariant enforced - newly created projects land in project scope by default, agent presence does not hijack scope

19. **[Phase 1.4 Invariant Hardening Report](./PHASE_1_4_INVARIANT_HARDENING_REPORT.md)**
    - **Date**: 2025-12-26
    - **Purpose**: Phase 1.4 - Seal Phase 1 so it cannot regress (invariant hardening + removal/locking of transitional crutches)
    - **Status**: ✅ Successfully implemented
    - **Files Modified**: `client/src/lib/devLog.ts`, `client/src/pages/home.tsx`, `server/routes.ts`
    - **Files Created**: `docs/invariants/phase1.md`, `scripts/test-phase1-invariants.ts`
    - **Key Changes**: Invariants documented, dev logs kill switch, regression guards, explicit fallback classification, comprehensive regression tests
    - **Test Results**: 11/11 regression tests passed
    - **Key Achievement**: Phase 1 sealed and protected against future regressions

20. **[Phase 1.2 WS Error Handling Report](./PHASE_1_2_WS_ERROR_HANDLING_REPORT.md)**
    - **Date**: 2025-12-26
    - **Purpose**: Phase 1.2 - Apply production-safe error handling at WebSocket ingress boundary
    - **Status**: ✅ Successfully implemented
    - **Files Modified**: `server/routes.ts`
    - **Files Created**: `scripts/test-ws-error-handling.ts`, `scripts/stress-test-ws-error-handling.ts`
    - **Key Changes**: Environment helpers, sendWsError helper, production-safe envelope validation, production-safe invariant assertions, catch-all protection
    - **Test Results**: 18/18 tests passed (6 error handling + 12 stress)
    - **Key Achievement**: Production resilience without sacrificing development feedback

---

## 📝 Report Naming Convention

For future bug fix reports, please follow this naming convention:

**Format**: `[CATEGORY]_[BRIEF_DESCRIPTION]_REPORT.md`

**Examples**:
- `MEMORY_SCOPING_FIX_REPORT.md` ✅
- `WEBSOCKET_URL_FIX_REPORT.md` ✅
- `CONVERSATION_ID_INVESTIGATION_REPORT.md` ✅

**Categories**:
- `CONVERSATION_ID` - Conversation ID related fixes
- `MEMORY` - Memory system fixes
- `WEBSOCKET` - WebSocket related fixes
- `STORAGE` - Storage/database fixes
- `UI` - Frontend/UI fixes
- `API` - API/backend fixes

---

## 🔍 How to Use This Directory

1. **Before fixing a bug**: Create an investigation report if needed
2. **After fixing a bug**: Create a fix report documenting:
   - What was changed
   - Why it was changed
   - How it was tested
   - Any known limitations
3. **Update this README**: Add your new report to the index above

---

## 📊 Report Status Legend

- ✅ **Successfully implemented** - Fix is complete and tested
- 🔄 **In progress** - Fix is being worked on
- ⚠️ **Known limitations** - Fix works but has documented edge cases
- 📋 **Investigation** - Analysis only, no code changes

---

## 🗂️ Related Files

- Test scripts: `scripts/test-*.ts`
- Shared utilities: `shared/conversationId.ts`
- Implementation files: See individual reports for file paths

---

**Last Updated**: 2025-12-25

