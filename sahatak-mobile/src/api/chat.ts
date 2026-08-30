import { apiClient } from './client';
import { ChatMessage } from '../types';
import { INITIAL_CHAT_MESSAGES } from '../data/mockData';

export const fetchChatMessagesApi = async (doctorId: string): Promise<ChatMessage[]> => {
  try {
    const response = await apiClient.get(`/chat/messages/${doctorId}`);
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return INITIAL_CHAT_MESSAGES;
  } catch {
    return INITIAL_CHAT_MESSAGES;
  }
};

export const sendChatMessageApi = async (doctorId: string, message: Partial<ChatMessage>): Promise<ChatMessage> => {
  try {
    const response = await apiClient.post('/chat/messages', { doctorId, ...message });
    return response.data;
  } catch {
    return {
      id: `msg-${Date.now()}`,
      sender: 'patient',
      text: message.text || '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: message.type || 'text',
    };
  }
};

