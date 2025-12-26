#!/usr/bin/env node

/**
 * Comprehensive Task Suggestion System Test Runner
 * 
 * This script runs both stress tests and API tests to provide
 * a complete analysis of the task suggestion system.
 */

const { TaskSuggestionStressTest, runStressTest } = require('./stress-test-task-suggestions.js');
const { TaskSuggestionAPITester, runAPITests } = require('./test-task-suggestion-api.js');
const fs = require('fs');
const path = require('path');

class ComprehensiveTestRunner {
  constructor() {
    this.startTime = Date.now();
    this.results = {
      stressTest: null,
      apiTest: null,
      combinedAnalysis: null
    };
  }

  async runAllTests() {
    console.log('🧪 COMPREHENSIVE TASK SUGGESTION SYSTEM TEST');
    console.log('============================================\n');

    try {
      // Run API Tests first (faster, more focused)
      console.log('📋 Phase 1: API Endpoint Testing');
      console.log('================================');
      this.results.apiTest = await runAPITests();
      
      console.log('\n⏳ Waiting 2 seconds before stress test...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Run Stress Tests
      console.log('🚀 Phase 2: Stress Testing');
      console.log('==========================');
      this.results.stressTest = await this.runStressTestWithTimeout();
      
      // Generate combined analysis
      console.log('\n📊 Phase 3: Combined Analysis');
      console.log('=============================');
      this.results.combinedAnalysis = this.generateCombinedAnalysis();
      
      // Display final report
      this.displayFinalReport();
      
      // Save comprehensive report
      this.saveComprehensiveReport();
      
    } catch (error) {
      console.error('❌ Comprehensive test failed:', error);
    }
  }

  async runStressTestWithTimeout() {
    return new Promise((resolve) => {
      const stressTest = new TaskSuggestionStressTest();
      
      // Set a timeout for stress test
      const timeout = setTimeout(() => {
        console.log('⏰ Stress test timeout reached');
        resolve({
          timeout: true,
          message: 'Stress test timed out after 60 seconds'
        });
      }, 60000);
      
      // Run stress test
      stressTest.runConcurrentUsers()
        .then(() => {
          clearTimeout(timeout);
          const report = stressTest.generateReport();
          resolve(report);
        })
        .catch(error => {
          clearTimeout(timeout);
          resolve({
            error: error.message,
            success: false
          });
        });
    });
  }

  generateCombinedAnalysis() {
    const analysis = {
      overallHealth: 'unknown',
      criticalIssues: [],
      performanceIssues: [],
      recommendations: [],
      systemCapabilities: {
        apiReliability: 0,
        stressTestReliability: 0,
        averageResponseTime: 0,
        maxConcurrentUsers: 0
      }
    };

    // Analyze API Test Results
    if (this.results.apiTest) {
      analysis.systemCapabilities.apiReliability = parseFloat(this.results.apiTest.summary.successRate);
      analysis.systemCapabilities.averageResponseTime = this.results.apiTest.performance.averageAnalyzeTime;
      
      if (this.results.apiTest.summary.failedTests > 0) {
        analysis.criticalIssues.push({
          type: 'API_FAILURE',
          severity: 'high',
          message: `${this.results.apiTest.summary.failedTests} API tests failed`,
          details: this.results.apiTest.detailedResults.filter(r => !r.success)
        });
      }
    }

    // Analyze Stress Test Results
    if (this.results.stressTest && !this.results.stressTest.timeout) {
      analysis.systemCapabilities.stressTestReliability = parseFloat(this.results.stressTest.testSummary.successRate);
      analysis.systemCapabilities.maxConcurrentUsers = this.results.stressTest.testSummary.totalUsers;
      
      if (this.results.stressTest.testSummary.failedRequests > 0) {
        analysis.criticalIssues.push({
          type: 'STRESS_TEST_FAILURE',
          severity: 'high',
          message: `${this.results.stressTest.testSummary.failedRequests} stress test requests failed`,
          details: this.results.stressTest.errorAnalysis
        });
      }
    }

    // Performance Analysis
    if (analysis.systemCapabilities.averageResponseTime > 5000) {
      analysis.performanceIssues.push({
        type: 'SLOW_RESPONSE',
        severity: 'medium',
        message: `Average response time is ${analysis.systemCapabilities.averageResponseTime.toFixed(2)}ms`,
        recommendation: 'Consider optimizing API endpoints or increasing server resources'
      });
    }

    // Overall Health Assessment
    if (analysis.criticalIssues.length === 0 && analysis.performanceIssues.length === 0) {
      analysis.overallHealth = 'excellent';
    } else if (analysis.criticalIssues.length === 0) {
      analysis.overallHealth = 'good';
    } else if (analysis.criticalIssues.filter(i => i.severity === 'high').length === 0) {
      analysis.overallHealth = 'fair';
    } else {
      analysis.overallHealth = 'poor';
    }

    // Generate Recommendations
    analysis.recommendations = this.generateSystemRecommendations(analysis);

    return analysis;
  }

  generateSystemRecommendations(analysis) {
    const recommendations = [];

    if (analysis.overallHealth === 'poor') {
      recommendations.push({
        priority: 'critical',
        category: 'reliability',
        title: 'Fix Critical Issues',
        description: 'Address all high-severity issues before deploying to production',
        actions: [
          'Review error logs and fix API endpoint failures',
          'Implement proper error handling and validation',
          'Add comprehensive logging for debugging'
        ]
      });
    }

    if (analysis.performanceIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        title: 'Optimize Performance',
        description: 'Improve system response times and throughput',
        actions: [
          'Profile API endpoints for bottlenecks',
          'Implement caching strategies',
          'Consider database query optimization',
          'Add response time monitoring'
        ]
      });
    }

