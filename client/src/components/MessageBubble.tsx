import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Copy, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    messageType: 'user' | 'agent';
    timestamp: string;
    metadata?: {
      agentRole?: string;
    };
  };
  isGrouped?: boolean; // whether this message is grouped with previous message from same sender
  showReactions?: boolean; // only show reactions for agent messages
  onReaction?: (messageId: string, reactionType: 'thumbs_up' | 'thumbs_down') => void;
  chatContext?: {
    mode: 'project' | 'team' | 'agent';
    color: string;
  };
}

export function MessageBubble({ 
  message, 
  isGrouped = false, 
  showReactions = false,
  onReaction,
  chatContext
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const isUser = message.messageType === 'user';
  const isAgent = message.messageType === 'agent';

  // Get bubble colors - using single consistent color like sidebar
  const getBubbleStyles = () => {
    if (isUser) {
      return {
        className: 'text-gray-100 rounded-br-sm',
        style: { backgroundColor: 'hsl(216, 8%, 18%)' }
      };
    }
    
    // AI messages - use single consistent color with lower opacity (matching sidebar)
    if (isAgent) {
      return {
        className: 'text-gray-100 rounded-bl-sm',
        style: { 
          backgroundColor: 'hsla(158, 66%, 57%, 0.15)', // Green with 15% opacity
          border: '1px solid hsla(158, 66%, 57%, 0.3)' // Green with 30% opacity border
        }
      };
    }
    
    // Fallback
    return {
      className: 'bg-gray-700 text-gray-100 rounded-bl-sm border border-gray-600',
      style: {}
    };
  };

  // A1.1: Relative time formatting  
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - messageTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  // A2.1: Copy message to clipboard
  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast({
        description: "Message copied to clipboard",
        duration: 2000,
      });
    } catch (error) {
      toast({
        description: "Failed to copy message",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  // A1.1: Handle reaction button clicks
  const handleReaction = (reactionType: 'thumbs_up' | 'thumbs_down') => {
    if (onReaction) {
      onReaction(message.id, reactionType);
      toast({
        description: `Feedback sent! This helps improve AI responses.`,
        duration: 3000,
      });
    }
  };

  // A3.2: Message grouping logic - don't show sender name/avatar if grouped
  const showSenderInfo = !isGrouped && isAgent;

  return (
    <TooltipProvider>
      <ContextMenu>
        <ContextMenuTrigger>
          <motion.div
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-1' : 'mt-4'}`}
            onMouseEnter={() => {
              setIsHovered(true);
              setShowActions(true);
            }}
            onMouseLeave={() => {
              setIsHovered(false);
              setShowActions(false);
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`max-w-[70%] ${isUser ? 'ml-auto' : 'mr-auto'}`}>
              {/* Agent sender info (only if not grouped) */}
              {showSenderInfo && (
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                    style={{ backgroundColor: 'hsl(158, 66%, 57%)' }} // Single consistent green color
                  >
                    {message.senderName.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-300">{message.senderName}</span>
                </div>
              )}

              {/* Message bubble */}
              <div
                className={`p-3 rounded-lg ${getBubbleStyles().className}`}
                style={getBubbleStyles().style}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>

              {/* Timestamp - moved outside bubble */}
              <div className={`text-xs mt-1 px-1 ${isUser ? 'text-right text-gray-400' : 'text-left text-gray-500'}`}>
                {formatRelativeTime(message.timestamp)}
              </div>

              {/* A1.1 & A1.4: Reaction buttons for agent messages */}
              <AnimatePresence>
                {showReactions && isAgent && showActions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1 mt-2 ml-1"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-green-500/20 text-gray-400 hover:text-green-400"
                          onClick={() => handleReaction('thumbs_up')}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Good response</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                          onClick={() => handleReaction('thumbs_down')}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Could be better</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400"
                          onClick={handleCopyMessage}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy message</p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </ContextMenuTrigger>

        {/* A2.2: Context menu for additional actions */}
        <ContextMenuContent>
          <ContextMenuItem onClick={handleCopyMessage}>
            <Copy className="w-4 h-4 mr-2" />
            Copy message
          </ContextMenuItem>
          {showReactions && isAgent && (
            <>
              <ContextMenuItem onClick={() => handleReaction('thumbs_up')}>
                <ThumbsUp className="w-4 h-4 mr-2" />
                Good response
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleReaction('thumbs_down')}>
                <ThumbsDown className="w-4 h-4 mr-2" />
                Could be better
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </TooltipProvider>
  );
}