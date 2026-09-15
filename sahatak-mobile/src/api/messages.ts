/**
 * messages.ts
 * -----------
 * Typed API layer for the REAL production messaging contract
 * (backend/routes/messages.py of Sahatak-2, deployed at sahatak.pythonanywhere.com).
 *
 * Every route is @api_login_required (JWT Bearer via the shared axios client)
 * and every response is wrapped in the APIResponse envelope
 * { success, message, data, ... } — unwrapped with the Phase-1 `unwrap` helper.
 *
 * Field names below mirror models.py exactly:
 *   Conversation.to_dict(): id, patient_id, doctor_id, appointment_id, subject,
 *     status, created_at, updated_at, last_message_at, metadata, unread_count,
 *     participant_info: { patient: {id,name,avatar}, doctor: {id,name,specialty,avatar} }
 *   Message.to_dict(): id, conversation_id, sender_id, recipient_id, appointment_id,
 *     content, message_type, is_read, is_urgent, is_system_message, created_at,
 *     read_at, metadata, sender_info: {id,name,user_type}, appointment_info, attachments
 *   MessageAttachment.to_dict(): id, message_id, filename, file_type, file_size,
 *     mime_type, uploaded_at, is_image, download_url
 */

import apiClient, { ApiEnvelope, unwrap, ApiError } from './client';

// ---------------------------------------------------------------------------
// Raw backend shapes (exactly as serialized by models.py)
// ---------------------------------------------------------------------------

export type MessageContentType =
  | 'text'
  | 'image'
  | 'file'
  | 'appointment_request'
  | 'prescription_request'
  | 'urgent';

export interface Pagination {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface RawMessageAttachment {
  id: number;
  message_id: number;
  filename: string;
  file_type: string;
  file_size: number;
  mime_type?: string | null;
  uploaded_at: string;
  is_image: boolean;
  download_url: string;
}

export interface RawMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  recipient_id: number;
  appointment_id?: number | null;
  content: string;
  message_type: MessageContentType;
  is_read: boolean;
  is_urgent: boolean;
  is_system_message: boolean;
  created_at: string;
  read_at?: string | null;
  metadata?: Record<string, unknown> | null;
  sender_info: {
    id: number;
    name: string;
    user_type: 'patient' | 'doctor' | 'admin';
  };
  appointment_info?: Record<string, unknown> | null;
  attachments: RawMessageAttachment[];
}

export interface RawConversation {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_id?: number | null;
  subject?: string | null;
  status: 'active' | 'archived' | 'closed';
  created_at: string;
  updated_at: string;
  last_message_at?: string | null;
  metadata?: Record<string, unknown> | null;
  unread_count: number;
  participant_info: {
    patient: { id: number; name: string; avatar: string | null };
    doctor: { id: number; name: string; specialty?: string; avatar: string | null };
  };
  messages?: RawMessage[];
  has_more_messages?: boolean;
  pagination?: Pagination;
}

export interface RawQuickTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
}

