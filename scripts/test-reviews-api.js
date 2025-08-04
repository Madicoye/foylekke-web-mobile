#!/usr/bin/env node

// Test script to check if reviews API is working
const axios = require('axios').default;

// Get API base URL from environment or use default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:9999';

console.log('🔍 Testing Reviews API Connectivity...\n');
console.log(`API Base URL: ${API_BASE_URL}\n`);

async function testReviewsAPI() {
  const tests = [
    {
      name: 'Get All Reviews',
      url: `${API_BASE_URL}/api/reviews`,
      method: 'GET'
    },
    {
      name: 'Get Reviews with Pagination',
      url: `${API_BASE_URL}/api/reviews?limit=5&page=1`,
      method: 'GET'
    },
    {
      name: 'Get Place Reviews (Le Lagon)',
      url: `${API_BASE_URL}/api/reviews/place/687cfbe473402ae98527aab9`,
      method: 'GET'
    },
    {
      name: 'Get Place Reviews (Generic)',
      url: `${API_BASE_URL}/api/reviews/place/687cfbe573402ae98527ab29`,
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
        timeout: 10000,
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
                   Array.isArray(response.data?.reviews) ? response.data.reviews.length :
                   response.data?.total || 'N/A',
        hasData: !!response.data,
        averageRating: response.data?.averageRating || 'N/A'
      };

      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Reviews Count: ${result.dataCount}`);
      console.log(`   ⭐ Average Rating: ${result.averageRating}`);
      console.log(`   ⏱️  Response Time: ${result.responseTime}`);
      
      // Log sample data for reviews endpoints
      if (response.data?.reviews && Array.isArray(response.data.reviews) && response.data.reviews.length > 0) {
        const review = response.data.reviews[0];
        console.log(`   📝 Sample Review: ${review.rating}⭐ - "${review.title || review.content?.substring(0, 50)}..."`);
        console.log(`   👤 By: ${review.user?.name || review.userName || 'Anonymous'}`);
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

async function generateReport(results) {
  console.log('📊 REVIEWS API TEST REPORT');
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
    });
  }
  
  if (successful.length > 0) {
    console.log(`\n✅ Successful Tests:`);
    successful.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.test}`);
      console.log(`      Status: ${result.status}`);
      console.log(`      Reviews Count: ${result.dataCount}`);
      console.log(`      Average Rating: ${result.averageRating}`);
      console.log(`      Response Time: ${result.responseTime}`);
    });
  }
  
  // Diagnose review-specific issues
  console.log(`\n🔍 Reviews Diagnosis:`);
  
  if (failed.length === results.length) {
    console.log(`   🚨 All review tests failed - Backend server or reviews endpoints not working`);
    console.log(`   💡 Solution: Check backend server and review routes`);
  } else if (successful.some(r => r.dataCount === 0 || r.dataCount === 'N/A')) {
    console.log(`   ⚠️  Reviews API responding but no review data found`);
    console.log(`   💡 Solution: Check if database has review data, or add some test reviews`);
  } else {
    console.log(`   ✅ Reviews API is working correctly`);
    console.log(`   🎉 Review data is being returned successfully`);
    
    // Check for specific place reviews
    const placeReviewTests = successful.filter(r => r.test.includes('Place Reviews'));
    if (placeReviewTests.some(r => r.dataCount > 0)) {
      console.log(`   📍 Place-specific reviews are available`);
    } else {
      console.log(`   📍 No place-specific reviews found - may need to add reviews for specific places`);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
}

async function main() {
  try {
    const results = await testReviewsAPI();
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