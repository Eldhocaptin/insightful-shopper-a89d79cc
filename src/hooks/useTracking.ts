import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCallback, useEffect, useRef } from 'react';

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('tracking_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('tracking_session_id', sessionId);
  }
  return sessionId;
};

export const useTrackEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      eventType,
      value,
    }: {
      productId: string;
      eventType: string;
      value?: number;
    }) => {
      const sessionId = getSessionId();

      // Insert tracking event
      const { error: eventError } = await supabase.from('tracking_events').insert({
        product_id: productId,
        event_type: eventType,
        value,
        session_id: sessionId,
      });

      if (eventError) throw eventError;

      // Update aggregated analytics
      const updateField = getAnalyticsField(eventType);
      if (updateField) {
        // Get current analytics
        const { data: analytics } = await supabase
          .from('product_analytics')
          .select('*')
          .eq('product_id', productId)
          .maybeSingle();

        if (analytics) {
          const updates: Record<string, number> = {};
          
          if (updateField === 'impressions') {
            updates.impressions = (analytics.impressions || 0) + 1;
          } else if (updateField === 'clicks') {
            updates.clicks = (analytics.clicks || 0) + 1;
          } else if (updateField === 'add_to_cart_count') {
            updates.add_to_cart_count = (analytics.add_to_cart_count || 0) + 1;
          } else if (updateField === 'checkout_intents') {
            updates.checkout_intents = (analytics.checkout_intents || 0) + 1;
          } else if (updateField === 'time_on_page' && value) {
            updates.total_time_on_page = (analytics.total_time_on_page || 0) + value;
            updates.view_count = (analytics.view_count || 0) + 1;
          } else if (updateField === 'scroll_depth' && value) {
            updates.total_scroll_depth = (analytics.total_scroll_depth || 0) + value;
          }

          if (Object.keys(updates).length > 0) {
            await supabase
              .from('product_analytics')
              .update(updates)
              .eq('product_id', productId);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-analytics'] });
    },
  });
};

const getAnalyticsField = (eventType: string): string | null => {
  switch (eventType) {
    case 'impression':
      return 'impressions';
    case 'click':
      return 'clicks';
    case 'addToCart':
      return 'add_to_cart_count';
    case 'checkoutIntent':
      return 'checkout_intents';
    case 'timeOnPage':
      return 'time_on_page';
    case 'scroll':
      return 'scroll_depth';
    default:
      return null;
  }
};

export const useProductPageTracking = (productId: string | undefined) => {
  const trackEvent = useTrackEvent();
  const scrollDepthRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const hasTrackedImpression = useRef(false);

  const trackImpression = useCallback(() => {
    if (productId && !hasTrackedImpression.current) {
      hasTrackedImpression.current = true;
      trackEvent.mutate({ productId, eventType: 'impression' });
    }
  }, [productId, trackEvent]);

  const trackClick = useCallback(() => {
    if (productId) {
      trackEvent.mutate({ productId, eventType: 'click' });
    }
  }, [productId, trackEvent]);

  const trackAddToCart = useCallback((quantity: number = 1) => {
    if (productId) {
      trackEvent.mutate({ productId, eventType: 'addToCart', value: quantity });
    }
  }, [productId, trackEvent]);

  const trackCheckoutIntent = useCallback((quantity: number = 1) => {
    if (productId) {
      trackEvent.mutate({ productId, eventType: 'checkoutIntent', value: quantity });
    }
  }, [productId, trackEvent]);

  // Track scroll depth
  useEffect(() => {
    if (!productId) return;

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const depth = docHeight > 0 ? Math.round((scrolled / docHeight) * 100) : 0;
      if (depth > scrollDepthRef.current) {
        scrollDepthRef.current = depth;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [productId]);

  // Track time on page and scroll depth on unmount
  useEffect(() => {
    if (!productId) return;
    
    startTimeRef.current = Date.now();
    scrollDepthRef.current = 0;
    hasTrackedImpression.current = false;

    return () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 0) {
        trackEvent.mutate({ productId, eventType: 'timeOnPage', value: timeSpent });
      }
      if (scrollDepthRef.current > 0) {
        trackEvent.mutate({ productId, eventType: 'scroll', value: scrollDepthRef.current });
      }
    };
  }, [productId]);

  return {
    trackImpression,
    trackClick,
    trackAddToCart,
    trackCheckoutIntent,
  };
};
