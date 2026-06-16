import type { z } from 'zod';
import type { sidoSchema, sigunguSchema } from '../api/regions.schema';

export type Sido = z.infer<typeof sidoSchema>;
export type Sigungu = z.infer<typeof sigunguSchema>;
