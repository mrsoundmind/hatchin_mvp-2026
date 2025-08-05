import WebSocket from 'ws';

// B4: Personality Evolution Test
console.log('🧪 Starting B4 Personality Evolution Test\n');

const ws = new WebSocket('ws://localhost:5000/ws');
let testStep = 0;
let lastMessageId = null;
const testUserId = 'personality-tester';

ws.on('open', function open() {
  console.log('✅ Connected to WebSocket\n');
  
  // Join conversation
  ws.send(JSON.stringify({
    type: 'join_conversation',
    conversationId: 'project-saas-startup'
  }));
  
  setTimeout(() => runPersonalityTest(), 1000);
});

function runPersonalityTest() {
  testStep++;
  
  if (testStep === 1) {
    console.log('🔬 TEST 1: Anxious communication style detection');
    sendMessage('Hi! I\'m really worried about our project timeline!! We have a deadline ASAP and I need to know if we can finish this quickly???');
    
  } else if (testStep === 2) {
    console.log('\n🔬 TEST 2: Decisive communication style');
    sendMessage('Let\'s go with option A. I\'ve decided this is the best approach. Make it happen.');
    
  } else if (testStep === 3) {
    console.log('\n🔬 TEST 3: Analytical communication style');
    sendMessage('I need to analyze the data and metrics. Can you provide evidence-based research comparing our options with detailed pros and cons?');
    
  } else if (testStep === 4) {
    console.log('\n🔬 TEST 4: Casual communication style');
    sendMessage('Hey! Sounds awesome. Yeah, that looks cool. Ok let\'s do it!');
    
  } else if (testStep === 5) {
    console.log('\n🔬 TEST 5: Check personality adaptation');
    testPersonalityAPI();
    
  } else {
    console.log('\n🏁 Personality evolution test completed');
    setTimeout(() => ws.close(), 2000);
  }
}

function sendMessage(content) {
  ws.send(JSON.stringify({
    type: 'send_message_streaming',
    conversationId: 'project-saas-startup',
    message: {
      id: 'personality-test-' + Date.now(),
      conversationId: 'project-saas-startup',
      userId: testUserId,
      content: content,
      messageType: 'user',
      timestamp: new Date().toISOString(),
      senderName: 'Personality Tester',
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
}

async function testPersonalityAPI() {
  try {
    console.log('🔍 Fetching personality stats for Product Manager...');
    
    const response = await fetch('http://localhost:5000/api/personality/Product Manager/' + testUserId);
    const stats = await response.json();
    
    console.log('📊 Personality Stats:');
    console.log('- Interaction Count:', stats.profile.interactionCount);
    console.log('- Adaptation Confidence:', (stats.profile.adaptationConfidence * 100).toFixed(1) + '%');
    console.log('- Learning History:', stats.profile.learningHistory.length, 'adjustments');
    
    console.log('\n📈 Adaptation Summary:');
    console.log(stats.adaptationSummary);
    
    // Test positive feedback
    console.log('\n🔬 TEST 6: Testing positive feedback impact');
    const feedbackResponse = await fetch('http://localhost:5000/api/personality/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'Product Manager',
        userId: testUserId,
        feedback: 'positive',
        messageContent: 'Great advice!',
        agentResponse: 'Thank you for your feedback.'
      })
    });
    
    const feedbackResult = await feedbackResponse.json();
    console.log('✅ Positive feedback processed:', feedbackResult);
    
    setTimeout(() => runPersonalityTest(), 2000);
    
  } catch (error) {
    console.error('❌ Error testing personality API:', error.message);
    setTimeout(() => runPersonalityTest(), 2000);
  }
}

ws.on('message', function message(data) {
  const msg = JSON.parse(data.toString());
  
  if (msg.type === 'streaming_completed') {
    console.log('✅ AI Response completed with personality adaptation\n');
    setTimeout(() => runPersonalityTest(), 3000);
    
  } else if (msg.type === 'new_message' && msg.message?.messageType === 'agent') {
    lastMessageId = msg.message.id;
    console.log('🤖 Agent Response (adapted):', msg.message.content.substring(0, 100) + '...\n');
    
    // Check if the response shows personality adaptation
    const content = msg.message.content.toLowerCase();
    if (testStep === 1 && (content.includes('understand') || content.includes('concern'))) {
      console.log('🎯 Detected empathy adaptation for anxious user!');
    } else if (testStep === 2 && content.length < 200) {
      console.log('🎯 Detected brief response for decisive user!');
    } else if (testStep === 3 && (content.includes('data') || content.includes('analysis'))) {
      console.log('🎯 Detected technical depth for analytical user!');
    } else if (testStep === 4 && (content.includes('great') || content.includes('awesome'))) {
      console.log('🎯 Detected enthusiasm for casual user!');
    }
  }
});

ws.on('close', function close() {
  console.log('✅ Personality evolution test completed - WebSocket closed');
});

// Auto-close after 30 seconds
setTimeout(() => {
  if (ws.readyState === WebSocket.OPEN) {
    console.log('\n⏰ Test timeout - closing connection');
    ws.close();
  }
}, 30000);