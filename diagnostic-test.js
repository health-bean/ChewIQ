#!/usr/bin/env node

const https = require('https');

// Test different POST configurations to isolate the issue
const testConfigurations = [
  {
    name: 'No Auth Header (Dev Mode)',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'FILO-Diagnostic/1.0'
    },
    body: {
      userId: '8e8a568a-c2f8-43a8-abf2-4e54408dbdc0',
      entryDate: '2025-07-04',
      entryType: 'food',
      content: 'Diagnostic test - no auth'
    }
  },
  {
    name: 'With Auth Header',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'FILO-Diagnostic/1.0',
      'Authorization': 'Bearer diagnostic-token'
    },
    body: {
      userId: '8e8a568a-c2f8-43a8-abf2-4e54408dbdc0',
      entryDate: '2025-07-04',
      entryType: 'food',
      content: 'Diagnostic test - with auth'
    }
  },
  {
    name: 'With User ID Header',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'FILO-Diagnostic/1.0',
      'x-user-id': '8e8a568a-c2f8-43a8-abf2-4e54408dbdc0'
    },
    body: {
      userId: '8e8a568a-c2f8-43a8-abf2-4e54408dbdc0',
      entryDate: '2025-07-04',
      entryType: 'food',
      content: 'Diagnostic test - user header'
    }
  },
  {
    name: 'Minimal Body',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'FILO-Diagnostic/1.0'
    },
    body: {
      userId: '8e8a568a-c2f8-43a8-abf2-4e54408dbdc0',
      entryType: 'food',
      content: 'Minimal test'
    }
  },
  {
    name: 'Complete Body',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'FILO-Diagnostic/1.0'
    },
    body: {
      userId: '8e8a568a-c2f8-43a8-abf2-4e54408dbdc0',
      entryDate: '2025-07-04',
      entryTime: '12:00:00',
      entryType: 'food',
      content: 'Complete diagnostic test',
      selectedFoods: ['test food'],
      notes: 'Test notes',
      severity: 3
    }
  }
];

async function testPOSTConfiguration(config) {
  return new Promise((resolve) => {
    const url = 'https://suhoxvn8ik.execute-api.us-east-1.amazonaws.com/dev/api/v1/timeline/entries';
    const postData = JSON.stringify(config.body);
    
    const options = {
      method: 'POST',
      headers: {
        ...config.headers,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`\n🔄 Testing: ${config.name}`);
    console.log(`📋 Body: ${JSON.stringify(config.body, null, 2)}`);
    console.log(`🔑 Headers: ${JSON.stringify(config.headers, null, 2)}`);
    
    const startTime = Date.now();
    const req = https.request(url, options, (res) => {
      let body = '';
      const responseTime = Date.now() - startTime;
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode} | Time: ${responseTime}ms`);
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ SUCCESS!`);
          try {
            const parsed = JSON.parse(body);
            console.log(`📄 Response: ${JSON.stringify(parsed, null, 2)}`);
          } catch (e) {
            console.log(`📄 Response: ${body}`);
          }
        } else {
          console.log(`❌ FAILED`);
          console.log(`📄 Error: ${body}`);
        }
        
        resolve({
          config: config.name,
          status: res.statusCode,
          responseTime: responseTime,
          body: body,
          working: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Network Error: ${error.message}`);
      resolve({
        config: config.name,
        status: 0,
        responseTime: Date.now() - startTime,
        body: error.message,
        working: false
      });
    });
    
    req.write(postData);
    req.end();
  });
}

async function testGETEndpoints() {
  console.log('\n🔍 Testing GET endpoints for auth behavior...\n');
  
  const authEndpoints = [
    '/api/v1/users',
    '/api/v1/user/protocols',
    '/api/v1/user/preferences'
  ];
  
  for (const endpoint of authEndpoints) {
    await testGETConfiguration(endpoint);
  }
}

async function testGETConfiguration(endpoint) {
  return new Promise((resolve) => {
    const url = `https://suhoxvn8ik.execute-api.us-east-1.amazonaws.com/dev${endpoint}`;
    
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FILO-Diagnostic/1.0'
      }
    };

    console.log(`🔄 Testing GET: ${endpoint}`);
    
    const startTime = Date.now();
    const req = https.request(url, options, (res) => {
      let body = '';
      const responseTime = Date.now() - startTime;
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode} | Time: ${responseTime}ms`);
        
        if (res.statusCode === 401) {
          console.log(`❌ 401 Unauthorized - Auth middleware not working for this endpoint`);
        } else if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ SUCCESS - Auth middleware working`);
        } else {
          console.log(`❌ Other error: ${res.statusCode}`);
        }
        
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Network Error: ${error.message}`);
      resolve();
    });
    
    req.end();
  });
}

async function runDiagnostics() {
  console.log('🔍 FILO API Diagnostic Test');
  console.log('===========================\n');
  console.log('Testing different POST configurations to isolate the timeline entry issue...\n');
  
  const results = [];
  
  // Test all POST configurations
  for (const config of testConfigurations) {
    const result = await testPOSTConfiguration(config);
    results.push(result);
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Test GET endpoints
  await testGETEndpoints();
  
  // Summary
  console.log('\n📊 DIAGNOSTIC SUMMARY');
  console.log('====================\n');
  
  const successfulConfigs = results.filter(r => r.working);
  const failedConfigs = results.filter(r => !r.working);
  
  if (successfulConfigs.length > 0) {
    console.log('✅ SUCCESSFUL CONFIGURATIONS:');
    successfulConfigs.forEach(config => {
      console.log(`  - ${config.config}: ${config.status} (${config.responseTime}ms)`);
    });
  }
  
  if (failedConfigs.length > 0) {
    console.log('\n❌ FAILED CONFIGURATIONS:');
    failedConfigs.forEach(config => {
      console.log(`  - ${config.config}: ${config.status} (${config.responseTime}ms)`);
    });
  }
  
  console.log('\n🎯 RECOMMENDATIONS:');
  if (successfulConfigs.length > 0) {
    console.log('✅ Some configurations work! The issue is likely request format.');
  } else {
    console.log('❌ All configurations failed. The issue is likely in the Lambda auth middleware.');
    console.log('📋 Check if handleCreateTimelineEntry is using getCurrentUser() properly.');
  }
}

runDiagnostics().catch(console.error);
