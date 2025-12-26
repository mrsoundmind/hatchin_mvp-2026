#!/usr/bin/env node

/**
 * User Behavior Simulation for Task Suggestion System
 * 
 * This script simulates realistic user behaviors and conversation patterns
 * to test the task suggestion system under various scenarios.
 */

const fetch = require('node-fetch');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:5000';

// Simulated user personas and their conversation patterns
const userPersonas = {
  productManager: {
    name: "Product Manager",
    traits: ["strategic", "planning-focused", "user-centric"],
    conversationPatterns: [
      "We need to prioritize features based on user feedback",
      "Let's create a roadmap for the next quarter",
      "We should conduct user research before building",
      "How can we improve user engagement?",
      "Let's analyze the market competition"
    ]
  },
  
  developer: {
    name: "Developer",
    traits: ["technical", "implementation-focused", "problem-solving"],
    conversationPatterns: [
      "We need to refactor this code for better performance",
      "Let's implement proper error handling",
      "We should add unit tests for this feature",
      "The database queries are too slow",
      "We need to optimize the API endpoints"
    ]
  },
  
  designer: {
    name: "Designer",
    traits: ["user-experience", "visual", "creative"],
    conversationPatterns: [
      "We need to improve the user interface",
      "Let's create a design system",
      "The user flow needs to be simplified",
      "We should conduct usability testing",
      "Let's create wireframes for this feature"
    ]
  },
  
  qaEngineer: {
    name: "QA Engineer",
    traits: ["testing", "quality-focused", "detail-oriented"],
    conversationPatterns: [
      "We need to write test cases for this feature",
      "Let's implement automated testing",
      "We should test edge cases and error scenarios",
      "The bug reports are increasing",
      "We need to improve test coverage"
    ]
  }
};

// Conversation scenarios that should generate tasks
const taskGeneratingScenarios = [
  {
    name: "Feature Planning Session",
    participants: ["productManager", "developer", "designer"],
    conversation: [
      { role: "user", content: "We need to build a new dashboard for our users" },
      { role: "assistant", content: "That's a great idea. We should start with user research to understand their needs." },
      { role: "user", content: "Good point. We also need to create wireframes and mockups first." },
      { role: "assistant", content: "Absolutely. We should also plan the technical architecture and database schema." },
      { role: "user", content: "Let's also implement proper authentication and user management." },
      { role: "assistant", content: "Good thinking. We should also add analytics to track user behavior." }
    ],
    expectedTasks: ["User research", "Wireframes", "Technical architecture", "Authentication", "Analytics"]
  },
  
  {
    name: "Bug Fix Session",
    participants: ["developer", "qaEngineer"],
    conversation: [
      { role: "user", content: "The login system is broken. Users can't authenticate." },
      { role: "assistant", content: "Let's debug this step by step. First, let's check the authentication flow." },
      { role: "user", content: "The issue is with JWT token validation. We need to fix the middleware." },
      { role: "assistant", content: "We should also add proper error logging and monitoring." },
      { role: "user", content: "Good idea. Let's also write tests to prevent this from happening again." },
      { role: "assistant", content: "Absolutely. We should also implement proper error handling throughout the app." }
    ],
    expectedTasks: ["Fix JWT validation", "Debug authentication", "Add error logging", "Write tests", "Error handling"]
  },
  
  {
    name: "Performance Optimization",
    participants: ["developer", "qaEngineer"],
    conversation: [
      { role: "user", content: "Our app is running slowly. We need to optimize performance." },
      { role: "assistant", content: "Let's start by profiling the application to identify bottlenecks." },
      { role: "user", content: "We should implement caching and optimize database queries." },
      { role: "assistant", content: "Good points. We should also add monitoring and alerting." },
      { role: "user", content: "Let's also implement lazy loading and code splitting." },
      { role: "assistant", content: "Excellent. We should also optimize images and implement CDN." }
    ],
    expectedTasks: ["Performance profiling", "Caching", "Database optimization", "Monitoring", "Lazy loading", "CDN"]
  }
];

