#!/usr/bin/env node

/**
 * Task Suggestion System Stress Test
 * 
 * This script simulates various user scenarios and stress tests the task suggestion system
 * to identify performance bottlenecks, edge cases, and system reliability issues.
 */

const fetch = require('node-fetch');
const { performance } = require('perf_hooks');

// Configuration
const BASE_URL = 'http://localhost:5000';
const CONCURRENT_USERS = 10;
const REQUESTS_PER_USER = 5;
const TEST_DURATION_MS = 30000; // 30 seconds

// Test Results Storage
const testResults = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  maxResponseTime: 0,
  minResponseTime: Infinity,
  errors: [],
  performanceMetrics: [],
  scenarioResults: []
};

// Simulated User Scenarios
const userScenarios = [
  {
    name: "Product Manager Planning Session",
    conversation: [
      { role: "user", content: "We need to launch our new feature by next month. What should we prioritize?" },
      { role: "assistant", content: "Based on our current roadmap, I'd suggest focusing on the core user authentication system first, then the dashboard interface." },
      { role: "user", content: "Good point. We also need to implement proper error handling and logging. The current system is too fragile." },
      { role: "assistant", content: "Absolutely. We should also consider adding monitoring and alerting systems for production." },
      { role: "user", content: "Let's also plan for user testing and feedback collection. We need to validate our assumptions." }
    ],
    expectedTasks: ["Authentication system", "Dashboard interface", "Error handling", "Logging system", "Monitoring", "User testing"]
  },
  {
    name: "Developer Bug Fix Session",
    conversation: [
      { role: "user", content: "The login system is broken. Users can't authenticate properly." },
      { role: "assistant", content: "I can help debug this. Let's check the authentication flow and database connections." },
      { role: "user", content: "The issue seems to be with JWT token validation. We need to fix the middleware." },
      { role: "assistant", content: "Let's also add proper error logging so we can track these issues in the future." },
      { role: "user", content: "Good idea. We should also write tests to prevent this from happening again." }
    ],
    expectedTasks: ["Fix JWT validation", "Debug authentication", "Add error logging", "Write tests"]
  },
  {
    name: "Design System Discussion",
    conversation: [
      { role: "user", content: "We need to create a consistent design system for our application." },
      { role: "assistant", content: "That's a great idea. We should start with a component library and design tokens." },
      { role: "user", content: "Let's also create style guides and documentation for the team." },
      { role: "assistant", content: "We should also plan for accessibility compliance and responsive design patterns." },
      { role: "user", content: "Perfect. We need to create mockups and prototypes for user testing." }
    ],
    expectedTasks: ["Component library", "Design tokens", "Style guides", "Documentation", "Accessibility", "Mockups"]
  },
  {
    name: "Performance Optimization",
    conversation: [
      { role: "user", content: "Our application is running slowly. We need to optimize performance." },
      { role: "assistant", content: "Let's start by analyzing the current bottlenecks and implementing caching strategies." },
      { role: "user", content: "We should also optimize database queries and implement lazy loading." },
      { role: "assistant", content: "Good points. We should also consider CDN implementation and image optimization." },
      { role: "user", content: "Let's also add performance monitoring and set up alerts for degradation." }
    ],
    expectedTasks: ["Performance analysis", "Caching implementation", "Database optimization", "Lazy loading", "CDN setup", "Performance monitoring"]
  },
  {
    name: "Security Audit Discussion",
    conversation: [
      { role: "user", content: "We need to conduct a comprehensive security audit of our application." },
      { role: "assistant", content: "Let's start with vulnerability scanning and penetration testing." },
      { role: "user", content: "We should also review our authentication and authorization systems." },
      { role: "assistant", content: "Good idea. We should also implement security headers and HTTPS enforcement." },
      { role: "user", content: "Let's also create security documentation and train the team on best practices." }
    ],
    expectedTasks: ["Vulnerability scanning", "Penetration testing", "Auth review", "Security headers", "Documentation", "Team training"]
  }
];

// Edge Case Scenarios
const edgeCaseScenarios = [
  {
    name: "Empty Conversation",
    conversation: [],
    expectedTasks: []
  },
  {
    name: "Single Message",
    conversation: [
      { role: "user", content: "Hello" }
    ],
    expectedTasks: []
  },
  {
    name: "Non-Task Related Chat",
    conversation: [
      { role: "user", content: "How's the weather today?" },
      { role: "assistant", content: "I don't have access to weather information, but I can help with your project tasks." },
      { role: "user", content: "That's okay, just making conversation." }
    ],
    expectedTasks: []
  },
  {
    name: "Very Long Conversation",
    conversation: Array(50).fill(0).map((_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `This is message ${i + 1} in a very long conversation about various topics.`
    })),
    expectedTasks: []
  },
  {
    name: "Malformed Messages",
    conversation: [
      { role: "user", content: "" },
      { role: "assistant", content: null },
      { role: "user", content: "We need to fix the bug" }
    ],
    expectedTasks: ["Fix the bug"]
  }
];

