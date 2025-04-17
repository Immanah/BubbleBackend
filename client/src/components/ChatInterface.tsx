import { useState } from 'react';
import ChatPanel from './ChatPanel';
import BreathingExercise from './BreathingExercise';

interface ChatInterfaceProps {
  setIsTyping: (isTyping: boolean) => void;
}

export default function ChatInterface({ setIsTyping }: ChatInterfaceProps) {
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  
  return (
    <div className="h-full">
      <ChatPanel 
        setIsTyping={setIsTyping} 
        showBreathingExercise={showBreathingExercise}
        setShowBreathingExercise={setShowBreathingExercise}
      />
      <BreathingExercise 
        isOpen={showBreathingExercise} 
        onClose={() => setShowBreathingExercise(false)} 
      />
    </div>
  );
}
