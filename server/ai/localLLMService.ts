import { roleProfiles } from './roleProfiles.js';
import { trainingSystem } from './trainingSystem.js';
import { executeColleagueLogic } from './colleagueLogic.js';
import { UserBehaviorAnalyzer, type UserBehaviorProfile, type MessageAnalysis } from './userBehaviorAnalyzer.js';
import { personalityEngine } from './personalityEvolution.js';

interface ChatContext {
  mode: 'project' | 'team' | 'agent';
  projectName: string;
  teamName?: string;
  agentRole: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    senderId?: string;
    messageType?: 'user' | 'agent';
  }>;
  userId?: string;
}

interface ColleagueResponse {
  content: string;
  reasoning?: string;
  confidence: number;
}

// Local LLM configuration
interface LocalLLMConfig {
  endpoint?: string; // e.g., 'http://localhost:1234/v1/chat/completions' for LM Studio
  model?: string;    // e.g., 'llama-2-7b-chat' or your trained model name
  apiKey?: string;   // if your local server requires authentication
}

const DEFAULT_CONFIG: LocalLLMConfig = {
  endpoint: process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:1234/v1/chat/completions',
  model: process.env.LOCAL_LLM_MODEL || 'local-model',
  apiKey: process.env.LOCAL_LLM_API_KEY || 'not-needed'
};

// Mock LLM response for now - replace with actual local LLM calls
async function callLocalLLM(prompt: string, config: LocalLLMConfig = DEFAULT_CONFIG): Promise<string> {
  try {
    // Try to call local LLM endpoint (LM Studio, Text Generation WebUI, etc.)
    const response = await fetch(config.endpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && config.apiKey !== 'not-needed' ? { 'Authorization': `Bearer ${config.apiKey}` } : {})
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Local LLM API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.warn('Local LLM not available, using fallback:', error);
    // Fallback to rule-based responses when local LLM is not available
    return generateRuleBasedResponse(prompt);
  }
}

// Stream-compatible local LLM call
async function* callLocalLLMStream(prompt: string, config: LocalLLMConfig = DEFAULT_CONFIG, abortSignal?: AbortSignal): AsyncGenerator<string, void, unknown> {
  try {
    const response = await fetch(config.endpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && config.apiKey !== 'not-needed' ? { 'Authorization': `Bearer ${config.apiKey}` } : {})
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
        stream: true
      }),
      signal: abortSignal
    });

    if (!response.ok) {
      throw new Error(`Local LLM API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      if (abortSignal?.aborted) break;
      
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip malformed lines
          }
        }
      }
    }
  } catch (error) {
    console.warn('Local LLM streaming not available, using fallback:', error);
    // Fallback: yield the full response at once
    const fallbackResponse = generateRuleBasedResponse(prompt);
    for (const char of fallbackResponse) {
      if (abortSignal?.aborted) break;
      yield char;
      // Add small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
}

// Rule-based response generator for when LLM is not available
function generateRuleBasedResponse(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Extract role from prompt
  let detectedRole = 'Product Manager';
  for (const role of Object.keys(roleProfiles)) {
    if (lowerPrompt.includes(role.toLowerCase())) {
      detectedRole = role;
      break;
    }
  }
  
  const roleProfile = roleProfiles[detectedRole];
  
  // Generate response based on role and content
  if (lowerPrompt.includes('roadmap') || lowerPrompt.includes('plan')) {
    return `As a ${detectedRole}, I'd suggest breaking this down into phases. What's our primary objective and timeline?`;
  }
  
  if (lowerPrompt.includes('design') || lowerPrompt.includes('ui')) {
    return `From a ${detectedRole} perspective, let's focus on the user experience. What's the main goal users are trying to achieve?`;
  }
  
  if (lowerPrompt.includes('priority') || lowerPrompt.includes('urgent')) {
    return `I'll help prioritize this. Let's evaluate the impact versus effort for each item.`;
  }
  
  if (lowerPrompt.includes('technical') || lowerPrompt.includes('code')) {
    return `Looking at this from a technical standpoint, we should consider scalability and maintainability. What's the expected load?`;
  }
  
  // Default response based on role personality
  return `As a ${detectedRole}, I think ${roleProfile.meaning.toLowerCase()}. Let me help you with this.`;
}