    if (analysis.systemCapabilities.apiReliability < 90) {
      recommendations.push({
        priority: 'medium',
        category: 'reliability',
        title: 'Improve API Reliability',
        description: 'Enhance API stability and error handling',
        actions: [
          'Add input validation and sanitization',
          'Implement retry mechanisms',
          'Add circuit breakers for external dependencies',
          'Improve error messages and status codes'
        ]
      });
    }

    recommendations.push({
      priority: 'low',
      category: 'monitoring',
      title: 'Implement Monitoring',
      description: 'Add comprehensive monitoring and alerting',
      actions: [
        'Set up performance monitoring (APM)',
        'Add health check endpoints',
        'Implement alerting for critical failures',
        'Create dashboards for system metrics'
      ]
    });

    return recommendations;
  }

  displayFinalReport() {
    console.log('\n🎯 COMPREHENSIVE TEST RESULTS');
    console.log('===============================');
    
    console.log(`\n📊 Overall System Health: ${this.results.combinedAnalysis.overallHealth.toUpperCase()}`);
    
    console.log('\n🔧 System Capabilities:');
    console.log(`  API Reliability: ${this.results.combinedAnalysis.systemCapabilities.apiReliability}%`);
    console.log(`  Stress Test Reliability: ${this.results.combinedAnalysis.systemCapabilities.stressTestReliability}%`);
    console.log(`  Average Response Time: ${this.results.combinedAnalysis.systemCapabilities.averageResponseTime.toFixed(2)}ms`);
    console.log(`  Max Concurrent Users: ${this.results.combinedAnalysis.systemCapabilities.maxConcurrentUsers}`);
    
    if (this.results.combinedAnalysis.criticalIssues.length > 0) {
      console.log('\n🚨 Critical Issues:');
      this.results.combinedAnalysis.criticalIssues.forEach(issue => {
        console.log(`  - ${issue.type}: ${issue.message}`);
      });
    }
    
    if (this.results.combinedAnalysis.performanceIssues.length > 0) {
      console.log('\n⚠️  Performance Issues:');
      this.results.combinedAnalysis.performanceIssues.forEach(issue => {
        console.log(`  - ${issue.type}: ${issue.message}`);
      });
    }
    
    console.log('\n💡 Recommendations:');
    this.results.combinedAnalysis.recommendations.forEach(rec => {
      console.log(`  [${rec.priority.toUpperCase()}] ${rec.title}`);
      console.log(`      ${rec.description}`);
    });
  }

  saveComprehensiveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      testDuration: Date.now() - this.startTime,
      results: this.results,
      summary: {
        overallHealth: this.results.combinedAnalysis.overallHealth,
        criticalIssues: this.results.combinedAnalysis.criticalIssues.length,
        performanceIssues: this.results.combinedAnalysis.performanceIssues.length,
        recommendations: this.results.combinedAnalysis.recommendations.length
      }
    };

    const reportPath = './comprehensive-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Comprehensive report saved to: ${reportPath}`);
  }
}

// Main execution
async function runComprehensiveTest() {
  const runner = new ComprehensiveTestRunner();
  await runner.runAllTests();
}

// Check if this is being run directly
if (require.main === module) {
  runComprehensiveTest().catch(error => {
    console.error('❌ Comprehensive test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { ComprehensiveTestRunner, runComprehensiveTest };
