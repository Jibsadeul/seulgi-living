import { z } from 'zod';

export const chatRoleSchema = z.enum(['user', 'model']);

export const chatMessageSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  role: chatRoleSchema,
  content: z.string(),
  createdAt: z.string(),
});

export const chatSessionSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastMessage: z.string().nullable(),
});

export const chatUserContextSchema = z.object({
  age: z.number().int().positive().nullable().optional(),
  residence: z.string().trim().min(1).nullable().optional(),
});

export const createChatSessionResponseSchema = z.object({
  session: chatSessionSchema,
});

export const chatSessionListResponseSchema = z.object({
  sessions: chatSessionSchema.array(),
});

export const chatSessionMessagesResponseSchema = z.object({
  session: chatSessionSchema,
  messages: chatMessageSchema.array(),
});

export const sendChatMessageRequestSchema = z.object({
  message: z.string().trim().min(1, '메시지를 입력해주세요.'),
  userContext: chatUserContextSchema.optional(),
});

export const sendChatMessageResponseSchema = z.object({
  userMessage: chatMessageSchema,
  modelMessage: chatMessageSchema,
  session: chatSessionSchema,
});

export const chatTestRequestSchema = z.object({
  message: z.string().trim().min(1, '메시지를 입력해주세요.'),
  userContext: chatUserContextSchema.optional(),
});

export const chatTestResponseSchema = z.object({
  message: z.string(),
  modelMessage: z.object({
    role: z.literal('model'),
    content: z.string(),
  }),
});

export type ChatRole = z.infer<typeof chatRoleSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatSession = z.infer<typeof chatSessionSchema>;
export type ChatUserContext = z.infer<typeof chatUserContextSchema>;
export type CreateChatSessionResponse = z.infer<typeof createChatSessionResponseSchema>;
export type ChatSessionListResponse = z.infer<typeof chatSessionListResponseSchema>;
export type ChatSessionMessagesResponse = z.infer<typeof chatSessionMessagesResponseSchema>;
export type SendChatMessageRequest = z.infer<typeof sendChatMessageRequestSchema>;
export type SendChatMessageResponse = z.infer<typeof sendChatMessageResponseSchema>;
export type ChatTestRequest = z.infer<typeof chatTestRequestSchema>;
export type ChatTestResponse = z.infer<typeof chatTestResponseSchema>;
