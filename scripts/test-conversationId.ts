/**
 * Test harness for conversationId utility
 * Run with: npx tsx scripts/test-conversationId.ts
 */

import { buildConversationId, parseConversationId, type ConversationScope } from '../shared/conversationId';

interface TestCase {
  name: string;
  test: () => boolean | string; // Returns true if pass, error message if fail
}

const testCases: TestCase[] = [
  // Build tests
  {
    name: 'buildConversationId: project scope',
    test: () => {
      const result = buildConversationId('project', 'saas-startup');
      return result === 'project-saas-startup' || `Expected "project-saas-startup", got "${result}"`;
    }
  },
  {
    name: 'buildConversationId: team scope',
    test: () => {
      const result = buildConversationId('team', 'saas-startup', 'design-team');
      return result === 'team-saas-startup-design-team' || `Expected "team-saas-startup-design-team", got "${result}"`;
    }
  },
  {
    name: 'buildConversationId: agent scope',
    test: () => {
      const result = buildConversationId('agent', 'saas-startup', 'product-manager');
      return result === 'agent-saas-startup-product-manager' || `Expected "agent-saas-startup-product-manager", got "${result}"`;
    }
  },
  {
    name: 'buildConversationId: project scope rejects contextId',
    test: () => {
      try {
        buildConversationId('project', 'saas-startup', 'should-fail');
        return 'Should have thrown error for project scope with contextId';
      } catch (error: any) {
        return error.message.includes('must not accept contextId') || `Wrong error: ${error.message}`;
      }
    }
  },
  {
    name: 'buildConversationId: team scope requires contextId',
    test: () => {
      try {
        buildConversationId('team', 'saas-startup');
        return 'Should have thrown error for team scope without contextId';
      } catch (error: any) {
        return error.message.includes('required') || `Wrong error: ${error.message}`;
      }
    }
  },
  {
    name: 'buildConversationId: agent scope requires contextId',
    test: () => {
      try {
        buildConversationId('agent', 'saas-startup');
        return 'Should have thrown error for agent scope without contextId';
      } catch (error: any) {
        return error.message.includes('required') || `Wrong error: ${error.message}`;
      }
    }
  },

  // Parse tests - Project (reliable)
  {
    name: 'parseConversationId: project-saas-startup',
    test: () => {
      const parsed = parseConversationId('project-saas-startup');
      return (parsed.scope === 'project' && 
              parsed.projectId === 'saas-startup' && 
              parsed.contextId === undefined &&
              parsed.raw === 'project-saas-startup') || 
             `Failed: ${JSON.stringify(parsed)}`;
    }
  },
  {
    name: 'parseConversationId: project with multi-hyphen ID',
    test: () => {
      const parsed = parseConversationId('project-saas-startup-2024');
      return (parsed.scope === 'project' && 
              parsed.projectId === 'saas-startup-2024') || 
             `Failed: ${JSON.stringify(parsed)}`;
    }
  },

  // Parse tests - Team/Agent (unambiguous cases)
  {
    name: 'parseConversationId: team with 3 parts (unambiguous)',
    test: () => {
      const parsed = parseConversationId('team-saas-design');
      return (parsed.scope === 'team' && 
              parsed.projectId === 'saas' && 
              parsed.contextId === 'design') || 
             `Failed: ${JSON.stringify(parsed)}`;
    }
  },
  {
    name: 'parseConversationId: agent with 3 parts (unambiguous)',
    test: () => {
      const parsed = parseConversationId('agent-saas-pm');
      return (parsed.scope === 'agent' && 
              parsed.projectId === 'saas' && 
              parsed.contextId === 'pm') || 
             `Failed: ${JSON.stringify(parsed)}`;
    }
  },

  // Parse tests - Team/Agent with known projectId (disambiguated)
  {
    name: 'parseConversationId: team with known projectId',
    test: () => {
      const parsed = parseConversationId('team-saas-startup-design-team', 'saas-startup');
      return (parsed.scope === 'team' && 
              parsed.projectId === 'saas-startup' && 
              parsed.contextId === 'design-team') || 
             `Failed: ${JSON.stringify(parsed)}`;
    }
  },
  {
    name: 'parseConversationId: agent with known projectId',
    test: () => {
      const parsed = parseConversationId('agent-saas-startup-product-manager', 'saas-startup');
      return (parsed.scope === 'agent' && 
              parsed.projectId === 'saas-startup' && 
              parsed.contextId === 'product-manager') || 
             `Failed: ${JSON.stringify(parsed)}`;
    }
  },

  // Parse tests - Ambiguous cases (should throw)
  {
    name: 'parseConversationId: ambiguous team ID throws error',
    test: () => {
      try {
        parseConversationId('team-saas-startup-design-team');
        return 'Should have thrown error for ambiguous ID';
      } catch (error: any) {
        return error.message.includes('Ambiguous') || `Wrong error: ${error.message}`;
      }
    }
  },
  {
    name: 'parseConversationId: ambiguous agent ID throws error',
    test: () => {
      try {
        parseConversationId('agent-saas-startup-product-manager');
        return 'Should have thrown error for ambiguous ID';
      } catch (error: any) {
        return error.message.includes('Ambiguous') || `Wrong error: ${error.message}`;
      }
    }
  },

  // Parse tests - Invalid formats (should throw)
  {
    name: 'parseConversationId: "project" (missing projectId)',
    test: () => {
      try {
        parseConversationId('project');
        return 'Should have thrown error for missing projectId';
      } catch (error: any) {
        return (error.message.includes('empty') || 
                error.message.includes('must start with') ||
                error.message.includes('Invalid')) || 
               `Wrong error: ${error.message}`;
      }
    }
  },
  {
    name: 'parseConversationId: "team-" (missing IDs)',
    test: () => {
      try {
        parseConversationId('team-');
        return 'Should have thrown error for missing IDs';
      } catch (error: any) {
        return error.message.includes('at least 3 parts') || `Wrong error: ${error.message}`;
      }
    }
  },
  {
    name: 'parseConversationId: "agent-x" (missing contextId)',
    test: () => {
      try {
        parseConversationId('agent-x');
        return 'Should have thrown error for missing contextId';
      } catch (error: any) {
        return error.message.includes('at least 3 parts') || `Wrong error: ${error.message}`;
      }
    }
  },
  {
    name: 'parseConversationId: "foo-bar" (invalid scope)',
    test: () => {
      try {
        parseConversationId('foo-bar');
        return 'Should have thrown error for invalid scope';
      } catch (error: any) {
        return error.message.includes('must start with') || `Wrong error: ${error.message}`;
      }
    }
  },
  {
    name: 'parseConversationId: empty string',
    test: () => {
      try {
        parseConversationId('');
        return 'Should have thrown error for empty string';
      } catch (error: any) {
        return error.message.includes('cannot be empty') || `Wrong error: ${error.message}`;
      }
    }
  },

  // Round-trip tests
  {
    name: 'Round-trip: build then parse project',
    test: () => {
      const built = buildConversationId('project', 'saas-startup');
      const parsed = parseConversationId(built);
      return (parsed.scope === 'project' && 
              parsed.projectId === 'saas-startup') || 
             `Round-trip failed: ${JSON.stringify(parsed)}`;
    }
  },
  {
    name: 'Round-trip: build then parse team (unambiguous)',
    test: () => {
      const built = buildConversationId('team', 'saas', 'design');
      const parsed = parseConversationId(built);
      return (parsed.scope === 'team' && 
              parsed.projectId === 'saas' && 
              parsed.contextId === 'design') || 
             `Round-trip failed: ${JSON.stringify(parsed)}`;
    }
  },
  {
    name: 'Round-trip: build then parse agent (unambiguous)',
    test: () => {
      const built = buildConversationId('agent', 'saas', 'pm');
      const parsed = parseConversationId(built);
      return (parsed.scope === 'agent' && 
              parsed.projectId === 'saas' && 
              parsed.contextId === 'pm') || 
             `Round-trip failed: ${JSON.stringify(parsed)}`;
    }
  },
  {
    name: 'Round-trip: build then parse team with known projectId',
    test: () => {
      const built = buildConversationId('team', 'saas-startup', 'design-team');
      const parsed = parseConversationId(built, 'saas-startup');
      return (parsed.scope === 'team' && 
              parsed.projectId === 'saas-startup' && 
              parsed.contextId === 'design-team') || 
             `Round-trip failed: ${JSON.stringify(parsed)}`;
    }
  }
];

// Run tests
console.log('🧪 Conversation ID Utility Test Suite\n');

let passed = 0;
let failed = 0;
const failures: string[] = [];

testCases.forEach((testCase, index) => {
  try {
    const result = testCase.test();
    if (result === true) {
      passed++;
      console.log(`✅ Test ${index + 1}: ${testCase.name}`);
    } else {
      failed++;
      failures.push(testCase.name);
      console.log(`❌ Test ${index + 1}: ${testCase.name}`);
      console.log(`   ${result}`);
    }
  } catch (error: any) {
    failed++;
    failures.push(testCase.name);
    console.log(`❌ Test ${index + 1}: ${testCase.name}`);
    console.log(`   Error: ${error.message}`);
  }
});

console.log(`\n📊 Test Results:`);
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   Total: ${testCases.length}`);

if (failures.length > 0) {
  console.log(`\n❌ Failed Tests:`);
  failures.forEach(f => console.log(`   - ${f}`));
  process.exit(1);
} else {
  console.log(`\n🎉 All tests passed!`);
  process.exit(0);
}

