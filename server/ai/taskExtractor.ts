import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export interface ExtractedTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  suggestedAssignee: string;
  category: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  reasoning: string;
}

export interface TaskExtractionResult {
  hasTasks: boolean;
  tasks: ExtractedTask[];
  confidence: number;
}

/**
 * Extract actionable tasks from chat messages using AI
 */
export async function extractTasksFromMessage(
  userMessage: string,
  agentResponse: string,
  projectContext: {
    projectName: string;
    teamName?: string;
    agentRole: string;
    availableAgents: string[];
  }
): Promise<TaskExtractionResult> {
  
  if (!openai) {
    return {
      hasTasks: false,
      tasks: [],
      confidence: 0
    };
  }

  try {
    const systemPrompt = `You are an AI task extraction specialist. Analyze chat conversations to identify actionable tasks that need to be created.

PROJECT CONTEXT:
- Project: ${projectContext.projectName}
- Team: ${projectContext.teamName || 'General'}
- Responding Agent: ${projectContext.agentRole}
- Available Agents: ${projectContext.availableAgents.join(', ')}

TASK EXTRACTION RULES:
1. Only extract tasks that are clearly actionable and specific
2. Look for verbs like: fix, create, build, implement, design, test, deploy, update, review
3. Ignore general discussions, questions, or vague statements
4. Focus on concrete deliverables or problems to solve
5. Consider urgency indicators: "urgent", "asap", "critical", "blocking"
6. Assign appropriate priority based on language used
7. Suggest the most suitable agent based on the task type

RESPONSE FORMAT:
Return a JSON object with this structure:
{
  "hasTasks": boolean,
  "tasks": [
    {
      "title": "Clear, actionable task title",
      "description": "Detailed description of what needs to be done",
      "priority": "low|medium|high|urgent",
      "suggestedAssignee": "Agent role from available agents",
      "category": "Development|Design|Testing|Deployment|Research|Other",
      "estimatedEffort": "low|medium|high",
      "reasoning": "Why this task was identified and assigned this priority"
    }
  ],
  "confidence": 0.0-1.0
}

EXAMPLES OF TASK-INDICATING LANGUAGE:
- "We need to fix the authentication bug"
- "Let's create a user dashboard"
- "The API is broken and needs to be fixed"
- "We should implement user authentication"
- "The design needs to be updated"
- "We need to test the new feature"
- "Deploy the hotfix to production"

EXAMPLES OF NON-TASK LANGUAGE:
- "How are you doing?"
- "What do you think about this?"
- "I'm not sure about that"
- "Let's discuss this later"
- "That's interesting"`;

    const userPrompt = `CONVERSATION TO ANALYZE:

USER MESSAGE: "${userMessage}"

AGENT RESPONSE: "${agentResponse}"

Extract any actionable tasks from this conversation. Be conservative - only extract tasks that are clearly actionable and specific.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const response = completion.choices[0].message.content;
    
    try {
      const result = JSON.parse(response);
      return {
        hasTasks: result.hasTasks || false,
        tasks: result.tasks || [],
        confidence: result.confidence || 0
      };
    } catch (parseError) {
      console.error('Error parsing task extraction response:', parseError);
      return {
        hasTasks: false,
        tasks: [],
        confidence: 0
      };
    }

  } catch (error) {
    console.error('Error extracting tasks from message:', error);
    return {
      hasTasks: false,
      tasks: [],
      confidence: 0
    };
  }
}

/**
 * Fallback task extraction using keyword matching
 */
export function extractTasksFallback(
  userMessage: string,
  agentResponse: string,
  availableAgents: string[]
): TaskExtractionResult {
  
  const taskKeywords = [
    'fix', 'create', 'build', 'implement', 'design', 'test', 'deploy', 
    'update', 'review', 'debug', 'resolve', 'complete', 'finish'
  ];
  
  const urgentKeywords = ['urgent', 'asap', 'critical', 'blocking', 'emergency'];
  
  const combinedText = `${userMessage} ${agentResponse}`.toLowerCase();
  
  const hasTaskKeywords = taskKeywords.some(keyword => combinedText.includes(keyword));
  const hasUrgentKeywords = urgentKeywords.some(keyword => combinedText.includes(keyword));
  
  if (!hasTaskKeywords) {
    return {
      hasTasks: false,
      tasks: [],
      confidence: 0
    };
  }
  
  // Simple task extraction
  const tasks: ExtractedTask[] = [];
  
  // Look for "fix" patterns
  if (combinedText.includes('fix') && combinedText.includes('bug')) {
    tasks.push({
      title: 'Fix bug mentioned in conversation',
      description: `Task extracted from: "${userMessage}"`,
      priority: hasUrgentKeywords ? 'urgent' : 'high',
      suggestedAssignee: availableAgents.includes('Backend Developer') ? 'Backend Developer' : availableAgents[0],
      category: 'Development',
      estimatedEffort: 'medium',
      reasoning: 'Bug fix identified from conversation'
    });
  }
  
  // Look for "create" patterns
  if (combinedText.includes('create') || combinedText.includes('build')) {
    tasks.push({
      title: 'Create feature mentioned in conversation',
      description: `Task extracted from: "${userMessage}"`,
      priority: hasUrgentKeywords ? 'urgent' : 'medium',
      suggestedAssignee: availableAgents.includes('Product Designer') ? 'Product Designer' : availableAgents[0],
      category: 'Development',
      estimatedEffort: 'high',
      reasoning: 'Feature creation identified from conversation'
    });
  }
  
  return {
    hasTasks: tasks.length > 0,
    tasks,
    confidence: 0.6
  };
}
