import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface MessageFeedbackProps {
  messageId: string;
  conversationId: string;
  userMessage: string;
  agentResponse: string;
  agentRole: string;
  agentName: string;
  onFeedbackSubmitted?: () => void;
}

export function MessageFeedback({ 
  messageId, 
  conversationId, 
  userMessage, 
  agentResponse, 
  agentRole, 
  agentName,
  onFeedbackSubmitted 
}: MessageFeedbackProps) {
  const [selectedRating, setSelectedRating] = useState<'good' | 'bad' | 'excellent' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRatingSelect = async (rating: 'good' | 'bad' | 'excellent') => {
    setSelectedRating(rating);
    setIsSubmitting(true);

    try {
      await apiRequest('/api/training/feedback', {
        method: 'POST',
        body: JSON.stringify({
          messageId,
          conversationId,
          userMessage,
          agentResponse,
          agentRole,
          rating,
          feedback: feedbackText
        })
      });

      setIsSubmitted(true);
      onFeedbackSubmitted?.();
      
      // Auto-hide after success
      setTimeout(() => {
        setIsSubmitted(false);
        setSelectedRating(null);
        setFeedbackText('');
      }, 2000);

    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mt-2">
        <ThumbsUp size={14} />
        <span>Thanks! {agentName} will learn from your feedback.</span>
      </div>
    );
  }

  return (
    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        How was {agentName}'s response?
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRatingSelect('excellent')}
          disabled={isSubmitting}
          className="flex items-center gap-1 text-xs"
        >
          <Star size={14} />
          Excellent
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRatingSelect('good')}
          disabled={isSubmitting}
          className="flex items-center gap-1 text-xs"
        >
          <ThumbsUp size={14} />
          Good
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRatingSelect('bad')}
          disabled={isSubmitting}
          className="flex items-center gap-1 text-xs"
        >
          <ThumbsDown size={14} />
          Could be better
        </Button>
      </div>

      {selectedRating === 'bad' && !isSubmitted && (
        <div className="mt-2">
          <textarea
            placeholder="How should they respond instead? (optional)"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="w-full p-2 text-xs border rounded resize-none dark:bg-gray-700 dark:border-gray-600"
            rows={2}
          />
        </div>
      )}
    </div>
  );
}