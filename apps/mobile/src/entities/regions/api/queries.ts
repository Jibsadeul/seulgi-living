import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api/client';
import { sidoSchema, sigunguSchema } from './regions.schema';
import type { Sido, Sigungu } from '../model/type';

export async function getSidoList(): Promise<Sido[]> {
  return apiRequest('/api/regions/sido', sidoSchema.array());
}

export async function getSigunguList(sidoId: string): Promise<Sigungu[]> {
  const searchParams = new URLSearchParams({ sidoId });

  return apiRequest(`/api/regions/sigungu?${searchParams.toString()}`, sigunguSchema.array());
}

export function useSidoList() {
  return useQuery({ queryKey: ['sido'], queryFn: getSidoList });
}
