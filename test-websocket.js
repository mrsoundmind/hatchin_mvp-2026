import WebSocket from 'ws';

// Test WebSocket connection and memory system
const ws = new WebSocket('ws://localhost:5000/ws');

ws.on('open', function open() {
  console.log('🔌 Connected to WebSocket');
  
  // Join the project conversation
  ws.send(JSON.stringify({
    type: 'join_conversation',
    conversationId: 'project-saas-startup'
  }));
  
  // Send a test message with name introduction
  setTimeout(() => {
    console.log('📤 Sending test message with name...');
    ws.send(JSON.stringify({
      type: 'send_message_streaming',
      conversationId: 'project-saas-startup',
      message: {
        id: 'test-' + Date.now(),
        conversationId: 'project-saas-startup',
        userId: 'websocket-test',
        content: 'My name is WebSocketTester and I want to test if you remember conversations. What are our project goals?',
        messageType: 'user',
        timestamp: new Date().toISOString(),
        senderName: 'WebSocket Test User',
        metadata: {
          routing: {
            type: 'project',
            scope: 'SaaS Startup project (5 colleagues)', 
            participantCount: 5,
            recipients: ['Product Manager', 'Product Designer', 'UI Engineer', 'Backend Developer', 'QA Lead']
          },
          memory: {
            projectMemory: 'Project: SaaS Startup',
            memoryScope: 'project-wide',
            canWrite: true
          }
        }
      }
    }));
  }, 1000);
  
  // Follow up message to test memory
  setTimeout(() => {
    console.log('📤 Sending follow-up message to test memory...');
    ws.send(JSON.stringify({
      type: 'send_message_streaming', 
      conversationId: 'project-saas-startup',
      message: {
        id: 'test-followup-' + Date.now(),
        conversationId: 'project-saas-startup',
        userId: 'websocket-test',
        content: 'Do you remember my name? And what did we discuss about the project goals?',
        messageType: 'user',
        timestamp: new Date().toISOString(),
        senderName: 'WebSocket Test User',
        metadata: {
          routing: {
            type: 'project',
            scope: 'SaaS Startup project (5 colleagues)',
            participantCount: 5,
            recipients: ['Product Manager', 'Product Designer', 'UI Engineer', 'Backend Developer', 'QA Lead']
          },
          memory: {
            projectMemory: 'Project: SaaS Startup',
            memoryScope: 'project-wide', 
            canWrite: true
          }
        }
      }
    }));
  }, 8000);
});

ws.on('message', function message(data) {
  const msg = JSON.parse(data.toString());
  console.log('📥 Received:', msg.type, msg.messageId ? `(${msg.messageId})` : '');
  
  if (msg.type === 'streaming_chunk' && msg.chunk) {
    process.stdout.write(msg.chunk);
  } else if (msg.type === 'streaming_completed') {
    console.log('\n✅ AI Response completed');
  } else if (msg.type === 'new_message' && msg.message?.messageType === 'agent') {
    console.log('\n🤖 Agent response received:', msg.message.content.substring(0, 100) + '...');
  }
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err);
});

ws.on('close', function close() {
  console.log('🔌 WebSocket connection closed');
});

// Close after 15 seconds
setTimeout(() => {
  console.log('\n🔚 Test completed, closing connection...');
  ws.close();
}, 15000);