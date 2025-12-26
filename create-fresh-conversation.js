// Create fresh conversation for testing
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function createFreshConversation() {
  console.log('🔍 Creating fresh conversation for testing...');
  
  try {
    // Create a new conversation
    const convResponse = await fetch(`${BASE_URL}/api/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'fresh-test-conv',
        projectId: 'saas-startup',
        teamId: 'backend-team',
        agentId: 'backend-developer',
        isActive: true
      })
    });
    
    console.log('Conversation creation status:', convResponse.status);
    
    // Add messages with proper structure
    const messages = [
      {
        content: 'We need to implement user authentication for our SaaS platform. This is critical for security.',
        role: 'user',
        senderId: 'user',
        senderName: 'User',
        messageType: 'user',
        timestamp: new Date().toISOString()
      },
      {
        content: 'Absolutely! User authentication is essential. We should implement JWT tokens and password hashing.',
        role: 'assistant',
        senderId: 'backend-developer',
        senderName: 'Backend Developer',
        messageType: 'assistant',
        timestamp: new Date().toISOString()
      },
      {
        content: 'We need to add social login with Google and GitHub, implement two-factor authentication, and create a password reset flow.',
        role: 'user',
        senderId: 'user',
        senderName: 'User',
        messageType: 'user',
        timestamp: new Date().toISOString()
      }
    ];
    
    for (const message of messages) {
      const messageResponse = await fetch(`${BASE_URL}/api/conversations/fresh-test-conv/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
      
      console.log('Message creation status:', messageResponse.status);
    }
    
    // Test AI detection
    console.log('\n🧠 Testing AI detection...');
    const analysisResponse = await fetch(`${BASE_URL}/api/task-suggestions/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: 'fresh-test-conv',
        projectId: 'saas-startup',
        teamId: 'backend-team',
        agentId: 'backend-developer'
      })
    });
    
    const analysisData = await analysisResponse.json();
    console.log('Analysis result:', analysisData);
    
    // Check messages
    const messagesResponse = await fetch(`${BASE_URL}/api/conversations/fresh-test-conv/messages`);
    const retrievedMessages = await messagesResponse.json();
    console.log('Retrieved messages:', retrievedMessages.length);
    if (retrievedMessages.length > 0) {
      console.log('First message structure:', JSON.stringify(retrievedMessages[0], null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createFreshConversation();
