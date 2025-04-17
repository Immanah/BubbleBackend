import { useEffect, useState } from 'react';
import { Mood } from '@/models/types';
import { motion } from 'framer-motion';

interface BubbleAvatarProps {
  mood?: Mood;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  isTyping?: boolean;
}

export default function BubbleAvatar({ 
  mood = 'neutral', 
  size = 'lg',
  animate = true,
  isTyping = false
}: BubbleAvatarProps) {
  const [blinking, setBlinking] = useState(false);

  // Periodic blinking effect
  useEffect(() => {
    if (!animate) return;
    
    const blinkInterval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 200);
    }, 3000);
    
    return () => clearInterval(blinkInterval);
  }, [animate]);

  // Size mapping
  const sizeConfig = {
    sm: {
      width: '50px',
      height: '65px',
    },
    md: {
      width: '80px',
      height: '104px',
    },
    lg: {
      width: '120px',
      height: '156px',
    }
  };

  const config = sizeConfig[size];
  
  // Render facial expression based on mood
  const renderFacialExpression = () => {
    switch(mood) {
      case 'happy':
        return (
          <>
            {/* Happy eyes */}
            <div className="flex justify-center space-x-4 mt-6">
              <div className={`bg-black rounded-full ${blinking ? 'h-0.5' : 'h-2.5'} w-2.5`}></div>
              <div className={`bg-black rounded-full ${blinking ? 'h-0.5' : 'h-2.5'} w-2.5`}></div>
            </div>
            {/* Happy smile */}
            <div className="mt-3 w-8 h-4 border-black border-2 border-t-0 rounded-b-full"></div>
          </>
        );
      case 'sad':
        return (
          <>
            {/* Sad eyes */}
            <div className="flex justify-center space-x-4 mt-6">
              <div className={`bg-black rounded-full ${blinking ? 'h-0.5' : 'h-2.5'} w-2.5`}></div>
              <div className={`bg-black rounded-full ${blinking ? 'h-0.5' : 'h-2.5'} w-2.5`}></div>
            </div>
            {/* Sad mouth - upside down smile */}
            <div className="mt-3 w-8 h-4 border-black border-2 border-b-0 rounded-t-full"></div>
          </>
        );
      case 'anxious':
        return (
          <>
            {/* Anxious eyes - angled eyebrows */}
            <div className="flex flex-col items-center mt-6">
              <div className="flex justify-center space-x-4 relative">
                <div>
                  <div className="absolute top-[-5px] left-0 w-3 h-0.5 bg-black transform rotate-[-30deg]"></div>
                  <div className={`bg-black rounded-full ${blinking ? 'h-0.5' : 'h-3'} w-3`}></div>
                </div>
                <div>
                  <div className="absolute top-[-5px] right-0 w-3 h-0.5 bg-black transform rotate-[30deg]"></div>
                  <div className={`bg-black rounded-full ${blinking ? 'h-0.5' : 'h-3'} w-3`}></div>
                </div>
              </div>
              {/* Anxious mouth - small 'o' */}
              <div className="mt-3 w-5 h-5 border-black border-2 rounded-full"></div>
            </div>
          </>
        );
      case 'stressed':
        return (
          <>
            {/* Stressed eyes - squinted */}
            <div className="flex justify-center space-x-4 mt-6">
              <div className={`bg-black rounded-full ${blinking ? 'h-0.5' : 'h-2'} w-5`}></div>
              <div className={`bg-black rounded-full ${blinking ? 'h-0.5' : 'h-2'} w-5`}></div>
            </div>
            {/* Stressed mouth - thin line */}
            <div className="mt-4 w-6 h-0.5 bg-black"></div>
          </>
        );
      case 'neutral':
        return (
          <>
            {/* Neutral eyes - horizontal lines */}
            <div className="flex justify-center space-x-6 mt-6">
              <div className={`bg-black rounded-sm ${blinking ? 'h-0.5' : 'h-1'} w-4`}></div>
              <div className={`bg-black rounded-sm ${blinking ? 'h-0.5' : 'h-1'} w-4`}></div>
            </div>
            {/* Neutral mouth - straight line */}
            <div className="mt-5 w-8 h-0.5 bg-black"></div>
          </>
        );
      case 'calm':
      case 'improved':
        return (
          <>
            {/* Calm/improved eyes - relaxed */}
            <div className="flex justify-center space-x-4 mt-6">
              <div className={`bg-black rounded-full ${blinking ? 'h-0.5' : 'h-2'} w-2.5`}></div>
              <div className={`bg-black rounded-full ${blinking ? 'h-0.5' : 'h-2'} w-2.5`}></div>
            </div>
            {/* Calm mouth - gentle smile */}
            <div className="mt-4 w-6 h-3 border-black border-2 border-t-0 rounded-b-full"></div>
          </>
        );
      default:
        return (
          <>
            {/* Default eyes */}
            <div className="flex justify-center space-x-4 mt-6">
              <div className={`bg-black rounded-full ${blinking ? 'h-0.5' : 'h-2.5'} w-2.5`}></div>
              <div className={`bg-black rounded-full ${blinking ? 'h-0.5' : 'h-2.5'} w-2.5`}></div>
            </div>
            {/* Default neutral mouth */}
            <div className="mt-4 w-6 h-0.5 bg-black"></div>
          </>
        );
    }
  };

  return (
    <motion.div 
      className={`relative ${animate ? 'animate-float' : ''}`}
      style={{ 
        width: config.width, 
        height: config.height 
      }}
      animate={{ 
        scale: animate ? [1, 1.03, 1] : 1 
      }}
      transition={{ 
        repeat: animate ? Infinity : 0, 
        duration: 3 
      }}
    >
      {/* Bubble oval shape */}
      <div 
        className="w-full h-full rounded-full bg-[#D4F1FF]"
        style={{ 
          borderRadius: '50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Facial Expression */}
        {renderFacialExpression()}
      </div>

      {/* Typing indicator */}
      {isTyping && (
        <div className="absolute -bottom-6 left-0 w-full flex justify-center">
          <div className="flex gap-1 items-center bg-[#A3DAFF]/50 px-2 py-1 rounded-full">
            <motion.div 
              className="w-1.5 h-1.5 bg-white rounded-full" 
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            <motion.div 
              className="w-1.5 h-1.5 bg-white rounded-full" 
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
            />
            <motion.div 
              className="w-1.5 h-1.5 bg-white rounded-full" 
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
