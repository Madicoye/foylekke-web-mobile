#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Foy Lekke UI Component Tests...\n');

// Component test mapping
const testSuites = [
  {
    name: 'HangoutMessaging Component',
    path: 'src/components/hangouts/__tests__/HangoutMessaging.test.js',
    description: 'Real-time messaging interface tests'
  },
  {
    name: 'PlaceManagement Component', 
    path: 'src/components/admin/__tests__/PlaceManagement.test.js',
    description: 'Admin place management interface tests'
  },
  {
    name: 'NotificationsPage Component',
    path: 'src/pages/__tests__/NotificationsPage.test.js', 
    description: 'Full notifications page tests'
  },
  {
    name: 'ReviewForm Component',
    path: 'src/components/reviews/__tests__/ReviewForm.test.js',
    description: 'Review creation and editing form tests'
  },
  // Additional test files to check
  {
    name: 'AuthContext Tests',
    path: 'src/contexts/__tests__/AuthContext.test.js',
    description: 'Authentication context tests',
    optional: true
  },
  {
    name: 'API Services Tests',
    path: 'src/services/__tests__/api.test.js',
    description: 'API integration tests',
    optional: true
  }
];

// Issues tracker
const issues = {
  critical: [],
  warnings: [],
  suggestions: []
};

function addIssue(type, component, description, solution = null) {
  issues[type].push({
    component,
    description,
    solution,
    timestamp: new Date().toISOString()
  });
}

