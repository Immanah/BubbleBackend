import { useRef, useEffect } from 'react';
import { Message } from '@/models/types';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingChatMessagesProps {
  messages: Message[];
  isProcessing: boolean;
}

export default function FloatingChatMessages({ messages, isProcessing }: FloatingChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col justify-end p-6 z-10">
      {/* Glassmorphism chat panel - follows design specs */}
      <div 
        className="overflow-y-auto max-h-[70vh] space-y-4 pb-16 rounded-3xl shadow-lg backdrop-blur-md bg-[#D4F1FF] bg-opacity-50 p-4 border border-[#B8DFFC] border-opacity-40"
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div 
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
              className={`
                pointer-events-auto max-w-[80%] w-auto 
                ${message.sender === 'user' ? 'ml-auto' : 'mr-auto'}
                group
              `}
            >
              <div 
                className={`
                  chat-bubble p-3 rounded-2xl shadow-md inline-block transition-all duration-300
                  ${message.sender === 'user' 
                    ? 'bg-[#D4F1FF] bg-opacity-80 text-gray-800 rounded-tr-none hover:bg-opacity-90' 
                    : 'bg-[#B8DFFC] bg-opacity-90 text-gray-800 rounded-tl-none hover:bg-opacity-100 glow-' + (message.mood || 'neutral')}
                  hover:shadow-lg group-hover:scale-[1.02]
                `}
              >
                <p className="text-sm md:text-base">{message.content}</p>
              </div>
              
              {/* Message timestamp - visible on hover */}
              <motion.div 
                initial={{ opacity: 0 }} 
                whileHover={{ opacity: 1 }}
                className={`text-xs text-white bg-black bg-opacity-30 px-2 py-1 rounded-full mt-1 inline-block ${message.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}
              >
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </motion.div>
            </motion.div>
          ))}
          
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mr-auto pointer-events-auto"
            >
              <div className="chat-bubble bg-[#B8DFFC] bg-opacity-90 text-gray-800 p-3 rounded-2xl rounded-tl-none shadow-md glow-neutral inline-block">
                <div className="flex gap-2 items-center h-6">
                  <div className="animate-bounce delay-0 bg-white bg-opacity-60 w-2 h-2 rounded-full"></div>
                  <div className="animate-bounce delay-100 bg-white bg-opacity-60 w-2 h-2 rounded-full"></div>
                  <div className="animate-bounce delay-200 bg-white bg-opacity-60 w-2 h-2 rounded-full"></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}