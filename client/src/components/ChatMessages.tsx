import { useRef, useEffect } from 'react';
import BubbleAvatar from './BubbleAvatar';
import { Message } from '@/models/types';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatMessagesProps {
  messages: Message[];
  isProcessing: boolean;
}

export default function ChatMessages({ messages, isProcessing }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 p-4 overflow-y-auto flex flex-col" id="chat-messages">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center mb-6 mt-4">
          <BubbleAvatar mood="neutral" />
          <p className="text-center text-gray-500 text-sm">Bubble is here to chat!</p>
        </div>
      ) : (
        messages.map((message) => (
          <div 
            key={message.id}
            className={`chat-bubble ${message.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-bubble'}`}
          >
            <p>{message.content}</p>
          </div>
        ))
      )}
      
      {isProcessing && (
        <div className="chat-bubble chat-bubble-bubble">
          <div className="flex gap-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-16 h-6 rounded-md" />
            <Skeleton className="w-10 h-6 rounded-md" />
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}
