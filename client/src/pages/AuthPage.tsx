import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import SideMenu from "@/components/SideMenu";
import CartDrawer, { CartItem } from "@/components/CartDrawer";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import FloatingChatButton from "@/components/FloatingChatButton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Product } from "@/components/ProductCard";

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
  };
}

interface AuthPageProps {
  mode: "login" | "register";
  onBack: () => void;
  onLoginSuccess: () => void;
}

export default function AuthPage({
  mode: initialMode,
  onBack,
  onLoginSuccess,
}: AuthPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mode, setMode] = useState(initialMode);
  const { toast } = useToast();

  // Fetch cart
  const { data: cartData = [] } = useQuery({
    queryKey: ["/api/cart"],
    queryFn: () => api.getCart(),
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

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.login(email, password),
    onSuccess: (data) => {
      toast({
        title: "Bem-vindo!",
        description: `Ola, ${data.firstName}!`,
      });
      onLoginSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Email ou senha incorretos",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: { email: string; password: string; firstName: string; lastName: string }) =>
      api.register(data),
    onSuccess: () => {
      toast({
        title: "Conta criada!",
        description: "Sua conta foi criada com sucesso. Faca login para continuar.",
      });
      setMode("login");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar conta",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (email: string, password: string) => {
    loginMutation.mutate({ email, password });
  };

  const handleRegister = (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    registerMutation.mutate(data);
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

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartCount={cartCount}
        onMenuClick={() => setMenuOpen(!menuOpen)}
        onCartClick={() => setCartOpen(true)}
        onUserClick={() => {}}
        onSearch={(q) => toast({ title: "Pesquisa", description: q })}
        onLogoClick={onBack}
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
          data-testid="button-back-auth"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      <div className="px-4 pb-20">
        {mode === "login" ? (
          <LoginForm
            onLogin={handleLogin}
            onCreateAccount={() => setMode("register")}
            onForgotPassword={() =>
              toast({ title: "Recuperar senha", description: "Email enviado!" })
            }
          />
        ) : (
          <RegisterForm onRegister={handleRegister} onLogin={() => setMode("login")} />
        )}
      </div>

      <FloatingChatButton
        unreadCount={1}
        onClick={() => toast({ title: "Chat", description: "Abrindo chat..." })}
      />
    </div>
  );
}
