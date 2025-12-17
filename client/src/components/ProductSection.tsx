import ProductCard, { Product } from "./ProductCard";
import { Button } from "@/components/ui/button";

interface ProductSectionProps {
  title: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onViewMore?: () => void;
}

export default function ProductSection({
  title,
  products,
  onAddToCart,
  onProductClick,
  onViewMore,
}: ProductSectionProps) {
  return (
    <section className="py-4">
      <div className="flex items-center justify-between gap-4 mb-4 px-4">
        <h2 className="text-lg font-bold">{title}</h2>
        {onViewMore && (
          <Button
            variant="ghost"
            className="text-primary p-0 h-auto"
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
