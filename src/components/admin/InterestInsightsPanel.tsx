import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, TrendingUp, AlertTriangle, Target, Eye, RotateCcw } from 'lucide-react';
import { InterestScore } from '@/hooks/useInterestScores';
import { DBProduct } from '@/hooks/useProductsDB';
import { cn } from '@/lib/utils';

interface InterestInsightsPanelProps {
  scores: InterestScore[];
  products: DBProduct[];
}

interface Insight {
  type: 'success' | 'warning' | 'info' | 'tip';
  icon: React.ReactNode;
  title: string;
  description: string;
}

const InterestInsightsPanel = ({ scores, products }: InterestInsightsPanelProps) => {
  const productMap = new Map(products.map((p) => [p.id, p]));
  
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];

    // Find trending products (high return visitors)
    const highReturnProducts = scores.filter((s) => (s.return_visitors || 0) >= 3);
    if (highReturnProducts.length > 0) {
      const topReturning = highReturnProducts[0];
      const product = productMap.get(topReturning.product_id);
      if (product) {
        insights.push({
          type: 'success',
          icon: <TrendingUp className="h-5 w-5 text-green-500" />,
          title: `${product.name} is trending`,
          description: `${topReturning.return_visitors} people came back to look at this product again. Strong buying signal!`,
        });
      }
    }

    // Find high hesitation products
    const highHesitation = scores.filter((s) => (s.hesitation_score || 0) >= 30 && (s.unique_sessions || 0) >= 3);
    if (highHesitation.length > 0) {
      const topHesitation = highHesitation[0];
      const product = productMap.get(topHesitation.product_id);
      if (product) {
        insights.push({
          type: 'warning',
          icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
          title: `${product.name} has high hesitation`,
          description: `Many visitors hover on "Add to Cart" but don't click. Consider adjusting price or adding more details.`,
        });
      }
    }

    // Find products with strong buyer confidence
    const highConfidence = scores.filter((s) => (s.buyer_confidence || 0) >= 40 && (s.unique_sessions || 0) >= 2);
    if (highConfidence.length > 0) {
      const topConfidence = highConfidence[0];
      const product = productMap.get(topConfidence.product_id);
      if (product) {
        insights.push({
          type: 'success',
          icon: <Target className="h-5 w-5 text-green-500" />,
          title: `${product.name} has strong buyer intent`,
          description: `${topConfidence.buyer_confidence}% of viewers add this to cart. Consider promoting it more!`,
        });
      }
    }

    // Find products with high time on page
    const highEngagement = scores.filter((s) => (s.avg_time_on_page || 0) >= 60000); // 1+ minute
    if (highEngagement.length > 0) {
      const topEngagement = highEngagement[0];
      const product = productMap.get(topEngagement.product_id);
      if (product) {
        insights.push({
          type: 'info',
          icon: <Eye className="h-5 w-5 text-blue-500" />,
          title: `${product.name} captures attention`,
          description: `Visitors spend over ${Math.round((topEngagement.avg_time_on_page || 0) / 60000)} minute on average. Great product description!`,
        });
      }
    }

    // Find cold products with some views
    const coldWithViews = scores.filter((s) => 
      s.interest_level === 'cold' && (s.unique_sessions || 0) >= 5
    );
    if (coldWithViews.length > 0) {
      const product = productMap.get(coldWithViews[0].product_id);
      if (product) {
        insights.push({
          type: 'warning',
          icon: <RotateCcw className="h-5 w-5 text-amber-500" />,
          title: `${product.name} needs attention`,
          description: `${coldWithViews[0].unique_sessions || 0} visitors viewed but showed low interest. Consider updating images or description.`,
        });
      }
    }

    // General tips
    if (scores.length === 0) {
      insights.push({
        type: 'tip',
        icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
        title: 'Getting started',
        description: 'Interest data will appear as customers browse your products. Check back soon!',
      });
    } else if (scores.every((s) => s.interest_level === 'cold')) {
      insights.push({
        type: 'tip',
        icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
        title: 'Boost engagement',
        description: 'All products are currently "Cold". Try improving product images or descriptions to increase interest.',
      });
    }

    // Add a general tip about return visitors
    const totalReturnVisitors = scores.reduce((sum, s) => sum + (s.return_visitors || 0), 0);
    if (totalReturnVisitors > 0) {
      insights.push({
        type: 'tip',
        icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
        title: 'Return visitor insight',
        description: `You have ${totalReturnVisitors} return visitors across all products. These are your most likely buyers!`,
      });
    }

    return insights.slice(0, 5); // Max 5 insights
  };

  const insights = generateInsights();

  const getCardClassName = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-500/20 bg-green-500/5';
      case 'warning':
        return 'border-amber-500/20 bg-amber-500/5';
      case 'info':
        return 'border-blue-500/20 bg-blue-500/5';
      case 'tip':
        return 'border-yellow-500/20 bg-yellow-500/5';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Key Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No insights available yet. Check back as more data is collected.
          </p>
        ) : (
          insights.map((insight, index) => (
            <div
              key={index}
              className={cn(
                'p-4 rounded-lg border',
                getCardClassName(insight.type)
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{insight.icon}</div>
                <div>
                  <p className="font-medium">{insight.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default InterestInsightsPanel;
