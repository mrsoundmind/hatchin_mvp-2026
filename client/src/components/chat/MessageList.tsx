import { useEffect, useRef } from 'react';
import { MessageBubble } from '@/components/chat/MessageBubble';
import type { Message } from '@shared/schema';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-lg mb-2">💬</div>
          <p>No messages yet</p>
          <p className="text-sm mt-1">Start a conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: '#374151 #1f2937'
      }}
    >
      {messages.map((message, index) => {
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showAvatar = !prevMessage || 
          prevMessage.agentId !== message.agentId || 
          prevMessage.messageType !== message.messageType;

        return (
          <MessageBubble
            key={message.id}
            message={message}
            showAvatar={showAvatar}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}