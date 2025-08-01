import { OpenAI } from 'openai';
import { roleProfiles } from './roleProfiles.js';
import { trainingSystem } from './trainingSystem.js';
import { executeColleagueLogic } from './colleagueLogic.js';
import { UserBehaviorAnalyzer, type UserBehaviorProfile, type MessageAnalysis } from './userBehaviorAnalyzer.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: enhancedPrompt
        },
        {
          role: 'user', 
          content: basePrompt.userPrompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    let responseContent = completion.choices[0]?.message?.content || '';
    
    // Enhance response with custom logic results if available
    if (logicResult.shouldExecute && logicResult.enhancedResponse) {
      responseContent = `${logicResult.enhancedResponse}\n\n${responseContent}`;
    }
    
    // Calculate confidence based on response quality
    const confidence = calculateConfidence(responseContent, userMessage, roleProfile);

    return {
      content: responseContent,
      confidence,
      reasoning: `Generated using ${agentRole} expertise and conversation context${logicResult.shouldExecute ? ' with custom logic' : ''}`
    };

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Fallback to keyword-based response if OpenAI fails
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
  
  const systemPrompt = `You are ${roleProfile.name}, a ${role} working on the "${context.projectName}" project.

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
- Respond as ${roleProfile.name} with your specific expertise and personality
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

Respond as ${roleProfile.name} with your expertise in ${role}:`;

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