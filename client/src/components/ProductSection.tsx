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
    <section className={`py-6 ${highlighted ? 'bg-white/10' : ''}`}>
      <div className="flex items-center justify-between gap-3 mb-3 px-4">
        <h2 className="text-lg font-bold text-white line-clamp-1">{title}</h2>
        {onViewMore && (
          <Button
            size="sm"
            variant="ghost"
            className="text-white p-0 h-auto text-xs"
            onClick={onViewMore}
            data-testid={`button-view-more-${title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            MAIS
          </Button>
        )}
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 px-4">
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