// Stress Test Functions
class TaskSuggestionStressTest {
  constructor() {
    this.startTime = performance.now();
    this.results = [];
  }

  async simulateUserSession(userId, scenario) {
    const sessionResults = {
      userId,
      scenario: scenario.name,
      startTime: performance.now(),
      requests: [],
      errors: []
    };

    try {
      // Simulate conversation analysis
      const analyzeStart = performance.now();
      const analyzeResponse = await this.analyzeConversation(scenario.conversation, userId);
      const analyzeTime = performance.now() - analyzeStart;

      sessionResults.requests.push({
        type: 'analyze',
        duration: analyzeTime,
        success: analyzeResponse.success,
        suggestions: analyzeResponse.suggestions?.length || 0
      });

      if (analyzeResponse.success && analyzeResponse.suggestions?.length > 0) {
        // Simulate task approval
        const approveStart = performance.now();
        const approveResponse = await this.approveTasks(analyzeResponse.suggestions, userId);
        const approveTime = performance.now() - approveStart;

        sessionResults.requests.push({
          type: 'approve',
          duration: approveTime,
          success: approveResponse.success,
          tasksCreated: approveResponse.tasksCreated?.length || 0
        });
      }

    } catch (error) {
      sessionResults.errors.push({
        type: 'session_error',
        message: error.message,
        timestamp: performance.now()
      });
    }

    sessionResults.endTime = performance.now();
    sessionResults.totalDuration = sessionResults.endTime - sessionResults.startTime;
    
    return sessionResults;
  }

  async analyzeConversation(conversation, userId) {
    try {
      const startTime = performance.now();
      
      const response = await fetch(`${BASE_URL}/api/task-suggestions/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: `test-conversation-${userId}`,
          projectId: `test-project-${userId}`,
          teamId: `test-team-${userId}`,
          agentId: `test-agent-${userId}`,
          messages: conversation.map((msg, index) => ({
            id: `msg-${userId}-${index}`,
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

  async approveTasks(suggestions, userId) {
    try {
      const startTime = performance.now();
      
      const response = await fetch(`${BASE_URL}/api/task-suggestions/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvedTasks: suggestions,
          projectId: `test-project-${userId}`
        })
      });

      const duration = performance.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        tasksCreated: data.createdTasks || [],
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

  async runConcurrentUsers() {
    console.log(`🚀 Starting stress test with ${CONCURRENT_USERS} concurrent users...`);
    
    const userPromises = [];
    
    for (let i = 0; i < CONCURRENT_USERS; i++) {
      const userId = `user-${i}`;
      const scenario = userScenarios[i % userScenarios.length];
      
      const userPromise = this.simulateUserSession(userId, scenario);
      userPromises.push(userPromise);
    }

    try {
      const results = await Promise.allSettled(userPromises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          this.results.push(result.value);
        } else {
          this.results.push({
            userId: `user-${index}`,
            error: result.reason,
            scenario: 'failed'
          });
        }
      });

    } catch (error) {
      console.error('❌ Error in concurrent user simulation:', error);
    }
  }

  async runEdgeCaseTests() {
    console.log('🧪 Running edge case tests...');
    
    const edgeCaseResults = [];
    
    for (const scenario of edgeCaseScenarios) {
      try {
        const result = await this.simulateUserSession(`edge-${scenario.name}`, scenario);
        edgeCaseResults.push({
          scenario: scenario.name,
          result,
          expectedTasks: scenario.expectedTasks,
          actualTasks: result.requests.find(r => r.type === 'analyze')?.suggestions || 0
        });
      } catch (error) {
        edgeCaseResults.push({
          scenario: scenario.name,
          error: error.message,
          result: null
        });
      }
    }

    return edgeCaseResults;
  }

  generateReport() {
    const totalDuration = performance.now() - this.startTime;
    const allRequests = this.results.flatMap(r => r.requests || []);
    const successfulRequests = allRequests.filter(r => r.success);
    const failedRequests = allRequests.filter(r => !r.success);
    
    const responseTimes = allRequests.map(r => r.duration);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);

    const report = {
      testSummary: {
        totalDuration: `${totalDuration.toFixed(2)}ms`,
        totalUsers: CONCURRENT_USERS,
        totalRequests: allRequests.length,
        successfulRequests: successfulRequests.length,
        failedRequests: failedRequests.length,
        successRate: `${((successfulRequests.length / allRequests.length) * 100).toFixed(2)}%`
      },
      performanceMetrics: {
        averageResponseTime: `${avgResponseTime.toFixed(2)}ms`,
        maxResponseTime: `${maxResponseTime.toFixed(2)}ms`,
        minResponseTime: `${minResponseTime.toFixed(2)}ms`,
        requestsPerSecond: `${(allRequests.length / (totalDuration / 1000)).toFixed(2)}`
      },
      scenarioAnalysis: this.results.map(result => ({
        userId: result.userId,
        scenario: result.scenario,
        totalDuration: `${result.totalDuration?.toFixed(2)}ms`,
        requests: result.requests?.length || 0,
        errors: result.errors?.length || 0,
        suggestions: result.requests?.find(r => r.type === 'analyze')?.suggestions || 0
      })),
      errorAnalysis: {
        totalErrors: this.results.reduce((sum, r) => sum + (r.errors?.length || 0), 0),
        errorTypes: this.results.flatMap(r => r.errors || []).reduce((acc, error) => {
          acc[error.type] = (acc[error.type] || 0) + 1;
          return acc;
        }, {})
      },
      recommendations: this.generateRecommendations(successfulRequests, failedRequests, avgResponseTime)
    };

    return report;
  }

  generateRecommendations(successfulRequests, failedRequests, avgResponseTime) {
    const recommendations = [];
    
    if (failedRequests.length > 0) {
      recommendations.push({
        type: 'error',
        priority: 'high',
        message: `${failedRequests.length} requests failed. Check server logs and error handling.`
      });
    }
    
    if (avgResponseTime > 5000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: `Average response time is ${avgResponseTime.toFixed(2)}ms. Consider optimizing API endpoints.`
      });
    }
    
    if (successfulRequests.length < 10) {
      recommendations.push({
        type: 'reliability',
        priority: 'medium',
        message: 'Low success rate. Check system stability and error handling.'
      });
    }

    return recommendations;
  }
}

