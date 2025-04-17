import { useAvatarStore } from '@/store/avatarStore';
import BubbleAvatar from './BubbleAvatar';
import { Button } from '@/components/ui/button';

interface AvatarTabProps {
  onCustomize: () => void;
}

export default function AvatarTab({ onCustomize }: AvatarTabProps) {
  const { avatarCustomization } = useAvatarStore();

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Avatar</h2>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center">
        <div className="mb-4">
          <BubbleAvatar size="lg" mood="neutral" />
        </div>
        
        <Button onClick={onCustomize} className="mt-2">
          <span className="material-icons mr-2">edit</span>
          Customize Avatar
        </Button>
        
        <div className="mt-6 w-full">
          <h3 className="text-md font-medium text-gray-700 mb-2">Current Style</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bubble-light rounded-lg p-3">
              <p className="text-sm text-gray-500">Face Shape</p>
              <p className="text-gray-700 capitalize">{avatarCustomization.faceShape}</p>
            </div>
            
            <div className="bg-bubble-light rounded-lg p-3">
              <p className="text-sm text-gray-500">Eye Style</p>
              <p className="text-gray-700 capitalize">{avatarCustomization.eyeStyle}</p>
            </div>
            
            <div className="bg-bubble-light rounded-lg p-3">
              <p className="text-sm text-gray-500">Color</p>
              <div className="flex items-center mt-1">
                <div 
                  className="w-6 h-6 rounded-full mr-2" 
                  style={{ backgroundColor: avatarCustomization.color }}
                ></div>
                <span className="text-gray-700">
                  {avatarCustomization.color === '#4FACFE' ? 'Blue' : 
                   avatarCustomization.color === '#9370DB' ? 'Purple' :
                   avatarCustomization.color === '#4CAF50' ? 'Green' :
                   avatarCustomization.color === '#FFC107' ? 'Yellow' :
                   avatarCustomization.color === '#FF6B6B' ? 'Red' : 'Custom'}
                </span>
              </div>
            </div>
            
            <div className="bg-bubble-light rounded-lg p-3">
              <p className="text-sm text-gray-500">Accessories</p>
              <p className="text-gray-700">
                {avatarCustomization.accessories.length > 0 
                  ? avatarCustomization.accessories.join(', ')
                  : 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <h3 className="text-md font-medium text-gray-700 mb-2">Mood Expressions</h3>
        <p className="text-sm text-gray-600 mb-4">
          Your avatar will express these emotions based on your conversations:
        </p>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center">
            <BubbleAvatar size="sm" mood="happy" />
            <p className="mt-2 text-sm text-gray-600">Happy</p>
          </div>
          <div className="flex flex-col items-center">
            <BubbleAvatar size="sm" mood="calm" />
            <p className="mt-2 text-sm text-gray-600">Calm</p>
          </div>
          <div className="flex flex-col items-center">
            <BubbleAvatar size="sm" mood="neutral" />
            <p className="mt-2 text-sm text-gray-600">Neutral</p>
          </div>
          <div className="flex flex-col items-center">
            <BubbleAvatar size="sm" mood="sad" />
            <p className="mt-2 text-sm text-gray-600">Sad</p>
          </div>
          <div className="flex flex-col items-center">
            <BubbleAvatar size="sm" mood="anxious" />
            <p className="mt-2 text-sm text-gray-600">Anxious</p>
          </div>
          <div className="flex flex-col items-center">
            <BubbleAvatar size="sm" mood="stressed" />
            <p className="mt-2 text-sm text-gray-600">Stressed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
