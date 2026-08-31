/**
 * socketService.ts
 * ----------------
 * Manages the Socket.IO connection to the Sahatak-2 backend.
 *
 * Architecture note (from backend websocket_service.py):
 *  - Messages are SENT via REST POST /api/messages/conversations/:id/messages
 *  - The backend then calls emit_new_message() which broadcasts to the room
 *  - This service only RECEIVES real-time events (new_message, user_typing_start, etc.)
 *  - Client emits: join_conversation, leave_conversation, typing_start, typing_stop
 *
 * Backend event names (server → client):
 *   new_message          payload: { conversation_id, message: {...}, sender_id, timestamp }
 *   user_typing_start    payload: { user_id, user_name, conversation_id }
 *   user_typing_stop     payload: { user_id, conversation_id }
 *   connection_status    payload: { status, user_id, timestamp }
 *   user_joined_conversation
 *   user_left_conversation
 */

import { io, Socket } from 'socket.io-client';
import { SERVER_HOST } from '../api/client';

export type IncomingMessage = {
  id: string | number;
  conversation_id: string | number;
  content: string;
  message_type: string;
  sender_id: number;
  sender_type: 'patient' | 'doctor' | 'admin';
  created_at: string;
  is_read?: boolean;
  [key: string]: any;
};

type NewMessagePayload = {
  conversation_id: string | number;
  message: IncomingMessage;
  sender_id: number;
  timestamp: string;
};

type TypingPayload = {
  user_id: number;
  user_name: string;
  conversation_id: string | number;
};

type MessageCallback = (msg: IncomingMessage, conversationId: string) => void;
type TypingCallback = (data: TypingPayload) => void;

class SocketService {
  private socket: Socket | null = null;
  private messageHandlers: Set<MessageCallback> = new Set();
  private typingHandlers: Set<TypingCallback> = new Set();

  /**
   * Connect to the Socket.IO server, authenticating with the JWT token.
   * Call this right after a successful login.
   */
  connect(token: string): void {
    if (this.socket?.connected) return;

    this.socket = io(SERVER_HOST, {
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('[SocketService] Connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[SocketService] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[SocketService] Connection error:', err.message);
    });

    // Backend emits 'new_message' with nested { conversation_id, message, sender_id, timestamp }
    this.socket.on('new_message', (payload: NewMessagePayload) => {
      if (!payload?.message) return;
      const convId = String(payload.conversation_id ?? payload.message?.conversation_id ?? '');
      this.messageHandlers.forEach((cb) => cb(payload.message, convId));
    });

    // Backend emits 'user_typing_start' (not 'typing_start')
    this.socket.on('user_typing_start', (data: TypingPayload) => {
      this.typingHandlers.forEach((cb) => cb(data));
    });
  }

  /** Gracefully disconnect and clear all handlers. Call on logout. */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.messageHandlers.clear();
    this.typingHandlers.clear();
  }

  /** Returns true if currently connected */
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /** Join a specific conversation room to receive its messages in real-time */
  joinConversation(conversationId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('join_conversation', { conversation_id: conversationId });
  }

  /** Leave a conversation room */
  leaveConversation(conversationId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('leave_conversation', { conversation_id: conversationId });
  }

  /** Emit typing_start event to the backend (broadcast to other participants) */
  sendTypingStart(conversationId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('typing_start', { conversation_id: conversationId });
  }

  /** Emit typing_stop event */
  sendTypingStop(conversationId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('typing_stop', { conversation_id: conversationId });
  }

  // ── Event registration ────────────────────────────────────────────────

  onMessage(cb: MessageCallback): void {
    this.messageHandlers.add(cb);
  }

  offMessage(cb: MessageCallback): void {
    this.messageHandlers.delete(cb);
  }

  onTyping(cb: TypingCallback): void {
    this.typingHandlers.add(cb);
  }

  offTyping(cb: TypingCallback): void {
    this.typingHandlers.delete(cb);
  }
}

// Singleton — one connection shared for the whole app lifetime
export const socketService = new SocketService();
