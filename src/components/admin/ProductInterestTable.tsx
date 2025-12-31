import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Eye, Users, ShoppingCart, Clock } from 'lucide-react';
import InterestLevelBadge from './InterestLevelBadge';
import { InterestScore } from '@/hooks/useInterestScores';
import { DBProduct } from '@/hooks/useProductsDB';
import { cn } from '@/lib/utils';

interface ProductInterestTableProps {
  scores: InterestScore[];
  products: DBProduct[];
  onProductClick?: (productId: string) => void;
}

const ProductInterestTable = ({ scores, products, onProductClick }: ProductInterestTableProps) => {
  // Create a map for quick product lookup
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Sort scores by interest_score descending
  const sortedScores = [...scores].sort((a, b) => b.interest_score - a.interest_score);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getTrendIcon = (score: InterestScore) => {
    // Simple trend based on return visitors vs unique sessions ratio
    if (score.unique_sessions === 0) return <Minus className="h-4 w-4 text-muted-foreground" />;
    const ratio = score.return_visitors / score.unique_sessions;
    if (ratio >= 0.3) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (ratio >= 0.1) return <Minus className="h-4 w-4 text-muted-foreground" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-500';
    if (score >= 45) return 'text-orange-500';
    if (score >= 20) return 'text-blue-500';
    return 'text-slate-500';
  };

  const getProgressColor = (level: string) => {
    switch (level) {
      case 'hot': return 'bg-red-500';
      case 'warm': return 'bg-orange-500';
      case 'cool': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  if (sortedScores.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No interest data yet</p>
        <p className="text-sm">Interest scores will appear as customers interact with products</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Product</TableHead>
            <TableHead className="w-[100px] text-center">Score</TableHead>
            <TableHead className="w-[120px]">Interest Level</TableHead>
            <TableHead className="w-[150px]">Interest Meter</TableHead>
            <TableHead className="text-center">Trend</TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Users className="h-4 w-4" />
                <span className="sr-only md:not-sr-only">Sessions</span>
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-1">
                <ShoppingCart className="h-4 w-4" />
                <span className="sr-only md:not-sr-only">Add to Cart</span>
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-4 w-4" />
                <span className="sr-only md:not-sr-only">Avg Time</span>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedScores.map((score) => {
            const product = productMap.get(score.product_id);
            if (!product) return null;

            return (
              <TableRow 
                key={score.product_id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onProductClick?.(score.product_id)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images?.[0] || '/placeholder.svg'}
                      alt={product.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn('text-2xl font-bold', getScoreColor(score.interest_score))}>
                    {score.interest_score}
                  </span>
                </TableCell>
                <TableCell>
                  <InterestLevelBadge level={score.interest_level as 'hot' | 'warm' | 'cool' | 'cold'} />
                </TableCell>
                <TableCell>
                  <div className="w-full">
                    <Progress 
                      value={score.interest_score} 
                      className="h-2"
                      style={{
                        ['--progress-background' as string]: getProgressColor(score.interest_level),
                      }}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {getTrendIcon(score)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center">
                    <span className="font-medium">{score.unique_sessions}</span>
                    {score.return_visitors > 0 && (
                      <span className="text-xs text-green-600">
                        +{score.return_visitors} returned
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center font-medium">
                  {score.total_add_to_cart}
                </TableCell>
                <TableCell className="text-center text-sm text-muted-foreground">
                  {formatTime(score.avg_time_on_page)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductInterestTable;
