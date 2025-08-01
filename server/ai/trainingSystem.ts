// AI Training System for Hatchin Colleagues
// Learns from user feedback to improve responses over time

interface TrainingFeedback {
  id: string;
  conversationId: string;
  messageId: string;
  userMessage: string;
  agentResponse: string;
  agentRole: string;
  rating: 'good' | 'bad' | 'excellent';
  feedback?: string;
  timestamp: string;
}

interface CustomExample {
  id: string;
  agentRole: string;
  userInput: string;
  idealResponse: string;
  category: string;
  createdAt: string;
}

interface LearningPattern {
  agentRole: string;
  keywords: string[];
  preferredResponseStyle: string;
  responseLength: 'short' | 'medium' | 'long';
  tone: 'formal' | 'casual' | 'technical' | 'friendly';
  confidence: number;
}

export class TrainingSystem {
  private feedback: TrainingFeedback[] = [];
  private customExamples: CustomExample[] = [];
  private learningPatterns: LearningPattern[] = [];

  // Add feedback for a colleague response
  addFeedback(feedback: Omit<TrainingFeedback, 'id' | 'timestamp'>) {
    const trainingFeedback: TrainingFeedback = {
      ...feedback,
      id: `feedback-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    this.feedback.push(trainingFeedback);
    this.updateLearningPatterns(trainingFeedback);
    
    console.log(`Training feedback recorded: ${feedback.rating} for ${feedback.agentRole}`);
    return trainingFeedback;
  }

  // Add custom example conversation
  addCustomExample(example: Omit<CustomExample, 'id' | 'createdAt'>) {
    const customExample: CustomExample = {
      ...example,
      id: `example-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    this.customExamples.push(customExample);
    console.log(`Custom example added for ${example.agentRole}`);
    return customExample;
  }

  // Get training data for a specific agent role
  getTrainingData(agentRole: string) {
    const roleFeedback = this.feedback.filter(f => f.agentRole === agentRole);
    const roleExamples = this.customExamples.filter(e => e.agentRole === agentRole);
    const rolePatterns = this.learningPatterns.filter(p => p.agentRole === agentRole);

    return {
      feedback: roleFeedback,
      examples: roleExamples,
      patterns: rolePatterns,
      goodResponses: roleFeedback.filter(f => f.rating === 'good' || f.rating === 'excellent'),
      badResponses: roleFeedback.filter(f => f.rating === 'bad')
    };
  }

  // Generate enhanced prompt based on learning
  generateEnhancedPrompt(agentRole: string, userMessage: string, basePrompt: string): string {
    const trainingData = this.getTrainingData(agentRole);
    
    if (trainingData.examples.length === 0 && trainingData.goodResponses.length === 0) {
      return basePrompt;
    }

    let enhancedPrompt = basePrompt;

    // Add custom examples if available
    if (trainingData.examples.length > 0) {
      enhancedPrompt += "\n\nCUSTOM TRAINING EXAMPLES:";
      trainingData.examples.slice(-3).forEach(example => {
        enhancedPrompt += `\nUser: "${example.userInput}"\nYou: "${example.idealResponse}"`;
      });
    }

    // Add successful response patterns
    if (trainingData.goodResponses.length > 0) {
      enhancedPrompt += "\n\nSUCCESSFUL RESPONSE PATTERNS (follow these styles):";
      trainingData.goodResponses.slice(-3).forEach(response => {
        enhancedPrompt += `\nUser: "${response.userMessage}"\nGood Response: "${response.agentResponse}"`;
      });
    }

    // Add learning patterns
    if (trainingData.patterns.length > 0) {
      const pattern = trainingData.patterns[0];
      enhancedPrompt += `\n\nLEARNED PREFERENCES:
- Response Style: ${pattern.preferredResponseStyle}
- Tone: ${pattern.tone}
- Length: ${pattern.responseLength}
- Focus Keywords: ${pattern.keywords.join(', ')}`;
    }

    enhancedPrompt += "\n\nRespond following the patterns above while maintaining your core personality.";
    
    return enhancedPrompt;
  }

  // Update learning patterns based on feedback
  private updateLearningPatterns(feedback: TrainingFeedback) {
    const existingPattern = this.learningPatterns.find(p => p.agentRole === feedback.agentRole);
    
    if (feedback.rating === 'good' || feedback.rating === 'excellent') {
      const keywords = this.extractKeywords(feedback.userMessage);
      const responseStyle = this.analyzeResponseStyle(feedback.agentResponse);
      const tone = this.analyzeTone(feedback.agentResponse);
      const responseLength = this.analyzeLength(feedback.agentResponse);

      if (existingPattern) {
        // Update existing pattern
        existingPattern.keywords = [...new Set([...existingPattern.keywords, ...keywords])];
        existingPattern.preferredResponseStyle = responseStyle;
        existingPattern.tone = tone;
        existingPattern.responseLength = responseLength;
        existingPattern.confidence = Math.min(existingPattern.confidence + 0.1, 1.0);
      } else {
        // Create new pattern
        this.learningPatterns.push({
          agentRole: feedback.agentRole,
          keywords,
          preferredResponseStyle: responseStyle,
          tone,
          responseLength,
          confidence: 0.7
        });
      }
    }
  }

  // Extract keywords from user message
  private extractKeywords(message: string): string[] {
    const words = message.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return words.filter(word => word.length > 3 && !stopWords.includes(word)).slice(0, 5);
  }

  // Analyze response style
  private analyzeResponseStyle(response: string): string {
    if (response.includes('?')) return 'questioning';
    if (response.includes('Let me') || response.includes('I\'ll')) return 'proactive';
    if (response.includes('Here\'s') || response.includes('Try this')) return 'directive';
    return 'conversational';
  }

  // Analyze tone
  private analyzeTone(response: string): 'formal' | 'casual' | 'technical' | 'friendly' {
    if (response.includes('API') || response.includes('database') || response.includes('code')) return 'technical';
    if (response.includes('!') || response.includes('Great') || response.includes('Perfect')) return 'friendly';
    if (response.length > 100 && !response.includes('!')) return 'formal';
    return 'casual';
  }

  // Analyze response length
  private analyzeLength(response: string): 'short' | 'medium' | 'long' {
    if (response.length < 50) return 'short';
    if (response.length < 150) return 'medium';
    return 'long';
  }

  // Get training statistics
  getTrainingStats() {
    const totalFeedback = this.feedback.length;
    const goodFeedback = this.feedback.filter(f => f.rating === 'good' || f.rating === 'excellent').length;
    const badFeedback = this.feedback.filter(f => f.rating === 'bad').length;
    
    const roleStats = Object.entries(
      this.feedback.reduce((acc, f) => {
        acc[f.agentRole] = (acc[f.agentRole] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    );

    return {
      totalFeedback,
      goodFeedback,
      badFeedback,
      successRate: totalFeedback > 0 ? Math.round((goodFeedback / totalFeedback) * 100) : 0,
      roleStats,
      customExamples: this.customExamples.length,
      learningPatterns: this.learningPatterns.length
    };
  }
}

// Global training system instance
export const trainingSystem = new TrainingSystem();