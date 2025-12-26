// Test debug output
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testDebugOutput() {
  console.log('🔍 Testing debug output...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/task-suggestions/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: 'auth-implementation-discussion',
        projectId: 'saas-startup',
        teamId: 'backend-team',
        agentId: 'backend-developer'
      })
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
    // Also check the messages directly
    const messagesResponse = await fetch(`${BASE_URL}/api/conversations/auth-implementation-discussion/messages`);
    const messages = await messagesResponse.json();
    console.log('Messages structure:', JSON.stringify(messages[0], null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDebugOutput();
