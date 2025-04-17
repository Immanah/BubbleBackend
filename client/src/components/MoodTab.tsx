import { useEffect, useRef } from 'react';
import { useJournalStore } from '@/store/journalStore';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format, subDays } from 'date-fns';

export default function MoodTab() {
  const { moodData, fetchMoodData } = useJournalStore();
  
  useEffect(() => {
    fetchMoodData();
  }, [fetchMoodData]);

  // Convert mood data to format for chart
  const chartData = moodData.map(item => ({
    date: format(item.timestamp, 'MMM dd'),
    value: item.value,
    mood: item.mood
  }));

  const getMoodValue = (mood: string) => {
    switch(mood) {
      case 'happy': return 90;
      case 'calm': return 80;
      case 'improved': return 70;
      case 'neutral': return 50;
      case 'anxious': return 30;
      case 'sad': return 20;
      case 'stressed': return 10;
      default: return 50;
    }
  };

  // Generate dummy data for 7 days if no data
  const generateDummyData = () => {
    if (chartData.length > 0) return chartData;
    
    const dummy = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      dummy.push({
        date: format(date, 'MMM dd'),
        value: 50, // neutral value
        mood: 'neutral'
      });
    }
    return dummy;
  };

  const data = generateDummyData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600">
            Mood: {payload[0].payload.mood.charAt(0).toUpperCase() + payload[0].payload.mood.slice(1)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Mood Tracker</h2>
      
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 mb-6">
        <h3 className="text-md font-medium text-gray-700 mb-2">Your Mood Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4FACFE" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4FACFE" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} hide />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#4FACFE" 
                fillOpacity={1} 
                fill="url(#colorMood)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <h3 className="text-md font-medium text-gray-700 mb-2">Most Common Mood</h3>
          <div className="flex items-center justify-center p-4">
            <div className="text-center">
              <span className="material-icons text-4xl text-bubble-primary">
                {moodData.length > 0
                  ? (() => {
                      const moodCounts: Record<string, number> = {};
                      moodData.forEach(m => {
                        moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
                      });
                      const mostCommon = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
                      
                      switch(mostCommon) {
                        case 'happy': return 'sentiment_very_satisfied';
                        case 'calm': return 'sentiment_satisfied';
                        case 'sad': return 'sentiment_dissatisfied';
                        case 'anxious': return 'sentiment_stressed';
                        case 'stressed': return 'sentiment_very_dissatisfied';
                        case 'improved': return 'trending_up';
                        default: return 'sentiment_neutral';
                      }
                    })()
                  : 'sentiment_neutral'
                }
              </span>
              <p className="mt-2 text-gray-600">
                {moodData.length > 0
                  ? (() => {
                      const moodCounts: Record<string, number> = {};
                      moodData.forEach(m => {
                        moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
                      });
                      const mostCommon = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Neutral';
                      return mostCommon.charAt(0).toUpperCase() + mostCommon.slice(1);
                    })()
                  : 'Neutral'
                }
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <h3 className="text-md font-medium text-gray-700 mb-2">Weekly Average</h3>
          <div className="flex items-center justify-center p-4">
            <div className="text-center">
              <span className="text-4xl font-bold text-bubble-primary">
                {moodData.length > 0
                  ? Math.round(moodData.reduce((acc, curr) => acc + curr.value, 0) / moodData.length)
                  : 50}%
              </span>
              <p className="mt-2 text-gray-600">
                {moodData.length > 0
                  ? (() => {
                      const avg = moodData.reduce((acc, curr) => acc + curr.value, 0) / moodData.length;
                      if (avg > 75) return 'Excellent';
                      if (avg > 60) return 'Good';
                      if (avg > 40) return 'Okay';
                      if (avg > 25) return 'Needs Attention';
                      return 'Concerning';
                    })()
                  : 'Neutral'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
