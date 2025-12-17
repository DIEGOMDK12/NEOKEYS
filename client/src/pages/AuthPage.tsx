import { useState } from "react";
import Header from "@/components/Header";
import SideMenu from "@/components/SideMenu";
import CartDrawer, { CartItem } from "@/components/CartDrawer";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import FloatingChatButton from "@/components/FloatingChatButton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthPageProps {
  mode: "login" | "register";
  onBack: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export default function AuthPage({
  mode: initialMode,
  onBack,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
}: AuthPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mode, setMode] = useState(initialMode);
  const { toast } = useToast();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogin = (email: string, password: string) => {
    console.log("Login:", email, password);
    toast({
      title: "Entrando...",
      description: "Verificando suas credenciais",
    });
  };

  const handleRegister = (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    console.log("Register:", data);
    toast({
      title: "Criando conta...",
      description: "Sua conta esta sendo criada",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartCount={cartCount}
        onMenuClick={() => setMenuOpen(!menuOpen)}
        onCartClick={() => setCartOpen(true)}
        onUserClick={() => {}}
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