// Edge case scenarios
const edgeCaseScenarios = [
  {
    name: "Empty Messages",
    conversation: [
      { role: "user", content: "" },
      { role: "assistant", content: "" },
      { role: "user", content: "We need to fix the bug" }
    ]
  },
  
  {
    name: "Very Long Messages",
    conversation: [
      { role: "user", content: "We need to implement a comprehensive user management system that includes authentication, authorization, user profiles, role-based access control, audit logging, session management, password reset functionality, email verification, two-factor authentication, social login integration, user preferences, notification settings, privacy controls, data export capabilities, account deletion, user analytics, engagement tracking, A/B testing framework, personalization engine, recommendation system, content filtering, spam detection, user feedback collection, support ticket system, help documentation, onboarding flow, user education, feature tutorials, in-app messaging, push notifications, email campaigns, user segmentation, cohort analysis, retention tracking, churn prediction, user satisfaction surveys, NPS scoring, customer support integration, user research tools, usability testing, accessibility compliance, internationalization, localization, multi-language support, timezone handling, currency conversion, cultural adaptation, legal compliance, GDPR compliance, data privacy, security audit, penetration testing, vulnerability assessment, code review, security training, incident response, disaster recovery, backup systems, monitoring, alerting, logging, analytics, reporting, dashboard creation, data visualization, business intelligence, machine learning integration, AI-powered features, natural language processing, sentiment analysis, content moderation, automated testing, continuous integration, continuous deployment, infrastructure as code, containerization, orchestration, scaling, load balancing, caching, CDN, database optimization, query optimization, indexing, sharding, replication, backup, recovery, monitoring, alerting, logging, analytics, reporting, and much more." }
    ]
  },
  
  {
    name: "Special Characters",
    conversation: [
      { role: "user", content: "We need to fix the bug with special characters: !@#$%^&*()_+-=[]{}|;':\",./<>?" },
      { role: "assistant", content: "Let's handle the encoding properly and add validation." }
    ]
  },
  
  {
    name: "Unicode Characters",
    conversation: [
      { role: "user", content: "We need to support international users: 你好世界 🌍 café naïve résumé" },
      { role: "assistant", content: "Let's implement proper Unicode support and internationalization." }
    ]
  }
];

class UserBehaviorSimulator {
  constructor() {
    this.results = [];
    this.startTime = performance.now();
  }

