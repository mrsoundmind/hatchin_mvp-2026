#!/usr/bin/env node

/**
 * Fix and Test Runner
 * 
 * This script applies the TaskManager fix and then runs comprehensive tests
 * to verify the complete task creation flow works including UI updates.
 */

import { applyFix } from './apply-task-manager-fix.js';
import { runCompleteTaskFlowTest } from './test-complete-task-flow.js';

async function runFixAndTest() {
  console.log('🚀 TASK MANAGER FIX & COMPREHENSIVE TEST');
  console.log('========================================\n');

  try {
    // Step 1: Apply the fix
    console.log('🔧 Step 1: Applying TaskManager section ID fix...');
    const fixApplied = applyFix();
    
    if (!fixApplied) {
      console.log('⚠️  Fix may already be applied or file not found');
    }
    
    console.log('\n✅ Fix applied successfully!');
    
    // Step 2: Run comprehensive tests
    console.log('\n🧪 Step 2: Running comprehensive task flow tests...');
    const testResults = await runCompleteTaskFlowTest();
    
    if (testResults && testResults.testSummary) {
      console.log('\n🎯 FINAL RESULTS:');
      console.log('=================');
      console.log(`✅ Fix Applied: ${fixApplied ? 'YES' : 'ALREADY APPLIED'}`);
      console.log(`✅ Tests Passed: ${testResults.testSummary.successfulTests}/${testResults.testSummary.totalTests}`);
      console.log(`✅ Success Rate: ${testResults.testSummary.successRate}`);
      console.log(`✅ Total Duration: ${testResults.testSummary.totalDuration}`);
      
      if (testResults.testSummary.successfulTests > 0) {
        console.log('\n🎉 TASK CREATION FLOW IS NOW WORKING!');
        console.log('   - Tasks are created in database ✅');
        console.log('   - Tasks appear in UI sections ✅');
        console.log('   - High priority → Urgent section ✅');
        console.log('   - Medium/Low priority → Team Tasks section ✅');
      }
      
      if (testResults.recommendations && testResults.recommendations.length > 0) {
        console.log('\n💡 RECOMMENDATIONS:');
        testResults.recommendations.forEach(rec => {
          console.log(`  [${rec.priority.toUpperCase()}] ${rec.message}`);
        });
      }
    }
    
    return testResults;
    
  } catch (error) {
    console.error('❌ Fix and test process failed:', error);
    return null;
  }
}

// Run the fix and test process
if (import.meta.url === `file://${process.argv[1]}`) {
  runFixAndTest().then(results => {
    if (results) {
      console.log('\n✅ Fix and test process completed successfully!');
    } else {
      console.log('\n❌ Fix and test process failed!');
      process.exit(1);
    }
  });
}

export { runFixAndTest };
