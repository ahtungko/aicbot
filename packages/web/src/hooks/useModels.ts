import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Model } from '@aicbot/shared';

export function useModels() {
  return useQuery<Model[], Error>({
    queryKey: ['models'],
    queryFn: () => api.getModels(),
    staleTime: 1000 * 60 * 30,
  });
}
