import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import ProductPage from "@/pages/ProductPage";
import AuthPage from "@/pages/AuthPage";
import { Product } from "@/components/ProductCard";

type Page = "home" | "product" | "login" | "register";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  const handleLoginSuccess = () => {
    setCurrentPage("home");
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
          />
        )}
        {(currentPage === "login" || currentPage === "register") && (
          <AuthPage
            mode={currentPage}
            onBack={handleBack}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
