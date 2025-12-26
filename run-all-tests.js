#!/usr/bin/env node

/**
 * Master Test Runner for Task Suggestion System
 * 
 * This script runs all tests in sequence and generates a comprehensive report.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class MasterTestRunner {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  async runTest(testName, testScript) {
    console.log(`\n🧪 Running ${testName}...`);
    console.log('='.repeat(50));
    
    return new Promise((resolve) => {
      const child = spawn('node', [testScript], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      child.on('close', (code) => {
        const result = {
          testName,
          script: testScript,
          exitCode: code,
          success: code === 0,
          timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        if (code === 0) {
          console.log(`✅ ${testName} completed successfully`);
        } else {
          console.log(`❌ ${testName} failed with exit code ${code}`);
        }
        
        resolve(result);
      });
      
      child.on('error', (error) => {
        console.log(`❌ ${testName} failed to start: ${error.message}`);
        resolve({
          testName,
          script: testScript,
          error: error.message,
          success: false,
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  async runAllTests() {
    console.log('🚀 MASTER TEST RUNNER FOR TASK SUGGESTION SYSTEM');
    console.log('===============================================');
    console.log(`Started at: ${new Date().toLocaleString()}\n`);

    const tests = [
      { name: 'API Endpoint Tests', script: 'test-task-suggestion-api.js' },
      { name: 'User Behavior Simulation', script: 'simulate-user-behaviors.js' },
      { name: 'Stress Tests', script: 'stress-test-task-suggestions.js' },
      { name: 'Comprehensive Tests', script: 'run-comprehensive-test.js' }
    ];

    // Check if server is running
    console.log('🔍 Checking server status...');
    try {
      const fetch = require('node-fetch');
      const response = await fetch('http://localhost:5000/api/projects');
      if (response.ok) {
        console.log('✅ Server is running and accessible\n');
      } else {
        console.log('❌ Server is not responding properly');
        console.log('💡 Please start the server first: cd server && npm start');
        return;
      }
    } catch (error) {
      console.log('❌ Cannot connect to server:', error.message);
      console.log('💡 Please start the server first: cd server && npm start');
      return;
    }

    // Run each test
    for (const test of tests) {
      if (fs.existsSync(test.script)) {
        await this.runTest(test.name, test.script);
        
        // Wait between tests to avoid overwhelming the server
        console.log('⏳ Waiting 3 seconds before next test...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        console.log(`⚠️  Test script not found: ${test.script}`);
        this.testResults.push({
          testName: test.name,
          script: test.script,
          error: 'Script not found',
          success: false,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Generate final report
    console.log('\n📊 Generating final report...');
    await this.generateFinalReport();
  }

  async generateFinalReport() {
    try {
      const { generateReport } = require('./generate-test-report.js');
      await generateReport();
      
      console.log('\n🎯 MASTER TEST RUNNER SUMMARY');
      console.log('============================');
      console.log(`Total Tests Run: ${this.testResults.length}`);
      console.log(`Successful: ${this.testResults.filter(r => r.success).length}`);
      console.log(`Failed: ${this.testResults.filter(r => !r.success).length}`);
      console.log(`Total Duration: ${((Date.now() - this.startTime) / 1000).toFixed(2)} seconds`);
      
      console.log('\n📋 TEST RESULTS:');
      this.testResults.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`  ${status} ${result.testName}`);
        if (result.error) {
          console.log(`      Error: ${result.error}`);
        }
      });
      
      console.log('\n📄 REPORTS GENERATED:');
      const reportFiles = [
        'comprehensive-test-report.html',
        'final-test-report.json',
        'api-test-report.json',
        'stress-test-report.json',
        'user-behavior-simulation-report.json'
      ];
      
      reportFiles.forEach(file => {
        if (fs.existsSync(file)) {
          console.log(`  ✅ ${file}`);
        } else {
          console.log(`  ⚠️  ${file} (not found)`);
        }
      });
      
      console.log('\n🎉 All tests completed!');
      console.log('📖 Open comprehensive-test-report.html in your browser to view the detailed report.');
      
    } catch (error) {
      console.error('❌ Error generating final report:', error);
    }
  }
}

// Main execution
async function runAllTests() {
  const runner = new MasterTestRunner();
  await runner.runAllTests();
}

if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Master test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { MasterTestRunner, runAllTests };
