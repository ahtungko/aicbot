import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Conversation, ConversationSettings, Model } from '@aicbot/shared';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.getConversations(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => api.getConversation(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      title,
      settings,
    }: {
      title: string;
      settings: ConversationSettings;
    }) => api.createConversation(title, settings),
    onSuccess: newConversation => {
      queryClient.setQueryData(
        ['conversations'],
        (old: Conversation[] | undefined) => {
          return old ? [newConversation, ...old] : [newConversation];
        }
      );
      queryClient.setQueryData(
        ['conversation', newConversation.id],
        newConversation
      );
    },
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Conversation>;
    }) => api.updateConversation(id, updates),
    onSuccess: updatedConversation => {
      queryClient.setQueryData(
        ['conversations'],
        (old: Conversation[] | undefined) => {
          if (!old) return old;
          return old.map(conv =>
            conv.id === updatedConversation.id ? updatedConversation : conv
          );
        }
      );
      queryClient.setQueryData(
        ['conversation', updatedConversation.id],
        updatedConversation
      );
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteConversation(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(
        ['conversations'],
        (old: Conversation[] | undefined) => {
          if (!old) return old;
          return old.filter(conv => conv.id !== deletedId);
        }
      );
      queryClient.removeQueries(['conversation', deletedId]);
    },
  });
}

export function useModels() {
  return useQuery({
    queryKey: ['models'],
    queryFn: () => api.getModels(),
    staleTime: 1000 * 60 * 30, // 30 minutes - models don't change often
  });
}
