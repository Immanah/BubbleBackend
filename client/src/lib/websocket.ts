import { WebSocketMessage } from "@/models/types";

type WebSocketCallbacks = {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (data: WebSocketMessage) => void;
};

let socket: WebSocket | null = null;

export function connectWebSocket(callbacks: WebSocketCallbacks) {
  // Close any existing connection
  if (socket) {
    socket.close();
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('WebSocket connected');
    callbacks.onConnect?.();
  };

  socket.onclose = () => {
    console.log('WebSocket disconnected');
    callbacks.onDisconnect?.();
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    callbacks.onError?.(error);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as WebSocketMessage;
      callbacks.onMessage?.(data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  // Return a cleanup function
  return () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
  };
}

export function sendWebSocketMessage(message: WebSocketMessage) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
    return true;
  }
  return false;
}
