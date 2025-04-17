import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEnvironmentStore } from '@/store/environmentStore';
import { Maximize } from 'lucide-react';
import { Environment } from '@/models/types';

interface Bubble {
  id: number;
  size: string;
  top: string;
  left: string;
  delay: string;
  opacity: number;
}

export default function SpacesPanel() {
  const { environments, currentEnvironment, setCurrentEnvironment } = useEnvironmentStore();
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);
  const [environmentBubbles, setEnvironmentBubbles] = useState<{ [key: string]: Bubble[] }>({});
  
  // Categories for our environments
  const categories = {
    'forest': 'Nature',
    'ocean': 'Relaxation',
    'cafe': 'Comfort',
    'bedroom': 'Cozy'
  };
  
  // Generate random bubbles for each environment
  useEffect(() => {
    const bubbles: { [key: string]: Bubble[] } = {};
    
    environments.forEach(env => {
      const sizes = ['bubble-xs', 'bubble-sm', 'bubble-md'];
      const envBubbles = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        size: sizes[Math.floor(Math.random() * sizes.length)],
        top: `${Math.floor(Math.random() * 70) + 10}%`,
        left: `${Math.floor(Math.random() * 70) + 10}%`,
        delay: `${(Math.random() * 3).toFixed(1)}s`,
        opacity: 0.5 + Math.random() * 0.3
      }));
      
      bubbles[env.id] = envBubbles;
    });
    
    setEnvironmentBubbles(bubbles);
  }, [environments]);
  
  // Close full-screen view with escape key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showFullScreen) {
        setShowFullScreen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [showFullScreen]);
  
  // Handle environment selection
  const handleEnvironmentSelect = (env: Environment) => {
    setSelectedEnvironment(env);
    setCurrentEnvironment(env);
    setShowFullScreen(true);
  };

  return (
    <motion.div 
      className="h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-white text-4xl font-bold mb-6 text-center">ENVIRONMENTS</div>
      
      {showFullScreen && selectedEnvironment && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <motion.div 
            className="relative w-full max-w-6xl max-h-[95vh] bg-black/30 backdrop-blur-md rounded-2xl overflow-hidden border-4 border-bubble-primary/40"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <button 
              className="absolute top-4 right-4 z-10 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
              onClick={() => setShowFullScreen(false)}
            >
              <Maximize size={20} />
            </button>
            
            <img 
              src={selectedEnvironment.imageUrl} 
              alt={selectedEnvironment.name}
              className="w-full h-[80vh] object-cover" 
            />
            
            {/* Floating bubbles inside fullscreen */}
            <div className="absolute inset-0 pointer-events-none">
              {environmentBubbles[selectedEnvironment.id]?.map(bubble => (
                <div 
                  key={bubble.id}
                  className={`floating-bubble ${bubble.size}`} 
                  style={{ 
                    top: bubble.top, 
                    left: bubble.left, 
                    animationDelay: bubble.delay,
                    opacity: bubble.opacity
                  }}
                ></div>
              ))}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <h2 className="text-3xl font-bold text-white mb-3">{selectedEnvironment.name}</h2>
              <p className="text-white/80 mb-4 text-lg max-w-3xl">{selectedEnvironment.description}</p>
              
              <motion.button
                className="bg-bubble-primary text-white px-6 py-2 rounded-full font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFullScreen(false)}
              >
                Set Active
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Spaces grid with improved styling */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="grid grid-cols-2 gap-6">
          {environments.map((env) => (
            <motion.div
              key={env.id}
              onClick={() => handleEnvironmentSelect(env)}
              className={`relative rounded-2xl overflow-hidden shadow-lg cursor-pointer transition-all 
                ${currentEnvironment?.id === env.id 
                  ? 'ring-4 ring-bubble-primary/70 border-4 border-bubble-primary/30' 
                  : 'border-2 border-white/10'}
              `}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative h-52 overflow-hidden">
                <img 
                  src={env.imageUrl} 
                  alt={env.name} 
                  className="w-full h-full object-cover" 
                />
                
                {/* Floating bubbles in preview */}
                <div className="absolute inset-0 pointer-events-none">
                  {environmentBubbles[env.id]?.map(bubble => (
                    <div 
                      key={bubble.id}
                      className={`floating-bubble ${bubble.size}`} 
                      style={{ 
                        top: bubble.top, 
                        left: bubble.left, 
                        animationDelay: bubble.delay,
                        opacity: bubble.opacity
                      }}
                    ></div>
                  ))}
                </div>
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white text-xl font-bold mb-1 flex items-center">
                    {env.name}
                    {currentEnvironment?.id === env.id && (
                      <span className="ml-2 text-xs bg-bubble-primary text-white px-2 py-0.5 rounded-full">Active</span>
                    )}
                  </h3>
                  
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs rounded-full px-3 py-1">
                    {categories[env.id as keyof typeof categories] || 'Environment'}
                  </span>
                </div>
                
                {/* Full screen button */}
                <button
                  className="absolute top-3 right-3 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEnvironment(env);
                    setShowFullScreen(true);
                  }}
                >
                  <Maximize size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Floating selection prompt */}
      <div className="mt-4 p-4 bg-bubble-primary/20 backdrop-blur-sm rounded-xl text-center">
        <p className="text-white text-sm">
          Select an environment to immerse yourself. Each environment has unique bubble animations and soundscapes.
        </p>
      </div>
    </motion.div>
  );
}