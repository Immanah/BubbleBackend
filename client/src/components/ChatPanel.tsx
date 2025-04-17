import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Message, Mood } from '@/models/types';
import { useChatStore } from '@/store/chatStore';
import { v4 as uuidv4 } from 'uuid';
import { sendChatMessage } from '@/lib/chatService';

interface ChatPanelProps {
  setIsTyping: (typing: boolean) => void;
  showBreathingExercise: boolean;
  setShowBreathingExercise: (show: boolean) => void;
}

export default function ChatPanel({ 
  setIsTyping,
  showBreathingExercise, 
  setShowBreathingExercise 
}: ChatPanelProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isBreathingPromptVisible, setIsBreathingPromptVisible] = useState(false);
  const { messages, addMessage, currentMood, setCurrentMood } = useChatStore();
  const previousMoodRef = useRef<Mood>(currentMood);
  
  // Listen for mood changes and notify when mood changes
  useEffect(() => {
    // Only trigger if previous mood exists and is different
    if (previousMoodRef.current && previousMoodRef.current !== currentMood) {
      respondToMoodChange(previousMoodRef.current, currentMood);
    }
    
    // Update the previous mood ref
    previousMoodRef.current = currentMood;
  }, [currentMood]);

  // Function to respond to mood changes with appropriate messages
  const respondToMoodChange = (oldMood: Mood, newMood: Mood) => {
    let responseContent = '';
    
    // Create mood-change bubble animation
    createMoodChangeBubbles(newMood);
    
    // Different responses based on mood transitions
    if (newMood === 'sad' || newMood === 'anxious' || newMood === 'stressed') {
      responseContent = `I noticed your mood has changed to ${newMood}. Would you like to talk about what's happening? A breathing exercise might also help.`;
      setIsBreathingPromptVisible(true);
    } else if (newMood === 'happy') {
      responseContent = `I'm so glad to see you're feeling happy! Would you like to share what's bringing you joy today?`;
    } else if (newMood === 'improved') {
      responseContent = `It's great to see you're feeling better! What positive changes have you noticed?`;
    } else if (newMood === 'calm') {
      responseContent = `I notice you're feeling calm. That's wonderful! Would you like to continue this peaceful state with a mindfulness exercise?`;
    } else if (newMood === 'neutral') {
      responseContent = `I see your mood has shifted to neutral. How would you describe how you're feeling right now?`;
    }
    
    // Only add a response if we have content
    if (responseContent) {
      // Simulate Bubble typing
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        
        const bubbleMessage: Message = {
          id: uuidv4(),
          content: responseContent,
          sender: 'bubble',
          timestamp: new Date(),
          mood: 'neutral' // Keep Bubble neutral when responding to user's mood changes
        };
        
        addMessage(bubbleMessage);
      }, 1000);
    }
  };
  
  // Function to create animated bubbles when mood changes
  const createMoodChangeBubbles = (mood: Mood) => {
    // Create a container for the bubbles
    const bubbleContainer = document.createElement('div');
    bubbleContainer.className = 'fixed inset-0 pointer-events-none z-50';
    document.body.appendChild(bubbleContainer);
    
    // Generate a number of bubbles
    const bubbleCount = 15;
    const sizes = ['bubble-xs', 'bubble-sm', 'bubble-md', 'bubble-lg', 'bubble-xl'];
    const moodColor = getMoodColor(mood);
    
    for (let i = 0; i < bubbleCount; i++) {
      const bubble = document.createElement('div');
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      const left = 10 + Math.random() * 80; // Keep bubbles within the middle 80% of screen
      
      bubble.className = `floating-bubble ${size}`;
      bubble.style.position = 'absolute';
      bubble.style.bottom = '-50px';
      bubble.style.left = `${left}%`;
      bubble.style.opacity = '0';
      bubble.style.background = `radial-gradient(circle at 30% 35%, 
        rgba(255, 255, 255, 0.8) 0%, 
        ${moodColor}99 40%, 
        ${moodColor}66 80%)`;
      
      bubbleContainer.appendChild(bubble);
      
      // Animate the bubble rising
      setTimeout(() => {
        bubble.style.transition = 'opacity 0.5s ease-in, transform 6s ease-out';
        bubble.style.opacity = '0.9';
        bubble.style.transform = 'translateY(-100vh) translateX(20px)';
      }, i * 100);
      
      // Remove the bubble after animation
      setTimeout(() => {
        bubble.style.opacity = '0';
      }, 5000 + i * 100);
    }
    
    // Remove the container after all animations
    setTimeout(() => {
      if (document.body.contains(bubbleContainer)) {
        document.body.removeChild(bubbleContainer);
      }
    }, 8000);
  };
  
  // Helper function to get color based on mood
  const getMoodColor = (mood: Mood): string => {
    switch (mood) {
      case 'happy':
        return '#4ade80'; // green-400
      case 'calm':
        return '#60a5fa'; // blue-400
      case 'anxious':
        return '#facc15'; // yellow-400
      case 'sad':
        return '#818cf8'; // indigo-400
      case 'stressed':
        return '#f87171'; // red-400
      case 'improved':
        return '#a3e635'; // lime-400
      default:
        return '#9ca3af'; // gray-400
    }
  };
  
  // Function to handle user message sending
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Check for distress keywords that might indicate need for breathing exercise
    const distressKeywords = ['anxious', 'anxiety', 'stressed', 'overwhelmed', 'panic', 'scared', 'frightened', 'worry', 'worried', 'nervous', 'tense', 'uneasy'];
    const shouldOfferBreathing = distressKeywords.some(keyword => inputMessage.toLowerCase().includes(keyword));
    
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    addMessage(userMessage);
    setInputMessage('');
    
    // Simulate Bubble typing
    setIsTyping(true);
    
    try {
      // Attempt to get response from the API
      const response = await sendChatMessage(inputMessage);
      
      setIsTyping(false);
      
      const bubbleMessage: Message = {
        id: uuidv4(),
        content: response.message,
        sender: 'bubble',
        timestamp: new Date(),
        mood: response.mood as Mood || 'neutral'
      };
      
      addMessage(bubbleMessage);
      
      // If distress detected, offer breathing exercise
      if (shouldOfferBreathing && !isBreathingPromptVisible) {
        setTimeout(() => {
          setIsBreathingPromptVisible(true);
          
          const breathingPromptMessage: Message = {
            id: uuidv4(),
            content: "I noticed you might be feeling stressed. Would you like to try a breathing exercise to help calm your mind?",
            sender: 'bubble',
            timestamp: new Date(),
            mood: 'calm'
          };
          
          addMessage(breathingPromptMessage);
        }, 1000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      // Fallback response
      const fallbackMessage: Message = {
        id: uuidv4(),
        content: "I'm here to listen and support you. Please continue sharing how you're feeling.",
        sender: 'bubble',
        timestamp: new Date(),
        mood: 'neutral'
      };
      
      addMessage(fallbackMessage);
    }
  };
  
  // Function to start breathing exercise
  const startBreathingExercise = () => {
    setShowBreathingExercise(true);
    setIsBreathingPromptVisible(false);
    
    // Add confirmation message
    const confirmationMessage: Message = {
      id: uuidv4(),
      content: "Great! Let's begin a breathing exercise to help you relax. Take your time with it.",
      sender: 'bubble',
      timestamp: new Date(),
      mood: 'calm'
    };
    
    addMessage(confirmationMessage);
  };

  // Function to decline breathing exercise
  const declineBreathingExercise = () => {
    setIsBreathingPromptVisible(false);
    
    // Add acknowledgment message
    const acknowledgmentMessage: Message = {
      id: uuidv4(),
      content: "That's okay. I'm here whenever you need to talk or try a relaxation exercise.",
      sender: 'bubble',
      timestamp: new Date(),
      mood: 'neutral'
    };
    
    addMessage(acknowledgmentMessage);
  };

  return (
    <motion.div 
      className="h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-white text-4xl font-bold mb-4 text-center">CHAT</div>
      
      {/* Breathing Exercise is now handled by the parent component */}
      
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto mb-4 bg-[#3498db]/30 rounded-3xl p-4">
        <div className="flex flex-col space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-[#50c8ff] text-white rounded-tr-none'
                    : 'bg-[#9AD9EA] text-gray-800 rounded-tl-none'
                }`}
              >
                {message.content}
                
                {/* Breathing exercise prompt buttons */}
                {message.sender === 'bubble' && isBreathingPromptVisible && message.content.includes('breathing exercise') && (
                  <div className="mt-2 flex space-x-2">
                    <button 
                      onClick={startBreathingExercise}
                      className="bg-[#50c8ff] text-white px-3 py-1 rounded-full text-sm"
                    >
                      Try it now
                    </button>
                    <button 
                      onClick={declineBreathingExercise}
                      className="bg-[#B8DFFC] text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      No thanks
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Breathing exercise button - more prominent */}
      <div className="mb-4 flex justify-center">
        <button 
          onClick={() => setShowBreathingExercise(true)}
          className="bg-[#50c8ff] hover:bg-[#38b6ff] text-white px-4 py-2 rounded-full font-medium shadow-lg flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
          <span>Breathing Exercise</span>
        </button>
      </div>
      
      {/* Input area */}
      <div className="flex items-center space-x-2 bg-[#3498db]/30 rounded-full p-2">
        <button className="p-2 text-white rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
        
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/70"
          placeholder="Type your message..."
        />
        
        <button 
          onClick={handleSendMessage}
          disabled={!inputMessage.trim()}
          className="p-2 text-white rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </motion.div>
  );
}