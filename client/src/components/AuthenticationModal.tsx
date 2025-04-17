import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, Mail, UserPlus } from 'lucide-react';

// Helper function to extract error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return 'Authentication failed. Please try again.';
};

interface AuthenticationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { id: number, username: string }) => void;
}

export default function AuthenticationModal({ isOpen, onClose, onLogin }: AuthenticationModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!username || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed');
      }
      
      const userData = await response.json();
      
      setIsLoading(false);
      onLogin({ id: userData.id, username: userData.username });
      onClose();
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setErrorMessage('');
    setIsLoading(true);
    
    try {
      // In a real app, we would first get an OAuth token from the provider
      // For now, let's simulate with a mock token
      const mockToken = 'mock_token_' + Math.random().toString(36).substring(2);
      const mockEmail = `user_${Math.random().toString(36).substring(2)}@${provider}.com`;
      const mockName = provider === 'google' ? 'Google User' : 'Apple User';
      
      const response = await fetch('/api/auth/social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          provider, 
          token: mockToken,
          email: mockEmail,
          name: mockName
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Social authentication failed');
      }
      
      const userData = await response.json();
      
      setIsLoading(false);
      onLogin({ 
        id: userData.id, 
        username: userData.username
      });
      onClose();
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(getErrorMessage(error));
    }
  };

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
            className="bg-[#A3DAFF]/70 max-w-md w-11/12 rounded-2xl p-6 relative glassmorphism"
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
            
            <h2 className="text-2xl font-semibold text-white text-center mb-4">
              {mode === 'login' ? 'Sign In to Bubble' : 'Create an Account'}
            </h2>
            
            {/* Social Login Options */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button 
                onClick={() => handleSocialLogin('google')}
                className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors"
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                <span>Google</span>
              </button>
              <button 
                onClick={() => handleSocialLogin('apple')}
                className="bg-black hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors"
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/>
                </svg>
                <span>Apple</span>
              </button>
            </div>
            
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-white/30 flex-grow"></div>
              <div className="px-3 text-white text-sm">or</div>
              <div className="border-t border-white/30 flex-grow"></div>
            </div>
            
            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-white text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#D4F1FF] rounded-xl p-3 text-gray-800 placeholder-gray-500"
                  placeholder="your.email@example.com"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-white text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#D4F1FF] rounded-xl p-3 text-gray-800 placeholder-gray-500"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              
              {errorMessage && (
                <p className="text-red-300 text-sm">{errorMessage}</p>
              )}
              
              <button
                type="submit"
                className="w-full bg-[#50c8ff] hover:bg-[#38b6ff] text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-white hover:underline text-sm"
                disabled={isLoading}
              >
                {mode === 'login' 
                  ? "Don't have an account? Sign Up" 
                  : "Already have an account? Sign In"
                }
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}