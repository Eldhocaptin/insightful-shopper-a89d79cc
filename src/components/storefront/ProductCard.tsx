import { Link } from 'react-router-dom';
import { ShoppingBag, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DBProduct } from '@/hooks/useProductsDB';
import { useCart } from '@/contexts/CartContext';
import { useTrackEvent } from '@/hooks/useTracking';
import { useProductCardTracking } from '@/hooks/useInterestTracking';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: DBProduct;
  onQuickView?: (product: DBProduct) => void;
}

const ProductCard = ({ product, onQuickView }: ProductCardProps) => {
  const { addToCart } = useCart();
  const trackEvent = useTrackEvent();
  const { onHoverStart, onHoverEnd } = useProductCardTracking(product.id);
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images,
    });
    trackEvent.mutate({ productId: product.id, eventType: 'addToCart', value: 1 });
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleClick = () => {
    trackEvent.mutate({ productId: product.id, eventType: 'click' });
  };

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;

  const imageUrl = product.images?.[0] || '/placeholder.svg';

  return (
    <Link
      to={`/product/${product.id}`}
      onClick={handleClick}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className="group block animate-fade-in"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted/50 mb-4">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {discount && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
        
        {/* Action Buttons */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          {onQuickView && (
            <Button
              variant="secondary"
              size="icon"
              className="opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-elegant"
              onClick={handleQuickView}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="secondary"
            size="icon"
            className="opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-elegant delay-75"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {product.category}
        </p>
        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{formatPrice(Number(product.price))}</span>
          {product.original_price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(Number(product.original_price))}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
