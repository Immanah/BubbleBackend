import { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, Clock, BellRing, Bell, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Affirmation {
  id: string | number;
  text: string;
  reminderTime?: string;
  isActive: boolean;
  createdAt?: Date;
}

export default function AffirmationsTab() {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newAffirmationText, setNewAffirmationText] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [userId, setUserId] = useState<number | null>(1); // Default to 1 for demo

  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Load affirmations when the component mounts
    if (userId) {
      fetchAffirmations();
    }
  }, [userId]);
  
  const fetchAffirmations = async () => {
    try {
      setIsLoading(true);
      
      // Using fetch directly for now as apiRequest is causing typing issues
      const response = await fetch(`/api/affirmations?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch affirmations');
      }
      
      const data = await response.json();
      setAffirmations(data);
    } catch (error) {
      console.error('Failed to fetch affirmations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load affirmations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAffirmation = async () => {
    if (!newAffirmationText.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Affirmation text cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newItem: Affirmation = {
        id: Date.now().toString(),
        text: newAffirmationText,
        reminderTime: newReminderTime || undefined,
        isActive: true,
      };
      
      const response = await fetch('/api/affirmations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          text: newItem.text,
          reminderTime: newItem.reminderTime,
          isActive: newItem.isActive,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add affirmation');
      }
      
      const createdAffirmation = await response.json();
      
      setAffirmations((prev) => [...prev, createdAffirmation]);
      setNewAffirmationText('');
      setNewReminderTime('');
      
      toast({
        title: 'Success',
        description: 'Affirmation added successfully',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/affirmations'] });
    } catch (error) {
      console.error('Failed to add affirmation:', error);
      toast({
        title: 'Error',
        description: 'Failed to add affirmation',
        variant: 'destructive',
      });
    }
  };

  const startEditing = (affirmation: Affirmation) => {
    setIsEditing(true);
    setEditingId(affirmation.id);
    setNewAffirmationText(affirmation.text);
    setNewReminderTime(affirmation.reminderTime || '');
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingId(null);
    setNewAffirmationText('');
    setNewReminderTime('');
  };

  const handleUpdateAffirmation = async () => {
    if (!newAffirmationText.trim() || !editingId) {
      toast({
        title: 'Validation Error',
        description: 'Affirmation text cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/affirmations/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newAffirmationText,
          reminderTime: newReminderTime || undefined,
          isActive: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update affirmation');
      }
      
      const updatedAffirmation = await response.json();
      
      setAffirmations((prev) => 
        prev.map((item) => 
          item.id === editingId ? updatedAffirmation : item
        )
      );
      
      cancelEditing();
      
      toast({
        title: 'Success',
        description: 'Affirmation updated successfully',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/affirmations'] });
    } catch (error) {
      console.error('Failed to update affirmation:', error);
      toast({
        title: 'Error',
        description: 'Failed to update affirmation',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (affirmation: Affirmation) => {
    try {
      const response = await fetch(`/api/affirmations/${affirmation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...affirmation,
          isActive: !affirmation.isActive,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle affirmation');
      }
      
      const updatedAffirmation = await response.json();
      
      setAffirmations((prev) => 
        prev.map((item) => 
          item.id === affirmation.id ? updatedAffirmation : item
        )
      );
      
      toast({
        title: 'Success',
        description: `Reminder ${updatedAffirmation.isActive ? 'enabled' : 'disabled'}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/affirmations'] });
    } catch (error) {
      console.error('Failed to toggle affirmation:', error);
      toast({
        title: 'Error',
        description: 'Failed to update affirmation',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAffirmation = async (id: string | number) => {
    try {
      const response = await fetch(`/api/affirmations/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete affirmation');
      }
      
      setAffirmations((prev) => prev.filter((item) => item.id !== id));
      
      toast({
        title: 'Success',
        description: 'Affirmation deleted successfully',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/affirmations'] });
    } catch (error) {
      console.error('Failed to delete affirmation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete affirmation',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-bubble-primary">Daily Affirmations</h2>
      <p className="text-sm text-gray-600">
        Create positive affirmations to remind yourself throughout the day.
      </p>
      
      {/* Add/Edit Affirmation Form */}
      <div className="bg-bubble-light rounded-lg p-4 shadow-sm">
        <div className="flex flex-col gap-3">
          <textarea
            value={newAffirmationText}
            onChange={(e) => setNewAffirmationText(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-bubble-primary"
            placeholder="Write your affirmation here..."
            rows={3}
          />
          
          <div className="flex items-center gap-2">
            <Clock className="text-gray-500" size={18} />
            <input
              type="time"
              value={newReminderTime}
              onChange={(e) => setNewReminderTime(e.target.value)}
              className="flex-1 p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-bubble-primary"
              placeholder="Set reminder time"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            {isEditing && (
              <button
                onClick={cancelEditing}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            )}
            
            <button
              onClick={isEditing ? handleUpdateAffirmation : handleAddAffirmation}
              className="px-4 py-2 bg-bubble-primary text-white rounded-md hover:bg-opacity-90 flex items-center gap-2"
              disabled={!newAffirmationText.trim()}
            >
              <PlusCircle size={18} />
              {isEditing ? 'Update' : 'Add'} Affirmation
            </button>
          </div>
        </div>
      </div>
      
      {/* Affirmations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bubble-primary"></div>
          </div>
        ) : affirmations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <BellRing size={32} />
            <p className="mt-2">No affirmations yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {affirmations.map((affirmation) => (
              <div 
                key={affirmation.id} 
                className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between">
                  <div className="flex-1">
                    <p className="text-gray-800">{affirmation.text}</p>
                    
                    {affirmation.reminderTime && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <Clock size={14} />
                        <span>Reminder at {affirmation.reminderTime}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <button 
                      onClick={() => toggleActive(affirmation)}
                      className="text-gray-500 hover:text-yellow-500"
                      title={affirmation.isActive ? "Disable reminder" : "Enable reminder"}
                    >
                      {affirmation.isActive ? <Bell size={18} /> : <BellOff size={18} />}
                    </button>
                    
                    <button 
                      onClick={() => startEditing(affirmation)}
                      className="text-gray-500 hover:text-blue-500"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    
                    <button 
                      onClick={() => handleDeleteAffirmation(affirmation.id)}
                      className="text-gray-500 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}