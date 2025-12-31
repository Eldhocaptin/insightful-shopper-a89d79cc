import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useProduct } from '@/hooks/useProductsDB';
import { useProductPageTracking } from '@/hooks/useTracking';
import { useProductPageTracking as useInterestPageTracking } from '@/hooks/useInterestTracking';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';
import { formatPrice } from '@/lib/utils';

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(id || '');
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);
  
  // Original tracking
  const { trackImpression, trackAddToCart } = useProductPageTracking(id);
  
  // Enhanced interest tracking
  const { 
    trackImageView,
    trackQuantityChange,
    trackAddToCart: trackInterestAddToCart,
    onPriceHoverStart,
    onPriceHoverEnd,
    onAddToCartHoverStart,
    onAddToCartHoverEnd,
  } = useInterestPageTracking(id);

  useEffect(() => {
    if (product) {
      trackImpression();
    }
  }, [product, trackImpression]);

  if (isLoading) {
    return (
      <div className="container py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-semibold mb-4">Product not found</h1>
        <Link to="/" className="text-primary hover:underline">
          ← Back to shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images,
    }, quantity);
    trackAddToCart(quantity);
    trackInterestAddToCart();
    onAddToCartHoverEnd(true); // Mark as clicked
    toast({
      title: 'Added to cart',
      description: `${quantity}x ${product.name} has been added to your cart.`,
    });
  };

  const handleQuantityChange = (newQty: number) => {
    setQuantity(newQty);
    trackQuantityChange(newQty);
  };

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;

  const imageUrl = product.images?.[0] || '/placeholder.svg';

  return (
    <>
      <Helmet>
        <title>{`${product.name} | Dropzy`}</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="container py-8 md:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Image */}
          <div className="animate-fade-in">
            <div 
              className="relative aspect-square overflow-hidden rounded-2xl bg-muted/50 cursor-zoom-in"
              onClick={trackImageView}
            >
              <img
                src={imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {discount && (
                <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm font-medium px-3 py-1.5 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="animate-slide-up space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold mb-4">
                {product.name}
              </h1>
              <div 
                className="flex items-center gap-3"
                onMouseEnter={onPriceHoverStart}
                onMouseLeave={onPriceHoverEnd}
              >
                <span className="text-3xl font-semibold">
                  {formatPrice(Number(product.price))}
                </span>
                {product.original_price && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(Number(product.original_price))}
                  </span>
                )}
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            <div className="border-t border-b border-border py-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Quantity</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleQuantityChange(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Button
              ref={addToCartButtonRef}
              size="lg"
              className="w-full h-14 text-base gradient-primary shadow-glow"
              onClick={handleAddToCart}
              onMouseEnter={onAddToCartHoverStart}
              onMouseLeave={() => onAddToCartHoverEnd(false)}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Add to Cart — {formatPrice(Number(product.price) * quantity)}
            </Button>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground">Free Shipping</p>
                <p className="text-sm font-medium">Orders over ₹500</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground">Easy Returns</p>
                <p className="text-sm font-medium">30-day policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPage;
