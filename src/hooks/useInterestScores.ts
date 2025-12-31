import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface InterestScore {
  id: string;
  product_id: string;
  interest_score: number;
  interest_level: 'hot' | 'warm' | 'cool' | 'cold';
  buyer_confidence: number;
  hesitation_score: number;
  unique_sessions: number;
  return_visitors: number;
  avg_time_on_page: number;
  total_hovers: number;
  total_add_to_cart: number;
  updated_at: string;
}

export interface InterestEvent {
  id: string;
  session_id: string;
  product_id: string;
  event_type: string;
  event_value: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Fetch all interest scores
export const useInterestScores = () => {
  return useQuery({
    queryKey: ['interest-scores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_interest_scores')
        .select('*')
        .order('interest_score', { ascending: false });

      if (error) throw error;
      return data as InterestScore[];
    },
  });
};

// Fetch interest events for a specific product
export const useProductInterestEvents = (productId: string) => {
  return useQuery({
    queryKey: ['interest-events', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_interest_events')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as InterestEvent[];
    },
    enabled: !!productId,
  });
};

// Get aggregated event stats for a product
export const useProductInterestStats = (productId: string) => {
  return useQuery({
    queryKey: ['interest-stats', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_interest_events')
        .select('event_type, event_value')
        .eq('product_id', productId);

      if (error) throw error;

      // Aggregate by event type
      const stats: Record<string, { count: number; totalValue: number }> = {};
      (data || []).forEach((event) => {
        if (!stats[event.event_type]) {
          stats[event.event_type] = { count: 0, totalValue: 0 };
        }
        stats[event.event_type].count += 1;
        stats[event.event_type].totalValue += Number(event.event_value) || 0;
      });

      return stats;
    },
    enabled: !!productId,
  });
};

// Get interest overview (count by level)
export const useInterestOverview = () => {
  return useQuery({
    queryKey: ['interest-overview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_interest_scores')
        .select('interest_level');

      if (error) throw error;

      const counts = { hot: 0, warm: 0, cool: 0, cold: 0 };
      (data || []).forEach((item) => {
        const level = item.interest_level as keyof typeof counts;
        if (counts[level] !== undefined) {
          counts[level]++;
        }
      });

      return counts;
    },
  });
};

// Calculate scores for all products
export const useCalculateInterestScores = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Get all events from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: events, error: eventsError } = await supabase
        .from('customer_interest_events')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (eventsError) throw eventsError;

      // Get all products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id');

      if (productsError) throw productsError;

      // Calculate scores for each product
      const scores = products.map((product) => {
        const productEvents = (events || []).filter((e) => e.product_id === product.id) as InterestEvent[];
        return calculateProductScore(product.id, productEvents);
      });

      // Upsert scores
      for (const score of scores) {
        const { error } = await supabase
          .from('customer_interest_scores')
          .upsert(score, { onConflict: 'product_id' });

        if (error) throw error;
      }

      return scores;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-scores'] });
      queryClient.invalidateQueries({ queryKey: ['interest-overview'] });
    },
  });
};

// Signal weights for scoring
const SIGNAL_WEIGHTS = {
  add_to_cart: 25,
  checkout_intent: 20,
  return_visit: 15,
  time_on_page: 12,
  hover: 10,
  scroll_depth: 8,
  quantity_change: 5,
  comparison_view: 3,
  description_read: 2,
  image_view: 3,
  price_focus: 4,
  add_to_cart_hover: 6,
};

// Calculate temporal decay factor
const calculateDecay = (createdAt: string): number => {
  const daysOld = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return Math.exp(-0.1 * daysOld); // 10% decay per day
};

// Calculate score for a single product
const calculateProductScore = (productId: string, events: InterestEvent[]) => {
  let totalScore = 0;
  let totalWeight = 0;
  let hesitationEvents = 0;
  let addToCartCount = 0;
  let totalTimeOnPage = 0;
  let hoverCount = 0;

  const uniqueSessions = new Set<string>();
  const returnVisitors = new Set<string>();

  events.forEach((event) => {
    uniqueSessions.add(event.session_id);
    
    const weight = SIGNAL_WEIGHTS[event.event_type as keyof typeof SIGNAL_WEIGHTS] || 0;
    const decay = calculateDecay(event.created_at);
    
    // Normalize event value
    let normalizedValue = 1;
    if (event.event_type === 'time_on_page') {
      normalizedValue = Math.min(Number(event.event_value) / 120000, 1); // Max 2 minutes
      totalTimeOnPage += Number(event.event_value);
    } else if (event.event_type === 'scroll_depth') {
      normalizedValue = Number(event.event_value) / 100;
    } else if (event.event_type === 'hover') {
      normalizedValue = Math.min(Number(event.event_value) / 10000, 1); // Max 10 seconds
      hoverCount++;
    }

    totalScore += weight * normalizedValue * decay;
    totalWeight += weight;

    // Track specific metrics
    if (event.event_type === 'add_to_cart_hover') {
      hesitationEvents++;
    }
    if (event.event_type === 'add_to_cart') {
      addToCartCount++;
    }
    if (event.event_type === 'return_visit') {
      returnVisitors.add(event.session_id);
    }
  });

  // Normalize to 0-100 scale
  const maxPossibleScore = Object.values(SIGNAL_WEIGHTS).reduce((a, b) => a + b, 0);
  const interestScore = Math.min(Math.round((totalScore / maxPossibleScore) * 100), 100);

  // Determine interest level
  let interestLevel: 'hot' | 'warm' | 'cool' | 'cold';
  if (interestScore >= 70) {
    interestLevel = 'hot';
  } else if (interestScore >= 45) {
    interestLevel = 'warm';
  } else if (interestScore >= 20) {
    interestLevel = 'cool';
  } else {
    interestLevel = 'cold';
  }

  // Calculate buyer confidence (ratio of add-to-cart to unique sessions)
  const buyerConfidence = uniqueSessions.size > 0 
    ? Math.round((addToCartCount / uniqueSessions.size) * 100)
    : 0;

  // Calculate hesitation score
  const hesitationScore = events.length > 0
    ? Math.round((hesitationEvents / events.length) * 100)
    : 0;

  return {
    product_id: productId,
    interest_score: interestScore,
    interest_level: interestLevel,
    buyer_confidence: buyerConfidence,
    hesitation_score: hesitationScore,
    unique_sessions: uniqueSessions.size,
    return_visitors: returnVisitors.size,
    avg_time_on_page: uniqueSessions.size > 0 ? Math.round(totalTimeOnPage / uniqueSessions.size) : 0,
    total_hovers: hoverCount,
    total_add_to_cart: addToCartCount,
  };
};
