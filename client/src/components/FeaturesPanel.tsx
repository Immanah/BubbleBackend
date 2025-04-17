import { useState } from 'react';
import JournalTab from './JournalTab';
import MoodTab from './MoodTab';
import AvatarTab from './AvatarTab';
import AffirmationsTab from './AffirmationsTab';
import EnvironmentSelector from './EnvironmentSelector';

interface FeaturesPanelProps {
  activeTab: 'journal' | 'mood' | 'avatar' | 'affirmations';
  onTabChange: (tab: 'journal' | 'mood' | 'avatar' | 'affirmations') => void;
  onCustomizeAvatar: () => void;
}

export default function FeaturesPanel({
  activeTab,
  onTabChange,
  onCustomizeAvatar
}: FeaturesPanelProps) {
  return (
    <section className="w-full md:w-96 bg-white border-l border-gray-100 flex flex-col h-full">
      {/* Tabs Navigation */}
      <div className="flex flex-wrap border-b border-gray-100">
        <button 
          className={`py-4 font-medium text-sm px-4 ${activeTab === 'journal' ? 'text-bubble-primary border-b-2 border-bubble-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => onTabChange('journal')}
        >
          Journal
        </button>
        <button 
          className={`py-4 font-medium text-sm px-4 ${activeTab === 'mood' ? 'text-bubble-primary border-b-2 border-bubble-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => onTabChange('mood')}
        >
          Mood
        </button>
        <button 
          className={`py-4 font-medium text-sm px-4 ${activeTab === 'avatar' ? 'text-bubble-primary border-b-2 border-bubble-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => onTabChange('avatar')}
        >
          Avatar
        </button>
        <button 
          className={`py-4 font-medium text-sm px-4 ${activeTab === 'affirmations' ? 'text-bubble-primary border-b-2 border-bubble-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => onTabChange('affirmations')}
        >
          Affirmations
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'journal' && <JournalTab />}
        {activeTab === 'mood' && <MoodTab />}
        {activeTab === 'avatar' && <AvatarTab onCustomize={onCustomizeAvatar} />}
        {activeTab === 'affirmations' && <AffirmationsTab />}
      </div>
      
      {/* Environment Selector */}
      <EnvironmentSelector />
    </section>
  );
}
