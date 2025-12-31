import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeProducts = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          console.log('Realtime product update:', payload);
          
          // Invalidate and refetch products queries
          queryClient.invalidateQueries({ queryKey: ['products'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};

export const useRealtimeAnalytics = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('analytics-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_analytics',
        },
        (payload) => {
          console.log('Realtime analytics update:', payload);
          queryClient.invalidateQueries({ queryKey: ['product-analytics'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_interest_scores',
        },
        (payload) => {
          console.log('Realtime interest scores update:', payload);
          queryClient.invalidateQueries({ queryKey: ['interest-scores'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
