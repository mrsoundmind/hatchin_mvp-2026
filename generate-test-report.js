#!/usr/bin/env node

/**
 * Comprehensive Test Report Generator
 * 
 * This script generates a detailed HTML report from all test results
 * and provides actionable insights for the task suggestion system.
 */

const fs = require('fs');
const path = require('path');

class TestReportGenerator {
  constructor() {
    this.reportData = {
      timestamp: new Date().toISOString(),
      testResults: {},
      systemHealth: 'unknown',
      criticalIssues: [],
      performanceIssues: [],
      recommendations: []
    };
  }

  async loadTestResults() {
    const reportFiles = [
      './comprehensive-test-report.json',
      './api-test-report.json',
      './stress-test-report.json',
      './user-behavior-simulation-report.json'
    ];

    for (const file of reportFiles) {
      if (fs.existsSync(file)) {
        try {
          const data = JSON.parse(fs.readFileSync(file, 'utf8'));
          const testType = path.basename(file, '.json').replace('-report', '');
          this.reportData.testResults[testType] = data;
          console.log(`✅ Loaded ${testType} results`);
        } catch (error) {
          console.log(`⚠️  Could not load ${file}: ${error.message}`);
        }
      } else {
        console.log(`⚠️  Report file not found: ${file}`);
      }
    }
  }

  analyzeSystemHealth() {
    const issues = [];
    const performanceIssues = [];
    let overallHealth = 'excellent';

    // Analyze API test results
    if (this.reportData.testResults.api) {
      const apiResults = this.reportData.testResults.api;
      if (apiResults.summary && apiResults.summary.failedTests > 0) {
        issues.push({
          type: 'API_FAILURE',
          severity: 'high',
          message: `${apiResults.summary.failedTests} API tests failed`,
          details: apiResults.detailedResults?.filter(r => !r.success) || []
        });
        overallHealth = 'poor';
      }

      if (apiResults.performance && apiResults.performance.averageAnalyzeTime > 5000) {
        performanceIssues.push({
          type: 'SLOW_API_RESPONSE',
          severity: 'medium',
          message: `API average response time is ${apiResults.performance.averageAnalyzeTime.toFixed(2)}ms`,
          recommendation: 'Optimize API endpoints and consider caching'
        });
        if (overallHealth === 'excellent') overallHealth = 'good';
      }
    }

    // Analyze stress test results
    if (this.reportData.testResults.stress) {
      const stressResults = this.reportData.testResults.stress;
      if (stressResults.testSummary && stressResults.testSummary.failedRequests > 0) {
        issues.push({
          type: 'STRESS_TEST_FAILURE',
          severity: 'high',
          message: `${stressResults.testSummary.failedRequests} stress test requests failed`,
          details: stressResults.errorAnalysis || {}
        });
        overallHealth = 'poor';
      }

      if (stressResults.performanceMetrics && stressResults.performanceMetrics.averageResponseTime > 3000) {
        performanceIssues.push({
          type: 'STRESS_PERFORMANCE',
          severity: 'medium',
          message: `Stress test average response time is ${stressResults.performanceMetrics.averageResponseTime}ms`,
          recommendation: 'Consider load balancing and server scaling'
        });
      }
    }

    // Analyze user behavior simulation results
    if (this.reportData.testResults['user-behavior-simulation']) {
      const behaviorResults = this.reportData.testResults['user-behavior-simulation'];
      if (behaviorResults.simulationSummary && behaviorResults.simulationSummary.successRate < 80) {
        issues.push({
          type: 'BEHAVIOR_SIMULATION_FAILURE',
          severity: 'medium',
          message: `User behavior simulation success rate is ${behaviorResults.simulationSummary.successRate}%`,
          details: behaviorResults.personaAnalysis || {}
        });
        if (overallHealth === 'excellent') overallHealth = 'good';
      }
    }

    this.reportData.systemHealth = overallHealth;
    this.reportData.criticalIssues = issues;
    this.reportData.performanceIssues = performanceIssues;
  }

