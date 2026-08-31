import { apiClient, unwrapData } from './client';
import { ChatMessage } from '../types';
import { INITIAL_CHAT_MESSAGES } from '../data/mockData';

// -------------------------------------------------------
// Transform a backend Message object → mobile ChatMessage type
// -------------------------------------------------------
function transformBackendMessage(m: any, currentUserId?: string): ChatMessage {
  const isPatient = m.sender_type === 'patient' ||
    (currentUserId && String(m.sender_id) === String(currentUserId));
  return {
    id: String(m.id ?? `msg-${Date.now()}`),
    sender: isPatient ? 'patient' : 'doctor',
    text: m.content ?? m.message ?? m.text ?? '',
    timestamp: m.created_at
      ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : m.timestamp ?? '',
    type: m.message_type ?? m.type ?? 'text',
    mediaUrl: m.attachment_url ?? m.media_url ?? undefined,
  };
}

// -------------------------------------------------------
// Get or create a conversation with a specific doctor
// Endpoint: GET /api/messages/conversations (filter by doctor)
//           POST /api/messages/conversations (create if not exists)
// -------------------------------------------------------
export const getOrCreateConversationApi = async (
  doctorId: string
): Promise<{ conversationId: string }> => {
  try {
    // Try to find existing conversation
    const listRes = await apiClient.get('/messages/conversations');
    const inner = unwrapData<any>(listRes.data);
    const conversations: any[] = Array.isArray(inner)
      ? inner
      : Array.isArray(inner?.conversations)
      ? inner.conversations
      : [];

    const existing = conversations.find(
      (c: any) =>
        String(c.doctor_id) === String(doctorId) ||
        String(c.other_user_id) === String(doctorId)
    );
    if (existing) return { conversationId: String(existing.id) };

    // Create a new conversation
    const createRes = await apiClient.post('/messages/conversations', {
      participant_id: doctorId,
    });
    const created = unwrapData<any>(createRes.data);
    return { conversationId: String(created?.id ?? created?.conversation_id ?? '') };
  } catch {
    return { conversationId: '' };
  }
};

// -------------------------------------------------------
// Fetch chat messages for a conversation
// -------------------------------------------------------
export const fetchChatMessagesApi = async (
  doctorId: string,
  currentUserId?: string
): Promise<ChatMessage[]> => {
  try {
    const { conversationId } = await getOrCreateConversationApi(doctorId);
    if (!conversationId) return INITIAL_CHAT_MESSAGES;

    const response = await apiClient.get(`/messages/conversations/${conversationId}`);
    const inner = unwrapData<any>(response.data);
    const rawMessages: any[] = Array.isArray(inner)
      ? inner
      : Array.isArray(inner?.messages)
      ? inner.messages
      : [];

    return rawMessages.length > 0
      ? rawMessages.map((m) => transformBackendMessage(m, currentUserId))
      : INITIAL_CHAT_MESSAGES;
  } catch {
    return INITIAL_CHAT_MESSAGES;
  }
};

// -------------------------------------------------------
// Send a text message via REST (fallback if Socket.IO not connected)
// Endpoint: POST /api/messages/conversations/:id/messages
// -------------------------------------------------------
export const sendChatMessageApi = async (
  doctorId: string,
  message: Partial<ChatMessage>,
  currentUserId?: string
): Promise<ChatMessage> => {
  const fallbackMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    sender: 'patient',
    text: message.text || '',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: message.type || 'text',
  };

  try {
    const { conversationId } = await getOrCreateConversationApi(doctorId);
    if (!conversationId) return fallbackMsg;

    const response = await apiClient.post(
      `/messages/conversations/${conversationId}/messages`,
      {
        content: message.text || '',
        message_type: message.type ?? 'text',
      }
    );
    const inner = unwrapData<any>(response.data);
    return inner ? transformBackendMessage(inner, currentUserId) : fallbackMsg;
  } catch {
    return fallbackMsg;
  }
};