// Check if test files exist
function checkTestFiles() {
  console.log('📋 Checking test files...\n');
  
  testSuites.forEach(suite => {
    const fullPath = path.join(process.cwd(), suite.path);
    
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${suite.name}: Test file exists`);
    } else {
      console.log(`❌ ${suite.name}: Test file missing`);
      if (!suite.optional) {
        addIssue(
          'critical',
          suite.name,
          `Test file missing: ${suite.path}`,
          `Create test file at ${suite.path}`
        );
      }
    }
  });
  
  console.log('\n');
}

// Run specific test suite
function runTestSuite(testPath, suiteName) {
  return new Promise((resolve) => {
    console.log(`🏃 Running ${suiteName}...`);
    
    const jest = spawn('npm', ['test', '--', testPath, '--verbose', '--no-coverage'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true
    });

    let stdout = '';
    let stderr = '';

    jest.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    jest.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    jest.on('close', (code) => {
      const result = {
        suite: suiteName,
        exitCode: code,
        stdout,
        stderr,
        passed: code === 0
      };

      // Analyze test output for issues
      analyzeTestOutput(result);
      
      resolve(result);
    });
  });
}

// Analyze test output for potential issues
function analyzeTestOutput(result) {
  const { suite, stdout, stderr, passed } = result;
  
  if (!passed) {
    addIssue('critical', suite, 'Test suite failed', 'Review test failures and fix failing tests');
  }

  // Check for common issues in output
  const output = stdout + stderr;
  
  // API-related issues
  if (output.includes('NetworkError') || output.includes('fetch failed')) {
    addIssue('critical', suite, 'API connectivity issues detected', 'Check API endpoints and network configuration');
  }

  // React component issues
  if (output.includes('Warning: ReactDOM.render is no longer supported')) {
    addIssue('warnings', suite, 'Deprecated ReactDOM.render usage', 'Update to use createRoot from react-dom/client');
  }

  // Memory leaks
  if (output.includes('memory leak') || output.includes('Warning: Can\'t perform a React state update')) {
    addIssue('warnings', suite, 'Potential memory leak detected', 'Review component cleanup and useEffect dependencies');
  }

  // Missing dependencies
  if (output.includes('Module not found') || output.includes('Cannot resolve module')) {
    addIssue('critical', suite, 'Missing dependencies detected', 'Install missing packages or check import paths');
  }

  // React Query issues
  if (output.includes('QueryClient')) {
    addIssue('suggestions', suite, 'React Query configuration', 'Ensure QueryClient is properly configured in tests');
  }

  // Authentication issues
  if (output.includes('AuthContext') || output.includes('user is not authenticated')) {
    addIssue('warnings', suite, 'Authentication context issues', 'Mock authentication properly in tests');
  }

  // Accessibility warnings
  if (output.includes('Warning: Invalid aria') || output.includes('accessibility')) {
    addIssue('suggestions', suite, 'Accessibility improvements needed', 'Review ARIA labels and accessibility attributes');
  }
}

// Component-specific issue detection
function detectComponentIssues() {
  console.log('🔍 Detecting component-specific issues...\n');

  // Check HangoutMessaging component
  const hangoutMessagingPath = 'src/components/hangouts/HangoutMessaging.js';
  if (fs.existsSync(hangoutMessagingPath)) {
    const content = fs.readFileSync(hangoutMessagingPath, 'utf8');
    
    if (!content.includes('addMessage')) {
      addIssue('critical', 'HangoutMessaging', 'Missing addMessage API integration', 'Verify API endpoint exists and is properly called');
    }
    
    if (!content.includes('scrollToBottom')) {
      addIssue('warnings', 'HangoutMessaging', 'Missing auto-scroll functionality', 'Implement scroll-to-bottom for new messages');
    }
  }

  // Check PlaceManagement component  
  const placeManagementPath = 'src/components/admin/PlaceManagement.js';
  if (fs.existsSync(placeManagementPath)) {
    const content = fs.readFileSync(placeManagementPath, 'utf8');
    
    if (!content.includes('syncPlacesFromGoogle')) {
      addIssue('critical', 'PlaceManagement', 'Missing Google Places sync functionality', 'Implement syncPlacesFromGoogle API call');
    }
    
    if (!content.includes('deletePlace')) {
      addIssue('critical', 'PlaceManagement', 'Missing delete functionality', 'Implement place deletion with confirmation');
    }
  }

  // Check NotificationsPage
  const notificationsPath = 'src/pages/NotificationsPage.js';
  if (fs.existsSync(notificationsPath)) {
    const content = fs.readFileSync(notificationsPath, 'utf8');
    
    if (!content.includes('markAllAsRead')) {
      addIssue('warnings', 'NotificationsPage', 'Missing bulk mark-as-read functionality', 'Implement mark all as read feature');
    }
  }

  // Check API configuration
  const apiPath = 'src/services/api.js';
  if (fs.existsSync(apiPath)) {
    const content = fs.readFileSync(apiPath, 'utf8');
    
    if (!content.includes('hangoutsAPI.addMessage')) {
      addIssue('critical', 'API Services', 'Missing hangout messaging API endpoint', 'Add addMessage endpoint to hangoutsAPI');
    }
    
    if (!content.includes('notificationsAPI')) {
      addIssue('critical', 'API Services', 'Missing notifications API', 'Implement complete notifications API');
    }
  }

  console.log('✅ Component issue detection complete\n');
}

// Generate test report
function generateReport(testResults) {
  console.log('\n📊 TEST REPORT\n');
  console.log('=' .repeat(50));

  // Test results summary
  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;

  console.log(`\n📈 Test Results Summary:`);
  console.log(`   Total Suites: ${totalTests}`);
  console.log(`   Passed: ${passedTests} ✅`);
  console.log(`   Failed: ${failedTests} ❌`);
  console.log(`   Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

  // Issues summary
  console.log(`\n🚨 Issues Summary:`);
  console.log(`   Critical: ${issues.critical.length} 🔴`);
  console.log(`   Warnings: ${issues.warnings.length} 🟡`);
  console.log(`   Suggestions: ${issues.suggestions.length} 🔵`);

  // Detailed issues
  if (issues.critical.length > 0) {
    console.log(`\n🔴 CRITICAL ISSUES (${issues.critical.length}):`);
    issues.critical.forEach((issue, index) => {
      console.log(`   ${index + 1}. [${issue.component}] ${issue.description}`);
      if (issue.solution) {
        console.log(`      💡 Solution: ${issue.solution}`);
      }
    });
  }

  if (issues.warnings.length > 0) {
    console.log(`\n🟡 WARNINGS (${issues.warnings.length}):`);
    issues.warnings.forEach((issue, index) => {
      console.log(`   ${index + 1}. [${issue.component}] ${issue.description}`);
      if (issue.solution) {
        console.log(`      💡 Solution: ${issue.solution}`);
      }
    });
  }

  if (issues.suggestions.length > 0) {
    console.log(`\n🔵 SUGGESTIONS (${issues.suggestions.length}):`);
    issues.suggestions.forEach((issue, index) => {
      console.log(`   ${index + 1}. [${issue.component}] ${issue.description}`);
      if (issue.solution) {
        console.log(`      💡 Solution: ${issue.solution}`);
      }
    });
  }

  // Recommendations
  console.log(`\n🎯 NEXT STEPS:`);
  
  if (issues.critical.length > 0) {
    console.log(`   1. 🔴 Fix ${issues.critical.length} critical issues first`);
  }
  
  if (failedTests > 0) {
    console.log(`   2. 🧪 Fix ${failedTests} failing test suite(s)`);
  }
  
  if (issues.warnings.length > 0) {
    console.log(`   3. 🟡 Address ${issues.warnings.length} warning(s)`);
  }
  
  console.log(`   4. 🚀 Test your fixes by running components manually`);
  console.log(`   5. 📝 Update documentation if needed`);

  console.log('\n' + '=' .repeat(50));
}

// Main test runner
async function runAllTests() {
  try {
    // Step 1: Check test file existence
    checkTestFiles();
    
    // Step 2: Detect component issues
    detectComponentIssues();
    
    // Step 3: Run test suites
    console.log('🧪 Running test suites...\n');
    const testResults = [];
    
    for (const suite of testSuites) {
      if (fs.existsSync(path.join(process.cwd(), suite.path))) {
        const result = await runTestSuite(suite.path, suite.name);
        testResults.push(result);
        
        console.log(result.passed ? '✅ PASSED' : '❌ FAILED');
        console.log('-'.repeat(30));
      }
    }
    
    // Step 4: Generate report
    generateReport(testResults);
    
    // Step 5: Exit with appropriate code
    const hasCriticalIssues = issues.critical.length > 0;
    const hasFailedTests = testResults.some(r => !r.passed);
    
    if (hasCriticalIssues || hasFailedTests) {
      console.log('\n❌ Tests completed with issues. Please review and fix the problems above.');
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed! Your components are working correctly.');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('💥 Test runner failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runAllTests(); 