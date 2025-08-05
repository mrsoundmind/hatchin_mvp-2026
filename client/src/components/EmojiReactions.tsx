import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Smile } from 'lucide-react';
import type { EmojiReaction } from '@shared/schema';

interface EmojiReactionsProps {
  messageId: string;
}

// Popular emojis for quick reactions
const QUICK_EMOJIS = ['👍', '❤️', '😄', '😮', '😢', '😡', '🎉', '👏'];

export function EmojiReactions({ messageId }: EmojiReactionsProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch existing reactions for this message
  const { data: reactions = [] } = useQuery<EmojiReaction[]>({
    queryKey: [`/api/messages/${messageId}/emoji-reactions`],
    enabled: !!messageId,
  });

  // Add emoji reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async (emoji: string) => {
      return await apiRequest(`/api/messages/${messageId}/emoji-reactions`, 'POST', { emoji });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/messages/${messageId}/emoji-reactions`] 
      });
      setIsPopoverOpen(false);
    },
    onError: (error) => {
      console.error('Failed to add emoji reaction:', error);
    },
  });

  // Group reactions by emoji and count them
  const reactionGroups = reactions.reduce((groups, reaction) => {
    const emoji = reaction.emoji;
    if (!groups[emoji]) {
      groups[emoji] = {
        emoji,
        count: 0,
        users: [],
        userReacted: false,
      };
    }
    groups[emoji].count++;
    groups[emoji].users.push(reaction.userId);
    if (reaction.userId === 'user') {
      groups[emoji].userReacted = true;
    }
    return groups;
  }, {} as Record<string, { emoji: string; count: number; users: string[]; userReacted: boolean }>);

  const handleEmojiClick = (emoji: string) => {
    addReactionMutation.mutate(emoji);
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      {/* Display existing reaction groups */}
      {Object.values(reactionGroups).map((group) => (
        <Button
          key={group.emoji}
          variant="outline"
          size="sm"
          onClick={() => handleEmojiClick(group.emoji)}
          className={`h-6 px-2 text-xs rounded-full transition-all duration-200 ${
            group.userReacted
              ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
              : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
          }`}
          data-testid={`reaction-${group.emoji}-${messageId}`}
        >
          <span className="mr-1">{group.emoji}</span>
          <span>{group.count}</span>
        </Button>
      ))}

      {/* Add reaction button */}
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-full"
            data-testid={`add-reaction-${messageId}`}
          >
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-64 p-3 bg-zinc-900 border-zinc-700"
          align="start"
          side="top"
        >
          <div className="grid grid-cols-4 gap-2">
            {QUICK_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => handleEmojiClick(emoji)}
                className="h-8 w-8 p-0 text-lg hover:bg-zinc-800 rounded"
                disabled={addReactionMutation.isPending}
                data-testid={`emoji-option-${emoji}`}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}