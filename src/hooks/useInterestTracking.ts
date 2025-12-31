import { useCallback, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Get or create session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('interest_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('interest_session_id', sessionId);
  }
  return sessionId;
};

// Check if this is a return visitor for a product
const getViewedProducts = (): string[] => {
  const viewed = localStorage.getItem('viewed_products');
  return viewed ? JSON.parse(viewed) : [];
};

const addViewedProduct = (productId: string) => {
  const viewed = getViewedProducts();
  if (!viewed.includes(productId)) {
    viewed.push(productId);
    localStorage.setItem('viewed_products', JSON.stringify(viewed));
  }
};

const isReturnVisitor = (productId: string): boolean => {
  return getViewedProducts().includes(productId);
};

interface TrackEventParams {
  productId: string;
  eventType: 'hover' | 'image_view' | 'price_focus' | 'description_read' | 'quantity_change' | 
             'add_to_cart_hover' | 'return_visit' | 'time_on_page' | 'scroll_depth' | 
             'add_to_cart' | 'checkout_intent' | 'comparison_view';
  value?: number;
  metadata?: Record<string, unknown>;
}

export const useInterestTracking = () => {
  const queryClient = useQueryClient();

  const trackEvent = useMutation({
    mutationFn: async ({ productId, eventType, value = 0, metadata = {} }: TrackEventParams) => {
      const sessionId = getSessionId();
      
      const { error } = await supabase
        .from('customer_interest_events')
        .insert([{
          session_id: sessionId,
          product_id: productId,
          event_type: eventType,
          event_value: value,
          metadata: JSON.parse(JSON.stringify(metadata)),
        }]);

      if (error) throw error;

      // Update session profile
      await updateSessionProfile(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-scores'] });
    },
  });

  return trackEvent;
};

// Update session profile with viewed products
const updateSessionProfile = async (productId: string) => {
  const sessionId = getSessionId();
  
  // Get current profile
  const { data: existing } = await supabase
    .from('session_interest_profiles')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (existing) {
    const productsViewed = existing.products_viewed || [];
    if (!productsViewed.includes(productId)) {
      productsViewed.push(productId);
      await supabase
        .from('session_interest_profiles')
        .update({ products_viewed: productsViewed })
        .eq('session_id', sessionId);
    }
  } else {
    await supabase
      .from('session_interest_profiles')
      .insert({
        session_id: sessionId,
        products_viewed: [productId],
        is_return_visitor: getViewedProducts().length > 0,
      });
  }
};

// Hook for tracking product card interactions
export const useProductCardTracking = (productId: string) => {
  const trackEvent = useInterestTracking();
  const hoverStartRef = useRef<number | null>(null);
  const hasTrackedHover = useRef(false);

  const onHoverStart = useCallback(() => {
    hoverStartRef.current = Date.now();
    hasTrackedHover.current = false;
  }, []);

  const onHoverEnd = useCallback(() => {
    if (hoverStartRef.current && !hasTrackedHover.current) {
      const duration = Date.now() - hoverStartRef.current;
      if (duration > 2000) { // Track hovers longer than 2 seconds
        trackEvent.mutate({
          productId,
          eventType: 'hover',
          value: duration,
          metadata: { source: 'product_card' },
        });
        hasTrackedHover.current = true;
      }
    }
    hoverStartRef.current = null;
  }, [productId, trackEvent]);

  return { onHoverStart, onHoverEnd };
};

// Hook for tracking product page interactions
export const useProductPageTracking = (productId: string | undefined) => {
  const trackEvent = useInterestTracking();
  const pageLoadRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);
  const hasTrackedReturn = useRef(false);
  const priceHoverStartRef = useRef<number | null>(null);
  const addToCartHoverRef = useRef<number | null>(null);

  useEffect(() => {
    if (!productId) return;

    pageLoadRef.current = Date.now();
    maxScrollRef.current = 0;

    // Check for return visit
    if (isReturnVisitor(productId) && !hasTrackedReturn.current) {
      trackEvent.mutate({
        productId,
        eventType: 'return_visit',
        value: 1,
      });
      hasTrackedReturn.current = true;
    }

    // Mark as viewed for future return detection
    addViewedProduct(productId);

    // Track scroll depth
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      maxScrollRef.current = Math.max(maxScrollRef.current, scrollPercent);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      
      // Track time on page and scroll depth on unmount
      const timeOnPage = Date.now() - pageLoadRef.current;
      if (timeOnPage > 5000) { // Only track if more than 5 seconds
        trackEvent.mutate({
          productId,
          eventType: 'time_on_page',
          value: timeOnPage,
        });
      }

      if (maxScrollRef.current > 25) {
        trackEvent.mutate({
          productId,
          eventType: 'scroll_depth',
          value: maxScrollRef.current,
        });
      }
    };
  }, [productId, trackEvent]);

  const trackImageView = useCallback(() => {
    if (!productId) return;
    trackEvent.mutate({
      productId,
      eventType: 'image_view',
      value: 1,
    });
  }, [productId, trackEvent]);

  const trackDescriptionRead = useCallback((readPercent: number) => {
    if (!productId) return;
    trackEvent.mutate({
      productId,
      eventType: 'description_read',
      value: readPercent,
    });
  }, [productId, trackEvent]);

  const trackQuantityChange = useCallback((newQty: number) => {
    if (!productId) return;
    trackEvent.mutate({
      productId,
      eventType: 'quantity_change',
      value: newQty,
    });
  }, [productId, trackEvent]);

  const onPriceHoverStart = useCallback(() => {
    priceHoverStartRef.current = Date.now();
  }, []);

  const onPriceHoverEnd = useCallback(() => {
    if (priceHoverStartRef.current && productId) {
      const duration = Date.now() - priceHoverStartRef.current;
      if (duration > 1500) {
        trackEvent.mutate({
          productId,
          eventType: 'price_focus',
          value: duration,
        });
      }
    }
    priceHoverStartRef.current = null;
  }, [productId, trackEvent]);

  const onAddToCartHoverStart = useCallback(() => {
    addToCartHoverRef.current = Date.now();
  }, []);

  const onAddToCartHoverEnd = useCallback((didClick: boolean) => {
    if (addToCartHoverRef.current && productId && !didClick) {
      const duration = Date.now() - addToCartHoverRef.current;
      if (duration > 1000) {
        trackEvent.mutate({
          productId,
          eventType: 'add_to_cart_hover',
          value: duration,
          metadata: { hesitation: true },
        });
      }
    }
    addToCartHoverRef.current = null;
  }, [productId, trackEvent]);

  const trackAddToCart = useCallback(() => {
    if (!productId) return;
    trackEvent.mutate({
      productId,
      eventType: 'add_to_cart',
      value: 1,
    });
  }, [productId, trackEvent]);

  const trackCheckoutIntent = useCallback(() => {
    if (!productId) return;
    trackEvent.mutate({
      productId,
      eventType: 'checkout_intent',
      value: 1,
    });
  }, [productId, trackEvent]);

  return {
    trackImageView,
    trackDescriptionRead,
    trackQuantityChange,
    trackAddToCart,
    trackCheckoutIntent,
    onPriceHoverStart,
    onPriceHoverEnd,
    onAddToCartHoverStart,
    onAddToCartHoverEnd,
  };
};
