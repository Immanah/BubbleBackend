import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Trash2, X, ArrowLeft, Edit } from 'lucide-react';
import { Mood } from '@/models/types';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood: Mood;
}

export default function JournalPanel() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [isViewingEntry, setIsViewingEntry] = useState(false);
  const [isEditingEntry, setIsEditingEntry] = useState(false);
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryContent, setNewEntryContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood>('neutral');
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  
  const moods: Record<Mood, { label: string, icon: string }> = {
    happy: { label: 'Happy', icon: '😊' },
    calm: { label: 'Calm', icon: '😌' },
    neutral: { label: 'Neutral', icon: '😐' },
    sad: { label: 'Sad', icon: '😔' },
    anxious: { label: 'Anxious', icon: '😰' },
    stressed: { label: 'Stressed', icon: '😖' },
    improved: { label: 'Improved', icon: '😌' }
  };

  // Load journal entries from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      setJournalEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Save new journal entry
  const saveJournalEntry = () => {
    if (newEntryTitle.trim() === '' || newEntryContent.trim() === '') {
      return; // Don't save empty entries
    }
    
    if (isEditingEntry && currentEntry) {
      // Update existing entry
      const updatedEntry = {
        ...currentEntry,
        title: newEntryTitle,
        content: newEntryContent,
        mood: selectedMood
      };
      
      const updatedEntries = journalEntries.map(entry => 
        entry.id === currentEntry.id ? updatedEntry : entry
      );
      
      setJournalEntries(updatedEntries);
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      
      // Reset state
      setCurrentEntry(null);
      setIsEditingEntry(false);
      setShowNewEntry(false);
      setIsViewingEntry(false);
      
    } else {
      // Create new entry
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        title: newEntryTitle,
        content: newEntryContent,
        date: new Date().toLocaleDateString(),
        mood: selectedMood
      };
      
      const updatedEntries = [newEntry, ...journalEntries];
      setJournalEntries(updatedEntries);
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      
      // Reset fields
      setNewEntryTitle('');
      setNewEntryContent('');
      setSelectedMood('neutral');
      setShowNewEntry(false);
    }
  };

  // Delete journal entry
  const deleteEntry = (id: string) => {
    const updatedEntries = journalEntries.filter(entry => entry.id !== id);
    setJournalEntries(updatedEntries);
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    
    if (isViewingEntry || isEditingEntry) {
      setIsViewingEntry(false);
      setIsEditingEntry(false);
      setCurrentEntry(null);
    }
  };

  // View a specific entry
  const viewEntry = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setIsViewingEntry(true);
    setShowNewEntry(false);
  };

  // Edit a specific entry
  const editEntry = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setNewEntryTitle(entry.title);
    setNewEntryContent(entry.content);
    setSelectedMood(entry.mood);
    setIsEditingEntry(true);
    setShowNewEntry(true);
    setIsViewingEntry(false);
  };

  const resetForm = () => {
    setNewEntryTitle('');
    setNewEntryContent('');
    setSelectedMood('neutral');
    setIsEditingEntry(false);
    setCurrentEntry(null);
    setShowNewEntry(false);
  };

  return (
    <motion.div 
      className="h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="text-white text-4xl font-bold text-center">JOURNAL</div>
        {!isViewingEntry && !showNewEntry && (
          <button 
            onClick={() => setShowNewEntry(true)}
            className="bg-[#50c8ff] rounded-full w-10 h-10 flex items-center justify-center text-white"
          >
            <span className="text-2xl font-bold">+</span>
          </button>
        )}
        {(isViewingEntry || showNewEntry) && (
          <button 
            onClick={() => {
              setIsViewingEntry(false);
              setShowNewEntry(false);
              setIsEditingEntry(false);
              setCurrentEntry(null);
            }}
            className="text-white hover:text-[#50c8ff] transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
      </div>
      
      {showNewEntry ? (
        // New entry form
        <div className="flex-1 bg-[#3498db]/30 rounded-3xl p-4 glassmorphism flex flex-col">
          <input
            type="text"
            value={newEntryTitle}
            onChange={(e) => setNewEntryTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-white/20 border-none outline-none text-white placeholder-white/70 mb-4 p-3 rounded-full"
          />
          
          <textarea
            value={newEntryContent}
            onChange={(e) => setNewEntryContent(e.target.value)}
            placeholder="Write your thoughts here..."
            className="flex-1 w-full bg-white/20 border-none outline-none text-white placeholder-white/70 p-4 rounded-3xl resize-none mb-4"
          />
          
          <div className="mb-4">
            <div className="text-white mb-2">How were you feeling?</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(moods).map(([moodKey, { label, icon }]) => (
                <motion.button
                  key={moodKey}
                  onClick={() => setSelectedMood(moodKey as Mood)}
                  className={`rounded-full py-1 px-3 flex items-center ${
                    selectedMood === moodKey 
                      ? 'bg-[#50c8ff] text-white' 
                      : 'bg-[#9AD9EA]/50 text-white/90'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="mr-1">{icon}</span>
                  <span className="text-sm">{label}</span>
                </motion.button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={resetForm}
              className="bg-white/20 text-white rounded-full px-4 py-2 flex items-center"
            >
              <X className="w-5 h-5 mr-2" />
              Cancel
            </button>
            <button
              onClick={saveJournalEntry}
              className="bg-[#50c8ff] text-white rounded-full px-6 py-2 flex items-center"
              disabled={!newEntryTitle.trim() || !newEntryContent.trim()}
            >
              <Save className="w-5 h-5 mr-2" />
              Save Entry
            </button>
          </div>
        </div>
      ) : isViewingEntry && currentEntry ? (
        // View specific entry
        <div className="flex-1 bg-[#3498db]/30 rounded-3xl p-6 glassmorphism overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-2xl font-bold">{currentEntry.title}</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => editEntry(currentEntry)}
                className="text-white hover:text-[#50c8ff]"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button 
                onClick={() => deleteEntry(currentEntry.id)}
                className="text-white hover:text-red-500"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center text-white/70 text-sm mb-4">
            <span>{currentEntry.date}</span>
            <span className="mx-2">•</span>
            <span className="flex items-center">
              {moods[currentEntry.mood].icon} {moods[currentEntry.mood].label}
            </span>
          </div>
          
          <div className="text-white whitespace-pre-wrap">
            {currentEntry.content}
          </div>
        </div>
      ) : (
        // Journal entries list
        <div className="flex-1 overflow-y-auto space-y-3">
          {journalEntries.length === 0 ? (
            <div className="text-white/70 text-center py-20">
              <p className="mb-4">No journal entries yet</p>
              <button
                onClick={() => setShowNewEntry(true)}
                className="bg-[#50c8ff] text-white rounded-full px-6 py-2 inline-flex items-center"
              >
                <span className="mr-2">+</span>
                Write your first entry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {journalEntries.map((entry) => (
                <motion.div 
                  key={entry.id}
                  className="bg-[#3498db]/30 rounded-3xl p-4 text-white glassmorphism cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => viewEntry(entry)}
                >
                  <h3 className="font-bold mb-2 truncate">{entry.title}</h3>
                  <p className="text-sm opacity-80 mb-4 line-clamp-2">{entry.content}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg">{moods[entry.mood].icon}</span>
                    <p className="text-xs opacity-60">{entry.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}