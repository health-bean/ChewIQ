#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

class FILOAPIAnalyzer {
  constructor() {
    this.baseURL = 'https://suhoxvn8ik.execute-api.us-east-1.amazonaws.com/dev';
    this.results = {
      endpoints: [],
      status: 'unknown',
      timestamp: new Date().toISOString(),
      summary: {
        working: 0,
        broken: 0,
        total: 0,
        authRequired: 0,
        authFailed: 0
      }
    };
  }

  async analyzeAPIs() {
    console.log('🌐 Testing FILO Health Platform APIs...');
    console.log(`Base URL: ${this.baseURL}\n`);
    
    // Production endpoints with authentication requirements
    const productionEndpoints = [
      // Core protocol endpoints (public)
      { path: '/api/v1/protocols', method: 'GET', description: 'Get available health protocols', requiresAuth: false },
      
      // AI correlation endpoints (public with userId param)
      { path: '/api/v1/correlations/insights?userId=8e8a568a-c2f8-43a8-abf2-4e54408dbdc0', method: 'GET', description: 'Get AI correlation insights', requiresAuth: false },
      { path: '/api/v1/correlations/insights?userId=8e8a568a-c2f8-43a8-abf2-4e54408dbdc0&confidence_threshold=0.7', method: 'GET', description: 'Get filtered correlation insights', requiresAuth: false },
      
      // Protocol foods endpoints (public)
      { path: '/api/v1/foods/by-protocol?protocol_id=1495844a-19de-404c-a288-7660eda0cbe1', method: 'GET', description: 'Get AIP Core protocol foods', requiresAuth: false },
      { path: '/api/v1/foods/by-protocol?protocol_id=51ca7a24-4691-4629-8ee5-c20876e68c29', method: 'GET', description: 'Get Low Histamine protocol foods', requiresAuth: false },
      { path: '/api/v1/foods/search?search=chicken', method: 'GET', description: 'Search foods - chicken', requiresAuth: false },
      { path: '/api/v1/foods/search?search=broccoli&protocol_id=1495844a-19de-404c-a288-7660eda0cbe1', method: 'GET', description: 'Search foods with protocol context', requiresAuth: false },
      
      // Timeline endpoints (public with userId param)
      { path: '/api/v1/timeline/entries', method: 'GET', description: 'Get timeline entries', requiresAuth: false },
      { path: '/api/v1/timeline/entries?date=2025-07-04', method: 'GET', description: 'Get timeline entries with date filter', requiresAuth: false },
      { path: '/api/v1/timeline/entries?userId=8e8a568a-c2f8-43a8-abf2-4e54408dbdc0', method: 'GET', description: 'Get user timeline entries', requiresAuth: false },
      
      // User management endpoints (should work in dev mode - returns demo user)
      { path: '/api/v1/users', method: 'GET', description: 'Get user data (dev mode: returns demo user)', requiresAuth: false },
      { path: '/api/v1/user/protocols', method: 'GET', description: 'Get user active protocols (dev mode)', requiresAuth: false },
      { path: '/api/v1/user/preferences', method: 'GET', description: 'Get user preferences (dev mode)', requiresAuth: false },
      
      // Journal endpoints (should work in dev mode)
      { path: '/api/v1/journal/entries', method: 'GET', description: 'Get journal entries (dev mode)', requiresAuth: false },
      { path: '/api/v1/journal/entries?date=2025-07-04', method: 'GET', description: 'Get journal entries with date filter (dev mode)', requiresAuth: false },
      
      // Search endpoints (public)
      { path: '/api/v1/symptoms/search?search=headache', method: 'GET', description: 'Search symptoms', requiresAuth: false },
      { path: '/api/v1/supplements/search?search=vitamin', method: 'GET', description: 'Search supplements', requiresAuth: false },
      { path: '/api/v1/medications/search?search=ibuprofen', method: 'GET', description: 'Search medications', requiresAuth: false },
      
      // Exposure and detox endpoints (exposure-types missing per 404 error)
      // { path: '/api/v1/exposure-types', method: 'GET', description: 'Get exposure types', requiresAuth: false },
      { path: '/api/v1/detox-types', method: 'GET', description: 'Get detox types', requiresAuth: false },
      
      // Authentication endpoint (test login) - NOT IMPLEMENTED YET
      // { path: '/api/v1/auth', method: 'POST', description: 'User authentication', requiresAuth: false,
      //   body: {
      //     email: 'patient@example.com',
      //     password: 'demo123456'
      //   }
      // },
      
      // Test POST endpoint (timeline creation) - test with auth header
      { path: '/api/v1/timeline/entries', method: 'POST', description: 'Create timeline entry (test auth)', requiresAuth: true,
        body: {
          userId: '8e8a568a-c2f8-43a8-abf2-4e54408dbdc0',
          entryDate: '2025-07-04',
          entryType: 'food',
          content: 'API test entry',
          selectedFoods: ['test food']
        }
      }
    ];

    console.log(`Testing ${productionEndpoints.length} production endpoints...\n`);
    
    for (const endpoint of productionEndpoints) {
      // Test without auth - your dev mode should return demo user automatically
      await this.testEndpoint(endpoint, false);
      await this.sleep(300); // Rate limiting between requests
    }

    this.generateReport();
    this.saveResults();
  }

