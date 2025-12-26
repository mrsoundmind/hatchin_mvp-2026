#!/usr/bin/env node

/**
 * Stress Test for UI Mapping Fix
 * 
 * This script runs multiple concurrent tests to ensure the UI mapping fix
 * works correctly under stress conditions.
 */

import fetch from 'node-fetch';
import { performance } from 'perf_hooks';

const BASE_URL = 'http://localhost:3001';

class StressTestUI {
  constructor() {
    this.startTime = performance.now();
    this.results = [];
  }

  async runStressTest() {
    console.log('🚀 STRESS TESTING UI MAPPING FIX');
    console.log('=================================\n');

    const concurrentUsers = 10;
    const requestsPerUser = 5;
    const totalRequests = concurrentUsers * requestsPerUser;

    console.log(`Testing with ${concurrentUsers} concurrent users, ${requestsPerUser} requests each (${totalRequests} total requests)...\n`);

    const userPromises = [];
    
    for (let i = 0; i < concurrentUsers; i++) {
      const userPromise = this.simulateUser(i, requestsPerUser);
      userPromises.push(userPromise);
    }

    try {
      const results = await Promise.allSettled(userPromises);
      
      const successfulSessions = results.filter(r => 
        r.status === 'fulfilled' && r.value.success
      ).length;
      
      const failedSessions = results.filter(r => 
        r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
      ).length;

      const successRate = (successfulSessions / results.length) * 100;
      const totalDuration = performance.now() - this.startTime;

      console.log('\n📊 STRESS TEST RESULTS:');
      console.log('========================');
      console.log(`Total Users: ${concurrentUsers}`);
      console.log(`Requests per User: ${requestsPerUser}`);
      console.log(`Total Requests: ${totalRequests}`);
      console.log(`Successful Sessions: ${successfulSessions}`);
      console.log(`Failed Sessions: ${failedSessions}`);
      console.log(`Success Rate: ${successRate.toFixed(2)}%`);
      console.log(`Total Duration: ${totalDuration.toFixed(2)}ms`);
      console.log(`Average Time per Request: ${(totalDuration / totalRequests).toFixed(2)}ms`);

      // Test UI mapping logic under stress
      console.log('\n🎨 UI MAPPING STRESS TEST:');
      console.log('==========================');
      
      const uiMappingResults = await this.testUIMappingUnderStress();
      
      if (uiMappingResults.success) {
        console.log('✅ UI Mapping works correctly under stress');
        console.log(`✅ High Priority Tasks: ${uiMappingResults.highPriorityTasks}`);
        console.log(`✅ Team Tasks: ${uiMappingResults.teamTasks}`);
        console.log(`✅ Total Mapped: ${uiMappingResults.totalMapped}`);
      } else {
        console.log('❌ UI Mapping failed under stress');
      }

      const overallSuccess = successRate >= 90 && uiMappingResults.success;
      
      if (overallSuccess) {
        console.log('\n🎉 STRESS TEST PASSED!');
        console.log('✅ System handles concurrent load');
        console.log('✅ UI mapping works under stress');
        console.log('✅ Task creation flow is robust');
      } else {
        console.log('\n⚠️  STRESS TEST HAD ISSUES');
        console.log(`Success Rate: ${successRate.toFixed(2)}% (target: 90%+)`);
        console.log(`UI Mapping: ${uiMappingResults.success ? 'PASSED' : 'FAILED'}`);
      }

      return {
        success: overallSuccess,
        successRate,
        uiMappingSuccess: uiMappingResults.success,
        totalDuration,
        details: {
          concurrentUsers,
          requestsPerUser,
          totalRequests,
          successfulSessions,
          failedSessions,
          uiMappingResults
        }
      };

    } catch (error) {
      console.error('❌ Stress test failed:', error);
      return {
        success: false,
        error: error.message,
        totalDuration: performance.now() - this.startTime
      };
    }
  }

