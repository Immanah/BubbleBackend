import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import audioHandler from '@/lib/audioHandler';

interface BreathingExerciseProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BreathingExercise({ isOpen, onClose }: BreathingExerciseProps) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [count, setCount] = useState(4);
  const [rounds, setRounds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Animation properties for the breathing circle
  const circleVariants = {
    inhale: {
      scale: 1.5,
      transition: { duration: 4, ease: "easeInOut" }
    },
    hold: {
      scale: 1.5,
      transition: { duration: 2, ease: "linear" }
    },
    exhale: {
      scale: 1,
      transition: { duration: 4, ease: "easeInOut" }
    },
    rest: {
      scale: 1,
      transition: { duration: 2, ease: "linear" }
    }
  };

  // Text instructions for each phase
  const getInstructions = () => {
    switch (phase) {
      case 'inhale': return 'Breathe in...';
      case 'hold': return 'Hold...';
      case 'exhale': return 'Breathe out...';
      case 'rest': return 'Rest...';
      default: return '';
    }
  };

  // Get the duration for each phase
  const getPhaseDuration = () => {
    switch (phase) {
      case 'inhale': return 4;
      case 'hold': return 2;
      case 'exhale': return 4;
      case 'rest': return 2;
      default: return 4;
    }
  };

  // Start the breathing exercise
  const startExercise = () => {
    setIsActive(true);
    setPhase('inhale');
    setCount(4);
    setRounds(0);
    setTotalTime(0);
    
    // Play breathing ambient sound
    audioHandler.playBackgroundSound('feature_breathing');
    audioHandler.setBackgroundVolume(0.4); // Lower volume for background
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setCount(prevCount => {
        if (prevCount === 1) {
          setPhase(prevPhase => {
            // Cycle through phases
            switch (prevPhase) {
              case 'inhale': return 'hold';
              case 'hold': return 'exhale';
              case 'exhale': return 'rest';
              case 'rest': 
                setRounds(prevRounds => prevRounds + 1);
                return 'inhale';
              default: return 'inhale';
            }
          });
          return getPhaseDuration();
        }
        return prevCount - 1;
      });
      
      // Track total time spent in the exercise
      setTotalTime(prevTime => prevTime + 1);
    }, 1000);
  };

  // Stop the breathing exercise
  const stopExercise = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Stop the ambient sound
    audioHandler.stopBackgroundSound();
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Make sure we stop any sounds when unmounting
      audioHandler.stopBackgroundSound();
    };
  }, []);

  // Stop exercise when modal is closed
  useEffect(() => {
    if (!isOpen && isActive) {
      stopExercise();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-[#A3DAFF]/70 max-w-lg w-11/12 rounded-2xl p-6 relative glassmorphism"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-semibold text-white text-center mb-6">
              Breathing Exercise
            </h2>
            
            <div className="flex flex-col items-center">
              <motion.div 
                className="w-48 h-48 bg-[#D4F1FF]/70 rounded-full flex items-center justify-center mb-6 breathe-circle"
                variants={circleVariants}
                animate={phase}
              >
                <div className="text-[#2980b9] text-5xl font-bold">{count}</div>
              </motion.div>
              
              <p className="text-white text-xl mb-4">{getInstructions()}</p>
              
              <div className="grid grid-cols-2 gap-4 w-full mb-6">
                <div className="bg-[#B8DFFC]/60 p-3 rounded-xl text-center">
                  <p className="text-white text-sm">Total Time</p>
                  <p className="text-white font-semibold">{formatTime(totalTime)}</p>
                </div>
                <div className="bg-[#B8DFFC]/60 p-3 rounded-xl text-center">
                  <p className="text-white text-sm">Rounds</p>
                  <p className="text-white font-semibold">{rounds}</p>
                </div>
              </div>
              
              {!isActive ? (
                <button
                  onClick={startExercise}
                  className="bg-[#50c8ff] hover:bg-[#38b6ff] text-white px-6 py-3 rounded-full font-medium"
                >
                  Start Breathing
                </button>
              ) : (
                <button
                  onClick={stopExercise}
                  className="bg-[#ff5050] hover:bg-[#ff3838] text-white px-6 py-3 rounded-full font-medium"
                >
                  Stop Exercise
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}