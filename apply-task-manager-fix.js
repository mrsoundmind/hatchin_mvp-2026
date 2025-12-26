#!/usr/bin/env node

/**
 * Apply TaskManager Fix Script
 * 
 * This script applies the bug fix for the section ID mismatch in TaskManager.tsx
 */

import fs from 'fs';

const TASK_MANAGER_PATH = './client/src/components/TaskManager.tsx';

function applyFix() {
  try {
    console.log('🔧 Applying TaskManager section ID fix...');
    
    // Read the current file
    const content = fs.readFileSync(TASK_MANAGER_PATH, 'utf8');
    
    // Apply the fix: change 'tasks' to 'team-tasks'
    const fixedContent = content.replace(
      "} else if (section.id === 'tasks') {",
      "} else if (section.id === 'team-tasks') {"
    );
    
    // Check if the fix was applied
    if (fixedContent === content) {
      console.log('⚠️  No changes needed - fix may already be applied');
      return false;
    }
    
    // Write the fixed content back
    fs.writeFileSync(TASK_MANAGER_PATH, fixedContent);
    
    console.log('✅ TaskManager fix applied successfully!');
    console.log('   Changed: section.id === \'tasks\'');
    console.log('   To:      section.id === \'team-tasks\'');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error applying fix:', error.message);
    return false;
  }
}

// Run the fix
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = applyFix();
  process.exit(success ? 0 : 1);
}

export { applyFix };