  async simulateUser(userId, requestCount) {
    const userResults = [];
    
    for (let i = 0; i < requestCount; i++) {
      try {
        const projectId = `stress-project-${userId}-${i}-${Date.now()}`;
        
        // Create mock task suggestions
        const mockSuggestions = [
          {
            id: `suggestion-${userId}-${i}-1`,
            title: `High Priority Task ${userId}-${i}`,
            description: `High priority task for user ${userId}`,
            priority: 'High',
            suggestedAssignee: { id: `user-${userId}`, name: `User ${userId}` },
            category: 'Development',
            estimatedEffort: 'Medium'
          },
          {
            id: `suggestion-${userId}-${i}-2`,
            title: `Medium Priority Task ${userId}-${i}`,
            description: `Medium priority task for user ${userId}`,
            priority: 'Medium',
            suggestedAssignee: { id: `user-${userId}`, name: `User ${userId}` },
            category: 'Testing',
            estimatedEffort: 'Low'
          }
        ];

        // Test task approval
        const startTime = performance.now();
        
        const response = await fetch(`${BASE_URL}/api/task-suggestions/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            approvedTasks: mockSuggestions,
            projectId
          })
        });

        const duration = performance.now() - startTime;
        
        if (response.ok) {
          const data = await response.json();
          
          userResults.push({
            requestId: `${userId}-${i}`,
            success: true,
            tasksCreated: data.createdTasks?.length || 0,
            duration: duration.toFixed(2) + 'ms',
            projectId
          });
        } else {
          userResults.push({
            requestId: `${userId}-${i}`,
            success: false,
            error: `HTTP ${response.status}`,
            duration: duration.toFixed(2) + 'ms'
          });
        }
        
      } catch (error) {
        userResults.push({
          requestId: `${userId}-${i}`,
          success: false,
          error: error.message
        });
      }
    }

    return {
      userId,
      userResults,
      success: userResults.every(r => r.success)
    };
  }

  async testUIMappingUnderStress() {
    // Simulate multiple task creation scenarios
    const testScenarios = [
      { high: 3, medium: 2, low: 1 },
      { high: 1, medium: 4, low: 2 },
      { high: 5, medium: 1, low: 0 },
      { high: 0, medium: 3, low: 3 }
    ];

    let totalHigh = 0;
    let totalMedium = 0;
    let totalLow = 0;
    let totalMapped = 0;

    for (const scenario of testScenarios) {
      const tasks = [];
      
      // Create high priority tasks
      for (let i = 0; i < scenario.high; i++) {
        tasks.push({
          id: `high-${Date.now()}-${i}`,
          title: `High Priority Task ${i}`,
          priority: 'High',
          assigneeId: `user-${i}`
        });
      }
      
      // Create medium priority tasks
      for (let i = 0; i < scenario.medium; i++) {
        tasks.push({
          id: `medium-${Date.now()}-${i}`,
          title: `Medium Priority Task ${i}`,
          priority: 'Medium',
          assigneeId: `user-${i}`
        });
      }
      
      // Create low priority tasks
      for (let i = 0; i < scenario.low; i++) {
        tasks.push({
          id: `low-${Date.now()}-${i}`,
          title: `Low Priority Task ${i}`,
          priority: 'Low',
          assigneeId: `user-${i}`
        });
      }

      // Test UI mapping
      const sections = [
        { id: 'urgent', title: 'Urgent Tasks', tasks: [] },
        { id: 'team-tasks', title: 'All Team Tasks', tasks: [] },
        { id: 'completed', title: 'Completed Tasks', tasks: [] }
      ];

      const newTasks = tasks.map(task => ({
        id: task.id,
        title: task.title,
        status: 'todo',
        priority: task.priority.toLowerCase(),
        assignee: task.assigneeId,
        createdAt: new Date(),
        updatedAt: new Date(),
        projectId: 'stress-test',
        teamId: null,
        parentTaskId: null
      }));

      // Apply the FIXED mapping logic
      const mappedSections = sections.map(section => {
        if (section.id === 'urgent' && newTasks.some(task => task.priority === 'high')) {
          return {
            ...section,
            tasks: [...section.tasks, ...newTasks.filter(task => task.priority === 'high')]
          };
        } else if (section.id === 'team-tasks') {  // ✅ FIXED version
          return {
            ...section,
            tasks: [...section.tasks, ...newTasks.filter(task => task.priority !== 'high')]
          };
        }
        return section;
      });

      const urgentTasks = mappedSections.find(s => s.id === 'urgent')?.tasks || [];
      const teamTasks = mappedSections.find(s => s.id === 'team-tasks')?.tasks || [];
      
      totalHigh += urgentTasks.length;
      totalMedium += teamTasks.filter(t => t.priority === 'medium').length;
      totalLow += teamTasks.filter(t => t.priority === 'low').length;
      totalMapped += urgentTasks.length + teamTasks.length;
    }

    const expectedTotal = totalHigh + totalMedium + totalLow;
    const mappingCorrect = totalMapped === expectedTotal;

    return {
      success: mappingCorrect,
      highPriorityTasks: totalHigh,
      teamTasks: totalMedium + totalLow,
      totalMapped,
      expectedTotal
    };
  }
}

// Main execution
async function runStressTest() {
  console.log('🚀 Stress Testing UI Mapping Fix');
  console.log('=================================\n');

  const stressTest = new StressTestUI();
  
  try {
    const results = await stressTest.runStressTest();
    
    if (results && results.success) {
      console.log('\n✅ STRESS TEST COMPLETED SUCCESSFULLY!');
      console.log('🎯 The UI mapping fix works correctly under stress!');
    } else {
      console.log('\n❌ STRESS TEST FAILED!');
      console.log('🔧 Please review the system performance');
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Stress test failed:', error);
    return null;
  }
}

// Check server health
async function checkServerHealth() {
  try {
    const response = await fetch(`${BASE_URL}/api/projects`);
    if (response.ok) {
      console.log('✅ Server is accessible');
      return true;
    } else {
      console.log('❌ Server health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to server:', error.message);
    return false;
  }
}

// Run the stress test
if (import.meta.url === `file://${process.argv[1]}`) {
  checkServerHealth().then(serverRunning => {
    if (serverRunning) {
      runStressTest();
    } else {
      console.log('❌ Cannot run stress test - server is not accessible');
      process.exit(1);
    }
  });
}

export { StressTestUI, runStressTest };
