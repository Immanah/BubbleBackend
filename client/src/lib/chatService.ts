import { apiRequest } from './queryClient';
import { sendWebSocketMessage, connectWebSocket } from './websocket';
import { Mood, WebSocketMessage } from '@/models/types';

interface ChatResponse {
  message: string;
  mood?: Mood;
}

// Store pending chat requests
const pendingRequests = new Map<string, { 
  resolve: (value: ChatResponse) => void, 
  reject: (reason: any) => void 
}>();

// Track session ID for REST API fallback
let sessionId: string | null = null;

// Setup WebSocket connection and message handler
let wsConnected = false;
const setupWebSocket = () => {
  if (wsConnected) return;
  
  const cleanup = connectWebSocket({
    onConnect: () => {
      console.log('Chat service connected to WebSocket');
      wsConnected = true;
    },
    onDisconnect: () => {
      console.log('Chat service disconnected from WebSocket');
      wsConnected = false;
    },
    onMessage: (data: WebSocketMessage) => {
      if (data.type === 'chat') {
        // Handle chat response
        const responseData = data.payload;
        const messageId = responseData.messageId || 'default';
        
        // Find and resolve pending request if exists
        const pendingRequest = pendingRequests.get(messageId);
        if (pendingRequest) {
          pendingRequest.resolve({
            message: responseData.message,
            mood: responseData.mood
          });
          pendingRequests.delete(messageId);
        }
      }
      else if (data.type === 'system' && data.payload.status === 'typing') {
        // Could trigger a typing indicator in the UI
        console.log('Bubble is typing...');
      }
    },
    onError: (error) => {
      console.error('Chat WebSocket error:', error);
      // Reject all pending requests on error
      pendingRequests.forEach(request => {
        request.reject(new Error('WebSocket connection error'));
      });
      pendingRequests.clear();
      wsConnected = false;
    }
  });
  
  // Clean up on page unload
  window.addEventListener('beforeunload', cleanup);
};

// Initialize WebSocket connection
setupWebSocket();

export async function sendChatMessage(content: string): Promise<ChatResponse> {
  try {
    const messageId = `msg_${Date.now()}`;
    
    // Try using WebSocket for real-time communication
    if (wsConnected) {
      const sent = sendWebSocketMessage({
        type: 'chat',
        payload: { 
          message: content,
          messageId
        }
      });
      
      if (sent) {
        // Return a promise that will be resolved when the response is received
        return new Promise<ChatResponse>((resolve, reject) => {
          // Store the promise resolvers with the message ID
          pendingRequests.set(messageId, { resolve, reject });
          
          // Set a timeout to reject the promise if no response is received
          setTimeout(() => {
            if (pendingRequests.has(messageId)) {
              pendingRequests.delete(messageId);
              reject(new Error('WebSocket response timeout'));
            }
          }, 30000); // 30 second timeout
        });
      }
    }

    // Fall back to REST API if WebSocket isn't available
    console.log('Falling back to REST API for chat');
    const response = await apiRequest('POST', '/api/interactions/process', {
      message: content,
      sessionId // Include session ID if we have one from previous exchanges
    });
    
    const data = await response.json();
    
    // Store session ID for future requests
    if (data.sessionId) {
      sessionId = data.sessionId;
    }
    
    return {
      message: data.response,
      mood: data.mood || 'neutral'
    };
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

export async function getAffirmation(): Promise<string> {
  try {
    const response = await apiRequest('GET', '/api/safe-space/affirmation', undefined);
    const data = await response.json();
    return data.affirmation;
  } catch (error) {
    console.error('Error getting affirmation:', error);
    throw error;
  }
}
