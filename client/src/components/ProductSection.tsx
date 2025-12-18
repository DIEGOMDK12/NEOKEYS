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
    <section className={`py-8 ${highlighted ? 'bg-white/10' : ''}`}>
      <div className="flex items-center justify-between gap-4 mb-4 px-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {onViewMore && (
          <Button
            variant="ghost"
            className="text-white p-0 h-auto"
            onClick={onViewMore}
            data-testid={`button-view-more-${title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            VER MAIS
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-4">
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
