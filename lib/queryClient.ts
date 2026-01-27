import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
})
