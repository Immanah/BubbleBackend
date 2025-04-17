import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize TanStack Query client
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Initialize THREE.js
import * as THREE from 'three';
window.THREE = THREE;

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
