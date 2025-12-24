import ProductCard, { Product } from "./ProductCard";
import { Button } from "@/components/ui/button";

interface ProductSectionProps {
  title: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onViewMore?: () => void;
  highlighted?: boolean;
}

export default function ProductSection({
  title,
  products,
  onAddToCart,
  onProductClick,
  onViewMore,
  highlighted = false,
}: ProductSectionProps) {
  return (
    <section className={`py-3 sm:py-4 md:py-6 ${highlighted ? 'bg-white/10' : ''}`}>
      <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3 px-2 sm:px-4">
        <h2 className="text-sm sm:text-base md:text-lg font-bold text-white line-clamp-1">{title}</h2>
        {onViewMore && (
          <Button
            size="sm"
            variant="ghost"
            className="text-white p-0 h-auto text-[10px] sm:text-xs"
            onClick={onViewMore}
            data-testid={`button-view-more-${title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            MAIS
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-2 sm:gap-3 px-2 sm:px-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onProductClick={onProductClick}
          />
        ))}
      </div>
    </section>
  );
}
