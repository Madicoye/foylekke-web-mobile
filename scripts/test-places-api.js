#!/usr/bin/env node

// Test script to check if places API is working
const axios = require('axios').default;

// Get API base URL from environment or use default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

console.log('🔍 Testing Places API Connectivity...\n');
console.log(`API Base URL: ${API_BASE_URL}\n`);

async function testPlacesAPI() {
  const tests = [
    {
      name: 'Health Check',
      url: `${API_BASE_URL}/health`,
      method: 'GET'
    },
    {
      name: 'Get All Places',
      url: `${API_BASE_URL}/api/places`,
      method: 'GET'
    },
    {
      name: 'Get Places with Filters',
      url: `${API_BASE_URL}/api/places?limit=5&type=restaurant`,
      method: 'GET'
    },
    {
      name: 'Get Place Types',
      url: `${API_BASE_URL}/api/places/types`,
      method: 'GET'
    },
    {
      name: 'Get Top Places by Region',
      url: `${API_BASE_URL}/api/places/top/Dakar`,
      method: 'GET'
    }
  ];

  const results = [];

  for (const test of tests) {
    try {
      console.log(`🧪 Testing: ${test.name}...`);
      
      const startTime = Date.now();
      const response = await axios({
        method: test.method,
        url: test.url,
        timeout: 10000, // 10 second timeout
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      const endTime = Date.now();

      const result = {
        test: test.name,
        success: true,
        status: response.status,
        responseTime: `${endTime - startTime}ms`,
        dataCount: Array.isArray(response.data) ? response.data.length : 
                   Array.isArray(response.data?.places) ? response.data.places.length :
                   response.data?.total || 'N/A',
        hasData: !!response.data
      };

      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Data Count: ${result.dataCount}`);
      console.log(`   ⏱️  Response Time: ${result.responseTime}`);
      
      // Log sample data for places endpoints
      if (test.name.includes('Places') && response.data) {
        const places = response.data.places || response.data;
        if (Array.isArray(places) && places.length > 0) {
          console.log(`   📝 Sample Place: ${places[0].name || places[0].title || 'Unnamed'}`);
        }
      }
      
      results.push(result);
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      
      const result = {
        test: test.name,
        success: false,
        error: error.message,
        status: error.response?.status || 'NO_RESPONSE',
        details: error.code || error.response?.statusText || 'Unknown error'
      };
      
      results.push(result);
    }
    
    console.log(''); // Empty line for readability
  }

  return results;
}

async function checkEnvironment() {
  console.log('🔧 Environment Check:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`   REACT_APP_API_URL: ${process.env.REACT_APP_API_URL || 'not set'}`);
  console.log(`   Using API URL: ${API_BASE_URL}`);
  console.log('');
}

async function generateReport(results) {
  console.log('📊 API TEST REPORT');
  console.log('=' .repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n📈 Summary:`);
  console.log(`   Total Tests: ${results.length}`);
  console.log(`   Successful: ${successful.length} ✅`);
  console.log(`   Failed: ${failed.length} ❌`);
  console.log(`   Success Rate: ${((successful.length/results.length) * 100).toFixed(1)}%`);
  
  if (failed.length > 0) {
    console.log(`\n❌ Failed Tests:`);
    failed.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.test}`);
      console.log(`      Error: ${result.error}`);
      console.log(`      Status: ${result.status}`);
      console.log(`      Details: ${result.details}`);
    });
  }
  
  if (successful.length > 0) {
    console.log(`\n✅ Successful Tests:`);
    successful.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.test}`);
      console.log(`      Status: ${result.status}`);
      console.log(`      Data Count: ${result.dataCount}`);
      console.log(`      Response Time: ${result.responseTime}`);
    });
  }
  
  // Diagnose common issues
  console.log(`\n🔍 Diagnosis:`);
  
  if (failed.length === results.length) {
    console.log(`   🚨 All tests failed - Backend server is likely not running`);
    console.log(`   💡 Solution: Start your backend server`);
  } else if (failed.some(r => r.test === 'Health Check')) {
    console.log(`   🚨 Health check failed - Backend not responding`);
    console.log(`   💡 Solution: Check if backend server is running on correct port`);
  } else if (failed.some(r => r.test.includes('Places'))) {
    console.log(`   🚨 Places endpoints failing - API or database issue`);
    console.log(`   💡 Solution: Check backend logs and database connection`);
  } else if (successful.some(r => r.dataCount === 0 || r.dataCount === 'N/A')) {
    console.log(`   ⚠️  API responding but no places data found`);
    console.log(`   💡 Solution: Check if database has been populated with places`);
  } else {
    console.log(`   ✅ API is working correctly`);
    console.log(`   🎉 Places data is being returned successfully`);
  }
  
  console.log('\n' + '=' .repeat(50));
}

async function main() {
  try {
    await checkEnvironment();
    const results = await testPlacesAPI();
    await generateReport(results);
    
    const hasFailures = results.some(r => !r.success);
    process.exit(hasFailures ? 1 : 0);
    
  } catch (error) {
    console.error('💥 Test runner failed:', error.message);
    process.exit(1);
  }
}

// Check if axios is available
try {
  require('axios');
  main();
} catch (error) {
  console.error('❌ axios is not installed. Please run: npm install axios');
  process.exit(1);
}