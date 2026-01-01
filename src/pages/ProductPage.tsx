import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingBag, Loader2, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useProduct } from '@/hooks/useProductsDB';
import { useProductPageTracking } from '@/hooks/useTracking';
import { useProductPageTracking as useInterestPageTracking } from '@/hooks/useInterestTracking';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(id || '');
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
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

  // Reset media index when product changes
  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [id]);

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

  // Combine images and videos into a single media array
  const images = product.images || [];
  const videos = (product as any).videos || [];
  const allMedia = [
    ...images.map((url: string) => ({ type: 'image' as const, url })),
    ...videos.map((url: string) => ({ type: 'video' as const, url })),
  ];
  
  // Fallback if no media
  if (allMedia.length === 0) {
    allMedia.push({ type: 'image', url: '/placeholder.svg' });
  }

  const currentMedia = allMedia[currentMediaIndex];
  const hasMultipleMedia = allMedia.length > 1;

  const handlePrevious = () => {
    setCurrentMediaIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
    trackImageView();
  };

  const handleNext = () => {
    setCurrentMediaIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1));
    trackImageView();
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentMediaIndex(index);
    trackImageView();
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images,
    }, quantity);
    trackAddToCart(quantity);
    trackInterestAddToCart();
    onAddToCartHoverEnd(true);
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
          {/* Product Media Gallery */}
          <div className="animate-fade-in space-y-4">
            {/* Main Media Display */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/50">
              {currentMedia.type === 'image' ? (
                <img
                  src={currentMedia.url}
                  alt={product.name}
                  className="h-full w-full object-cover cursor-zoom-in"
                  onClick={trackImageView}
                />
              ) : (
                <video
                  ref={videoRef}
                  src={currentMedia.url}
                  className="h-full w-full object-cover"
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-lg"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-lg"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}

              {/* Media Counter */}
              {hasMultipleMedia && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium">
                  {currentMediaIndex + 1} / {allMedia.length}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {hasMultipleMedia && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {allMedia.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={cn(
                      "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                      currentMediaIndex === index
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-muted-foreground/30"
                    )}
                  >
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full bg-muted">
                        <video
                          src={media.url}
                          className="w-full h-full object-cover"
                          muted
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="h-6 w-6 text-white fill-white" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
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
                <p className="text-sm font-medium">7-day policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPage;