// Main execution
async function runStressTest() {
  console.log('🧪 Task Suggestion System Stress Test');
  console.log('=====================================\n');

  const stressTest = new TaskSuggestionStressTest();

  try {
    // Run concurrent user simulation
    await stressTest.runConcurrentUsers();
    
    // Run edge case tests
    const edgeCaseResults = await stressTest.runEdgeCaseTests();
    
    // Generate comprehensive report
    const report = stressTest.generateReport();
    
    // Display results
    console.log('\n📊 STRESS TEST RESULTS');
    console.log('=====================');
    console.log(`Total Duration: ${report.testSummary.totalDuration}`);
    console.log(`Total Requests: ${report.testSummary.totalRequests}`);
    console.log(`Success Rate: ${report.testSummary.successRate}`);
    console.log(`Average Response Time: ${report.performanceMetrics.averageResponseTime}`);
    console.log(`Requests Per Second: ${report.performanceMetrics.requestsPerSecond}`);
    
    console.log('\n🔍 SCENARIO ANALYSIS');
    console.log('===================');
    report.scenarioAnalysis.forEach(scenario => {
      console.log(`${scenario.userId}: ${scenario.scenario} - ${scenario.totalDuration} - ${scenario.requests} requests - ${scenario.suggestions} suggestions`);
    });
    
    console.log('\n❌ ERROR ANALYSIS');
    console.log('=================');
    console.log(`Total Errors: ${report.errorAnalysis.totalErrors}`);
    Object.entries(report.errorAnalysis.errorTypes).forEach(([type, count]) => {
      console.log(`${type}: ${count}`);
    });
    
    console.log('\n💡 RECOMMENDATIONS');
    console.log('==================');
    report.recommendations.forEach(rec => {
      console.log(`[${rec.priority.toUpperCase()}] ${rec.message}`);
    });

    // Save detailed report to file
    const fs = require('fs');
    const reportPath = './stress-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  } catch (error) {
    console.error('❌ Stress test failed:', error);
  }
}

// Check if server is running
async function checkServerHealth() {
  try {
    const response = await fetch(`${BASE_URL}/api/projects`);
    if (response.ok) {
      console.log('✅ Server is running and accessible');
      return true;
    } else {
      console.log('❌ Server responded with error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to server:', error.message);
    console.log('💡 Make sure the server is running on http://localhost:5000');
    return false;
  }
}

// Run the stress test
if (require.main === module) {
  checkServerHealth().then(serverRunning => {
    if (serverRunning) {
      runStressTest();
    } else {
      console.log('❌ Cannot run stress test - server is not accessible');
      process.exit(1);
    }
  });
}

module.exports = { TaskSuggestionStressTest, runStressTest };
