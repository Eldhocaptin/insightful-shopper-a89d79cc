import { useState } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DBProduct } from '@/hooks/useProductsDB';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface QuickViewModalProps {
  product: DBProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QuickViewModal = ({ product, open, onOpenChange }: QuickViewModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images,
    }, quantity);
    toast({
      title: 'Added to cart',
      description: `${quantity}x ${product.name} has been added to your cart.`,
    });
    onOpenChange(false);
    setQuantity(1);
  };

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;

  const imageUrl = product.images?.[0] || '/placeholder.svg';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-background">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-0">
          {/* Product Image */}
          <div className="relative aspect-square bg-muted">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount && (
              <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm font-medium px-3 py-1.5 rounded-full">
                -{discount}%
              </span>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6 flex flex-col">
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
                  {product.category}
                </p>
                <h2 className="text-2xl font-bold">{product.name}</h2>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">
                  {formatPrice(Number(product.price))}
                </span>
                {product.original_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(Number(product.original_price))}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
                {product.description}
              </p>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 pt-2">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-6 border-t border-border mt-6">
              <Button
                size="lg"
                className="w-full gradient-primary shadow-glow"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart — {formatPrice(Number(product.price) * quantity)}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                asChild
                onClick={() => onOpenChange(false)}
              >
                <Link to={`/product/${product.id}`}>
                  View Full Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