// B1.1: Add streaming response generation
export async function* generateStreamingResponse(
  userMessage: string,
  agentRole: string,
  context: ChatContext,
  sharedMemory?: string,
  abortSignal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  try {
    // B2.1: Analyze user behavior from conversation history
    let userBehaviorProfile: UserBehaviorProfile | null = null;
    let messageAnalysis: MessageAnalysis | null = null;
    let personalityPrompt = '';
    
    if (context.userId && context.conversationHistory.length > 0) {
      const messagesForAnalysis = context.conversationHistory.map(msg => ({
        content: msg.content,
        messageType: (msg.role === 'user' ? 'user' : 'agent') as 'user' | 'agent',
        timestamp: msg.timestamp,
        senderId: msg.senderId || (msg.role === 'user' ? context.userId! : agentRole)
      }));
      
      messagesForAnalysis.push({
        content: userMessage,
        messageType: 'user',
        timestamp: new Date().toISOString(),
        senderId: context.userId
      });
      
      userBehaviorProfile = UserBehaviorAnalyzer.analyzeUserBehavior(messagesForAnalysis, context.userId);
      messageAnalysis = UserBehaviorAnalyzer.analyzeMessage(userMessage, new Date().toISOString());
      
      // B4.1: Adapt personality based on user behavior
      if (userBehaviorProfile && messageAnalysis) {
        personalityEngine.adaptPersonalityFromBehavior(agentRole, context.userId, userBehaviorProfile, messageAnalysis);
        personalityPrompt = personalityEngine.generatePersonalityPrompt(agentRole, context.userId);
      }
    }

    const logicResult = executeColleagueLogic(agentRole, userMessage);
    const roleProfile = roleProfiles[agentRole] || roleProfiles['Product Manager'];
    
    // Create system prompt based on role and context
    const systemPrompt = `You are ${agentRole} in a ${context.mode} conversation. Project: ${context.projectName}${context.teamName ? `, Team: ${context.teamName}` : ''}.

Role Context: ${roleProfile.expertMindset}
Communication Style: ${roleProfile.personality}
Expertise: ${roleProfile.roleToolkit}

${sharedMemory ? `\n--- SHARED PROJECT MEMORY ---\n${sharedMemory}\n--- END MEMORY ---\n` : ''}

Be conversational, helpful, and stay in character. Remember user names and context from previous messages. Respond naturally as a human colleague would, not as a formal AI assistant.

${personalityPrompt}

Respond as this specific role with appropriate expertise and personality. Keep responses concise and actionable.

User message: ${userMessage}`;

    // Generate streaming response using local LLM
    let fullResponse = '';
    for await (const chunk of callLocalLLMStream(systemPrompt, DEFAULT_CONFIG, abortSignal)) {
      if (abortSignal?.aborted) {
        break;
      }
      
      fullResponse += chunk;
      yield chunk;
    }
    
    console.log('✅ Local LLM streaming completed, total length:', fullResponse.length);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Streaming response cancelled by user');
      return;
    }
    console.error('Error generating streaming response:', error);
    throw error;
  }
}

export async function generateIntelligentResponse(
  userMessage: string,
  agentRole: string,
  context: ChatContext
): Promise<ColleagueResponse> {
  try {
    // B2.1: Analyze user behavior from conversation history
    let userBehaviorProfile: UserBehaviorProfile | null = null;
    let messageAnalysis: MessageAnalysis | null = null;
    
    if (context.userId && context.conversationHistory.length > 0) {
      // Convert conversation history to the format expected by analyzer
      const messagesForAnalysis = context.conversationHistory.map(msg => ({
        content: msg.content,
        messageType: (msg.role === 'user' ? 'user' : 'agent') as 'user' | 'agent',
        timestamp: msg.timestamp,
        senderId: msg.senderId || (msg.role === 'user' ? context.userId! : agentRole)
      }));
      
      // Add current message to analysis
      messagesForAnalysis.push({
        content: userMessage,
        messageType: 'user',
        timestamp: new Date().toISOString(),
        senderId: context.userId
      });
      
      userBehaviorProfile = UserBehaviorAnalyzer.analyzeUserBehavior(messagesForAnalysis, context.userId);
      messageAnalysis = UserBehaviorAnalyzer.analyzeMessage(userMessage, new Date().toISOString());
    }

    // Execute custom logic for this colleague type
    const logicResult = executeColleagueLogic(agentRole, userMessage);
    
    // Get role profile for the responding colleague
    const roleProfile = roleProfiles[agentRole] || roleProfiles['Product Manager'];
    
    // Create context-aware prompt using our template system
    const basePrompt = createPromptTemplate({
      role: agentRole,
      userMessage,
      context: {
        chatMode: context.mode,
        projectName: context.projectName,
        teamName: context.teamName,
        recentMessages: context.conversationHistory.slice(-5) // Last 5 messages for context
      },
      roleProfile,
      userBehaviorProfile,
      messageAnalysis
    });

    // Enhance prompt with training data
    const enhancedPrompt = trainingSystem.generateEnhancedPrompt(agentRole, userMessage, basePrompt.systemPrompt);

    // Generate response using local LLM
    const responseContent = await callLocalLLM(enhancedPrompt);
    
    // Enhance response with custom logic results if available
    let finalContent = responseContent;
    if (logicResult.shouldExecute && logicResult.enhancedResponse) {
      finalContent = `${logicResult.enhancedResponse}\n\n${responseContent}`;
    }
    
    // Calculate confidence based on response quality
    const confidence = calculateConfidence(finalContent, userMessage, roleProfile);

    return {
      content: finalContent,
      confidence,
      reasoning: `Generated using ${agentRole} expertise and conversation context${logicResult.shouldExecute ? ' with custom logic' : ''}`
    };

  } catch (error) {
    console.error('Local LLM API Error:', error);
    
    // Fallback to keyword-based response if local LLM fails
    return {
      content: generateFallbackResponse(userMessage, agentRole, context.mode),
      confidence: 0.3,
      reasoning: 'Fallback response due to API error'
    };
  }
}

