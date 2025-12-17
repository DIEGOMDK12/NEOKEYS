import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

// Transform API product to frontend Product type
function transformProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    imageUrl: p.imageUrl,
    platform: p.platform,
    region: p.region,
    price: parseFloat(p.price),
    originalPrice: parseFloat(p.originalPrice),
    discount: p.discount,
  };
}

interface ProductPageProps {
  product: Product;
  onBack: () => void;
  onNavigateToProduct: (product: Product) => void;
  onNavigateToLogin: () => void;
}

export default function ProductPage({
  product,
  onBack,
  onNavigateToProduct,
  onNavigateToLogin,
}: ProductPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { toast } = useToast();

  // Fetch cart
  const { data: cartData = [] } = useQuery({
    queryKey: ["/api/cart"],
    queryFn: () => api.getCart(),
  });

  // Fetch related products
  const { data: allProducts = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: () => api.getProducts(),
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      api.addToCart(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  // Update cart mutation
  const updateCartMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      api.updateCartQuantity(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: (productId: string) => api.removeFromCart(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const handleAddToCart = (p: Product) => {
    addToCartMutation.mutate({ productId: p.id, quantity: 1 });
    toast({
      title: "Adicionado ao carrinho",
      description: `${p.name} foi adicionado.`,
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCartMutation.mutate(productId);
    } else {
      updateCartMutation.mutate({ productId, quantity });
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCartMutation.mutate(productId);
  };

  // Transform cart data
  const cartItems: CartItem[] = cartData.map((item: any) => ({
    product: transformProduct(item.product),
    quantity: item.quantity,
  }));

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Get related products (excluding current product)
  const relatedProducts: Product[] = allProducts
    .filter((p: any) => p.id !== product.id)
    .slice(0, 4)
    .map(transformProduct);

  const description = `${product.name} - Uma experiencia incrivel de jogos!

Aproveite esse titulo incrivel com um desconto de ${product.discount}%.

Disponivel para ${product.platform} na regiao ${product.region}.`;

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
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
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
        onAddToCart={() => handleAddToCart(product)}
        onBuyNow={() => {
          handleAddToCart(product);
          setCartOpen(true);
        }}
      />

      {relatedProducts.length > 0 && (
        <ProductSection
          title="Voce pode gostar"
          products={relatedProducts}
          onAddToCart={handleAddToCart}
          onProductClick={onNavigateToProduct}
        />
      )}

      <FloatingChatButton
        unreadCount={1}
        onClick={() => toast({ title: "Chat", description: "Abrindo chat..." })}
      />
    </div>
  );
}
