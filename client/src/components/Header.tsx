import { useUserStore } from '@/store/userStore';
import { useBubbleStore } from '@/store/bubbleStore';

interface HeaderProps {
  onAvatarClick?: () => void;
}

export default function Header({ onAvatarClick }: HeaderProps) {
  const { user } = useUserStore();
  const { connectionStatus } = useBubbleStore();

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-bubble flex items-center justify-center shadow-md">
            <span className="text-white font-bold">B</span>
          </div>
          <h1 className="ml-3 text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-bubble">
            Bubble
          </h1>
          {connectionStatus !== 'connected' && (
            <span className="ml-2 text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
              {connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            className="text-gray-600 hover:text-bubble-primary transition-colors" 
            aria-label="Settings"
          >
            <span className="material-icons">settings</span>
          </button>
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={onAvatarClick}
          >
            <div className="w-8 h-8 rounded-full bg-bubble-light flex items-center justify-center">
              <span className="material-icons text-sm text-bubble-primary">person</span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {user?.username || 'Guest'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
