/**
 * chat.ts
 * -------
 * Doctor-focused convenience layer used by AppContext / DoctorChatScreen.
 * Implemented on top of the exact production contract in `messages.ts`.
 *
 * The app identifies a chat by DOCTOR (DoctorChatScreen receives a Doctor),
 * while the backend identifies it by CONVERSATION ID. This module caches the
 * doctor → conversation mapping per session.
 */

import { ChatMessage } from '../types';
import {
  getConversationsApi,
  getConversationApi,
  sendMessageApi,
  startConversationApi,
  markMessageReadApi,
  getUnreadCountApi,
  RawMessage,
  MessageContentType,
} from './messages';

interface RawChatMessage {
  id: number | string;
  conversation_id?: number | string;
  sender_id?: number | string;
  sender_type?: 'patient' | 'doctor' | 'admin';
  content?: string;
  message?: string;
  message_type?: string;
  created_at?: string;
  is_read?: boolean;
  [key: string]: unknown;
}

/** doctor id (profile id from /users/doctors) → conversation id */
const conversationIdByDoctorId = new Map<string, string>();

function transformBackendMessage(raw: RawMessage | RawChatMessage): ChatMessage {
  const r = raw as Record<string, any>;
  const senderType = r.sender_info?.user_type ?? r.sender_type;
  return {
    id: String(r.id),
    sender: senderType === 'doctor' ? 'doctor' : 'patient',
    text: r.sender_info ? r.content : (r.content ?? r.message ?? ''),
    timestamp: r.created_at
      ? new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '',
    type: (r.message_type as ChatMessage['type']) ?? 'text',
  };
}

function transformBackendMessages(raws: (RawMessage | RawChatMessage)[]): ChatMessage[] {
  return raws.map(transformBackendMessage);
}

/**
 * Resolve the conversation for a doctor, creating it when necessary.
 *
 * Strategy (matches the real backend contract):
 *  1. Cached conversation id for this doctor → reuse.
 *  2. Look through GET /messages/conversations for a conversation whose
 *     participant doctor profile id matches the given doctor id.
 *  3. POST /messages/conversations with recipient_id = the doctor's USER id
 *     when known (the backend requires the user id for patients), falling
 *     back to the profile id if we only have that.
 */
export async function getOrCreateConversationApi(
  doctorId: number | string,
  doctorUserId?: number | string,
): Promise<{ conversationId: string }> {
  const key = String(doctorId);
  const cached = conversationIdByDoctorId.get(key);
  if (cached) return { conversationId: cached };

  // 2. Find an existing active conversation with this doctor.
  try {
    const { conversations } = await getConversationsApi(1, 50);
    const match = conversations.find(
      (c) => String(c.participant_info?.doctor?.id ?? '') === key,
    );
    if (match) {
      conversationIdByDoctorId.set(key, String(match.id));
      return { conversationId: String(match.id) };
    }
  } catch {
    // Listing may fail (e.g. no conversations yet) — fall through to create.
  }

  // 3. Create one. Backend requires the doctor's user id for patients.
  const recipientId = doctorUserId ?? doctorId;
  const conversation = await startConversationApi({
    recipient_id: recipientId,
    recipient_type: 'user',
  });
  const conversationId = String(conversation.id);
  conversationIdByDoctorId.set(key, conversationId);
  return { conversationId };
}

/** Pre-seed the cache (e.g. after resolving a conversation by appointment). */
export function cacheConversationForDoctor(
  doctorId: number | string,
  conversationId: number | string,
): void {
  conversationIdByDoctorId.set(String(doctorId), String(conversationId));
}

export async function fetchChatMessagesApi(
  doctorId: number | string,
  _userId?: string,
): Promise<ChatMessage[]> {
  const { conversationId } = await getOrCreateConversationApi(doctorId);
  // GET conversation detail also marks all messages read on the server side.
  const conversation = await getConversationApi(conversationId);
  return transformBackendMessages(conversation.messages ?? []);
}

export async function sendChatMessageApi(
  doctorId: number | string,
  payload: { text: string; type?: string },
  _userId?: string,
): Promise<ChatMessage> {
  const { conversationId } = await getOrCreateConversationApi(doctorId);
  const message = await sendMessageApi(conversationId, {
    content: payload.text,
    message_type: (payload.type as MessageContentType) ?? 'text',
  });
  return transformBackendMessage(message);
}

export { markMessageReadApi };

export async function fetchUnreadCountApi(): Promise<number> {
  const data = await getUnreadCountApi();
  return data.total_unread;
}
