#!/usr/bin/env node

/**
 * Task Creation Flow Test
 * 
 * This script specifically tests the complete flow from task suggestion
 * to actual task creation in the database after user approval.
 */

import fetch from 'node-fetch';
import { performance } from 'perf_hooks';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000';

class TaskCreationFlowTester {
  constructor() {
    this.results = [];
    this.testStartTime = performance.now();
  }

  async testCompleteTaskCreationFlow() {
    console.log('🧪 Testing Complete Task Creation Flow');
    console.log('=====================================\n');

    try {
      // Step 1: Create a conversation that should generate task suggestions
      console.log('📝 Step 1: Creating test conversation...');
      const conversationId = `test-conversation-${Date.now()}`;
      const projectId = `test-project-${Date.now()}`;
      
      const testConversation = [
        { role: "user", content: "We need to implement user authentication for our app" },
        { role: "assistant", content: "That's a great idea. We should also add password reset functionality and session management." },
        { role: "user", content: "Good point. We also need to implement role-based access control and audit logging." },
        { role: "assistant", content: "Absolutely. We should also consider adding two-factor authentication for enhanced security." },
        { role: "user", content: "Let's also plan for user onboarding and email verification." }
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

      // Step 3: Approve all suggested tasks
      console.log('✅ Step 3: Approving all suggested tasks...');
      const approveResult = await this.approveTasks(analyzeResult.suggestions, projectId);
      
      if (!approveResult.success) {
        throw new Error(`Approval failed: ${approveResult.error}`);
      }

      console.log(`✅ Successfully created ${approveResult.createdTasks.length} tasks`);

      // Step 4: Verify tasks were actually created in the database
      console.log('🔍 Step 4: Verifying tasks in database...');
      const verificationResult = await this.verifyTasksInDatabase(approveResult.createdTasks, projectId);
      
      if (!verificationResult.success) {
        throw new Error(`Verification failed: ${verificationResult.error}`);
      }

      console.log(`✅ Verified ${verificationResult.foundTasks.length} tasks in database`);

      // Step 5: Test task retrieval and display
      console.log('📋 Step 5: Testing task retrieval...');
      const retrievalResult = await this.testTaskRetrieval(projectId);
      
      if (!retrievalResult.success) {
        console.log(`⚠️  Task retrieval issue: ${retrievalResult.error}`);
      } else {
        console.log(`✅ Successfully retrieved ${retrievalResult.tasks.length} tasks`);
      }

      const flowResult = {
        success: true,
        conversationId,
        projectId,
        suggestionsGenerated: analyzeResult.suggestions.length,
        tasksCreated: approveResult.createdTasks.length,
        tasksVerified: verificationResult.foundTasks.length,
        tasksRetrieved: retrievalResult.tasks?.length || 0,
        totalDuration: performance.now() - this.testStartTime,
        details: {
          suggestions: analyzeResult.suggestions,
          createdTasks: approveResult.createdTasks,
          verifiedTasks: verificationResult.foundTasks,
          retrievedTasks: retrievalResult.tasks
        }
      };

      this.results.push(flowResult);
      return flowResult;

    } catch (error) {
      console.error('❌ Task creation flow failed:', error.message);
      return {
        success: false,
        error: error.message,
        totalDuration: performance.now() - this.testStartTime
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

  async testMultipleApprovalScenarios() {
    console.log('\n🔄 Testing Multiple Approval Scenarios');
    console.log('=====================================\n');

    const scenarios = [
      {
        name: "Single Task Approval",
        conversation: [
          { role: "user", content: "We need to fix the login bug" },
          { role: "assistant", content: "Let's debug the authentication flow and add proper error handling." }
        ]
      },
      {
        name: "Multiple Task Approval",
        conversation: [
          { role: "user", content: "We need to implement a complete user management system" },
          { role: "assistant", content: "That includes authentication, authorization, user profiles, and audit logging." },
          { role: "user", content: "We should also add password reset and email verification." },
          { role: "assistant", content: "Good points. Let's also implement role-based access control and session management." }
        ]
      },
      {
        name: "No Task Generation",
        conversation: [
          { role: "user", content: "Hello, how are you?" },
          { role: "assistant", content: "I'm doing well, thank you! How can I help you today?" }
        ]
      }
    ];

    const scenarioResults = [];

    for (const scenario of scenarios) {
      try {
        console.log(`🧪 Testing: ${scenario.name}`);
        
        const conversationId = `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const projectId = `scenario-project-${Date.now()}`;
        
        // Analyze conversation
        const analyzeResult = await this.analyzeConversation(scenario.conversation, conversationId, projectId);
        
        if (analyzeResult.success && analyzeResult.suggestions.length > 0) {
          // Approve tasks
          const approveResult = await this.approveTasks(analyzeResult.suggestions, projectId);
          
          scenarioResults.push({
            scenario: scenario.name,
            success: approveResult.success,
            suggestionsGenerated: analyzeResult.suggestions.length,
            tasksCreated: approveResult.createdTasks?.length || 0,
            error: approveResult.error
          });
          
          console.log(`✅ ${scenario.name}: ${approveResult.createdTasks?.length || 0} tasks created`);
        } else {
          scenarioResults.push({
            scenario: scenario.name,
            success: true,
            suggestionsGenerated: 0,
            tasksCreated: 0,
            note: 'No suggestions generated (expected for non-task conversations)'
          });
          
          console.log(`✅ ${scenario.name}: No suggestions (as expected)`);
        }
        
      } catch (error) {
        console.error(`❌ ${scenario.name} failed:`, error.message);
        scenarioResults.push({
          scenario: scenario.name,
          success: false,
          error: error.message
        });
      }
    }

    return scenarioResults;
  }

  generateFlowReport() {
    const totalDuration = performance.now() - this.testStartTime;
    const successfulFlows = this.results.filter(r => r.success).length;
    const failedFlows = this.results.filter(r => !r.success).length;

    const report = {
      testSummary: {
        totalFlows: this.results.length,
        successfulFlows,
        failedFlows,
        successRate: `${((successfulFlows / this.results.length) * 100).toFixed(2)}%`,
        totalDuration: `${totalDuration.toFixed(2)}ms`
      },
      flowDetails: this.results,
      recommendations: this.generateFlowRecommendations()
    };

    return report;
  }

  generateFlowRecommendations() {
    const recommendations = [];
    
    const failedFlows = this.results.filter(r => !r.success);
    if (failedFlows.length > 0) {
      recommendations.push({
        priority: 'high',
        type: 'reliability',
        message: `${failedFlows.length} task creation flows failed. Check API endpoints and database connectivity.`
      });
    }
    
    const zeroSuggestions = this.results.filter(r => r.success && r.suggestionsGenerated === 0);
    if (zeroSuggestions.length > 0) {
      recommendations.push({
        priority: 'medium',
        type: 'functionality',
        message: `${zeroSuggestions.length} flows generated no task suggestions. Review AI analysis logic.`
      });
    }
    
    const creationMismatch = this.results.filter(r => r.success && r.suggestionsGenerated !== r.tasksCreated);
    if (creationMismatch.length > 0) {
      recommendations.push({
        priority: 'high',
        type: 'data_integrity',
        message: `${creationMismatch.length} flows had suggestion/creation count mismatches. Check task creation logic.`
      });
    }

    return recommendations;
  }
}

// Main execution
async function runTaskCreationFlowTest() {
  console.log('🧪 Task Creation Flow Test Suite');
  console.log('=================================\n');

  const tester = new TaskCreationFlowTester();

  try {
    // Test complete flow
    const flowResult = await tester.testCompleteTaskCreationFlow();
    
    // Test multiple scenarios
    const scenarioResults = await tester.testMultipleApprovalScenarios();
    
    // Generate report
    const report = tester.generateFlowReport();
    
    // Display results
    console.log('\n📊 TASK CREATION FLOW RESULTS');
    console.log('==============================');
    console.log(`Total Flows: ${report.testSummary.totalFlows}`);
    console.log(`Successful: ${report.testSummary.successfulFlows}`);
    console.log(`Failed: ${report.testSummary.failedFlows}`);
    console.log(`Success Rate: ${report.testSummary.successRate}`);
    console.log(`Total Duration: ${report.testSummary.totalDuration}`);
    
    if (flowResult.success) {
      console.log('\n✅ MAIN FLOW SUCCESS:');
      console.log(`  Suggestions Generated: ${flowResult.suggestionsGenerated}`);
      console.log(`  Tasks Created: ${flowResult.tasksCreated}`);
      console.log(`  Tasks Verified: ${flowResult.tasksVerified}`);
      console.log(`  Tasks Retrieved: ${flowResult.tasksRetrieved}`);
    } else {
      console.log('\n❌ MAIN FLOW FAILED:');
      console.log(`  Error: ${flowResult.error}`);
    }
    
    console.log('\n🔄 SCENARIO RESULTS:');
    scenarioResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${result.scenario}: ${result.tasksCreated} tasks created`);
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
    });
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach(rec => {
        console.log(`  [${rec.priority.toUpperCase()}] ${rec.message}`);
      });
    }
    
    // Save detailed report
    const reportPath = './task-creation-flow-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    return report;
    
  } catch (error) {
    console.error('❌ Task creation flow test failed:', error);
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
      runTaskCreationFlowTest();
    } else {
      console.log('❌ Cannot run test - server is not accessible');
      process.exit(1);
    }
  });
}

export { TaskCreationFlowTester, runTaskCreationFlowTest };
