import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAvatarStore } from '@/store/avatarStore';
import { AvatarCustomization } from '@/models/types';
import BubbleAvatar from './BubbleAvatar';
import { useToast } from '@/hooks/use-toast';

interface AvatarCustomizationModalProps {
  onClose: () => void;
}

export default function AvatarCustomizationModal({ onClose }: AvatarCustomizationModalProps) {
  const { avatarCustomization, updateAvatarCustomization } = useAvatarStore();
  const [customization, setCustomization] = useState<AvatarCustomization>(avatarCustomization);
  const { toast } = useToast();
  
  const handleFaceShapeChange = (shape: 'round' | 'square' | 'triangle') => {
    setCustomization(prev => ({ ...prev, faceShape: shape }));
  };
  
  const handleEyeStyleChange = (style: 'default' | 'happy' | 'cool') => {
    setCustomization(prev => ({ ...prev, eyeStyle: style }));
  };
  
  const handleColorChange = (color: string) => {
    setCustomization(prev => ({ ...prev, color }));
  };
  
  const handleAccessoryToggle = (accessory: string) => {
    setCustomization(prev => {
      const accessories = [...prev.accessories];
      
      if (accessories.includes(accessory)) {
        return { ...prev, accessories: accessories.filter(a => a !== accessory) };
      } else {
        return { ...prev, accessories: [...accessories, accessory] };
      }
    });
  };
  
  const handleSave = () => {
    updateAvatarCustomization(customization);
    toast({
      title: "Success",
      description: "Avatar customization saved"
    });
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Customize Your Avatar</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 flex flex-col md:flex-row">
          {/* Avatar Preview */}
          <div className="md:w-1/3 flex flex-col items-center">
            <div className="w-40 h-40 rounded-full bg-bubble-light flex items-center justify-center mb-4">
              <BubbleAvatar size="lg" mood="neutral" />
            </div>
            <Button onClick={handleSave}>
              Save Avatar
            </Button>
          </div>
          
          {/* Customization Options */}
          <div className="md:w-2/3 md:pl-6 mt-6 md:mt-0">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Face Shape</h3>
              <div className="flex space-x-2">
                <button 
                  className={`w-10 h-10 rounded-full bg-bubble-light flex items-center justify-center ${
                    customization.faceShape === 'round' ? 'border-2 border-bubble-primary' : ''
                  }`}
                  onClick={() => handleFaceShapeChange('round')}
                >
                  <span className="material-icons text-sm">circle</span>
                </button>
                <button 
                  className={`w-10 h-10 rounded-full bg-bubble-light flex items-center justify-center ${
                    customization.faceShape === 'square' ? 'border-2 border-bubble-primary' : ''
                  }`}
                  onClick={() => handleFaceShapeChange('square')}
                >
                  <span className="material-icons text-sm">crop_square</span>
                </button>
                <button 
                  className={`w-10 h-10 rounded-full bg-bubble-light flex items-center justify-center ${
                    customization.faceShape === 'triangle' ? 'border-2 border-bubble-primary' : ''
                  }`}
                  onClick={() => handleFaceShapeChange('triangle')}
                >
                  <span className="material-icons text-sm">change_history</span>
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Eye Style</h3>
              <div className="flex space-x-2">
                <button 
                  className={`w-10 h-10 rounded-full bg-bubble-light flex items-center justify-center ${
                    customization.eyeStyle === 'default' ? 'border-2 border-bubble-primary' : ''
                  }`}
                  onClick={() => handleEyeStyleChange('default')}
                >
                  <span className="text-xs">👁️</span>
                </button>
                <button 
                  className={`w-10 h-10 rounded-full bg-bubble-light flex items-center justify-center ${
                    customization.eyeStyle === 'happy' ? 'border-2 border-bubble-primary' : ''
                  }`}
                  onClick={() => handleEyeStyleChange('happy')}
                >
                  <span className="text-xs">😊</span>
                </button>
                <button 
                  className={`w-10 h-10 rounded-full bg-bubble-light flex items-center justify-center ${
                    customization.eyeStyle === 'cool' ? 'border-2 border-bubble-primary' : ''
                  }`}
                  onClick={() => handleEyeStyleChange('cool')}
                >
                  <span className="text-xs">😎</span>
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Color</h3>
              <div className="flex space-x-2">
                <button 
                  className={`w-10 h-10 rounded-full bg-bubble-primary ${
                    customization.color === '#4FACFE' ? 'border-2 border-white ring-2 ring-bubble-primary' : ''
                  }`}
                  onClick={() => handleColorChange('#4FACFE')}
                ></button>
                <button 
                  className={`w-10 h-10 rounded-full bg-purple-400 ${
                    customization.color === '#9370DB' ? 'border-2 border-white ring-2 ring-bubble-primary' : ''
                  }`}
                  onClick={() => handleColorChange('#9370DB')}
                ></button>
                <button 
                  className={`w-10 h-10 rounded-full bg-green-400 ${
                    customization.color === '#4CAF50' ? 'border-2 border-white ring-2 ring-bubble-primary' : ''
                  }`}
                  onClick={() => handleColorChange('#4CAF50')}
                ></button>
                <button 
                  className={`w-10 h-10 rounded-full bg-yellow-400 ${
                    customization.color === '#FFC107' ? 'border-2 border-white ring-2 ring-bubble-primary' : ''
                  }`}
                  onClick={() => handleColorChange('#FFC107')}
                ></button>
                <button 
                  className={`w-10 h-10 rounded-full bg-red-400 ${
                    customization.color === '#FF6B6B' ? 'border-2 border-white ring-2 ring-bubble-primary' : ''
                  }`}
                  onClick={() => handleColorChange('#FF6B6B')}
                ></button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Accessories</h3>
              <div className="flex space-x-2">
                <button 
                  className={`w-10 h-10 rounded-full bg-bubble-light flex items-center justify-center ${
                    customization.accessories.includes('hat') ? 'border-2 border-bubble-primary' : ''
                  }`}
                  onClick={() => handleAccessoryToggle('hat')}
                >
                  <span className="text-xs">🎩</span>
                </button>
                <button 
                  className={`w-10 h-10 rounded-full bg-bubble-light flex items-center justify-center ${
                    customization.accessories.includes('glasses') ? 'border-2 border-bubble-primary' : ''
                  }`}
                  onClick={() => handleAccessoryToggle('glasses')}
                >
                  <span className="text-xs">👓</span>
                </button>
                <button 
                  className={`w-10 h-10 rounded-full bg-bubble-light flex items-center justify-center ${
                    customization.accessories.includes('bow') ? 'border-2 border-bubble-primary' : ''
                  }`}
                  onClick={() => handleAccessoryToggle('bow')}
                >
                  <span className="text-xs">🎀</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
