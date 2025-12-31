import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Users, RotateCcw, Clock, ShoppingCart, MousePointer, Scroll, ImageIcon } from 'lucide-react';
import InterestLevelBadge from './InterestLevelBadge';
import { InterestScore, useProductInterestStats } from '@/hooks/useInterestScores';
import { DBProduct } from '@/hooks/useProductsDB';

interface ProductInterestDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: InterestScore | null;
  product: DBProduct | null;
}

const ProductInterestDetail = ({ open, onOpenChange, score, product }: ProductInterestDetailProps) => {
  const { data: stats } = useProductInterestStats(score?.product_id || '');

  if (!score || !product) return null;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Calculate signal contributions
  const signalContributions = [
    { 
      name: 'Add to Cart', 
      weight: 25, 
      count: stats?.add_to_cart?.count || 0,
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    { 
      name: 'Checkout Intent', 
      weight: 20, 
      count: stats?.checkout_intent?.count || 0,
      icon: ShoppingCart,
      color: 'bg-emerald-500',
    },
    { 
      name: 'Return Visits', 
      weight: 15, 
      count: score.return_visitors || 0,
      icon: RotateCcw,
      color: 'bg-purple-500',
    },
    { 
      name: 'Time on Page', 
      weight: 12, 
      count: stats?.time_on_page?.count || 0,
      icon: Clock,
      color: 'bg-blue-500',
    },
    { 
      name: 'Hover Duration', 
      weight: 10, 
      count: score.total_hovers || 0,
      icon: MousePointer,
      color: 'bg-orange-500',
    },
    { 
      name: 'Scroll Depth', 
      weight: 8, 
      count: stats?.scroll_depth?.count || 0,
      icon: Scroll,
      color: 'bg-cyan-500',
    },
    { 
      name: 'Image Views', 
      weight: 3, 
      count: stats?.image_view?.count || 0,
      icon: ImageIcon,
      color: 'bg-pink-500',
    },
  ];

  const getLevelExplanation = () => {
    switch (score.interest_level) {
      case 'hot':
        return "This product is generating strong interest! Customers are actively considering purchase.";
      case 'warm':
        return "Good interest level. With a small push (discount, better images), this could convert.";
      case 'cool':
        return "Some interest but needs work. Consider improving product description or pricing.";
      case 'cold':
        return "Low interest so far. May need significant changes to attract customers.";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <img
              src={product.images?.[0] || '/placeholder.svg'}
              alt={product.name}
              className="h-12 w-12 rounded-lg object-cover"
            />
            <div>
              <span>{product.name}</span>
              <p className="text-sm text-muted-foreground font-normal">{product.category}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Score Overview */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm text-muted-foreground">Interest Score</p>
              <p className="text-4xl font-bold">{score.interest_score}</p>
            </div>
            <div className="text-right">
              <InterestLevelBadge level={score.interest_level as 'hot' | 'warm' | 'cool' | 'cold'} size="lg" />
              <p className="text-sm text-muted-foreground mt-2 max-w-[250px]">
                {getLevelExplanation()}
              </p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Eye className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">{score.unique_sessions || 0}</p>
                <p className="text-xs text-muted-foreground">Unique Visitors</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <RotateCcw className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">{score.return_visitors || 0}</p>
                <p className="text-xs text-muted-foreground">Came Back Again</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{formatTime(score.avg_time_on_page || 0)}</p>
                <p className="text-xs text-muted-foreground">Avg. View Time</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{score.total_add_to_cart || 0}</p>
                <p className="text-xs text-muted-foreground">Added to Cart</p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-2">Buyer Confidence</p>
                <div className="flex items-center gap-3">
                  <Progress value={score.buyer_confidence || 0} className="flex-1" />
                  <span className="text-sm font-bold">{score.buyer_confidence || 0}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  % of visitors who add to cart
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-2">Hesitation Score</p>
                <div className="flex items-center gap-3">
                  <Progress 
                    value={score.hesitation_score || 0} 
                    className="flex-1"
                  />
                  <span className="text-sm font-bold">{score.hesitation_score || 0}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Hover on button without clicking
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Signal Breakdown */}
          <div>
            <h4 className="font-medium mb-3">What's driving the interest?</h4>
            <div className="space-y-3">
              {signalContributions
                .filter((s) => s.count > 0)
                .sort((a, b) => (b.count * b.weight) - (a.count * a.weight))
                .map((signal) => {
                  const maxContribution = 100;
                  const contribution = Math.min((signal.count * signal.weight) / 5, maxContribution);
                  
                  return (
                    <div key={signal.name} className="flex items-center gap-3">
                      <signal.icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{signal.name}</span>
                          <span className="text-muted-foreground">{signal.count} events</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${signal.color} rounded-full transition-all`}
                            style={{ width: `${contribution}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              {signalContributions.every((s) => s.count === 0) && (
                <p className="text-sm text-muted-foreground">
                  No detailed signal data yet. Check back as more interactions are recorded.
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductInterestDetail;
