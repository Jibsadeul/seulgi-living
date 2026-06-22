import { useQuery } from '@tanstack/react-query';
import {
  chatSessionListResponseSchema,
  chatSessionMessagesResponseSchema,
  type ChatSessionListResponse,
  type ChatSessionMessagesResponse,
} from '@repo/contract';
import { apiRequest } from '@/shared/api/client';
import { chatKeys } from './keys';

export async function getChatSessions(): Promise<ChatSessionListResponse> {
  return apiRequest('/api/ai/chat/sessions', chatSessionListResponseSchema);
}

export async function getChatSessionMessages(
  sessionId: string,
): Promise<ChatSessionMessagesResponse> {
  return apiRequest(`/api/ai/chat/sessions/${sessionId}`, chatSessionMessagesResponseSchema);
}

export function useChatSessions() {
  return useQuery<ChatSessionListResponse>({
    queryKey: chatKeys.sessions(),
    queryFn: getChatSessions,
  });
}

export function useChatSessionMessages(sessionId: string | null) {
  return useQuery<ChatSessionMessagesResponse>({
    queryKey: chatKeys.messages(sessionId ?? ''),
    queryFn: () => getChatSessionMessages(sessionId ?? ''),
    enabled: Boolean(sessionId),
  });
}
