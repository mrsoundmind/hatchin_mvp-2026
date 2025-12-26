import { OpenAI } from 'openai';
import { Client } from "langsmith";
import { roleProfiles } from './roleProfiles.js';
import { trainingSystem } from './trainingSystem.js';
import { executeColleagueLogic } from './colleagueLogic.js';
import { UserBehaviorAnalyzer, type UserBehaviorProfile, type MessageAnalysis } from './userBehaviorAnalyzer.js';
import { personalityEngine } from './personalityEvolution.js';

// Initialize OpenAI client (conditionally)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Initialize LangSmith client for tracing
const langsmith = process.env.LANGSMITH_API_KEY ? new Client({
  apiKey: process.env.LANGSMITH_API_KEY,
}) : null;

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

// B1.1: Add streaming response generation with LangSmith tracing
export async function* generateStreamingResponse(
  userMessage: string,
  agentRole: string,
  context: ChatContext,
  sharedMemory?: string,
  abortSignal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  let runId: string | null = null;
  
  try {
    // Start LangSmith trace for streaming response
    if (langsmith) {
      try {
        const run = await langsmith.createRun({
          name: `Streaming Response - ${agentRole}`,
          run_type: "chain",
          inputs: { 
            userMessage, 
            agentRole, 
            context: {
              mode: context.mode,
              projectName: context.projectName,
              teamName: context.teamName
            },
            sharedMemory: sharedMemory || "None"
          },
          project_name: process.env.LANGSMITH_PROJECT || "hatchin-chat",
          tags: ["streaming", "ai-response", agentRole.toLowerCase().replace(/\s+/g, '-')]
        });
        runId = run?.id;
      } catch (error) {
        console.warn('LangSmith trace failed, continuing without tracing:', error.message);
        runId = null;
      }
    }
    // Fallback to local but smarter templated response if no OpenAI API key
    if (!openai) {
      const personaPrefix = agentRole === 'Product Manager'
        ? 'Here is a concise, action-focused reply:'
        : agentRole === 'Product Designer'
          ? 'Design-focused, concrete next steps:'
          : agentRole === 'UI Engineer'
            ? 'Frontend implementation plan:'
            : agentRole === 'Backend Developer'
              ? 'Backend implementation plan:'
              : 'Thoughtful response:';
      const fallbackResponse = `${personaPrefix} ${generateFallbackResponse(userMessage, agentRole, context.mode)}`;
      for (const word of fallbackResponse.split(' ')) {
        if (abortSignal?.aborted) break;
        yield word + ' ';
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate streaming
      }
      
      // Update LangSmith trace with fallback response
      if (langsmith && runId) {
        try {
          await langsmith.updateRun(runId, {
            outputs: { 
              response: fallbackResponse,
              method: "fallback",
              confidence: 0.3
            },
            status: "success"
          });
        } catch (error) {
          console.warn('LangSmith update failed:', error.message);
        }
      }
      return;
    }
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

Role Context: ${roleProfile.expertise}
Communication Style: ${roleProfile.communicationStyle}
Personality: ${roleProfile.personality}

${roleProfile.primaryGoals ? `Goals: ${roleProfile.primaryGoals}` : ''}

${sharedMemory ? `\n--- SHARED PROJECT MEMORY ---\n${sharedMemory}\n--- END MEMORY ---\n` : ''}

Be conversational, helpful, and stay in character. Remember user names and context from previous messages. Respond naturally as a human colleague would, not as a formal AI assistant.

${personalityPrompt}

Respond as this specific role with appropriate expertise and personality. Keep responses concise and actionable.`;

    // Create streaming completion
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: userBehaviorProfile?.communicationStyle === 'anxious' ? 150 : 500,
    }, { signal: abortSignal });

    // Stream the response word by word
    let fullResponse = '';
    for await (const chunk of completion) {
      if (abortSignal?.aborted) {
        break;
      }
      
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        yield content;
      }
    }
    
    // Update LangSmith trace with successful streaming response
    if (langsmith && runId) {
      try {
        await langsmith.updateRun(runId, {
          outputs: { 
            response: fullResponse,
            method: "streaming",
            confidence: calculateConfidence(fullResponse, userMessage, roleProfile),
            tokens: fullResponse.length
          },
          status: "success"
        });
      } catch (error) {
        console.warn('LangSmith update failed:', error.message);
      }
    }
    
    console.log('✅ OpenAI streaming completed, total length:', fullResponse.length);
  } catch (error: any) {
    // Update LangSmith trace with error
    if (langsmith && runId) {
      try {
        await langsmith.updateRun(runId, {
          outputs: { 
            error: error.message,
            method: "streaming"
          },
          status: "error"
        });
      } catch (updateError) {
        console.warn('LangSmith error update failed:', updateError.message);
      }
    }
    
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
  let runId: string | null = null;
  
  try {
    // Start LangSmith trace for intelligent response
    if (langsmith) {
      const run = await langsmith.createRun({
        name: `Intelligent Response - ${agentRole}`,
        run_type: "chain",
        inputs: { 
          userMessage, 
          agentRole, 
          context: {
            mode: context.mode,
            projectName: context.projectName,
            teamName: context.teamName,
            conversationHistory: context.conversationHistory.length
          }
        },
        project_name: process.env.LANGSMITH_PROJECT || "hatchin-chat",
        tags: ["intelligent", "ai-response", agentRole.toLowerCase().replace(/\s+/g, '-')]
      });
      runId = run.id;
    }
    // Fallback to local response if no OpenAI API key
    if (!openai) {
      const fallbackResponse = generateFallbackResponse(userMessage, agentRole, context.mode);
      
      // Update LangSmith trace with fallback response
      if (langsmith && runId) {
        await langsmith.updateRun(runId, {
          outputs: { 
            response: fallbackResponse,
            method: "fallback",
            confidence: 0.3
          },
          status: "success"
        });
      }
      
      return {
        content: fallbackResponse,
        confidence: 0.3,
        reasoning: 'Local fallback response (OpenAI API key not available)'
      };
    }
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

    // Update LangSmith trace with successful response
    if (langsmith && runId) {
      await langsmith.updateRun(runId, {
        outputs: { 
          content: responseContent,
          confidence,
          reasoning: `Generated using ${agentRole} expertise and conversation context${logicResult.shouldExecute ? ' with custom logic' : ''}`,
          method: "intelligent"
        },
        status: "success"
      });
    }

    return {
      content: responseContent,
      confidence,
      reasoning: `Generated using ${agentRole} expertise and conversation context${logicResult.shouldExecute ? ' with custom logic' : ''}`
    };

  } catch (error) {
    // Update LangSmith trace with error
    if (langsmith && runId) {
      await langsmith.updateRun(runId, {
        outputs: { 
          error: error.message,
          method: "intelligent"
        },
        status: "error"
      });
    }
    
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
  
  // Role-specific fallbacks with more comprehensive responses
  if (agentRole === "Product Manager") {
    if (lowerMessage.includes("roadmap") || lowerMessage.includes("milestone") || lowerMessage.includes("timeline")) {
      return "I'd recommend breaking this into 3 phases: MVP (3 months), Growth Features (6 months), and Scale (12 months). Let's start with defining your core value proposition and key user flows. What's your target launch date?";
    }
    if (lowerMessage.includes("goals") || lowerMessage.includes("smart")) {
      return "For SMART goals, I suggest: 1) User Acquisition: 1000 active users in 6 months, 2) Product-Market Fit: NPS score >50, 3) Revenue: $10K MRR by month 12. Each team should have specific KPIs aligned with these objectives.";
    }
    if (lowerMessage.includes("tasks") || lowerMessage.includes("responsibilities") || lowerMessage.includes("summarize")) {
      return "Here's the team breakdown: Design Team should focus on user research and wireframes, Development Team on core architecture and MVP features, Marketing Team on go-to-market strategy. What's your current biggest bottleneck?";
    }
    if (lowerMessage.includes("priority") || lowerMessage.includes("urgent")) {
      return "I'll help prioritize using impact vs effort matrix. What's the most critical user problem we're solving right now?";
    }
    return "As Product Manager, I'll coordinate with all teams on this. What's our primary objective and timeline?";
  }
  
  if (agentRole === "Product Designer") {
    if (lowerMessage.includes("roadmap")) {
      return "From a design perspective, our roadmap should prioritize user experience milestones: user research (month 1), wireframes & prototypes (month 2), usability testing (month 3). What's our target user persona?";
    }
    if (lowerMessage.includes("goals")) {
      return "Design goals should focus on usability: 90% task completion rate, <3 clicks to core features, 4.5+ app store rating. We need user research to validate our assumptions.";
    }
    if (lowerMessage.includes("design") || lowerMessage.includes("ui") || lowerMessage.includes("ux")) {
      return "I'll focus on user-centered design. Let's start with understanding user pain points and mapping their journey. What's the primary use case we're solving?";
    }
    return "From a design perspective, I'll ensure this creates great user experience. What's the main user goal here?";
  }
  
  if (agentRole === "UI Engineer") {
    if (lowerMessage.includes("roadmap")) {
      return "Technical roadmap priorities: component library setup (week 1), responsive design system (week 2-3), core UI implementation (month 2). What framework are we using?";
    }
    if (lowerMessage.includes("goals")) {
      return "Frontend goals: 95% mobile responsiveness, <2s load times, accessibility AA compliance. I'll implement a scalable component architecture.";
    }
    return "I'll handle the frontend implementation. What's the technical scope and timeline?";
  }
  
  if (agentRole === "Backend Developer") {
    if (lowerMessage.includes("roadmap")) {
      return "Backend roadmap: database schema design (week 1), API architecture (week 2), authentication system (week 3), deployment pipeline (week 4). What's our expected user scale?";
    }
    if (lowerMessage.includes("goals")) {
      return "Backend goals: 99.9% uptime, <200ms API response times, secure authentication, scalable to 10K users. I'll design for growth from day one.";
    }
    return "I'll architect the backend systems. What's our data model and scale requirements?";
  }
  
  if (agentRole === "QA Lead") {
    if (lowerMessage.includes("roadmap")) {
      return "QA roadmap: test strategy document (week 1), automated test setup (week 2), manual testing protocols (week 3), performance testing (week 4). What's our quality standard?";
    }
    if (lowerMessage.includes("goals")) {
      return "QA goals: <1% bug escape rate, 90% test automation coverage, <24hr bug fix cycle. I'll ensure we ship quality features consistently.";
    }
    return "I'll ensure quality throughout development. What's our testing scope and acceptance criteria?";
  }
  
  // Generic fallback
  return "That's an excellent point. Let me help you tackle this systematically. What's the priority and timeline?";
}

export { ChatContext, ColleagueResponse };