export interface RawUnreadCount {
  total_unread: number;
  conversations_with_unread: {
    conversation_id: number;
    unread_count: number;
    last_message_at?: string | null;
  }[];
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

/** GET /messages/conversations — paginated list of the user's active conversations. */
export async function getConversationsApi(
  page = 1,
  perPage = 20,
): Promise<{ conversations: RawConversation[]; pagination?: Pagination }> {
  const response = await apiClient.get<
    ApiEnvelope<{ conversations: RawConversation[]; pagination: Pagination }>
  >('/messages/conversations', { params: { page, per_page: perPage } });
  const data = unwrap(response);
  return {
    conversations: data?.conversations ?? [],
    pagination: data?.pagination,
  };
}

/**
 * GET /messages/conversations/<id> — conversation details + paginated messages.
 * NOTE: the backend marks all of the current user's messages in this
 * conversation as read as a side effect of this call.
 */
export async function getConversationApi(
  conversationId: number | string,
  page = 1,
  perPage = 50,
): Promise<RawConversation> {
  const response = await apiClient.get<ApiEnvelope<RawConversation>>(
    `/messages/conversations/${conversationId}`,
    { params: { page, per_page: perPage } },
  );
  return unwrap(response);
}

/**
 * POST /messages/conversations — start (or get) a conversation.
 * For a patient: recipient_id must be the DOCTOR'S USER id (recipient_type 'user').
 * For a doctor: recipient_id is the patient's PROFILE id with recipient_type 'patient'.
 */
export async function startConversationApi(payload: {
  recipient_id: number | string;
  recipient_type?: 'user' | 'patient';
  subject?: string;
  appointment_id?: number | string;
}): Promise<RawConversation> {
  const response = await apiClient.post<
    ApiEnvelope<{ conversation: RawConversation }>
  >('/messages/conversations', payload);
  return unwrap(response).conversation;
}

/** POST /messages/conversations/<id>/messages — send a message in a conversation. */
export async function sendMessageApi(
  conversationId: number | string,
  payload: {
    content: string;
    message_type?: MessageContentType;
    is_urgent?: boolean;
    appointment_id?: number | string;
    metadata?: Record<string, unknown>;
  },
): Promise<RawMessage> {
  const response = await apiClient.post<ApiEnvelope<RawMessage>>(
    `/messages/conversations/${conversationId}/messages`,
    payload,
  );
  return unwrap(response);
}

/** PUT /messages/<id>/read — only the message's recipient may mark it read. */
export async function markMessageReadApi(
  messageId: number | string,
): Promise<{ message_id: number; read_at: string }> {
  const response = await apiClient.put<
    ApiEnvelope<{ message_id: number; read_at: string }>
  >(`/messages/${messageId}/read`);
  return unwrap(response);
}

/** GET /messages/search?q=... — full-text search over the user's conversations. */
export async function searchMessagesApi(
  query: string,
  options?: {
    conversationId?: number | string;
    page?: number;
    perPage?: number;
  },
): Promise<{ messages: RawMessage[]; search_query: string; pagination: Pagination }> {
  const response = await apiClient.get<
    ApiEnvelope<{ messages: RawMessage[]; search_query: string; pagination: Pagination }>
  >('/messages/search', {
    params: {
      q: query,
      ...(options?.conversationId ? { conversation_id: options.conversationId } : {}),
      page: options?.page ?? 1,
      per_page: options?.perPage ?? 20,
    },
  });
  return unwrap(response);
}

/** GET /messages/unread-count — { total_unread, conversations_with_unread }.
 * A 404 (endpoint not yet deployed) or any network/malformed-response error is
 * treated as "no unread messages" instead of throwing, so polling never breaks
 * the UI (HomeScreen previously white-screened when this 404'd). */
export async function getUnreadCountApi(): Promise<RawUnreadCount> {
  try {
    const response = await apiClient.get<ApiEnvelope<RawUnreadCount>>(
      '/messages/unread-count',
    );
    const data = unwrap(response);
    return {
      total_unread: data?.total_unread ?? 0,
      conversations_with_unread: data?.conversations_with_unread ?? [],
    };
  } catch (err) {
    console.warn('[messages] /messages/unread-count unavailable — treating as no unread:', err);
    return { total_unread: 0, conversations_with_unread: [] };
  }
}

/** PUT /messages/conversations/<id>/archive — archive a conversation. */
export async function archiveConversationApi(
  conversationId: number | string,
): Promise<{ conversation_id: number; status: 'archived' }> {
  const response = await apiClient.put<
    ApiEnvelope<{ conversation_id: number; status: 'archived' }>
  >(`/messages/conversations/${conversationId}/archive`);
  return unwrap(response);
}

/** GET /messages/quick-templates — role-based canned message templates. */
export async function getQuickTemplatesApi(): Promise<RawQuickTemplate[]> {
  const response = await apiClient.get<
    ApiEnvelope<RawQuickTemplate[] | { templates: RawQuickTemplate[] }>
  >('/messages/quick-templates');
  const data = unwrap(response);
  return Array.isArray(data)
    ? data
    : ((data as { templates?: RawQuickTemplate[] })?.templates ?? []);
}

/**
 * POST /messages/conversations/appointment/<id> — create (or get) the
 * conversation tied to a specific appointment. The backend seeds an initial
 * system message. Returns both the conversation and the appointment.
 */
export async function createAppointmentConversationApi(
  appointmentId: number | string,
): Promise<{ conversation: RawConversation; appointment: Record<string, unknown> }> {
  const response = await apiClient.post<
    ApiEnvelope<{ conversation: RawConversation; appointment: Record<string, unknown> }>
  >(`/messages/conversations/appointment/${appointmentId}`);
  return unwrap(response);
}

// ---------------------------------------------------------------------------
// Friendly error mapping (same pattern as Phase 1 login/register cleanup)
// ---------------------------------------------------------------------------

/**
 * Converts raw API/network errors from the messaging endpoints into a short,
 * user-friendly message. Accepts a language flag for bilingual apps.
 */
export function getFriendlyChatError(err: unknown, lang: 'en' | 'ar' = 'en'): string {
  const ar = lang === 'ar';
  if (err instanceof ApiError) {
    if (err.status === 401) {
      return ar
        ? 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.'
        : 'Your session has expired. Please sign in again.';
    }
    if (err.status === 403) {
      return ar
        ? 'لا يمكنك مراسلة هذا الطبيب. يمكنك المراسلة فقط مع الأطباء الذين لديك مواعيد أو محادثات معهم.'
        : "You can't message this doctor yet. Messaging is available for doctors you have appointments or conversations with.";
    }
    if (err.status === 404) {
      return ar
        ? 'لم يتم العثور على المحادثة أو الطبيب المطلوب.'
        : 'The conversation or doctor could not be found.';
    }
    if (err.status === 400 || err.status === 422) {
      return ar
        ? 'تعذر إرسال الرسالة. يرجى التحقق من المحتوى والمحاولة مرة أخرى.'
        : "The message couldn't be sent. Please check the content and try again.";
    }
    if (err.status != null && err.status >= 500) {
      return ar
        ? 'حدث خطأ في الخادم. يرجى المحاولة بعد قليل.'
        : 'Something went wrong on our side. Please try again in a moment.';
    }
    if (err.message) return err.message;
  }
  return ar
    ? 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.'
    : "Couldn't reach the server. Please check your internet connection.";
}