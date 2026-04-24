import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { subscribeMessages } from '../services/chatService';

/**
 * Hook para suscribir los mensajes de un chat en tiempo real.
 * @param {string} chatId
 */
export function useMessagesList(chatId) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!chatId) return undefined;
    return subscribeMessages(
      chatId,
      (rows) => {
        queryClient.setQueryData(['messages', chatId], rows);
      },
      () => {
        queryClient.setQueryData(['messages', chatId], []);
      }
    );
  }, [chatId, queryClient]);

  return useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => Promise.resolve([]),
    enabled: Boolean(chatId),
    staleTime: Infinity,
    gcTime: Infinity,
    initialData: [],
  });
}
