import { z } from 'zod';

export const sidoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

export const sigunguSchema = z.object({
  id: z.string().min(1),
  sidoId: z.string().min(1),
  name: z.string().min(1),
});

export const sigunguListQuerySchema = z.object({
  sidoId: z.string().min(1),
});

export type Sido = z.infer<typeof sidoSchema>;
export type Sigungu = z.infer<typeof sigunguSchema>;
