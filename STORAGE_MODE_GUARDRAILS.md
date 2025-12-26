# Storage Mode Guardrails

## Current Storage Mode

**Mode**: `memory` (default)

**Durability**: **NON-DURABLE**

## What "Durable" Means

- **Durable storage**: Data persists across server restarts, crashes, and deployments
- **Non-durable storage**: Data exists only in memory and is lost when the server stops

## Current Implementation: Memory Mode

The system currently uses **in-memory Maps** (`MemStorage` class) for all data storage:

- `Map<string, User>` - User accounts
- `Map<string, Project>` - Projects
- `Map<string, Team>` - Teams
- `Map<string, Agent>` - AI agents
- `Map<string, Conversation>` - Conversations
- `Map<string, Message>` - Messages
- `Map<string, MessageReaction>` - Message reactions
- `Map<string, TypingIndicator>` - Typing indicators
- `Map<string, any[]>` - Conversation memories
- `Map<string, Task>` - Tasks

## What Is Lost on Restart (Memory Mode)

When the server restarts in memory mode, **all of the following are lost**:

1. **All conversations** - Every chat history is wiped
2. **All messages** - All user and AI messages are deleted
3. **All tasks** - All created tasks and task suggestions are lost
4. **All memories** - All extracted conversation memories are cleared
5. **All user data** - User accounts, preferences, and settings are reset
6. **All project data** - Projects, teams, and agents are reset to seed data only

**Exception**: Seed/demo data is re-initialized on each restart (see `MemStorage.initializeSampleData()`).

## Storage Mode Declaration

Storage mode is declared via:

1. **Environment Variable**: `STORAGE_MODE=memory` or `STORAGE_MODE=db`
2. **Default**: `memory` (if env var not set)
3. **Canonical Declaration**: `server/storage.ts` exports `STORAGE_MODE` constant

## Future Path: Phase 1

Phase 1 will implement `DBStorage` class that:

- Uses PostgreSQL/Neon database via Drizzle ORM
- Implements the same `IStorage` interface as `MemStorage`
- Provides durable storage across restarts
- Migrates data from memory to database (if needed)

When `DBStorage` is implemented:
- Setting `STORAGE_MODE=db` will use database storage
- Data will persist across restarts
- The system will be production-ready for data durability

## Current Status Endpoint

**GET** `/api/system/storage-status`

Returns:
```json
{
  "mode": "memory",
  "durable": false,
  "notes": "In-memory Maps. Data resets on restart."
}
```

## Startup Banner

On server boot, a banner is logged showing:
- Current storage mode
- Durability status
- Warnings if DB mode is requested but not implemented
- Notes about data persistence

Example output:
```
======================================================================
  STORAGE MODE: MEMORY
  ⚠️  NON-DURABLE: Restart will wipe conversations/tasks/memory.
  Notes: In-memory Maps. Data resets on restart.
======================================================================
```

## Guardrails

- **No behavior changes**: Storage mode declaration does not change how data is stored or retrieved
- **No migrations**: No database migrations are run in memory mode
- **No schema changes**: Database schema exists but is not used in memory mode
- **Explicit truth**: Storage mode is now inspectable and explicit, not implicit

## Testing

To verify storage mode:
1. Check startup banner log
2. Call `GET /api/system/storage-status`
3. Verify `mode` and `durable` fields match expected values

---

**Last Updated**: 2025-12-26  
**Phase**: 0.6.a - Storage Mode Declaration

