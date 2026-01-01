import { useState } from 'react';
import { Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight, Play } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface QuickViewModalProps {
  product: DBProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QuickViewModal = ({ product, open, onOpenChange }: QuickViewModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Reset when product changes
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
    setCurrentMediaIndex(0);
  };

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;

  // Combine images and videos
  const images = product.images || [];
  const videos = (product as any).videos || [];
  const allMedia = [
    ...images.map((url: string) => ({ type: 'image' as const, url })),
    ...videos.map((url: string) => ({ type: 'video' as const, url })),
  ];
  
  if (allMedia.length === 0) {
    allMedia.push({ type: 'image', url: '/placeholder.svg' });
  }

  const currentMedia = allMedia[currentMediaIndex] || allMedia[0];
  const hasMultipleMedia = allMedia.length > 1;

  const handlePrevious = () => {
    setCurrentMediaIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentMediaIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1));
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { 
      onOpenChange(open); 
      if (!open) {
        setCurrentMediaIndex(0);
        setQuantity(1);
      }
    }}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-background">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-0">
          {/* Product Media */}
          <div className="relative aspect-square bg-muted">
            {currentMedia.type === 'image' ? (
              <img
                src={currentMedia.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={currentMedia.url}
                className="w-full h-full object-cover"
                controls
                playsInline
                preload="metadata"
              />
            )}
            
            {discount && (
              <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm font-medium px-3 py-1.5 rounded-full z-10">
                -{discount}%
              </span>
            )}

            {/* Navigation Arrows */}
            {hasMultipleMedia && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-lg"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-lg"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Thumbnail dots */}
            {hasMultipleMedia && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allMedia.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMediaIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      currentMediaIndex === index
                        ? "bg-primary w-4"
                        : "bg-white/60 hover:bg-white/80"
                    )}
                  >
                    {media.type === 'video' && currentMediaIndex !== index && (
                      <Play className="h-1.5 w-1.5 text-transparent" />
                    )}
                  </button>
                ))}
              </div>
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
