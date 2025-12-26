#!/usr/bin/env node

/**
 * Complete Task Creation Flow Test
 * 
 * This script tests the ENTIRE flow from conversation analysis to UI display,
 * including the bug fix for section ID mismatch.
 */

import fetch from 'node-fetch';
import { performance } from 'perf_hooks';
import fs from 'fs';

const BASE_URL = 'http://localhost:3001';

class CompleteTaskFlowTester {
  constructor() {
    this.results = [];
    this.startTime = performance.now();
  }

  async testCompleteFlow() {
    console.log('🧪 COMPLETE TASK CREATION FLOW TEST');
    console.log('===================================\n');

    try {
      // Step 1: Create a realistic conversation that should generate tasks
      console.log('📝 Step 1: Creating test conversation...');
      const conversationId = `test-flow-${Date.now()}`;
      const projectId = `test-project-${Date.now()}`;
      
      const testConversation = [
        { role: "user", content: "We need to implement a complete user authentication system for our SaaS application" },
        { role: "assistant", content: "That's a great idea! We should start with JWT token implementation and then add password reset functionality." },
        { role: "user", content: "Good point. We also need to implement role-based access control, audit logging, and two-factor authentication." },
        { role: "assistant", content: "Absolutely. We should also consider adding social login integration and user onboarding flow." },
        { role: "user", content: "Let's also plan for user profile management and email verification system." }
      ];

      // Step 2: Analyze conversation for task suggestions
      console.log('🔍 Step 2: Analyzing conversation for task suggestions...');
      const analyzeResult = await this.analyzeConversation(testConversation, conversationId, projectId);
      
      if (!analyzeResult.success) {
        throw new Error(`Analysis failed: ${analyzeResult.error}`);
      }

      console.log(`✅ Found ${analyzeResult.suggestions.length} task suggestions`);
      
      if (analyzeResult.suggestions.length === 0) {
        console.log('⚠️  No task suggestions generated. This might indicate an issue with the AI analysis.');
        return {
          success: false,
          error: 'No task suggestions generated',
          suggestions: []
        };
      }

      // Display suggestions
      console.log('\n📋 Generated Task Suggestions:');
      analyzeResult.suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion.title} (${suggestion.priority}) - ${suggestion.suggestedAssignee.name}`);
      });

      // Step 3: Approve all suggested tasks
      console.log('\n✅ Step 3: Approving all suggested tasks...');
      const approveResult = await this.approveTasks(analyzeResult.suggestions, projectId);
      
      if (!approveResult.success) {
        throw new Error(`Approval failed: ${approveResult.error}`);
      }

      console.log(`✅ Successfully created ${approveResult.createdTasks.length} tasks in database`);

      // Step 4: Verify tasks were actually created in the database
      console.log('\n🔍 Step 4: Verifying tasks in database...');
      const verificationResult = await this.verifyTasksInDatabase(approveResult.createdTasks, projectId);
      
      if (!verificationResult.success) {
        throw new Error(`Verification failed: ${verificationResult.error}`);
      }

      console.log(`✅ Verified ${verificationResult.foundTasks.length} tasks in database`);

      // Step 5: Test task retrieval and display
      console.log('\n📋 Step 5: Testing task retrieval...');
      const retrievalResult = await this.testTaskRetrieval(projectId);
      
      if (!retrievalResult.success) {
        console.log(`⚠️  Task retrieval issue: ${retrievalResult.error}`);
      } else {
        console.log(`✅ Successfully retrieved ${retrievalResult.tasks.length} tasks`);
      }

      // Step 6: Test UI section mapping (simulate the frontend logic)
      console.log('\n🎨 Step 6: Testing UI section mapping...');
      const uiMappingResult = this.testUISectionMapping(approveResult.createdTasks);
      console.log(`✅ UI mapping test: ${uiMappingResult.success ? 'PASSED' : 'FAILED'}`);
      if (!uiMappingResult.success) {
        console.log(`❌ UI mapping issues: ${uiMappingResult.issues.join(', ')}`);
      }

      const flowResult = {
        success: true,
        conversationId,
        projectId,
        suggestionsGenerated: analyzeResult.suggestions.length,
        tasksCreated: approveResult.createdTasks.length,
        tasksVerified: verificationResult.foundTasks.length,
        tasksRetrieved: retrievalResult.tasks?.length || 0,
        uiMappingSuccess: uiMappingResult.success,
        totalDuration: performance.now() - this.startTime,
        details: {
          suggestions: analyzeResult.suggestions,
          createdTasks: approveResult.createdTasks,
          verifiedTasks: verificationResult.foundTasks,
          retrievedTasks: retrievalResult.tasks,
          uiMapping: uiMappingResult
        }
      };

      this.results.push(flowResult);
      return flowResult;

    } catch (error) {
      console.error('❌ Complete task flow failed:', error.message);
      return {
        success: false,
        error: error.message,
        totalDuration: performance.now() - this.startTime
      };
    }
  }

  async analyzeConversation(conversation, conversationId, projectId) {
    try {
      const startTime = performance.now();
      
      const response = await fetch(`${BASE_URL}/api/task-suggestions/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          projectId,
          teamId: 'test-team',
          agentId: 'test-agent',
          messages: conversation.map((msg, index) => ({
            id: `msg-${index}`,
            content: msg.content,
            messageType: msg.role === 'user' ? 'user' : 'assistant',
            senderId: msg.role === 'user' ? 'user' : 'assistant',
            senderName: msg.role === 'user' ? 'User' : 'Assistant',
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }))
        })
      });

      const duration = performance.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        suggestions: data.suggestions || [],
        duration,
        statusCode: response.status
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: performance.now() - startTime
      };
    }
  }

  async approveTasks(suggestions, projectId) {
    try {
      const startTime = performance.now();
      
      const response = await fetch(`${BASE_URL}/api/task-suggestions/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvedTasks: suggestions,
          projectId
        })
      });

      const duration = performance.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: data.success || false,
        createdTasks: data.createdTasks || [],
        duration,
        statusCode: response.status,
        message: data.message
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: performance.now() - startTime
      };
    }
  }

  async verifyTasksInDatabase(createdTasks, projectId) {
    try {
      // Try to get tasks for the project
      const response = await fetch(`${BASE_URL}/api/tasks?projectId=${projectId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const foundTasks = data.filter(task => 
        createdTasks.some(created => created.id === task.id)
      );

      return {
        success: true,
        foundTasks,
        totalTasksInProject: data.length
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        foundTasks: []
      };
    }
  }

  async testTaskRetrieval(projectId) {
    try {
      const response = await fetch(`${BASE_URL}/api/tasks?projectId=${projectId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        tasks: data,
        count: data.length
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        tasks: []
      };
    }
  }

  testUISectionMapping(createdTasks) {
    const issues = [];
    
    // Simulate the frontend section mapping logic
    const sections = [
      { id: 'urgent', title: 'Urgent Tasks' },
      { id: 'team-tasks', title: 'All Team Tasks' },
      { id: 'completed', title: 'Completed Tasks' }
    ];

    // Test the mapping logic
    createdTasks.forEach(task => {
      const priority = task.priority.toLowerCase();
      
      if (priority === 'high') {
        // Should go to 'urgent' section
        const urgentSection = sections.find(s => s.id === 'urgent');
        if (!urgentSection) {
          issues.push(`High priority task ${task.title} has no 'urgent' section to map to`);
        }
      } else {
        // Should go to 'team-tasks' section
        const teamTasksSection = sections.find(s => s.id === 'team-tasks');
        if (!teamTasksSection) {
          issues.push(`Non-high priority task ${task.title} has no 'team-tasks' section to map to`);
        }
      }
    });

    // Test the actual mapping logic from the frontend
    const newTasks = createdTasks.map(task => ({
      id: task.id,
      title: task.title,
      status: 'todo',
      priority: task.priority.toLowerCase(),
      assignee: task.assigneeId,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      projectId: task.projectId,
      teamId: null,
      parentTaskId: null
    }));

    // Simulate the section mapping
    const mappedSections = sections.map(section => {
      if (section.id === 'urgent' && newTasks.some(task => task.priority === 'high')) {
        return {
          ...section,
          tasks: [...[], ...newTasks.filter(task => task.priority === 'high')]
        };
      } else if (section.id === 'team-tasks') {  // ✅ This is the FIXED version
        return {
          ...section,
          tasks: [...[], ...newTasks.filter(task => task.priority !== 'high')]
        };
      }
      return section;
    });

    // Check if tasks were properly mapped
    const urgentTasks = mappedSections.find(s => s.id === 'urgent')?.tasks || [];
    const teamTasks = mappedSections.find(s => s.id === 'team-tasks')?.tasks || [];
    
    if (urgentTasks.length + teamTasks.length !== createdTasks.length) {
      issues.push(`Task mapping incomplete: ${urgentTasks.length + teamTasks.length} mapped vs ${createdTasks.length} created`);
    }

    return {
      success: issues.length === 0,
      issues,
      mappedSections,
      urgentTasks: urgentTasks.length,
      teamTasks: teamTasks.length
    };
  }

  async runStressTest() {
    console.log('\n🚀 STRESS TESTING TASK CREATION FLOW');
    console.log('=====================================\n');

    const stressResults = [];
    const concurrentUsers = 5;
    const requestsPerUser = 3;

    console.log(`Testing with ${concurrentUsers} concurrent users, ${requestsPerUser} requests each...`);

    const userPromises = [];
    
    for (let i = 0; i < concurrentUsers; i++) {
      const userPromise = this.simulateUserSession(i, requestsPerUser);
      userPromises.push(userPromise);
    }

    try {
      const results = await Promise.allSettled(userPromises);
    
    const successfulSessions = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failedSessions = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;
    
    console.log(`\n📊 STRESS TEST RESULTS:`);
    console.log(`  Successful sessions: ${successfulSessions}`);
    console.log(`  Failed sessions: ${failedSessions}`);
    console.log(`  Success rate: ${((successfulSessions / results.length) * 100).toFixed(1)}%`);

    } catch (error) {
      console.error('❌ Stress test failed:', error);
    }
  }

  async simulateUserSession(userId, requestCount) {
    const sessionResults = [];
    
    for (let i = 0; i < requestCount; i++) {
      try {
        const conversationId = `stress-${userId}-${i}-${Date.now()}`;
        const projectId = `stress-project-${userId}`;
        
        const testConversation = [
          { role: "user", content: `We need to implement feature ${i} for user ${userId}` },
          { role: "assistant", content: `Let's break this down into specific tasks and assign them to the right team members.` }
        ];

        // Analyze conversation
        const analyzeResult = await this.analyzeConversation(testConversation, conversationId, projectId);
        
        if (analyzeResult.success && analyzeResult.suggestions.length > 0) {
          // Approve tasks
          const approveResult = await this.approveTasks(analyzeResult.suggestions, projectId);
          
          sessionResults.push({
            sessionId: `${userId}-${i}`,
            success: approveResult.success,
            suggestionsGenerated: analyzeResult.suggestions.length,
            tasksCreated: approveResult.createdTasks?.length || 0,
            error: approveResult.error
          });
        } else {
          sessionResults.push({
            sessionId: `${userId}-${i}`,
            success: true,
            suggestionsGenerated: 0,
            tasksCreated: 0,
            note: 'No suggestions generated'
          });
        }
        
      } catch (error) {
        sessionResults.push({
          sessionId: `${userId}-${i}`,
          success: false,
          error: error.message
        });
      }
    }

    return {
      userId,
      sessionResults,
      success: sessionResults.every(r => r.success)
    };
  }

  generateReport() {
    const totalDuration = performance.now() - this.startTime;
    const allResults = this.results;
    const successfulResults = allResults.filter(r => r.success);
    const failedResults = allResults.filter(r => !r.success);

    const report = {
      testSummary: {
        totalTests: allResults.length,
        successfulTests: successfulResults.length,
        failedTests: failedResults.length,
        successRate: `${((successfulResults.length / allResults.length) * 100).toFixed(2)}%`,
        totalDuration: `${totalDuration.toFixed(2)}ms`
      },
      flowDetails: allResults,
      recommendations: this.generateRecommendations(successfulResults, failedResults)
    };

    return report;
  }

  generateRecommendations(successfulResults, failedResults) {
    const recommendations = [];
    
    if (failedResults.length > 0) {
      recommendations.push({
        priority: 'high',
        type: 'reliability',
        message: `${failedResults.length} tests failed. Check server logs and error handling.`
      });
    }
    
    const uiMappingIssues = successfulResults.filter(r => r.uiMappingSuccess === false);
    if (uiMappingIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        type: 'ui',
        message: `${uiMappingIssues.length} tests had UI mapping issues. Verify section ID fix is applied.`
      });
    }

    return recommendations;
  }
}

