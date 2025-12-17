import { useState } from "react";
import Header from "@/components/Header";
import SideMenu from "@/components/SideMenu";
import CartDrawer, { CartItem } from "@/components/CartDrawer";
import ProductDetail from "@/components/ProductDetail";
import ProductSection from "@/components/ProductSection";
import FloatingChatButton from "@/components/FloatingChatButton";
import { Product } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// todo: remove mock functionality
const relatedProducts: Product[] = [
  {
    id: "r1",
    name: "Beholder",
    imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=500&fit=crop",
    platform: "Steam",
    region: "Global",
    price: 4.99,
    originalPrice: 19.99,
    discount: 85,
  },
  {
    id: "r2",
    name: "Papers Please",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=500&fit=crop",
    platform: "Steam",
    region: "Global",
    price: 6.99,
    originalPrice: 14.99,
    discount: 70,
  },
];

interface ProductPageProps {
  product: Product;
  onBack: () => void;
  onNavigateToProduct: (product: Product) => void;
  onNavigateToLogin: () => void;
  cartItems: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export default function ProductPage({
  product,
  onBack,
  onNavigateToProduct,
  onNavigateToLogin,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
}: ProductPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { toast } = useToast();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // todo: remove mock functionality
  const description = `${product.name} - Agora voce faz parte do Ministerio!

Voce se tornara um oficial responsavel condecorado ou apenas um denunciante?

Voce e livre pra moldar seu proprio futuro!`;

  const requirements = {
    minimum: [
      "Sistema Operacional: Windows 7/8/10 (64-bit OS)",
      "Processador: Intel Core i3 or AMD Athlon II",
      "Memoria: 4 GB de RAM",
      "Placa de video: Intel HD Graphics 4000",
      "DirectX: Versao 11",
      "Armazenamento: 2 GB de espaco disponivel",
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartCount={cartCount}
        onMenuClick={() => setMenuOpen(!menuOpen)}
        onCartClick={() => setCartOpen(true)}
        onUserClick={onNavigateToLogin}
        onSearch={(q) => toast({ title: "Pesquisa", description: q })}
        menuOpen={menuOpen}
      />

      <SideMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onCategorySelect={(cat) => {
          toast({ title: "Categoria", description: cat });
          setMenuOpen(false);
        }}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
        onCheckout={() => toast({ title: "Checkout", description: "Redirecionando..." })}
        onViewCart={() => toast({ title: "Carrinho", description: "Visualizando..." })}
      />

      <div className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      <ProductDetail
        product={product}
        description={description}
        requirements={requirements}
        onAddToCart={() => {
          onAddToCart(product);
          toast({
            title: "Adicionado ao carrinho",
            description: `${product.name} foi adicionado.`,
          });
        }}
        onBuyNow={() => {
          onAddToCart(product);
          setCartOpen(true);
        }}
      />

      <ProductSection
        title="Voce pode gostar"
        products={relatedProducts}
        onAddToCart={(p) => {
          onAddToCart(p);
          toast({ title: "Adicionado", description: p.name });
        }}
        onProductClick={onNavigateToProduct}
      />

      <FloatingChatButton
        unreadCount={1}
        onClick={() => toast({ title: "Chat", description: "Abrindo chat..." })}
      />
    </div>
  );
}
