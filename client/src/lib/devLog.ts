/**
 * Dev-only instrumentation logger for UI audit
 * 
 * Invariant: Dev logs must never leak to production.
 * 
 * To enable logs in development:
 *   1. Run in dev mode (npm run dev)
 *   2. In browser console: window.HATCHIN_UI_AUDIT = true
 * 
 * This logger is tree-shaken in production builds (dead code elimination).
 */

// Kill switch: Only enable if in dev AND explicitly enabled via window flag
const UI_AUDIT_ENABLED = 
  (import.meta.env.DEV || import.meta.env.MODE === 'development') &&
  typeof window !== 'undefined' &&
  !!(window as any).HATCHIN_UI_AUDIT;

export function devLog(tag: string, payload?: Record<string, unknown>) {
  // NO-OP unless explicitly enabled (production-safe)
  if (!UI_AUDIT_ENABLED) {
    return;
  }

  // Format payload safely (don't log full user content)
  const safePayload = payload ? sanitizePayload(payload) : {};
  
  console.log(
    `%c[HATCHIN_UI_AUDIT] ${tag}`,
    'background: #6C82FF; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
    safePayload
  );
}

function sanitizePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(payload)) {
    // Don't log secrets/tokens
    const keyLower = key.toLowerCase();
    if (keyLower.includes('token') || keyLower.includes('secret') || keyLower.includes('password')) {
      sanitized[key] = '[REDACTED]';
      continue;
    }
    
    // Truncate long strings (like user messages)
    if (typeof value === 'string' && value.length > 100) {
      sanitized[key] = value.substring(0, 30) + `... (${value.length} chars)`;
      continue;
    }
    
    // Handle arrays - truncate if too long
    if (Array.isArray(value)) {
      if (value.length > 10) {
        sanitized[key] = `[Array(${value.length})] - showing first 10: ${JSON.stringify(value.slice(0, 10))}`;
      } else {
        sanitized[key] = value;
      }
      continue;
    }
    
    // Recursively sanitize nested objects (shallow recursion)
    if (value && typeof value === 'object' && !Array.isArray(value) && value !== null) {
      sanitized[key] = sanitizePayload(value as Record<string, unknown>);
      continue;
    }
    
    sanitized[key] = value;
  }
  
  return sanitized;
}

