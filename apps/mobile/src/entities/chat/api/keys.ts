export const chatKeys = {
  all: ['chat'] as const,
  sessions: () => [...chatKeys.all, 'sessions'] as const,
  messages: (sessionId: string) => [...chatKeys.all, 'sessions', sessionId, 'messages'] as const,
};
