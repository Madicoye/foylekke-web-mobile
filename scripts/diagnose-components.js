#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Foy Lekke Component Diagnostics\n');

const issues = [];

function checkFile(filePath, checks) {
  if (!fs.existsSync(filePath)) {
    issues.push({
      type: 'missing',
      file: filePath,
      issue: 'File does not exist'
    });
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  checks.forEach(check => {
    if (check.type === 'contains' && !content.includes(check.pattern)) {
      issues.push({
        type: 'missing-code',
        file: filePath,
        issue: check.description,
        solution: check.solution
      });
    } else if (check.type === 'not-contains' && content.includes(check.pattern)) {
      issues.push({
        type: 'problematic-code',
        file: filePath,
        issue: check.description,
        solution: check.solution
      });
    }
  });
}

// Check HangoutMessaging component
console.log('📱 Checking HangoutMessaging Component...');
checkFile('src/components/hangouts/HangoutMessaging.js', [
  {
    type: 'contains',
    pattern: 'hangoutsAPI.addMessage',
    description: 'Missing API call for adding messages',
    solution: 'Ensure hangoutsAPI.addMessage is called correctly'
  },
  {
    type: 'contains', 
    pattern: 'scrollToBottom',
    description: 'Missing auto-scroll functionality',
    solution: 'Implement scrollToBottom function'
  },
  {
    type: 'contains',
    pattern: 'useEffect',
    description: 'Missing useEffect for message updates',
    solution: 'Add useEffect to handle message updates'
  }
]);

// Check PlaceManagement component
console.log('⚙️ Checking PlaceManagement Component...');
checkFile('src/components/admin/PlaceManagement.js', [
  {
    type: 'contains',
    pattern: 'syncPlacesFromGoogle',
    description: 'Missing Google Places sync functionality',
    solution: 'Implement Google Places sync API call'
  },
  {
    type: 'contains',
    pattern: 'deletePlace',
    description: 'Missing delete place functionality',
    solution: 'Implement place deletion with confirmation'
  },
  {
    type: 'contains',
    pattern: 'useQuery',
    description: 'Missing React Query integration',
    solution: 'Add useQuery for data fetching'
  }
]);

// Check NotificationsPage component
console.log('🔔 Checking NotificationsPage Component...');
checkFile('src/pages/NotificationsPage.js', [
  {
    type: 'contains',
    pattern: 'markAllAsRead',
    description: 'Missing mark all as read functionality',
    solution: 'Implement mark all as read feature'
  },
  {
    type: 'contains',
    pattern: 'notificationsAPI',
    description: 'Missing notifications API integration',
    solution: 'Import and use notificationsAPI'
  },
  {
    type: 'contains',
    pattern: 'pagination',
    description: 'Missing pagination functionality',
    solution: 'Implement pagination for notifications'
  }
]);

// Check API service
console.log('🌐 Checking API Services...');
checkFile('src/services/api.js', [
  {
    type: 'contains',
    pattern: 'addMessage',
    description: 'Missing addMessage endpoint in hangoutsAPI',
    solution: 'Add addMessage endpoint to hangoutsAPI'
  },
  {
    type: 'contains',
    pattern: 'notificationsAPI',
    description: 'Missing notifications API',
    solution: 'Implement complete notifications API'
  }
]);

// Check specific components exist
console.log('📁 Checking Component Files...');
const componentFiles = [
  'src/components/hangouts/HangoutMessaging.js',
  'src/components/admin/PlaceManagement.js', 
  'src/pages/NotificationsPage.js',
  'src/components/reviews/ReviewForm.js',
  'src/components/reviews/ReviewCard.js',
  'src/components/reviews/ReviewsList.js',
  'src/components/notifications/NotificationBell.js',
  'src/components/notifications/NotificationsDropdown.js'
];

componentFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    issues.push({
      type: 'missing',
      file: file,
      issue: 'Component file does not exist'
    });
  }
});

// Check route integration
console.log('🛣️ Checking Route Integration...');
checkFile('src/App.js', [
  {
    type: 'contains',
    pattern: '/notifications',
    description: 'Missing notifications route',
    solution: 'Add /notifications route to App.js'
  },
  {
    type: 'contains',
    pattern: 'NotificationsPage',
    description: 'Missing NotificationsPage import',
    solution: 'Import NotificationsPage component'
  }
]);

// Check imports in key files
console.log('📦 Checking Critical Imports...');
checkFile('src/services/api.js', [
  {
    type: 'contains',
    pattern: 'axios',
    description: 'Missing axios import',
    solution: 'Import axios for HTTP requests'
  }
]);

// Generate report
console.log('\n📊 DIAGNOSTIC REPORT');
console.log('=' .repeat(50));

if (issues.length === 0) {
  console.log('\n✅ No issues found! All components appear to be properly configured.');
} else {
  console.log(`\n🚨 Found ${issues.length} issues:\n`);
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. [${issue.type.toUpperCase()}] ${issue.file}`);
    console.log(`   Issue: ${issue.issue}`);
    if (issue.solution) {
      console.log(`   Solution: ${issue.solution}`);
    }
    console.log('');
  });
}

// Categorize issues
const critical = issues.filter(i => i.type === 'missing' || i.type === 'missing-code');
const warnings = issues.filter(i => i.type === 'problematic-code');

console.log('📈 SUMMARY:');
console.log(`   Critical Issues: ${critical.length} 🔴`);
console.log(`   Warnings: ${warnings.length} 🟡`);
console.log(`   Total: ${issues.length}`);

if (critical.length > 0) {
  console.log('\n🎯 PRIORITY FIXES:');
  critical.slice(0, 3).forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue.file} - ${issue.issue}`);
  });
}

console.log('\n' + '=' .repeat(50));

process.exit(issues.length > 0 ? 1 : 0); 