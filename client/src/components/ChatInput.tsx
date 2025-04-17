import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onToggleVoice: () => void;
  voiceActive: boolean;
  isProcessing: boolean;
  voiceText?: string;
}

export default function ChatInput({
  onSendMessage,
  onToggleVoice,
  voiceActive,
  isProcessing,
  voiceText = ''
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const textToSend = voiceActive && voiceText ? voiceText : message;
    if (textToSend.trim() && !isProcessing) {
      onSendMessage(textToSend);
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current && !voiceActive) {
      inputRef.current.focus();
    }
  }, [voiceActive]);

  return (
    <div className="p-4 backdrop-blur-md bg-[#A3DAFF]/30">
      <div className="flex items-center max-w-3xl mx-auto">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`p-3 rounded-full shadow-lg ${
            voiceActive 
              ? 'bg-[#B8DFFC] text-gray-800' 
              : 'bg-[#D4F1FF]/80 text-gray-800 hover:bg-[#DDF4FF]/60'
          } transition-colors mr-2 border border-[#B8DFFC]/40`} 
          aria-label="Voice input"
          onClick={onToggleVoice}
          disabled={isProcessing}
        >
          <span className="material-icons">
            {voiceActive ? 'mic_off' : 'mic'}
          </span>
        </motion.button>
        
        <div className="flex-1 relative">
          <motion.div
            animate={{
              boxShadow: isFocused 
                ? '0 0 0 2px rgba(184, 223, 252, 0.6), 0 4px 8px rgba(0, 0, 0, 0.1)' 
                : '0 2px 6px rgba(0, 0, 0, 0.08)'
            }}
            className="rounded-full"
          >
            <input
              type="text"
              ref={inputRef}
              className="w-full py-3 px-6 bg-[#D4F1FF]/50 backdrop-blur-md rounded-full focus:outline-none border border-[#B8DFFC]/40"
              placeholder={voiceActive ? "Listening..." : "Type your message..."}
              value={voiceActive ? voiceText : message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={voiceActive || isProcessing}
              // Placeholder color handled via CSS
            />
          </motion.div>
          
          {voiceActive && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <div className="voice-wave flex items-end gap-[2px]">
                <span className="bg-[#A3DAFF] w-[3px] h-2 rounded-full animate-eq-1"></span>
                <span className="bg-[#A3DAFF] w-[3px] h-4 rounded-full animate-eq-2"></span>
                <span className="bg-[#A3DAFF] w-[3px] h-3 rounded-full animate-eq-3"></span>
                <span className="bg-[#A3DAFF] w-[3px] h-5 rounded-full animate-eq-4"></span>
                <span className="bg-[#A3DAFF] w-[3px] h-2 rounded-full animate-eq-1"></span>
              </div>
            </div>
          )}
        </div>
        
        <motion.button 
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-full bg-[#A3DAFF] hover:bg-[#DDF4FF]/60 text-gray-800 shadow-lg transition-colors ml-2 border border-[#B8DFFC]/40"
          aria-label="Send message"
          onClick={handleSubmit}
          disabled={(voiceActive ? !voiceText.trim() : !message.trim()) || isProcessing}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 12px rgba(212, 241, 255, 0.6)"
          }}
        >
          <motion.span 
            className="material-icons"
            whileTap={{ 
              scale: [1, 1.3, 0.9, 1], 
              rotate: [0, 0, 10, 0],
              transition: { duration: 0.3 }
            }}
          >
            send
          </motion.span>
          
          {/* Ripple effect animation on button click */}
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ backgroundColor: "#DDF4FF" }}
          />
        </motion.button>
      </div>
    </div>
  );
}