  async simulatePersonaConversation(persona, scenario) {
    const simulationResult = {
      persona: persona.name,
      scenario: scenario.name,
      startTime: performance.now(),
      success: false,
      responseTime: 0,
      suggestions: [],
      errors: []
    };

    try {
      console.log(`🎭 Simulating ${persona.name} in ${scenario.name}`);
      
      // Simulate conversation analysis
      const analyzeStart = performance.now();
      const response = await fetch(`${BASE_URL}/api/task-suggestions/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: `sim-${Date.now()}`,
          projectId: 'sim-project',
          teamId: 'sim-team',
          agentId: 'sim-agent',
          messages: scenario.conversation.map((msg, index) => ({
            id: `sim-msg-${index}`,
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

      simulationResult.responseTime = performance.now() - analyzeStart;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      simulationResult.suggestions = data.suggestions || [];
      simulationResult.success = true;

      console.log(`✅ ${persona.name}: ${simulationResult.suggestions.length} suggestions found`);
      
      // Validate suggestions quality
      this.validateSuggestionQuality(simulationResult.suggestions, scenario);

    } catch (error) {
      simulationResult.errors.push({
        type: 'simulation_error',
        message: error.message,
        timestamp: performance.now()
      });
      console.log(`❌ ${persona.name}: ${error.message}`);
    }

    simulationResult.endTime = performance.now();
    simulationResult.totalDuration = simulationResult.endTime - simulationResult.startTime;
    
    this.results.push(simulationResult);
    return simulationResult;
  }

  validateSuggestionQuality(suggestions, scenario) {
    if (!Array.isArray(suggestions)) {
      throw new Error('Suggestions should be an array');
    }

    // Check for required fields
    suggestions.forEach((suggestion, index) => {
      const requiredFields = ['id', 'title', 'description', 'priority', 'suggestedAssignee'];
      const missingFields = requiredFields.filter(field => !suggestion[field]);
      
      if (missingFields.length > 0) {
        console.log(`⚠️  Suggestion ${index} missing fields: ${missingFields.join(', ')}`);
      }
    });

    // Check if suggestions are relevant to the conversation
    if (scenario.expectedTasks && suggestions.length > 0) {
      const suggestionTitles = suggestions.map(s => s.title.toLowerCase());
      const expectedTasks = scenario.expectedTasks.map(t => t.toLowerCase());
      
      const relevantSuggestions = expectedTasks.filter(expected => 
        suggestionTitles.some(title => title.includes(expected) || expected.includes(title))
      );
      
      const relevanceScore = (relevantSuggestions.length / expectedTasks.length) * 100;
      console.log(`📊 Relevance Score: ${relevanceScore.toFixed(1)}%`);
    }
  }

  async runPersonaSimulations() {
    console.log('🎭 Running Persona-Based Simulations');
    console.log('====================================\n');

    const personaResults = [];

    // Test each persona with different scenarios
    for (const [personaKey, persona] of Object.entries(userPersonas)) {
      console.log(`\n👤 Testing Persona: ${persona.name}`);
      console.log('─'.repeat(40));
      
      for (const scenario of taskGeneratingScenarios) {
        try {
          const result = await this.simulatePersonaConversation(persona, scenario);
          personaResults.push(result);
        } catch (error) {
          console.error(`❌ Error simulating ${persona.name}:`, error);
        }
      }
    }

    return personaResults;
  }

  async runEdgeCaseSimulations() {
    console.log('\n🧪 Running Edge Case Simulations');
    console.log('=================================\n');

    const edgeCaseResults = [];

    for (const scenario of edgeCaseScenarios) {
      try {
        console.log(`🔬 Testing: ${scenario.name}`);
        
        const result = await this.simulatePersonaConversation(
          { name: "Edge Case User" }, 
          scenario
        );
        
        edgeCaseResults.push({
          scenario: scenario.name,
          result,
          handled: result.success,
          suggestions: result.suggestions.length
        });
        
      } catch (error) {
        console.error(`❌ Edge case ${scenario.name} failed:`, error);
        edgeCaseResults.push({
          scenario: scenario.name,
          error: error.message,
          handled: false
        });
      }
    }

    return edgeCaseResults;
  }

  async runRealisticUserFlow() {
    console.log('\n🔄 Running Realistic User Flow Simulation');
    console.log('==========================================\n');

    const flowResults = [];

    // Simulate a realistic development workflow
    const workflowSteps = [
      {
        name: "Planning Phase",
        conversation: [
          { role: "user", content: "We need to plan our next sprint" },
          { role: "assistant", content: "Let's start by reviewing our backlog and prioritizing features." },
          { role: "user", content: "We should focus on the user authentication system first." }
        ]
      },
      {
        name: "Development Phase",
        conversation: [
          { role: "user", content: "Let's implement the authentication system" },
          { role: "assistant", content: "We should start with the database schema and API endpoints." },
          { role: "user", content: "Good idea. We also need to add proper validation and error handling." }
        ]
      },
      {
        name: "Testing Phase",
        conversation: [
          { role: "user", content: "We need to test the authentication system" },
          { role: "assistant", content: "Let's write unit tests and integration tests." },
          { role: "user", content: "We should also test edge cases and security scenarios." }
        ]
      },
      {
        name: "Deployment Phase",
        conversation: [
          { role: "user", content: "We're ready to deploy the authentication system" },
          { role: "assistant", content: "Let's set up monitoring and rollback procedures." },
          { role: "user", content: "We should also create documentation for the team." }
        ]
      }
    ];

    for (const step of workflowSteps) {
      try {
        console.log(`📋 Testing: ${step.name}`);
        
        const result = await this.simulatePersonaConversation(
          { name: "Development Team" },
          { name: step.name, conversation: step.conversation }
        );
        
        flowResults.push({
          step: step.name,
          result,
          suggestions: result.suggestions.length,
          responseTime: result.responseTime
        });
        
      } catch (error) {
        console.error(`❌ Workflow step ${step.name} failed:`, error);
      }
    }

    return flowResults;
  }

  generateBehaviorReport() {
    const totalDuration = performance.now() - this.startTime;
    const allResults = this.results;
    const successfulResults = allResults.filter(r => r.success);
    const failedResults = allResults.filter(r => !r.success);

    const report = {
      simulationSummary: {
        totalSimulations: allResults.length,
        successfulSimulations: successfulResults.length,
        failedSimulations: failedResults.length,
        successRate: `${((successfulResults.length / allResults.length) * 100).toFixed(2)}%`,
        totalDuration: `${totalDuration.toFixed(2)}ms`
      },
      performanceMetrics: {
        averageResponseTime: this.calculateAverageResponseTime(),
        maxResponseTime: Math.max(...allResults.map(r => r.responseTime)),
        minResponseTime: Math.min(...allResults.map(r => r.responseTime)),
        totalSuggestions: allResults.reduce((sum, r) => sum + r.suggestions.length, 0)
      },
      personaAnalysis: this.analyzePersonaResults(),
      edgeCaseAnalysis: this.analyzeEdgeCaseResults(),
      recommendations: this.generateBehaviorRecommendations()
    };

    return report;
  }

  calculateAverageResponseTime() {
    const responseTimes = this.results.map(r => r.responseTime).filter(t => t > 0);
    if (responseTimes.length === 0) return 0;
    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }

  analyzePersonaResults() {
    const personaStats = {};
    
    this.results.forEach(result => {
      const persona = result.persona;
      if (!personaStats[persona]) {
        personaStats[persona] = {
          totalSimulations: 0,
          successfulSimulations: 0,
          totalSuggestions: 0,
          averageResponseTime: 0
        };
      }
      
      personaStats[persona].totalSimulations++;
      if (result.success) {
        personaStats[persona].successfulSimulations++;
        personaStats[persona].totalSuggestions += result.suggestions.length;
      }
    });

    // Calculate averages
    Object.keys(personaStats).forEach(persona => {
      const stats = personaStats[persona];
      stats.successRate = (stats.successfulSimulations / stats.totalSimulations) * 100;
      stats.averageSuggestions = stats.totalSuggestions / stats.successfulSimulations || 0;
    });

    return personaStats;
  }

  analyzeEdgeCaseResults() {
    const edgeCaseStats = {
      totalEdgeCases: 0,
      handledEdgeCases: 0,
      failedEdgeCases: 0,
      edgeCaseTypes: {}
    };

    this.results.forEach(result => {
      if (result.scenario.includes('Edge Case')) {
        edgeCaseStats.totalEdgeCases++;
        if (result.success) {
          edgeCaseStats.handledEdgeCases++;
        } else {
          edgeCaseStats.failedEdgeCases++;
        }
      }
    });

    return edgeCaseStats;
  }

  generateBehaviorRecommendations() {
    const recommendations = [];
    
    const successRate = (this.results.filter(r => r.success).length / this.results.length) * 100;
    
    if (successRate < 80) {
      recommendations.push({
        priority: 'high',
        type: 'reliability',
        message: `Success rate is ${successRate.toFixed(1)}%. Improve error handling and system stability.`
      });
    }
    
    const avgResponseTime = this.calculateAverageResponseTime();
    if (avgResponseTime > 3000) {
      recommendations.push({
        priority: 'medium',
        type: 'performance',
        message: `Average response time is ${avgResponseTime.toFixed(2)}ms. Consider optimizing the analysis process.`
      });
    }
    
    const totalSuggestions = this.results.reduce((sum, r) => sum + r.suggestions.length, 0);
    if (totalSuggestions === 0) {
      recommendations.push({
        priority: 'high',
        type: 'functionality',
        message: 'No task suggestions generated. Check the AI analysis logic and conversation processing.'
      });
    }

    return recommendations;
  }
}

// Main execution
async function runUserBehaviorSimulation() {
  console.log('🎭 User Behavior Simulation for Task Suggestion System');
  console.log('======================================================\n');

  const simulator = new UserBehaviorSimulator();

  try {
    // Run persona-based simulations
    await simulator.runPersonaSimulations();
    
    // Run edge case simulations
    await simulator.runEdgeCaseSimulations();
    
    // Run realistic workflow simulation
    await simulator.runRealisticUserFlow();
    
    // Generate comprehensive report
    const report = simulator.generateBehaviorReport();
    
    // Display results
    console.log('\n📊 BEHAVIOR SIMULATION RESULTS');
    console.log('=============================');
    console.log(`Total Simulations: ${report.simulationSummary.totalSimulations}`);
    console.log(`Success Rate: ${report.simulationSummary.successRate}`);
    console.log(`Average Response Time: ${report.performanceMetrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`Total Suggestions: ${report.performanceMetrics.totalSuggestions}`);
    
    console.log('\n👤 PERSONA ANALYSIS');
    console.log('===================');
    Object.entries(report.personaAnalysis).forEach(([persona, stats]) => {
      console.log(`${persona}: ${stats.successRate.toFixed(1)}% success, ${stats.averageSuggestions.toFixed(1)} avg suggestions`);
    });
    
    console.log('\n🧪 EDGE CASE ANALYSIS');
    console.log('=====================');
    console.log(`Total Edge Cases: ${report.edgeCaseAnalysis.totalEdgeCases}`);
    console.log(`Handled: ${report.edgeCaseAnalysis.handledEdgeCases}`);
    console.log(`Failed: ${report.edgeCaseAnalysis.failedEdgeCases}`);
    
    console.log('\n💡 RECOMMENDATIONS');
    console.log('==================');
    report.recommendations.forEach(rec => {
      console.log(`[${rec.priority.toUpperCase()}] ${rec.message}`);
    });
    
    // Save detailed report
    const fs = require('fs');
    const reportPath = './user-behavior-simulation-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  } catch (error) {
    console.error('❌ User behavior simulation failed:', error);
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

// Run the simulation
if (require.main === module) {
  checkServerHealth().then(serverRunning => {
    if (serverRunning) {
      runUserBehaviorSimulation();
    } else {
      console.log('❌ Cannot run simulation - server is not accessible');
      process.exit(1);
    }
  });
}

module.exports = { UserBehaviorSimulator, runUserBehaviorSimulation };
