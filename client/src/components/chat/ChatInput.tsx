import { useState, useRef, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const content = message.trim();
    if (!content || disabled) return;

    onSendMessage(content);
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setMessage(textarea.value);

    // Auto-resize textarea
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120); // Max 120px height
    textarea.style.height = `${newHeight}px`;
  };

  const handleCompositionStart = () => setIsComposing(true);
  const handleCompositionEnd = () => setIsComposing(false);

  return (
    <div className="p-4">
      <div className="flex items-end space-x-3">
        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder={disabled ? "Connecting..." : "Type a message..."}
            disabled={disabled}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[48px] max-h-[120px]"
            rows={1}
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: '#374151 #1f2937'
            }}
          />
          
          {/* Character count */}
          {message.length > 0 && (
            <div className="absolute bottom-1 right-12 text-xs text-gray-500">
              {message.length}
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg p-3 transition-colors duration-200 flex-shrink-0"
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </div>

      {/* Helper text */}
      <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
        <span>Press Enter to send, Shift+Enter for new line</span>
        {disabled && (
          <span className="text-yellow-500">Reconnecting...</span>
        )}
      </div>
    </div>
  );
}