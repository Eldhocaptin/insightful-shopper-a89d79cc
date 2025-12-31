import { Skeleton } from '@/components/ui/skeleton';

const ProductCardSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Image skeleton */}
      <Skeleton className="aspect-square rounded-xl mb-4" />
      
      {/* Category */}
      <Skeleton className="h-3 w-16 mb-2" />
      
      {/* Product name */}
      <Skeleton className="h-5 w-3/4 mb-2" />
      
      {/* Price */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
