/**
 * Canonical Conversation ID Contract
 * 
 * Shared utility for building and parsing conversation IDs used across client and server.
 * 
 * Formats (must remain identical):
 * - Project: project-{projectId}
 * - Team: team-{projectId}-{teamId}
 * - Agent: agent-{projectId}-{agentId}
 */

export type ConversationScope = "project" | "team" | "agent";

export interface ParsedConversationId {
  scope: ConversationScope;
  projectId: string;
  contextId?: string; // teamId for team scope, agentId for agent scope
  raw: string;
}

/**
 * Builds a conversation ID using the canonical format.
 * 
 * @param scope - The conversation scope (project, team, or agent)
 * @param projectId - The project identifier (required)
 * @param contextId - The team or agent identifier (required for team/agent scope)
 * @returns The conversation ID string
 * @throws Error if inputs are invalid
 */
export function buildConversationId(
  scope: ConversationScope,
  projectId: string,
  contextId?: string
): string {
  if (!projectId || projectId.trim() === '') {
    throw new Error('projectId is required and cannot be empty');
  }

  switch (scope) {
    case 'project':
      if (contextId !== undefined) {
        throw new Error('project scope must not accept contextId');
      }
      return `project-${projectId}`;
    
    case 'team':
      if (!contextId || contextId.trim() === '') {
        throw new Error('contextId (teamId) is required for team conversation ID');
      }
      return `team-${projectId}-${contextId}`;
    
    case 'agent':
      if (!contextId || contextId.trim() === '') {
        throw new Error('contextId (agentId) is required for agent conversation ID');
      }
      return `agent-${projectId}-${contextId}`;
    
    default:
      // TypeScript exhaustive check
      const _exhaustive: never = scope;
      throw new Error(`Unknown conversation scope: ${_exhaustive}`);
  }
}

/**
 * Parses a conversation ID string into its components.
 * 
 * IMPORTANT: This parser handles the current format but has limitations:
 * - Project IDs parse reliably (everything after "project-")
 * - Team/Agent IDs may be ambiguous if projectId or contextId contain hyphens
 * 
 * For team/agent IDs, parsing is only deterministic if:
 * - The projectId is known (can be provided as a hint)
 * - Or the format is unambiguous (e.g., single-word projectId)
 * 
 * @param conversationId - The conversation ID string to parse
 * @param knownProjectId - Optional: if provided, used to disambiguate team/agent IDs
 * @returns Parsed conversation ID components
 * @throws Error if the format is invalid or ambiguous
 */
export function parseConversationId(
  conversationId: string,
  knownProjectId?: string
): ParsedConversationId {
  if (!conversationId || conversationId.trim() === '') {
    throw new Error('conversationId cannot be empty');
  }

  const trimmed = conversationId.trim();
  
  // Must start with a valid scope prefix
  if (!trimmed.startsWith('project-') && 
      !trimmed.startsWith('team-') && 
      !trimmed.startsWith('agent-')) {
    throw new Error(
      `Invalid conversation ID format: must start with "project-", "team-", or "agent-". Got: "${trimmed}"`
    );
  }

  // Parse project scope (most reliable - everything after "project-")
  if (trimmed.startsWith('project-')) {
    const projectId = trimmed.slice('project-'.length);
    if (!projectId || projectId.trim() === '') {
      throw new Error('Invalid project conversation ID: projectId is empty after "project-" prefix');
    }
    return {
      scope: 'project',
      projectId: projectId,
      raw: trimmed
    };
  }

  // Parse team/agent scope (may be ambiguous)
  const parts = trimmed.split('-');
  if (parts.length < 3) {
    throw new Error(
      `Invalid ${parts[0]} conversation ID: must have at least 3 parts (scope-projectId-contextId). Got: "${trimmed}"`
    );
  }

  const scope = parts[0] as ConversationScope;
  if (scope !== 'team' && scope !== 'agent') {
    throw new Error(`Invalid conversation scope: expected "team" or "agent", got "${scope}"`);
  }

  // Remove the scope prefix
  const afterScope = trimmed.slice(scope.length + 1); // +1 for the hyphen

  // If we have a known projectId, use it to disambiguate
  if (knownProjectId) {
    const projectIdPrefix = `${knownProjectId}-`;
    if (afterScope.startsWith(projectIdPrefix)) {
      const contextId = afterScope.slice(projectIdPrefix.length);
      if (!contextId || contextId.trim() === '') {
        throw new Error(
          `Invalid ${scope} conversation ID: contextId is empty after known projectId "${knownProjectId}"`
        );
      }
      return {
        scope,
        projectId: knownProjectId,
        contextId,
        raw: trimmed
      };
    } else {
      throw new Error(
        `Conversation ID does not match known projectId. Expected projectId "${knownProjectId}", but ID "${trimmed}" does not start with "${scope}-${knownProjectId}-"`
      );
    }
  }

  // Without known projectId, attempt best-effort parse
  // This only works if projectId is unambiguous (single word, no hyphens)
  // For multi-hyphen projectIds, this will be ambiguous
  
  // Strategy: Try to parse assuming projectId is the first segment after scope
  // This works for simple cases like "team-saas-design" where projectId="saas", teamId="design"
  // But fails for "team-saas-startup-design" where we can't tell if:
  //   - projectId="saas", teamId="startup-design" OR
  //   - projectId="saas-startup", teamId="design"
  
  if (parts.length === 3) {
    // Unambiguous: exactly 3 parts means single-word projectId and single-word contextId
    // e.g., "team-saas-design" => projectId="saas", teamId="design"
    return {
      scope,
      projectId: parts[1],
      contextId: parts[2],
      raw: trimmed
    };
  }

  // Ambiguous case: more than 3 parts
  // We cannot deterministically parse without additional context
  throw new Error(
    `Ambiguous conversation ID: cannot safely parse "${trimmed}" without additional context. ` +
    `The ID has ${parts.length} parts, making it impossible to determine where projectId ends and contextId begins. ` +
    `Please provide the known projectId as a parameter, or use a structured ID format with a delimiter. ` +
    `Example: parseConversationId("${trimmed}", "known-project-id")`
  );
}

