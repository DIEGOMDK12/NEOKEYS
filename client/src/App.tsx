import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import ProductPage from "@/pages/ProductPage";
import AuthPage from "@/pages/AuthPage";
import { Product } from "@/components/ProductCard";
import { CartItem } from "@/components/CartDrawer";

type Page = "home" | "product" | "login" | "register";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

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

  const handleNavigateToProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage("product");
  };

  const handleNavigateToLogin = () => {
    setCurrentPage("login");
  };

  const handleBack = () => {
    setCurrentPage("home");
    setSelectedProduct(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {currentPage === "home" && (
          <Home
            onNavigateToProduct={handleNavigateToProduct}
            onNavigateToLogin={handleNavigateToLogin}
          />
        )}
        {currentPage === "product" && selectedProduct && (
          <ProductPage
            product={selectedProduct}
            onBack={handleBack}
            onNavigateToProduct={handleNavigateToProduct}
            onNavigateToLogin={handleNavigateToLogin}
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
        )}
        {(currentPage === "login" || currentPage === "register") && (
          <AuthPage
            mode={currentPage}
            onBack={handleBack}
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
