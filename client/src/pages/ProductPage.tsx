import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import SideMenu from "@/components/SideMenu";
import CartDrawer, { CartItem } from "@/components/CartDrawer";
import ProductDetail from "@/components/ProductDetail";
import ProductSection from "@/components/ProductSection";
import { Product } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { queryClient, getQueryFn } from "@/lib/queryClient";

interface CustomerUser {
  id: string;
  email: string;
  firstName: string;
  whatsapp: string;
}

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
    videoUrl: p.videoUrl,
    galleryImages: p.galleryImages,
    systemRequirements: p.systemRequirements,
  };
}

interface CheckoutData {
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  quantity: number;
}

interface ProductPageProps {
  product: Product;
  onBack: () => void;
  onNavigateToProduct: (product: Product) => void;
  onNavigateToLogin: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToPixCheckout: (data: CheckoutData) => void;
}

export default function ProductPage({
  product,
  onBack,
  onNavigateToProduct,
  onNavigateToLogin,
  onNavigateToDashboard,
  onNavigateToPixCheckout,
}: ProductPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { toast } = useToast();

  // Check customer session
  const { data: customerUser } = useQuery<CustomerUser | null>({
    queryKey: ["/api/customer/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Handle user click - go to dashboard if logged in, otherwise to login
  const handleUserClick = () => {
    if (customerUser && onNavigateToDashboard) {
      onNavigateToDashboard();
    } else {
      onNavigateToLogin();
    }
  };

  // Fetch cart - only fetch when session exists
  const { data: cartData = [] } = useQuery({
    queryKey: ["/api/cart"],
    queryFn: async () => {
      try {
        return await api.getCart();
      } catch (error) {
        return [];
      }
    },
  });

  // Fetch related products
  const { data: allProducts = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      try {
        return await api.getProducts();
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    },
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
    console.log("🛒 Adding to cart:", p.id, p.name);
    addToCartMutation.mutate({ productId: p.id, quantity: 1 });
    toast({
      title: "Adicionado ao carrinho!",
      description: `${p.name} foi adicionado. Abra o carrinho para comprar.`,
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
        onUserClick={handleUserClick}
        onSearch={(q) => toast({ title: "Pesquisa", description: q })}
        onLogoClick={onBack}
        menuOpen={menuOpen}
        isLoggedIn={!!customerUser}
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
        onCheckout={() => {
          if (customerUser && cartItems.length > 0) {
            const checkoutItems = cartItems.map(item => ({
              productId: item.product.id,
              name: item.product.name,
              imageUrl: item.product.imageUrl,
              quantity: item.quantity,
              price: item.product.price,
            }));
            onNavigateToPixCheckout({
              productId: checkoutItems[0]?.productId || "",
              productName: checkoutItems[0]?.name || "",
              productImage: checkoutItems[0]?.imageUrl || "",
              productPrice: checkoutItems[0]?.price || 0,
              quantity: 1,
              cartItems: checkoutItems as any,
            } as any);
            setCartOpen(false);
          } else if (!customerUser) {
            onNavigateToLogin();
          }
        }}
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
          console.log("✅ Cart button clicked - just adding to cart");
          handleAddToCart(product);
        }}
        onBuyNow={() => {
          console.log("💳 Buy now button clicked - going to checkout");
          onNavigateToPixCheckout({
            productId: product.id,
            productName: product.name,
            productImage: product.imageUrl,
            productPrice: product.price,
            quantity: 1,
          });
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
    </div>
  );
}
