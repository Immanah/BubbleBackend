import { useJournalStore } from '@/store/journalStore';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Mood } from '@/models/types';
import { createJournalEntry } from '@/lib/journalService';
import { useToast } from '@/hooks/use-toast';

export default function JournalTab() {
  const { journalEntries, addJournalEntry } = useJournalStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood>('neutral');
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!title || !content) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      const newEntry = await createJournalEntry({
        title,
        content,
        mood
      });
      
      addJournalEntry(newEntry);
      setOpen(false);
      setTitle('');
      setContent('');
      setMood('neutral');
      
      toast({
        title: 'Success',
        description: 'Journal entry created'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create journal entry',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const entryDate = new Date(date);
    
    const diffDays = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return format(entryDate, 'MMM d, yyyy');
  };

  const getMoodIcon = (mood: Mood) => {
    switch (mood) {
      case 'happy': return 'sentiment_very_satisfied';
      case 'calm': return 'sentiment_satisfied';
      case 'sad': return 'sentiment_dissatisfied';
      case 'anxious': return 'sentiment_stressed';
      case 'stressed': return 'sentiment_very_dissatisfied';
      case 'improved': return 'trending_up';
      default: return 'sentiment_neutral';
    }
  };

  const getMoodColor = (mood: Mood) => {
    switch (mood) {
      case 'happy': return 'text-bubble-success';
      case 'calm': return 'text-bubble-success';
      case 'sad': return 'text-bubble-warning';
      case 'anxious': return 'text-bubble-warning';
      case 'stressed': return 'text-bubble-error';
      case 'improved': return 'text-bubble-success';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Journal Entries</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="text-bubble-primary hover:text-bubble-secondary transition-colors p-1">
              <span className="material-icons">add_circle</span>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Journal Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 my-2">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Write your thoughts..."
                className="h-32"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div>
                <h3 className="text-sm font-medium mb-2">How are you feeling?</h3>
                <div className="flex flex-wrap gap-2">
                  {(['happy', 'calm', 'neutral', 'sad', 'anxious', 'stressed', 'improved'] as Mood[]).map((m) => (
                    <button
                      key={m}
                      className={`p-2 rounded-full ${mood === m ? 'bg-bubble-primary text-white' : 'bg-gray-100'}`}
                      onClick={() => setMood(m)}
                    >
                      <span className="material-icons text-sm">{getMoodIcon(m)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Save Entry</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Journal Entries List */}
      <div className="space-y-3">
        {journalEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="material-icons text-3xl mb-2">book</span>
            <p>No journal entries yet. Start writing!</p>
          </div>
        ) : (
          journalEntries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl shadow-sm p-4 mb-3 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-800">{entry.title}</h3>
                  <p className="text-xs text-gray-500">{formatDate(entry.createdAt)}</p>
                </div>
                <div className="flex space-x-1">
                  <span className={`material-icons text-sm ${getMoodColor(entry.mood)}`}>
                    {getMoodIcon(entry.mood)}
                  </span>
                  <span className="text-xs text-gray-600">
                    {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">{entry.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
