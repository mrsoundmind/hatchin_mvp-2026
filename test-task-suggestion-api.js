#!/usr/bin/env node

/**
 * Task Suggestion API Test Suite
 * 
 * This script tests the specific API endpoints for task suggestions
 * and validates the complete flow from conversation analysis to task creation.
 */

const fetch = require('node-fetch');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:5000';

// Test data for different scenarios
const testScenarios = {
  validConversation: {
    name: "Valid Task-Rich Conversation",
    conversation: [
      { role: "user", content: "We need to implement user authentication for our app" },
      { role: "assistant", content: "That's a great idea. We should also add password reset functionality and session management." },
      { role: "user", content: "Good point. We also need to implement role-based access control and audit logging." },
      { role: "assistant", content: "Absolutely. We should also consider adding two-factor authentication for enhanced security." },
      { role: "user", content: "Let's also plan for user onboarding and email verification." }
    ],
    expectedMinTasks: 3
  },
  
  minimalConversation: {
    name: "Minimal Task Conversation",
    conversation: [
      { role: "user", content: "We need to fix the login bug" },
      { role: "assistant", content: "I can help with that. Let's debug the authentication flow." }
    ],
    expectedMinTasks: 1
  },
  
  nonTaskConversation: {
    name: "Non-Task Conversation",
    conversation: [
      { role: "user", content: "Hello, how are you?" },
      { role: "assistant", content: "I'm doing well, thank you! How can I help you today?" },
      { role: "user", content: "Just checking in, nothing specific." }
    ],
    expectedMinTasks: 0
  },
  
  edgeCaseConversation: {
    name: "Edge Case Conversation",
    conversation: [
      { role: "user", content: "" },
      { role: "assistant", content: "I didn't catch that. Could you repeat?" },
      { role: "user", content: "We need to implement the feature" }
    ],
    expectedMinTasks: 0
  }
};

class TaskSuggestionAPITester {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  async testAnalyzeEndpoint(scenario) {
    const testResult = {
      scenario: scenario.name,
      startTime: performance.now(),
      success: false,
      responseTime: 0,
      suggestions: [],
      error: null
    };

    try {
      console.log(`🧪 Testing: ${scenario.name}`);
      
      const response = await fetch(`${BASE_URL}/api/task-suggestions/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: `test-${Date.now()}`,
          projectId: 'test-project',
          teamId: 'test-team',
          agentId: 'test-agent',
          messages: scenario.conversation.map((msg, index) => ({
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

      testResult.responseTime = performance.now() - testResult.startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      testResult.suggestions = data.suggestions || [];
      testResult.success = true;

      console.log(`✅ ${scenario.name}: ${testResult.suggestions.length} suggestions found`);
      
      // Validate suggestions structure
      this.validateSuggestions(testResult.suggestions, scenario);

    } catch (error) {
      testResult.error = error.message;
      testResult.responseTime = performance.now() - testResult.startTime;
      console.log(`❌ ${scenario.name}: ${error.message}`);
    }

    this.results.push(testResult);
    return testResult;
  }

  validateSuggestions(suggestions, scenario) {
    if (!Array.isArray(suggestions)) {
      throw new Error('Suggestions should be an array');
    }

    suggestions.forEach((suggestion, index) => {
      const requiredFields = ['id', 'title', 'description', 'priority', 'suggestedAssignee', 'category', 'estimatedEffort', 'reasoning'];
      const missingFields = requiredFields.filter(field => !suggestion[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Suggestion ${index} missing fields: ${missingFields.join(', ')}`);
      }

      // Validate priority
      if (!['High', 'Medium', 'Low'].includes(suggestion.priority)) {
        throw new Error(`Suggestion ${index} has invalid priority: ${suggestion.priority}`);
      }

