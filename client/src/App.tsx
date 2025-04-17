import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { useEffect } from "react";
import { useBubbleStore } from "./store/bubbleStore";
import { connectWebSocket } from "./lib/websocket";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { setConnectionStatus } = useBubbleStore();

  useEffect(() => {
    // Initialize WebSocket connection
    const cleanup = connectWebSocket({
      onConnect: () => setConnectionStatus('connected'),
      onDisconnect: () => setConnectionStatus('disconnected'),
      onError: () => setConnectionStatus('error')
    });

    return cleanup;
  }, [setConnectionStatus]);

  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
