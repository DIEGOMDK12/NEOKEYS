import ProductCard, { Product } from "../ProductCard";

const mockProduct: Product = {
  id: "1",
  name: "Beholder 2",
  imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=500&fit=crop",
  platform: "Steam",
  region: "Global",
  price: 9.56,
  originalPrice: 39.99,
  discount: 76,
};

export default function ProductCardExample() {
  return (
    <div className="w-48">
      <ProductCard
        product={mockProduct}
        onAddToCart={(p) => console.log("Add to cart:", p.name)}
        onProductClick={(p) => console.log("Product clicked:", p.name)}
      />
    </div>
  );
}