  generateRecommendations() {
    const recommendations = [];

    // Critical issues recommendations
    if (this.reportData.criticalIssues.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'reliability',
        title: 'Fix Critical System Issues',
        description: 'Address all critical issues before production deployment',
        actions: [
          'Review and fix all API endpoint failures',
          'Implement comprehensive error handling',
          'Add proper input validation and sanitization',
          'Set up monitoring and alerting systems',
          'Conduct thorough code review and testing'
        ]
      });
    }

    // Performance recommendations
    if (this.reportData.performanceIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        title: 'Optimize System Performance',
        description: 'Improve response times and system throughput',
        actions: [
          'Profile API endpoints for bottlenecks',
          'Implement caching strategies (Redis, in-memory)',
          'Optimize database queries and add indexes',
          'Consider implementing CDN for static assets',
          'Add response time monitoring and alerting',
          'Implement request rate limiting and throttling'
        ]
      });
    }

    // General system improvements
    recommendations.push({
      priority: 'medium',
      category: 'monitoring',
      title: 'Implement Comprehensive Monitoring',
      description: 'Add monitoring, logging, and alerting systems',
      actions: [
        'Set up application performance monitoring (APM)',
        'Implement structured logging with correlation IDs',
        'Add health check endpoints for all services',
        'Create dashboards for key metrics and KPIs',
        'Set up alerting for critical failures and performance degradation',
        'Implement distributed tracing for request flows'
      ]
    });

    recommendations.push({
      priority: 'medium',
      category: 'security',
      title: 'Enhance Security Measures',
      description: 'Implement security best practices and monitoring',
      actions: [
        'Add input validation and sanitization for all endpoints',
        'Implement rate limiting and DDoS protection',
        'Add security headers and HTTPS enforcement',
        'Conduct security audit and penetration testing',
        'Implement proper authentication and authorization',
        'Add security monitoring and threat detection'
      ]
    });

    recommendations.push({
      priority: 'low',
      category: 'scalability',
      title: 'Plan for Scalability',
      description: 'Prepare the system for increased load and usage',
      actions: [
        'Implement horizontal scaling strategies',
        'Add load balancing and auto-scaling',
        'Optimize database performance and consider sharding',
        'Implement caching at multiple levels',
        'Plan for microservices architecture if needed',
        'Add capacity planning and load testing'
      ]
    });

    this.reportData.recommendations = recommendations;
  }

  generateHTMLReport() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Suggestion System - Comprehensive Test Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h2 {
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .health-status {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.9em;
        }
        .health-excellent { background: #d4edda; color: #155724; }
        .health-good { background: #fff3cd; color: #856404; }
        .health-fair { background: #f8d7da; color: #721c24; }
        .health-poor { background: #f5c6cb; color: #721c24; }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .metric-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .metric-card h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 1.1em;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .issue-list {
            list-style: none;
            padding: 0;
        }
        .issue-item {
            background: #f8f9fa;
            margin: 10px 0;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #dc3545;
        }
        .issue-severity {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        .severity-high { background: #f8d7da; color: #721c24; }
        .severity-medium { background: #fff3cd; color: #856404; }
        .severity-low { background: #d1ecf1; color: #0c5460; }
        .recommendation {
            background: #e7f3ff;
            border: 1px solid #b3d9ff;
            border-radius: 6px;
            padding: 20px;
            margin: 15px 0;
        }
        .recommendation h4 {
            margin: 0 0 10px 0;
            color: #0066cc;
        }
        .recommendation .priority {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        .priority-critical { background: #f8d7da; color: #721c24; }
        .priority-high { background: #fff3cd; color: #856404; }
        .priority-medium { background: #d1ecf1; color: #0c5460; }
        .priority-low { background: #d4edda; color: #155724; }
        .actions-list {
            list-style: none;
            padding: 0;
        }
        .actions-list li {
            padding: 5px 0;
            padding-left: 20px;
            position: relative;
        }
        .actions-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #28a745;
            font-weight: bold;
        }
        .test-results {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .test-results h4 {
            margin: 0 0 15px 0;
            color: #333;
        }
        .test-metric {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #dee2e6;
        }
        .test-metric:last-child {
            border-bottom: none;
        }
        .timestamp {
            color: #6c757d;
            font-size: 0.9em;
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Task Suggestion System</h1>
            <p>Comprehensive Test Report</p>
            <p>Generated: ${new Date(this.reportData.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>System Health Overview</h2>
                <p>Overall System Health: <span class="health-status health-${this.reportData.systemHealth}">${this.reportData.systemHealth}</span></p>
                
                <div class="metrics-grid">
                    <div class="metric-card">
                        <h3>Critical Issues</h3>
                        <div class="metric-value">${this.reportData.criticalIssues.length}</div>
                    </div>
                    <div class="metric-card">
                        <h3>Performance Issues</h3>
                        <div class="metric-value">${this.reportData.performanceIssues.length}</div>
                    </div>
                    <div class="metric-card">
                        <h3>Recommendations</h3>
                        <div class="metric-value">${this.reportData.recommendations.length}</div>
                    </div>
                </div>
            </div>

            ${this.generateTestResultsSection()}
            ${this.generateIssuesSection()}
            ${this.generateRecommendationsSection()}
        </div>
        
        <div class="timestamp">
            Report generated on ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>`;

    return html;
  }

  generateTestResultsSection() {
    let html = '<div class="section"><h2>Test Results Summary</h2>';
    
    Object.entries(this.reportData.testResults).forEach(([testType, results]) => {
      html += `<div class="test-results">
        <h4>${testType.charAt(0).toUpperCase() + testType.slice(1).replace('-', ' ')} Test</h4>`;
      
      if (results.summary) {
        html += `
          <div class="test-metric">
            <span>Total Tests:</span>
            <span>${results.summary.totalTests || results.summary.totalRequests || 'N/A'}</span>
          </div>
          <div class="test-metric">
            <span>Success Rate:</span>
            <span>${results.summary.successRate || 'N/A'}</span>
          </div>`;
      }
      
      if (results.performanceMetrics) {
        html += `
          <div class="test-metric">
            <span>Average Response Time:</span>
            <span>${results.performanceMetrics.averageResponseTime || 'N/A'}</span>
          </div>`;
      }
      
      html += '</div>';
    });
    
    html += '</div>';
    return html;
  }

  generateIssuesSection() {
    if (this.reportData.criticalIssues.length === 0 && this.reportData.performanceIssues.length === 0) {
      return '<div class="section"><h2>Issues</h2><p>✅ No critical issues found!</p></div>';
    }

    let html = '<div class="section"><h2>Issues</h2>';
    
    if (this.reportData.criticalIssues.length > 0) {
      html += '<h3>Critical Issues</h3><ul class="issue-list">';
      this.reportData.criticalIssues.forEach(issue => {
        html += `
          <li class="issue-item">
            <span class="issue-severity severity-${issue.severity}">${issue.severity}</span>
            <strong>${issue.type}:</strong> ${issue.message}
          </li>`;
      });
      html += '</ul>';
    }
    
    if (this.reportData.performanceIssues.length > 0) {
      html += '<h3>Performance Issues</h3><ul class="issue-list">';
      this.reportData.performanceIssues.forEach(issue => {
        html += `
          <li class="issue-item">
            <span class="issue-severity severity-medium">medium</span>
            <strong>${issue.type}:</strong> ${issue.message}
          </li>`;
      });
      html += '</ul>';
    }
    
    html += '</div>';
    return html;
  }

  generateRecommendationsSection() {
    let html = '<div class="section"><h2>Recommendations</h2>';
    
    this.reportData.recommendations.forEach(rec => {
      html += `
        <div class="recommendation">
          <span class="priority priority-${rec.priority}">${rec.priority}</span>
          <h4>${rec.title}</h4>
          <p>${rec.description}</p>
          <ul class="actions-list">`;
      
      rec.actions.forEach(action => {
        html += `<li>${action}</li>`;
      });
      
      html += '</ul></div>';
    });
    
    html += '</div>';
    return html;
  }

  async generateReport() {
    console.log('📊 Generating comprehensive test report...');
    
    await this.loadTestResults();
    this.analyzeSystemHealth();
    this.generateRecommendations();
    
    const html = this.generateHTMLReport();
    
    // Save HTML report
    const reportPath = './comprehensive-test-report.html';
    fs.writeFileSync(reportPath, html);
    console.log(`✅ HTML report saved to: ${reportPath}`);
    
    // Save JSON report
    const jsonPath = './final-test-report.json';
    fs.writeFileSync(jsonPath, JSON.stringify(this.reportData, null, 2));
    console.log(`✅ JSON report saved to: ${jsonPath}`);
    
    return this.reportData;
  }
}

// Main execution
async function generateReport() {
  const generator = new TestReportGenerator();
  const report = await generator.generateReport();
  
  console.log('\n📋 REPORT SUMMARY');
  console.log('==================');
  console.log(`System Health: ${report.systemHealth.toUpperCase()}`);
  console.log(`Critical Issues: ${report.criticalIssues.length}`);
  console.log(`Performance Issues: ${report.performanceIssues.length}`);
  console.log(`Recommendations: ${report.recommendations.length}`);
  
  if (report.criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES:');
    report.criticalIssues.forEach(issue => {
      console.log(`  - ${issue.type}: ${issue.message}`);
    });
  }
  
  console.log('\n💡 TOP RECOMMENDATIONS:');
  report.recommendations.slice(0, 3).forEach(rec => {
    console.log(`  [${rec.priority.toUpperCase()}] ${rec.title}`);
  });
  
  console.log('\n📄 Reports generated:');
  console.log('  - comprehensive-test-report.html (HTML report)');
  console.log('  - final-test-report.json (JSON data)');
}

if (require.main === module) {
  generateReport().catch(error => {
    console.error('❌ Report generation failed:', error);
    process.exit(1);
  });
}

module.exports = { TestReportGenerator, generateReport };