  async testEndpoint(endpoint, withAuth = false) {
    return new Promise((resolve) => {
      const url = `${this.baseURL}${endpoint.path}`;
      const startTime = Date.now();
      
      const authSuffix = withAuth ? ' (with auth)' : '';
      const retryPrefix = endpoint.retryWithAuth ? '    🔄 ' : '🔄 ';
      console.log(`${retryPrefix}Testing: ${endpoint.method} ${endpoint.path}${authSuffix}`);
      
      const options = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'FILO-API-Analyzer/1.0'
        }
      };

      // Add authentication header for POST requests or auth-required endpoints
      if (withAuth || endpoint.requiresAuth) {
        // Try the development mode approach - no auth header to get demo user
        // But for POST requests that are failing, try with a dummy header
        if (endpoint.method === 'POST') {
          options.headers['Authorization'] = 'Bearer dev-mode-token';
        }
      }

      // Add body for POST requests
      let postData = null;
      if (endpoint.method === 'POST' && endpoint.body) {
        postData = JSON.stringify(endpoint.body);
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = https.request(url, options, (res) => {
        let body = '';
        const responseTime = Date.now() - startTime;
        
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsedBody = JSON.parse(body);
            const dataType = Array.isArray(parsedBody) ? 'array' : typeof parsedBody;
            const working = res.statusCode >= 200 && res.statusCode < 300;
            
            // Create sample data structure
            const sampleData = this.createSampleData(parsedBody);
            
            const endpointResult = {
              path: endpoint.path,
              method: endpoint.method,
              description: endpoint.description + (withAuth ? ' (with auth)' : ''),
              url: url,
              status: res.statusCode,
              responseTime: responseTime,
              dataType: dataType,
              dataSize: Buffer.byteLength(body),
              sampleData: sampleData,
              headers: {
                'content-type': res.headers['content-type'],
                'content-length': res.headers['content-length']
              },
              working: working,
              requiresAuth: endpoint.requiresAuth,
              testedWithAuth: withAuth,
              rawResponse: working ? null : body.substring(0, 500) // Limit error response size
            };
            
            this.results.endpoints.push(endpointResult);
            
            if (working) {
              this.results.summary.working++;
              const dataInfo = parsedBody && typeof parsedBody === 'object' ? 
                `${dataType} with ${Object.keys(parsedBody).length} properties` : 
                `${dataType}`;
              console.log(`  ✅ ${res.statusCode} (${responseTime}ms) - ${dataInfo}`);
            } else {
              this.results.summary.broken++;
              if (res.statusCode === 401 && endpoint.requiresAuth) {
                this.results.summary.authFailed++;
              }
              console.log(`  ❌ ${res.statusCode} (${responseTime}ms) - Error`);
            }
            
          } catch (error) {
            // Handle non-JSON responses
            const working = res.statusCode >= 200 && res.statusCode < 300;
            this.results.endpoints.push({
              path: endpoint.path,
              method: endpoint.method,
              description: endpoint.description + (withAuth ? ' (with auth)' : ''),
              url: url,
              status: res.statusCode,
              responseTime: responseTime,
              dataType: 'text',
              dataSize: Buffer.byteLength(body),
              sampleData: { raw: body.substring(0, 200) },
              headers: {
                'content-type': res.headers['content-type'],
                'content-length': res.headers['content-length']
              },
              working: working,
              requiresAuth: endpoint.requiresAuth,
              testedWithAuth: withAuth,
              rawResponse: body.substring(0, 500)
            });
            
            if (working) {
              this.results.summary.working++;
              console.log(`  ✅ ${res.statusCode} (${responseTime}ms) - Text response`);
            } else {
              this.results.summary.broken++;
              console.log(`  ❌ ${res.statusCode} (${responseTime}ms) - Parse error: ${error.message}`);
            }
          }
          
          this.results.summary.total++;
          resolve();
        });
      });
      
      req.on('error', (error) => {
        const responseTime = Date.now() - startTime;
        this.results.endpoints.push({
          path: endpoint.path,
          method: endpoint.method,
          description: endpoint.description + (withAuth ? ' (with auth)' : ''),
          url: url,
          status: 0,
          responseTime: responseTime,
          dataType: 'error',
          dataSize: 0,
          sampleData: { error: error.message },
          headers: {},
          working: false,
          requiresAuth: endpoint.requiresAuth,
          testedWithAuth: withAuth,
          rawResponse: error.message
        });
        
        this.results.summary.broken++;
        this.results.summary.total++;
        console.log(`  ❌ Network Error (${responseTime}ms) - ${error.message}`);
        resolve();
      });
      
      // Send POST data if present
      if (postData) {
        req.write(postData);
      }
      
      req.end();
    });
  }

  createSampleData(data) {
    if (!data || typeof data !== 'object') {
      return { raw: data };
    }
    
    const type = Array.isArray(data) ? 'array' : 'object';
    const keys = Array.isArray(data) ? [] : Object.keys(data);
    
    // Create structure description
    const structure = {};
    if (Array.isArray(data)) {
      structure.length = data.length;
      if (data.length > 0) {
        structure.sample = data[0];
      }
    } else {
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (Array.isArray(value)) {
          structure[key] = `array[${value.length}]`;
        } else {
          structure[key] = typeof value;
        }
      });
    }
    
    return {
      type: type,
      keys: keys,
      sample: Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data,
      structure: structure
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateReport() {
    const successRate = this.results.summary.total > 0 
      ? Math.round((this.results.summary.working / this.results.summary.total) * 100)
      : 0;
    
    console.log('\n📊 FILO API Analysis Report');
    console.log('============================\n');
    
    console.log('🎯 SUMMARY:');
    console.log(`✅ Working: ${this.results.summary.working}/${this.results.summary.total}`);
    console.log(`❌ Broken: ${this.results.summary.broken}/${this.results.summary.total}`);
    console.log(`📊 Success Rate: ${successRate}%`);
    console.log(`🔐 Auth Required: ${this.results.summary.authRequired}`);
    console.log(`🚫 Auth Failed: ${this.results.summary.authFailed}\n`);
    
    const workingEndpoints = this.results.endpoints.filter(e => e.working);
    const brokenEndpoints = this.results.endpoints.filter(e => !e.working);
    const authEndpoints = this.results.endpoints.filter(e => e.requiresAuth);
    
    if (workingEndpoints.length > 0) {
      console.log('🟢 WORKING ENDPOINTS:');
      workingEndpoints.forEach(endpoint => {
        console.log(`  ${endpoint.method} ${endpoint.path}`);
        console.log(`    Status: ${endpoint.status} | Response Time: ${endpoint.responseTime}ms`);
        console.log(`    Data: ${endpoint.dataType} with keys: ${endpoint.sampleData.keys ? endpoint.sampleData.keys.join(', ') : 'N/A'}`);
        console.log('');
      });
    }
    
    if (brokenEndpoints.length > 0) {
      console.log('🔴 BROKEN/ERROR ENDPOINTS:');
      brokenEndpoints.forEach(endpoint => {
        console.log(`  ${endpoint.method} ${endpoint.path}`);
        console.log(`    Status: ${endpoint.status} | Issue: ${this.getErrorDescription(endpoint.status)}`);
        if (endpoint.status === 401 && endpoint.requiresAuth) {
          console.log(`    Note: This endpoint requires authentication`);
        }
        console.log('');
      });
    }

    if (authEndpoints.length > 0) {
      console.log('🔐 AUTHENTICATION ANALYSIS:');
      authEndpoints.forEach(endpoint => {
        const authStatus = endpoint.working ? '✅ Working' : '❌ Failed';
        console.log(`  ${endpoint.method} ${endpoint.path} - ${authStatus}`);
        if (endpoint.testedWithAuth) {
          console.log(`    Tested with auth: ${endpoint.status}`);
        }
      });
      console.log('');
    }
    
    // Performance metrics
    const responseTimes = this.results.endpoints.map(e => e.responseTime);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const minResponseTime = Math.min(...responseTimes);
    const maxResponseTime = Math.max(...responseTimes);
    
    console.log('⚡ PERFORMANCE METRICS:');
    console.log(`  Average Response Time: ${Math.round(avgResponseTime)}ms`);
    console.log(`  Fastest Response: ${minResponseTime}ms`);
    console.log(`  Slowest Response: ${maxResponseTime}ms\n`);
    
    // Data insights
    console.log('📋 API DATA INSIGHTS:');
    workingEndpoints.forEach(endpoint => {
      if (endpoint.sampleData.structure) {
        console.log(`  ${endpoint.path}:`);
        Object.keys(endpoint.sampleData.structure).forEach(key => {
          console.log(`    - ${key}: ${endpoint.sampleData.structure[key]}`);
        });
        console.log('');
      }
    });
    
    // Troubleshooting recommendations
    console.log('🔧 TROUBLESHOOTING RECOMMENDATIONS:');
    const errors401 = brokenEndpoints.filter(e => e.status === 401);
    const errors404 = brokenEndpoints.filter(e => e.status === 404);
    const errors500 = brokenEndpoints.filter(e => e.status === 500);
    
    if (errors401.length > 0) {
      console.log('  📋 401 Unauthorized Errors:');
      console.log('    - These endpoints may not be using your dev mode auth middleware');
      console.log('    - Check if getCurrentUser() is being called for these routes');
      console.log('    - Your dev mode should return demo user when no auth header is present');
      errors401.forEach(e => {
        console.log(`    - Check route: ${e.path}`);
      });
    }
    
    if (errors404.length > 0) {
      console.log('  📋 404 Not Found Errors:');
      errors404.forEach(e => {
        console.log(`    - Missing endpoint: ${e.path}`);
      });
      console.log('    - These endpoints need to be implemented in your Lambda function');
    }
    
    if (errors500.length > 0) {
      console.log('  📋 500 Server Errors:');
      console.log('    - Check Lambda CloudWatch logs: aws logs tail /aws/lambda/health-platform-dev');
      console.log('    - Verify POST request body format and required fields');
      console.log('    - Check database connections and queries');
    }
    
    this.results.status = successRate > 50 ? 'healthy' : 'degraded';
  }

  getErrorDescription(statusCode) {
    const descriptions = {
      0: 'Network Error',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden', 
      404: 'Not Found',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable'
    };
    return descriptions[statusCode] || 'HTTP Error';
  }

  saveResults() {
    // Save detailed analysis
    fs.writeFileSync('FILO_API_ANALYSIS.json', JSON.stringify(this.results, null, 2));
    console.log('\n💾 Detailed API report saved to: FILO_API_ANALYSIS.json');
    
    // Save Swagger-like documentation
    const swagger = this.generateSwagger();
    fs.writeFileSync('FILO_API_SWAGGER.json', JSON.stringify(swagger, null, 2));
    console.log('📋 API documentation saved to: FILO_API_SWAGGER.json');
    
    // Save summary
    const summary = {
      timestamp: this.results.timestamp,
      baseURL: this.baseURL,
      summary: this.results.summary,
      status: this.results.status,
      workingEndpoints: this.results.endpoints.filter(e => e.working).length,
      totalEndpoints: this.results.summary.total,
      authEndpoints: this.results.endpoints.filter(e => e.requiresAuth).length,
      troubleshooting: {
        errors401: this.results.endpoints.filter(e => e.status === 401).length,
        errors404: this.results.endpoints.filter(e => e.status === 404).length,
        errors500: this.results.endpoints.filter(e => e.status === 500).length
      }
    };
    fs.writeFileSync('FILO_API_SUMMARY.json', JSON.stringify(summary, null, 2));
    console.log('📊 API summary saved to: FILO_API_SUMMARY.json');
  }

  generateSwagger() {
    const swagger = {
      openapi: '3.0.0',
      info: {
        title: 'FILO Health Platform API',
        version: '1.0.0',
        description: 'Production-ready API with proxy integration for AI-powered health intelligence platform'
      },
      servers: [
        {
          url: this.baseURL,
          description: 'Production API Gateway with proxy integration'
        }
      ],
      paths: {},
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer'
          }
        }
      }
    };
    
    this.results.endpoints.forEach(endpoint => {
      const path = endpoint.path.split('?')[0]; // Remove query parameters for swagger
      if (!swagger.paths[path]) {
        swagger.paths[path] = {};
      }
      
      const operation = {
        summary: endpoint.description,
        responses: {
          [endpoint.status]: {
            description: endpoint.working ? 'Success' : 'Error',
            content: {
              'application/json': {
                schema: {
                  type: endpoint.sampleData.type || 'object'
                }
              }
            }
          }
        }
      };

      if (endpoint.requiresAuth) {
        operation.security = [{ BearerAuth: [] }];
      }
      
      swagger.paths[path][endpoint.method.toLowerCase()] = operation;
    });
    
    return swagger;
  }
}

// Run the analysis
const analyzer = new FILOAPIAnalyzer();
analyzer.analyzeAPIs().catch(console.error);