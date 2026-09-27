import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../api/healthApi';

export function useHealth() {
  return useQuery({
    queryKey: ['healthStatus'],
    queryFn: () => healthApi.checkHealth(),
    refetchInterval: 30000,
    retry: 1,
  });
}
