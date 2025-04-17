import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer, WebSocket, MessageEvent } from "ws";
import { processChatMessage } from "./openaiService";

// Client connections
const clients = new Map<string, WebSocket>();

// Store conversation history for each client
const conversationHistory = new Map<string, Array<{role: 'user' | 'assistant', content: string}>>();

// Max conversation history to keep per client
const MAX_HISTORY_LENGTH = 10;

// Ping interval to keep connections alive (30 seconds)
const PING_INTERVAL = 30000;

// Define different mood responses for chat
const moodResponses = {
  happy: [
    "I'm glad to hear you're feeling positive! What's bringing you joy today?",
    "That's wonderful! It's great to see you in such high spirits."
  ],
  calm: [
    "It sounds like you're in a peaceful state of mind. How can we maintain this tranquility?",
    "I'm here to support your calm energy. What would you like to explore today?"
  ],
  sad: [
    "I'm sorry to hear you're feeling down. Would you like to talk about what's troubling you?",
    "It's okay to feel sad sometimes. I'm here to listen whenever you're ready to share."
  ],
  anxious: [
    "I notice you might be feeling anxious. Would taking a few deep breaths together help?",
    "Anxiety can be challenging. Let's work through these feelings together at your pace."
  ],
  stressed: [
    "It sounds like you're under a lot of pressure. What's contributing to your stress right now?",
    "When you're feeling stressed, it can help to identify what's within your control. Shall we explore that?"
  ],
  neutral: [
    "How are you feeling right now? I'm here to support you however you need.",
    "Is there something specific you'd like to talk about today?"
  ],
  improved: [
    "It's great to hear you're feeling better! What positive changes have you noticed?",
    "Progress is something to celebrate! What's been working well for you?"
  ]
};

// Helper function to get a random response for a mood
function getRandomMoodResponse(mood: string): string {
  const responses = moodResponses[mood as keyof typeof moodResponses] || moodResponses.neutral;
  return responses[Math.floor(Math.random() * responses.length)];
}