      // Validate assignee structure
      if (!suggestion.suggestedAssignee.id || !suggestion.suggestedAssignee.name || !suggestion.suggestedAssignee.role) {
        throw new Error(`Suggestion ${index} has invalid assignee structure`);
      }
    });

    // Check if we got the expected number of tasks
    if (suggestions.length < scenario.expectedMinTasks) {
      console.log(`⚠️  Warning: Expected at least ${scenario.expectedMinTasks} tasks, got ${suggestions.length}`);
    }
  }

  async testApproveEndpoint(suggestions) {
    if (!suggestions || suggestions.length === 0) {
      console.log('⏭️  Skipping approve test - no suggestions to approve');
      return { success: true, skipped: true };
    }

    const testResult = {
      startTime: performance.now(),
      success: false,
      responseTime: 0,
      createdTasks: [],
      error: null
    };

    try {
      console.log(`🧪 Testing task approval with ${suggestions.length} suggestions`);
      
      const response = await fetch(`${BASE_URL}/api/task-suggestions/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvedTasks: suggestions,
          projectId: 'test-project'
        })
      });

      testResult.responseTime = performance.now() - testResult.startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      testResult.createdTasks = data.createdTasks || [];
      testResult.success = data.success || false;

      console.log(`✅ Task approval: ${testResult.createdTasks.length} tasks created`);

    } catch (error) {
      testResult.error = error.message;
      testResult.responseTime = performance.now() - testResult.startTime;
      console.log(`❌ Task approval failed: ${error.message}`);
    }

    return testResult;
  }

  async testCompleteFlow(scenario) {
    console.log(`\n🔄 Testing complete flow for: ${scenario.name}`);
    
    // Step 1: Analyze conversation
    const analyzeResult = await this.testAnalyzeEndpoint(scenario);
    
    if (!analyzeResult.success) {
      return {
        scenario: scenario.name,
        success: false,
        error: `Analysis failed: ${analyzeResult.error}`,
        steps: { analyze: analyzeResult, approve: null }
      };
    }

    // Step 2: Approve tasks (if any)
    const approveResult = await this.testApproveEndpoint(analyzeResult.suggestions);
    
    return {
      scenario: scenario.name,
      success: analyzeResult.success && approveResult.success,
      steps: { analyze: analyzeResult, approve: approveResult },
      totalSuggestions: analyzeResult.suggestions.length,
      totalCreated: approveResult.createdTasks?.length || 0
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Task Suggestion API Tests');
    console.log('=====================================\n');

    const flowResults = [];

    // Test each scenario
    for (const [key, scenario] of Object.entries(testScenarios)) {
      try {
        const result = await this.testCompleteFlow(scenario);
        flowResults.push(result);
      } catch (error) {
        console.error(`❌ Error testing ${scenario.name}:`, error);
        flowResults.push({
          scenario: scenario.name,
          success: false,
          error: error.message
        });
      }
    }

    return flowResults;
  }

  generateReport(flowResults) {
    const totalTests = flowResults.length;
    const successfulTests = flowResults.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;

    const report = {
      summary: {
        totalTests,
        successfulTests,
        failedTests,
        successRate: `${((successfulTests / totalTests) * 100).toFixed(2)}%`
      },
      detailedResults: flowResults.map(result => ({
        scenario: result.scenario,
        success: result.success,
        error: result.error,
        totalSuggestions: result.totalSuggestions || 0,
        totalCreated: result.totalCreated || 0,
        analyzeTime: result.steps?.analyze?.responseTime || 0,
        approveTime: result.steps?.approve?.responseTime || 0
      })),
      performance: {
        averageAnalyzeTime: this.calculateAverageTime(flowResults, 'analyze'),
        averageApproveTime: this.calculateAverageTime(flowResults, 'approve'),
        totalSuggestions: flowResults.reduce((sum, r) => sum + (r.totalSuggestions || 0), 0),
        totalCreated: flowResults.reduce((sum, r) => sum + (r.totalCreated || 0), 0)
      },
      issues: this.identifyIssues(flowResults),
      recommendations: this.generateRecommendations(flowResults)
    };

    return report;
  }

  calculateAverageTime(flowResults, step) {
    const times = flowResults
      .map(r => r.steps?.[step]?.responseTime)
      .filter(time => time && time > 0);
    
    if (times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  identifyIssues(flowResults) {
    const issues = [];
    
    flowResults.forEach(result => {
      if (!result.success) {
        issues.push({
          type: 'failure',
          scenario: result.scenario,
          error: result.error
        });
      }
      
      if (result.steps?.analyze?.responseTime > 10000) {
        issues.push({
          type: 'performance',
          scenario: result.scenario,
          issue: 'Slow analysis response time',
          time: result.steps.analyze.responseTime
        });
      }
    });
    
    return issues;
  }

  generateRecommendations(flowResults) {
    const recommendations = [];
    
    const failedTests = flowResults.filter(r => !r.success);
    if (failedTests.length > 0) {
      recommendations.push({
        priority: 'high',
        type: 'reliability',
        message: `${failedTests.length} tests failed. Check error handling and API stability.`
      });
    }
    
    const slowTests = flowResults.filter(r => r.steps?.analyze?.responseTime > 5000);
    if (slowTests.length > 0) {
      recommendations.push({
        priority: 'medium',
        type: 'performance',
        message: `${slowTests.length} tests had slow response times. Consider optimizing the analysis endpoint.`
      });
    }
    
    return recommendations;
  }
}

// Main execution
async function runAPITests() {
  const tester = new TaskSuggestionAPITester();
  
  try {
    const flowResults = await tester.runAllTests();
    const report = tester.generateReport(flowResults);
    
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('=======================');
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Successful: ${report.summary.successfulTests}`);
    console.log(`Failed: ${report.summary.failedTests}`);
    console.log(`Success Rate: ${report.summary.successRate}`);
    
    console.log('\n⏱️  PERFORMANCE METRICS');
    console.log('======================');
    console.log(`Average Analysis Time: ${report.performance.averageAnalyzeTime.toFixed(2)}ms`);
    console.log(`Average Approval Time: ${report.performance.averageApproveTime.toFixed(2)}ms`);
    console.log(`Total Suggestions: ${report.performance.totalSuggestions}`);
    console.log(`Total Tasks Created: ${report.performance.totalCreated}`);
    
    console.log('\n🔍 DETAILED RESULTS');
    console.log('==================');
    report.detailedResults.forEach(result => {
      console.log(`${result.scenario}: ${result.success ? '✅' : '❌'} (${result.totalSuggestions} suggestions, ${result.totalCreated} created)`);
    });
    
    if (report.issues.length > 0) {
      console.log('\n⚠️  ISSUES IDENTIFIED');
      console.log('===================');
      report.issues.forEach(issue => {
        console.log(`${issue.type.toUpperCase()}: ${issue.scenario} - ${issue.issue || issue.error}`);
      });
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS');
      console.log('==================');
      report.recommendations.forEach(rec => {
        console.log(`[${rec.priority.toUpperCase()}] ${rec.message}`);
      });
    }
    
    // Save detailed report
    const fs = require('fs');
    const reportPath = './api-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    return report;
    
  } catch (error) {
    console.error('❌ API tests failed:', error);
    return null;
  }
}

// Check server health before running tests
async function checkServerHealth() {
  try {
    const response = await fetch(`${BASE_URL}/api/projects`);
    if (response.ok) {
      console.log('✅ Server is accessible');
      return true;
    } else {
      console.log('❌ Server health check failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to server:', error.message);
    console.log('💡 Make sure the server is running on http://localhost:5000');
    return false;
  }
}

// Run the tests
if (require.main === module) {
  checkServerHealth().then(serverRunning => {
    if (serverRunning) {
      runAPITests();
    } else {
      console.log('❌ Cannot run tests - server is not accessible');
      process.exit(1);
    }
  });
}

module.exports = { TaskSuggestionAPITester, runAPITests };
