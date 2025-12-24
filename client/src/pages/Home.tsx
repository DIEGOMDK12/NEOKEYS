import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import SideMenu from "@/components/SideMenu";
import HeroBanner from "@/components/HeroBanner";
import PriceFilters from "@/components/PriceFilters";
import ProductSection from "@/components/ProductSection";
import CartDrawer, { CartItem } from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { Product } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient, getQueryFn } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomerUser {
  id: string;
  email: string;
  firstName: string;
  whatsapp: string;
}

interface HomeProps {
  onNavigateToProduct: (product: Product) => void;
  onNavigateToLogin: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToPixCheckout?: (data: any) => void;
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
    description: p.description,
  };
}

export default function Home({ onNavigateToProduct, onNavigateToLogin, onNavigateToDashboard, onNavigateToPixCheckout }: HomeProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<number>();
  const [searchQuery, setSearchQuery] = useState("");
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

  // Seed products on first load
  useEffect(() => {
    api.seedProducts().catch(() => {});
  }, []);

  // Fetch settings
  const { data: settings = {} } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      try {
        return await api.getSettings();
      } catch (error) {
        return {};
      }
    },
  });

  // Fetch products
  const { data: allProducts = [], isLoading: productsLoading } = useQuery({
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

  // Fetch filtered products
  const { data: filteredProducts } = useQuery({
    queryKey: ["/api/products", { maxPrice: selectedPriceFilter, search: searchQuery }],
    queryFn: async () => {
      try {
        return await api.getProducts({ maxPrice: selectedPriceFilter, search: searchQuery || undefined });
      } catch (error) {
        return [];
      }
    },
    enabled: !!selectedPriceFilter || !!searchQuery,
  });

  // Fetch cart
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

  const handleAddToCart = (product: Product) => {
    addToCartMutation.mutate({ productId: product.id, quantity: 1 });
    toast({
      title: "Adicionado ao carrinho",
      description: `${product.name} foi adicionado ao seu carrinho.`,
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      toast({
        title: "Pesquisando...",
        description: `Buscando por "${query}"`,
      });
    }
  };

  // Transform cart data
  const cartItems: CartItem[] = cartData.map((item: any) => ({
    product: transformProduct(item.product),
    quantity: item.quantity,
  }));

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Transform products
  const products = (selectedPriceFilter || searchQuery ? filteredProducts : allProducts) || [];
  const transformedProducts: Product[] = products.map(transformProduct);

  // Split into cheap and expensive for display
  const cheapProducts = transformedProducts.filter((p) => p.price <= 10);
  const expensiveProducts = transformedProducts.filter((p) => p.price > 10);

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartCount={cartCount}
        onMenuClick={() => setMenuOpen(!menuOpen)}
        onCartClick={() => setCartOpen(true)}
        onUserClick={handleUserClick}
        onSearch={handleSearch}
        onLogoClick={() => window.location.href = "/"}
        menuOpen={menuOpen}
        isLoggedIn={!!customerUser}
      />

      <SideMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onCategorySelect={(cat) => {
          setSearchQuery(cat);
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
          if (!customerUser) {
            onNavigateToLogin();
            return;
          }
          if (cartItems.length > 0 && onNavigateToPixCheckout) {
            onNavigateToPixCheckout({
              cartItems: cartItems.map(item => ({
                productId: item.product.id,
                name: item.product.name,
                imageUrl: item.product.imageUrl,
                quantity: item.quantity,
                price: item.product.price,
              })),
            });
            setCartOpen(false);
          } else {
            toast({ title: "Erro", description: "Carrinho vazio", variant: "destructive" });
          }
        }}
        onViewCart={() => {
          toast({ title: "Carrinho", description: "Visualizando carrinho completo" });
        }}
      />

      <main className="pb-16">
        <div className="p-2 sm:p-3 flex justify-center">
          <HeroBanner
            title={settings.heroTitle || "RIMS RACING ULTIMATE EDITION"}
            subtitle={settings.heroSubtitle || "DISPONIVEL AGORA!"}
            price={settings.heroPrice || "R$ 46,92"}
            imageUrl={settings.heroImageUrl || "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=400&fit=crop"}
            onBuyClick={() => {
              if (settings.heroProductId && settings.heroProductId !== "none") {
                const product = transformedProducts.find((p) => p.id === settings.heroProductId);
                if (product) {
                  handleAddToCart(product);
                  return;
                }
              }
              toast({ title: "Comprar", description: "Adicionando ao carrinho..." });
            }}
          />
        </div>

        <PriceFilters
          selectedFilter={selectedPriceFilter}
          onFilterSelect={(price) => {
            const newFilter = price === selectedPriceFilter ? undefined : price;
            setSelectedPriceFilter(newFilter);
            if (newFilter) {
              toast({
                title: "Filtro aplicado",
                description: `Mostrando jogos ate R$ ${price}`,
              });
            }
          }}
        />

        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            {cheapProducts.length > 0 && (
              <ProductSection
                title="ATE 10R$"
                products={cheapProducts}
                onAddToCart={handleAddToCart}
                onProductClick={onNavigateToProduct}
                onViewMore={() => setSelectedPriceFilter(10)}
              />
            )}

            {expensiveProducts.length > 0 && (
              <ProductSection
                title="MAIS VENDIDOS"
                products={expensiveProducts}
                onAddToCart={handleAddToCart}
                onProductClick={onNavigateToProduct}
                onViewMore={() => console.log("View more")}
              />
            )}

            {transformedProducts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum produto encontrado
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
