'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { watchlistService } from '../services/watchlistService';
import { AddToWatchlistRequest } from '../types/watchlist';

export const useWatchlist = () => {
  return useQuery({
    queryKey: ['watchlist'],
    queryFn: () => watchlistService.getWatchlist(),
    staleTime: 1 * 60 * 1000,
  });
};

export const useAddToWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AddToWatchlistRequest) => watchlistService.addToWatchlist(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
};

export const useRemoveFromWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) => watchlistService.removeFromWatchlist(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
};
