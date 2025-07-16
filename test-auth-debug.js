// Test authentication flow for demo users
const { getCurrentUser } = require('./backend/functions/api/middleware/auth');

async function testAuthFlow() {
  console.log('Testing authentication flow...');
  
  // Simulate demo user request event
  const demoEvent = {
    headers: {
      'x-demo-mode': 'true',
      'x-demo-user-id': 'sarah-aip',
      'x-demo-session-id': 'session_123'
    }
  };
  
  console.log('Test event headers:', demoEvent.headers);
  
  try {
    const user = await getCurrentUser(demoEvent);
    console.log('Auth result:', user);
    
    if (user) {
      console.log('✅ Authentication successful');
      console.log('User ID:', user.id);
      console.log('Email:', user.email);
      console.log('Is Demo:', user.isDemo);
    } else {
      console.log('❌ Authentication failed - no user returned');
    }
  } catch (error) {
    console.error('❌ Authentication error:', error);
    console.error('Error stack:', error.stack);
  }
}

testAuthFlow().catch(console.error);