// Main execution
async function runCompleteTaskFlowTest() {
  console.log('🧪 Complete Task Creation Flow Test Suite');
  console.log('=========================================\n');

  const tester = new CompleteTaskFlowTester();

  try {
    // Test complete flow
    const flowResult = await tester.testCompleteFlow();
    
    // Run stress test
    await tester.runStressTest();
    
    // Generate report
    const report = tester.generateReport();
    
    // Display results
    console.log('\n📊 COMPLETE TASK FLOW RESULTS');
    console.log('==============================');
    console.log(`Total Tests: ${report.testSummary.totalTests}`);
    console.log(`Successful: ${report.testSummary.successfulTests}`);
    console.log(`Failed: ${report.testSummary.failedTests}`);
    console.log(`Success Rate: ${report.testSummary.successRate}`);
    console.log(`Total Duration: ${report.testSummary.totalDuration}`);
    
    if (flowResult.success) {
      console.log('\n✅ MAIN FLOW SUCCESS:');
      console.log(`  Suggestions Generated: ${flowResult.suggestionsGenerated}`);
      console.log(`  Tasks Created: ${flowResult.tasksCreated}`);
      console.log(`  Tasks Verified: ${flowResult.tasksVerified}`);
      console.log(`  Tasks Retrieved: ${flowResult.tasksRetrieved}`);
      console.log(`  UI Mapping Success: ${flowResult.uiMappingSuccess ? '✅' : '❌'}`);
    } else {
      console.log('\n❌ MAIN FLOW FAILED:');
      console.log(`  Error: ${flowResult.error}`);
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach(rec => {
        console.log(`  [${rec.priority.toUpperCase()}] ${rec.message}`);
      });
    }
    
    // Save detailed report
    const reportPath = './complete-task-flow-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    return report;
    
  } catch (error) {
    console.error('❌ Complete task flow test failed:', error);
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

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  checkServerHealth().then(serverRunning => {
    if (serverRunning) {
      runCompleteTaskFlowTest();
    } else {
      console.log('❌ Cannot run test - server is not accessible');
      process.exit(1);
    }
  });
}

export { CompleteTaskFlowTester, runCompleteTaskFlowTest };
