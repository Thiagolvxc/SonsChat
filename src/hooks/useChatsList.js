import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { subscribeChats } from '../services/chatService';

export function useChatsList(uid) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!uid) return undefined;
    return subscribeChats(
      uid,
      (rows) => {
        queryClient.setQueryData(['chats', uid], rows);
      },
      () => {
        queryClient.setQueryData(['chats', uid], []);
      }
    );
  }, [uid, queryClient]);

  return useQuery({
    queryKey: ['chats', uid],
    queryFn: () => Promise.resolve([]),
    enabled: Boolean(uid),
    staleTime: Infinity,
    gcTime: Infinity,
    initialData: [],
  });
}