// Enhanced prompt template creation
function createPromptTemplate(params: {
  role: string;
  userMessage: string;
  context: any;
  roleProfile: any;
  userBehaviorProfile?: UserBehaviorProfile | null;
  messageAnalysis?: MessageAnalysis | null;
}): { systemPrompt: string; userPrompt: string } {
  const { role, userMessage, context, roleProfile, userBehaviorProfile, messageAnalysis } = params;
  
  const systemPrompt = `You are ${roleProfile.roleTitle}, a ${role} working on the "${context.projectName}" project.

PERSONALITY: ${roleProfile.personality}
EXPERTISE: ${roleProfile.expertMindset}
SIGNATURE STYLE: ${roleProfile.signatureMoves}

CONTEXT:
- Chat Mode: ${context.chatMode} (${context.chatMode === 'project' ? 'talking to entire project team' : context.chatMode === 'team' ? `talking to ${context.teamName} team` : 'one-on-one conversation'})
- Project: ${context.projectName}
${context.teamName ? `- Team: ${context.teamName}` : ''}

CONVERSATION HISTORY:
${context.recentMessages.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}

INSTRUCTIONS:
- Respond as ${roleProfile.roleTitle} with your specific expertise and personality
- Keep responses concise (2-3 sentences max)
- Be helpful and actionable based on your role
- Match the conversational tone
- Don't mention you're an AI - you're a colleague

${userBehaviorProfile && messageAnalysis ? `
USER COMMUNICATION PROFILE (Confidence: ${(userBehaviorProfile.confidence * 100).toFixed(0)}%):
- Style: ${userBehaviorProfile.communicationStyle} (${userBehaviorProfile.responsePreference} responses preferred)
- Decision Making: ${userBehaviorProfile.decisionMaking}
- Current Message: ${messageAnalysis.emotionalTone} tone, ${messageAnalysis.urgencyLevel > 0.5 ? 'urgent' : 'normal'} priority
- Adapt your response accordingly: ${UserBehaviorAnalyzer.getResponseAdaptation(userBehaviorProfile, messageAnalysis).tone}
- Response Length: ${UserBehaviorAnalyzer.getResponseAdaptation(userBehaviorProfile, messageAnalysis).length}
` : ''}`;

  const userPrompt = `User message: "${userMessage}"

Respond as ${roleProfile.roleTitle} with your expertise in ${role}:`;

  return { systemPrompt, userPrompt };
}

// Calculate response confidence based on quality metrics
function calculateConfidence(response: string, userMessage: string, roleProfile: any): number {
  let confidence = 0.5; // Base confidence
  
  // Check if response is substantive (not too short)
  if (response.length > 50) confidence += 0.2;
  
  // Check if response includes role-specific keywords
  const roleKeywords = roleProfile.roleToolkit?.toLowerCase().split(' ') || [];
  const hasRoleKeywords = roleKeywords.some((keyword: string) => 
    response.toLowerCase().includes(keyword)
  );
  if (hasRoleKeywords) confidence += 0.2;
  
  // Check if response addresses user message contextually
  const userKeywords = userMessage.toLowerCase().split(' ').filter(word => word.length > 3);
  const addressesUser = userKeywords.some(keyword => 
    response.toLowerCase().includes(keyword)
  );
  if (addressesUser) confidence += 0.1;
  
  return Math.min(confidence, 1.0);
}

// Fallback response generator for API failures
function generateFallbackResponse(userMessage: string, agentRole: string, mode: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // Role-specific fallbacks
  if (agentRole === "Product Manager") {
    if (lowerMessage.includes("roadmap") || lowerMessage.includes("plan")) {
      return "Let me break this down into phases. What's our primary goal and timeline?";
    }
    if (lowerMessage.includes("priority") || lowerMessage.includes("urgent")) {
      return "I'll help prioritize. What's the impact vs effort on each item?";
    }
    return "Got it! Let me coordinate with the teams on this.";
  }
  
  if (agentRole === "Product Designer") {
    if (lowerMessage.includes("design") || lowerMessage.includes("ui")) {
      return "I'll help with the design approach. What's the main user goal here?";
    }
    return "Good point - let me think about the design implications here.";
  }
  
  // Generic fallback
  return "That's definitely something we should prioritize.";
}

export { ChatContext, ColleagueResponse };