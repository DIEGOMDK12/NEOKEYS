import { useState } from "react";
import Header from "@/components/Header";
import SideMenu from "@/components/SideMenu";
import HeroBanner from "@/components/HeroBanner";
import PriceFilters from "@/components/PriceFilters";
import ProductSection from "@/components/ProductSection";
import CartDrawer, { CartItem } from "@/components/CartDrawer";
import FloatingChatButton from "@/components/FloatingChatButton";
import { Product } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";

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

const mockProductsExpensive: Product[] = [
  {
    id: "5",
    name: "Cyberpunk 2077",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=500&fit=crop",
    platform: "Steam",
    region: "Global",
    price: 29.99,
    originalPrice: 59.99,
    discount: 50,
  },
  {
    id: "6",
    name: "Elden Ring",
    imageUrl: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=400&h=500&fit=crop",
    platform: "Steam",
    region: "Global",
    price: 35.99,
    originalPrice: 69.99,
    discount: 49,
  },
  {
    id: "7",
    name: "Hogwarts Legacy",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=500&fit=crop",
    platform: "Steam",
    region: "Global",
    price: 39.99,
    originalPrice: 79.99,
    discount: 50,
  },
  {
    id: "8",
    name: "Red Dead Redemption 2",
    imageUrl: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=400&h=500&fit=crop",
    platform: "Steam",
    region: "Global",
    price: 24.99,
    originalPrice: 59.99,
    discount: 58,
  },
];

interface HomeProps {
  onNavigateToProduct: (product: Product) => void;
  onNavigateToLogin: () => void;
}

export default function Home({ onNavigateToProduct, onNavigateToLogin }: HomeProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<number>();
  const { toast } = useToast();

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast({
      title: "Adicionado ao carrinho",
      description: `${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleSearch = (query: string) => {
    console.log("Search:", query);
    toast({
      title: "Pesquisando...",
      description: `Buscando por "${query}"`,
    });
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartCount={cartCount}
        onMenuClick={() => setMenuOpen(!menuOpen)}
        onCartClick={() => setCartOpen(true)}
        onUserClick={onNavigateToLogin}
        onSearch={handleSearch}
        menuOpen={menuOpen}
      />

      <SideMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onCategorySelect={(cat) => {
          console.log("Category:", cat);
          toast({ title: "Categoria", description: cat });
        }}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          toast({ title: "Checkout", description: "Redirecionando para pagamento..." });
        }}
        onViewCart={() => {
          toast({ title: "Carrinho", description: "Visualizando carrinho completo" });
        }}
      />

      <main className="pb-20">
        <div className="p-4">
          <HeroBanner
            title="RIMS RACING ULTIMATE EDITION"
            subtitle="DISPONIVEL AGORA!"
            price="R$ 46,92"
            imageUrl="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=400&fit=crop"
            onBuyClick={() => {
              toast({ title: "Comprar", description: "Adicionando ao carrinho..." });
            }}
          />
        </div>

        <PriceFilters
          selectedFilter={selectedPriceFilter}
          onFilterSelect={(price) => {
            setSelectedPriceFilter(price === selectedPriceFilter ? undefined : price);
            toast({
              title: "Filtro aplicado",
              description: `Mostrando jogos ate R$ ${price}`,
            });
          }}
        />

        <ProductSection
          title="ATE 10R$"
          products={mockProducts}
          onAddToCart={handleAddToCart}
          onProductClick={onNavigateToProduct}
          onViewMore={() => console.log("View more")}
        />

        <ProductSection
          title="MAIS VENDIDOS"
          products={mockProductsExpensive}
          onAddToCart={handleAddToCart}
          onProductClick={onNavigateToProduct}
          onViewMore={() => console.log("View more")}
        />
      </main>

      <FloatingChatButton
        unreadCount={1}
        onClick={() => toast({ title: "Chat", description: "Abrindo chat de suporte..." })}
      />
    </div>
  );
}
