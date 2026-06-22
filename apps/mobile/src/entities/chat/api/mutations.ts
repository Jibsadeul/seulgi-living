import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createChatSessionResponseSchema,
  sendChatMessageRequestSchema,
  sendChatMessageResponseSchema,
  type ChatUserContext,
  type CreateChatSessionResponse,
  type SendChatMessageResponse,
} from '@repo/contract';
import { apiRequest } from '@/shared/api/client';
import { chatKeys } from './keys';

export async function createChatSession(): Promise<CreateChatSessionResponse> {
  return apiRequest('/api/ai/chat/sessions', createChatSessionResponseSchema, {
    method: 'POST',
  });
}

export async function sendChatMessage(
  sessionId: string,
  message: string,
  userContext?: ChatUserContext,
): Promise<SendChatMessageResponse> {
  const body = sendChatMessageRequestSchema.parse({ message, userContext });

  return apiRequest(`/api/ai/chat/sessions/${sessionId}/messages`, sendChatMessageResponseSchema, {
    method: 'POST',
    body,
  });
}

export function useCreateChatSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createChatSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.sessions() });
    },
  });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      message,
      userContext,
    }: {
      sessionId: string;
      message: string;
      userContext?: ChatUserContext;
    }) => sendChatMessage(sessionId, message, userContext),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(data.session.id) });
    },
  });
}