// Helper function to analyze message and determine mood
function analyzeMood(message: string): string {
  const message_lower = message.toLowerCase();
  
  // Very simple sentiment analysis
  if (message_lower.includes('happy') || message_lower.includes('joy') || message_lower.includes('excited')) {
    return 'happy';
  } else if (message_lower.includes('calm') || message_lower.includes('peaceful') || message_lower.includes('relaxed')) {
    return 'calm';
  } else if (message_lower.includes('sad') || message_lower.includes('depressed') || message_lower.includes('unhappy')) {
    return 'sad';
  } else if (message_lower.includes('anxious') || message_lower.includes('worried') || message_lower.includes('nervous')) {
    return 'anxious';
  } else if (message_lower.includes('stress') || message_lower.includes('overwhelm') || message_lower.includes('pressure')) {
    return 'stressed';
  } else if (message_lower.includes('better') || message_lower.includes('improv') || message_lower.includes('progress')) {
    return 'improved';
  }
  
  return 'neutral';
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Create WebSocket server on /ws path
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Extend WebSocket interface for our custom properties
  interface ExtendedWebSocket extends WebSocket {
    isAlive: boolean;
  }

  // Heartbeat to keep connections alive
  function heartbeat(this: WebSocket) {
    (this as ExtendedWebSocket).isAlive = true;
  }
  
  // Set up interval to check connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const extWs = ws as ExtendedWebSocket;
      if (extWs.isAlive === false) return extWs.terminate();
      
      extWs.isAlive = false;
      extWs.ping();
    });
  }, PING_INTERVAL);
  
  // Clear interval when server closes
  wss.on('close', () => {
    clearInterval(interval);
  });

  // WebSocket connection handler
  wss.on('connection', (ws) => {
    const extWs = ws as ExtendedWebSocket;
    const clientId = Date.now().toString();
    console.log(`Client connected: ${clientId}`);
    clients.set(clientId, extWs);
    
    // Set initial alive state
    extWs.isAlive = true;
    extWs.on('pong', function() {
      (this as ExtendedWebSocket).isAlive = true;
    });

    // Send welcome message
    extWs.send(JSON.stringify({
      type: 'system',
      payload: { 
        message: 'Connected to Bubble WebSocket Server',
        clientId
      }
    }));

    // Message handler
    extWs.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Received from ${clientId}:`, data);

        if (data.type === 'chat') {
          // Get or initialize conversation history for this client
          if (!conversationHistory.has(clientId)) {
            conversationHistory.set(clientId, []);
          }
          
          const history = conversationHistory.get(clientId)!;
          
          // Add user message to history
          history.push({
            role: 'user',
            content: data.payload.message
          });
          
          // Limit history size
          while (history.length > MAX_HISTORY_LENGTH) {
            history.shift();
          }
          
          try {
            // Indicate typing status to client
            if (extWs.readyState === WebSocket.OPEN) {
              extWs.send(JSON.stringify({
                type: 'system',
                payload: { status: 'typing' }
              }));
            }
            
            // Process chat message with OpenAI
            const aiResponse = await processChatMessage({
              userMessage: data.payload.message,
              previousMessages: history.slice(0, -1) // Exclude the current message
            });
            
            // Add AI response to conversation history
            history.push({
              role: 'assistant',
              content: aiResponse.message
            });
            
            // Send response back to the client
            const response = {
              type: 'chat',
              payload: {
                message: aiResponse.message,
                mood: aiResponse.mood,
                messageId: data.payload.messageId // Return the same message ID if provided
              }
            };
            
            if (extWs.readyState === WebSocket.OPEN) {
              extWs.send(JSON.stringify(response));
            }
          } catch (error) {
            console.error("Error processing chat with OpenAI:", error);
            
            // Fallback to rule-based response
            const detectedMood = analyzeMood(data.payload.message);
            const fallbackResponse = {
              type: 'chat',
              payload: {
                message: getRandomMoodResponse(detectedMood),
                mood: detectedMood,
                messageId: data.payload.messageId // Return the same message ID if provided
              }
            };
            
            if (extWs.readyState === WebSocket.OPEN) {
              extWs.send(JSON.stringify(fallbackResponse));
            }
          }
        }
        
        // Handle environment change
        else if (data.type === 'environment') {
          // Broadcast environment change to all clients for collaborative experiences
          const broadcastMsg = {
            type: 'environment',
            payload: {
              environment: data.payload.environment,
              changedBy: clientId
            }
          };
          
          wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
              client.send(JSON.stringify(broadcastMsg));
            }
          });
        }
        
        // Handle mood tracking
        else if (data.type === 'mood') {
          // Store mood data (would save to database in production)
          console.log(`Mood update from ${clientId}:`, data.payload.mood);
          
          // Acknowledge receipt
          extWs.send(JSON.stringify({
            type: 'system',
            payload: { message: 'Mood update received' }
          }));
        }
      } catch (error) {
        console.error('Error processing message:', error);
        extWs.send(JSON.stringify({
          type: 'system',
          payload: { error: 'Invalid message format' }
        }));
      }
    });

    // Handle disconnection
    extWs.on('close', () => {
      console.log(`Client disconnected: ${clientId}`);
      clients.delete(clientId);
    });
  });

  // REST API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Chat interactions API
  app.post('/api/interactions/process', async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      
      // Generate a unique session ID if not provided
      const actualSessionId = sessionId || `session_${Date.now()}`;
      
      // Get or initialize conversation history for this session
      if (!conversationHistory.has(actualSessionId)) {
        conversationHistory.set(actualSessionId, []);
      }
      
      const history = conversationHistory.get(actualSessionId)!;
      
      // Add user message to history
      history.push({
        role: 'user',
        content: message
      });
      
      // Limit history size
      while (history.length > MAX_HISTORY_LENGTH) {
        history.shift();
      }
      
      try {
        // Process chat message with OpenAI
        const aiResponse = await processChatMessage({
          userMessage: message,
          previousMessages: history.slice(0, -1) // Exclude the current message
        });
        
        // Add AI response to conversation history
        history.push({
          role: 'assistant',
          content: aiResponse.message
        });
        
        // Return response
        res.json({
          response: aiResponse.message,
          mood: aiResponse.mood,
          sessionId: actualSessionId
        });
      } catch (error) {
        console.error("Error processing chat with OpenAI:", error);
        
        // Fallback to rule-based response
        const detectedMood = analyzeMood(message);
        const fallbackMessage = getRandomMoodResponse(detectedMood);
        
        res.json({
          response: fallbackMessage,
          mood: detectedMood,
          sessionId: actualSessionId,
          fallback: true
        });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to process interaction' });
    }
  });
  
  // Environment change API (with ambient sound selection)
  app.post('/api/environment/change', async (req, res) => {
    try {
      const { environmentId } = req.body;
      
      // This would normally update user preferences in the database
      // and potentially notify connected clients about the change
      
      // Return environment details including ambient sound URL
      const environments = {
        forest: {
          id: 'forest',
          name: 'Forest Retreat',
          audioUrl: '/sounds/forest-ambient.mp3',
          sceneData: { 
            particles: 'leaves',
            lightIntensity: 0.8,
            fogDensity: 0.05
          }
        },
        ocean: {
          id: 'ocean',
          name: 'Ocean Waves',
          audioUrl: '/sounds/ocean-waves.mp3',
          sceneData: { 
            particles: 'bubbles',
            lightIntensity: 1.0,
            fogDensity: 0.02
          }
        },
        sunset: {
          id: 'sunset',
          name: 'Peaceful Sunset',
          audioUrl: '/sounds/gentle-wind.mp3',
          sceneData: { 
            particles: 'dust',
            lightIntensity: 0.7,
            fogDensity: 0.08
          }
        },
        bedroom: {
          id: 'bedroom',
          name: 'Cozy Bedroom',
          audioUrl: '/sounds/fireplace.mp3',
          sceneData: { 
            particles: 'none',
            lightIntensity: 0.6,
            fogDensity: 0.01
          }
        }
      };
      
      res.json(environments[environmentId as keyof typeof environments] || environments.forest);
    } catch (error) {
      res.status(500).json({ error: 'Failed to change environment' });
    }
  });

  // Journal routes
  app.get('/api/journal/list', async (req, res) => {
    try {
      // Simulated journal entries data
      const entries = [
        {
          id: 1,
          title: "Anxiety Management",
          content: "The breathing exercises really helped me calm down before my meeting. I felt much more confident.",
          mood: "improved",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          id: 2,
          title: "Work Stress",
          content: "Feeling overwhelmed with the project deadline approaching. Need to practice more mindfulness.",
          mood: "neutral",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        }
      ];
      
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch journal entries' });
    }
  });

  app.post('/api/journal/add', async (req, res) => {
    try {
      const { title, content, mood } = req.body;
      
      // This would normally insert into the database
      const newEntry = {
        id: Date.now(),
        title,
        content,
        mood,
        createdAt: new Date()
      };
      
      res.status(201).json(newEntry);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add journal entry' });
    }
  });

  app.delete('/api/journal/delete/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // This would normally delete from the database
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete journal entry' });
    }
  });

  app.get('/api/journal/mood-data', async (req, res) => {
    try {
      // Simulated mood data
      const moodData = [
        { mood: 'anxious', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), value: 30 },
        { mood: 'neutral', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), value: 50 },
        { mood: 'sad', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), value: 20 },
        { mood: 'calm', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), value: 70 },
        { mood: 'happy', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), value: 80 },
        { mood: 'improved', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), value: 85 }
      ];
      
      res.json(moodData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch mood data' });
    }
  });

  // Reminders routes
  app.get('/api/reminders/list', async (req, res) => {
    try {
      // Simulated reminders data
      const reminders = [
        {
          id: 1,
          title: "Deep Breathing Exercise",
          description: "Take 5 minutes for deep breathing",
          time: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
        },
        {
          id: 2,
          title: "Journal Reflection",
          description: "Write about your day",
          time: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours from now
        }
      ];
      
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reminders' });
    }
  });

  // Safe Space routes
  app.get('/api/safe-space/affirmation', async (req, res) => {
    try {
      // Simulated affirmation
      const affirmations = [
        "You are doing your best, and that is enough.",
        "You are worthy of love and support.",
        "Your feelings are valid and important.",
        "Each breath is a fresh start.",
        "You have the strength to overcome challenges."
      ];
      
      const randomIndex = Math.floor(Math.random() * affirmations.length);
      
      res.json({ affirmation: affirmations[randomIndex] });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch affirmation' });
    }
  });
  
  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, password, email } = req.body;
      
      // In a real app, validate input and check if user exists
      // Then hash password before storing it
      
      const user = await storage.createUser({ 
        username, 
        password
      });
      
      res.status(201).json({
        id: user.id,
        username: user.username
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to register user' });
    }
  });
  
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Find user and verify password
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      res.json({
        id: user.id,
        username: user.username
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to authenticate' });
    }
  });
  
  app.post('/api/auth/social', async (req, res) => {
    try {
      const { provider, token, email, name } = req.body;
      
      // In a real app, verify the token with the provider
      // For now, simulate a successful login
      
      res.json({
        id: Date.now(),
        username: name || email.split('@')[0],
        provider
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to authenticate with social provider' });
    }
  });
  
  // Affirmations routes (simulated - would use database in production)
  app.get('/api/affirmations', async (req, res) => {
    try {
      const userId = req.query.userId;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      // Simulated affirmations
      const sampleAffirmations = [
        {
          id: 1,
          text: "I am worthy of good things",
          reminderTime: "08:00",
          isActive: true,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
          id: 2,
          text: "I choose to focus on what I can control",
          reminderTime: "20:00",
          isActive: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        }
      ];
      
      res.json(sampleAffirmations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch affirmations' });
    }
  });
  
  app.post('/api/affirmations', async (req, res) => {
    try {
      const { userId, text, reminderTime, isActive } = req.body;
      
      if (!userId || !text) {
        return res.status(400).json({ error: 'User ID and text are required' });
      }
      
      // Simulated response - would create in database in production
      const newAffirmation = {
        id: Date.now(),
        userId: Number(userId),
        text,
        reminderTime,
        isActive: isActive !== undefined ? isActive : true,
        createdAt: new Date()
      };
      
      res.status(201).json(newAffirmation);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create affirmation' });
    }
  });
  
  app.put('/api/affirmations/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { text, reminderTime, isActive } = req.body;
      
      // Simulated response - would update in database in production
      const updatedAffirmation = {
        id,
        text,
        reminderTime,
        isActive,
        userId: 1, // Placeholder
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      };
      
      res.json(updatedAffirmation);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update affirmation' });
    }
  });
  
  app.delete('/api/affirmations/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      // Would delete from database in production
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete affirmation' });
    }
  });

  return httpServer;
}
