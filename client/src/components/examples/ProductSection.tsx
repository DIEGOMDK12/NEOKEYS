import ProductSection from "../ProductSection";
import { Product } from "../ProductCard";

// todo: remove mock functionality
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Beholder 2",
    imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=500&fit=crop",
    platform: "Steam",
    region: "Global",
    price: 9.56,
    originalPrice: 39.99,
    discount: 76,
  },
  {
    id: "2",
    name: "Gravity Circuit",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=500&fit=crop",
    platform: "Steam",
    region: "Global",
    price: 8.66,
    originalPrice: 52.49,
    discount: 84,
  },
  {
    id: "3",
    name: "Nomad Survival",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=500&fit=crop",
    platform: "Steam",
    region: "Global",
    price: 4.99,
    originalPrice: 19.99,
    discount: 75,
  },
  {
    id: "4",
    name: "S.W.I.N.E.",
    imageUrl: "https://images.unsplash.com/photo-1493711662062-fa541f7f75a3?w=400&h=500&fit=crop",
    platform: "Steam",
    region: "Global",
    price: 7.50,
    originalPrice: 24.99,
    discount: 70,
  },
];

export default function ProductSectionExample() {
  return (
    <div className="bg-background">
      <ProductSection
        title="ATÉ 10R$"
        products={mockProducts}
        onAddToCart={(p) => console.log("Add:", p.name)}
        onProductClick={(p) => console.log("Click:", p.name)}
        onViewMore={() => console.log("View more")}
      />
    </div>
  );
}
