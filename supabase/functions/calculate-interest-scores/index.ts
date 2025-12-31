import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Signal weights for scoring algorithm
const SIGNAL_WEIGHTS: Record<string, number> = {
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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting interest score calculation...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all events from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: events, error: eventsError } = await supabase
      .from("customer_interest_events")
      .select("*")
      .gte("created_at", thirtyDaysAgo.toISOString());

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      throw eventsError;
    }

    console.log(`Found ${events?.length || 0} events to process`);

    // Get all products
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id");

    if (productsError) {
      console.error("Error fetching products:", productsError);
      throw productsError;
    }

    console.log(`Processing ${products?.length || 0} products`);

    // Calculate scores for each product
    const scores = (products || []).map((product) => {
      const productEvents = (events || []).filter((e) => e.product_id === product.id);
      
      let totalScore = 0;
      let hesitationEvents = 0;
      let addToCartCount = 0;
      let totalTimeOnPage = 0;
      let hoverCount = 0;

      const uniqueSessions = new Set<string>();
      const returnVisitors = new Set<string>();

      productEvents.forEach((event) => {
        uniqueSessions.add(event.session_id);
        
        const weight = SIGNAL_WEIGHTS[event.event_type] || 0;
        const decay = calculateDecay(event.created_at);
        
        // Normalize event value
        let normalizedValue = 1;
        if (event.event_type === "time_on_page") {
          normalizedValue = Math.min(Number(event.event_value) / 120000, 1);
          totalTimeOnPage += Number(event.event_value);
        } else if (event.event_type === "scroll_depth") {
          normalizedValue = Number(event.event_value) / 100;
        } else if (event.event_type === "hover") {
          normalizedValue = Math.min(Number(event.event_value) / 10000, 1);
          hoverCount++;
        }

        totalScore += weight * normalizedValue * decay;

        if (event.event_type === "add_to_cart_hover") {
          hesitationEvents++;
        }
        if (event.event_type === "add_to_cart") {
          addToCartCount++;
        }
        if (event.event_type === "return_visit") {
          returnVisitors.add(event.session_id);
        }
      });

      // Normalize to 0-100 scale
      const maxPossibleScore = Object.values(SIGNAL_WEIGHTS).reduce((a, b) => a + b, 0);
      const interestScore = Math.min(Math.round((totalScore / maxPossibleScore) * 100), 100);

      // Determine interest level
      let interestLevel: string;
      if (interestScore >= 70) {
        interestLevel = "hot";
      } else if (interestScore >= 45) {
        interestLevel = "warm";
      } else if (interestScore >= 20) {
        interestLevel = "cool";
      } else {
        interestLevel = "cold";
      }

      const buyerConfidence = uniqueSessions.size > 0 
        ? Math.round((addToCartCount / uniqueSessions.size) * 100)
        : 0;

      const hesitationScore = productEvents.length > 0
        ? Math.round((hesitationEvents / productEvents.length) * 100)
        : 0;

      return {
        product_id: product.id,
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
    });

    console.log(`Calculated ${scores.length} scores, upserting...`);

    // Upsert all scores
    for (const score of scores) {
      const { error } = await supabase
        .from("customer_interest_scores")
        .upsert(score, { onConflict: "product_id" });

      if (error) {
        console.error(`Error upserting score for product ${score.product_id}:`, error);
      }
    }

    console.log("Interest score calculation complete!");

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: scores.length,
        summary: {
          hot: scores.filter(s => s.interest_level === "hot").length,
          warm: scores.filter(s => s.interest_level === "warm").length,
          cool: scores.filter(s => s.interest_level === "cool").length,
          cold: scores.filter(s => s.interest_level === "cold").length,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in calculate-interest-scores:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
