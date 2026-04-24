import { QueryClient } from '@tanstack/react-query';

/**
 * Cliente de React Query compartido para todas las consultas de datos.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});
