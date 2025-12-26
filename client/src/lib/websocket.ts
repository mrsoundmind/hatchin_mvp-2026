import { useEffect, useRef, useState } from 'react';
import { devLog } from './devLog';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface WebSocketHook {
  socket: WebSocket | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  sendMessage: (message: WebSocketMessage) => void;
  lastMessage: WebSocketMessage | null;
}

export function useWebSocket(url: string, options?: {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
}): WebSocketHook {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectInterval = options?.reconnectInterval || 3000;

  const connect = () => {
    try {
      setConnectionStatus('connecting');
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WebSocket connected');
        
        devLog('WEBSOCKET_CONNECTED', {
          url,
          readyState: ws.readyState
        });
        
        setConnectionStatus('connected');
        setSocket(ws);
        options?.onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);
          options?.onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('disconnected');
        setSocket(null);
        options?.onDisconnect?.();

        // Auto-reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        options?.onError?.(error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
    }
  };

  const sendMessage = (message: WebSocketMessage) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      // Extract conversationId defensively
      const conversationId = message.conversationId || message.message?.conversationId || null;
      
      devLog('WEBSOCKET_SEND', {
        messageType: message.type,
        conversationId,
        readyState: socket.readyState
      });
      
      socket.send(JSON.stringify(message));
    } else {
      const conversationId = message.conversationId || message.message?.conversationId || null;
      
      devLog('WEBSOCKET_SEND_BLOCKED', {
        messageType: message.type,
        conversationId,
        readyState: socket?.readyState,
        reason: 'not_connected'
      });
      
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, [url]);

  return {
    socket,
    connectionStatus,
    sendMessage,
    lastMessage
  };
}

// WebSocket URL helper
export function getWebSocketUrl(): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsHost = import.meta.env?.VITE_WS_HOST;
  const wsPort = import.meta.env?.VITE_WS_PORT;
  const wsPath = import.meta.env?.VITE_WS_PATH ?? '/ws';
  
  // Ensure path begins with /
  const path = wsPath.startsWith('/') ? wsPath : `/${wsPath}`;

  // Dev-only diagnostic logs
  if (import.meta.env.DEV) {
    console.log('[WebSocket URL Debug]', {
      'VITE_WS_HOST': wsHost,
      'VITE_WS_PORT': wsPort,
      'VITE_WS_PATH': wsPath,
      'window.location.host': window.location.host,
      'window.location.hostname': window.location.hostname,
      'window.location.port': window.location.port,
      'window.location.protocol': window.location.protocol
    });
  }

  let wsUrl: string;

  if (wsHost || wsPort !== undefined) {
    // Explicit configuration: construct URL manually
    const host = wsHost ?? window.location.hostname;
    // Only include port if explicitly provided and non-empty
    // If wsPort is undefined, don't include port (use default port for protocol)
    const port = (wsPort !== undefined && wsPort !== null && wsPort.trim() !== '') 
      ? `:${wsPort}` 
      : '';
    wsUrl = `${protocol}//${host}${port}${path}`;
  } else {
    // Default: use current origin (handles port automatically, no undefined issues)
    wsUrl = `${protocol}//${window.location.host}${path}`;
  }

  // Dev-only diagnostic logs
  if (import.meta.env.DEV) {
    console.log('[WebSocket URL Debug] Computed URL:', wsUrl);
  }

  return wsUrl;
}

// Message type definitions for type safety
export interface JoinConversationMessage {
  type: 'join_conversation';
  conversationId: string;
}

export interface SendMessageData {
  type: 'send_message';
  conversationId: string;
  message: {
    conversationId: string;
    userId?: string;
    agentId?: string;
    content: string;
    messageType: 'user' | 'agent' | 'system';
    metadata?: Record<string, any>;
  };
}

export interface StartTypingMessage {
  type: 'start_typing';
  conversationId: string;
  agentId: string;
  estimatedDuration?: number;
}

export interface StopTypingMessage {
  type: 'stop_typing';
  conversationId: string;
  agentId: string;
}

// Connection status indicator component (to be used in React components)
export interface ConnectionStatusProps { 
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export const getConnectionStatusConfig = (status: ConnectionStatusProps['status']) => {
  const statusConfig = {
    connecting: { color: 'text-yellow-500', text: 'Connecting...', bgColor: 'bg-yellow-500 animate-pulse' },
    connected: { color: 'text-green-500', text: 'Connected', bgColor: 'bg-green-500' },
    disconnected: { color: 'text-gray-500', text: 'Disconnected', bgColor: 'bg-gray-500' },
    error: { color: 'text-red-500', text: 'Connection Error', bgColor: 'bg-red-500' }
  };
  return statusConfig[status];
};