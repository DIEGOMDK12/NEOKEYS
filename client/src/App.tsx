import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import ProductPage from "@/pages/ProductPage";
import AuthPage from "@/pages/AuthPage";
import AdminPage from "@/pages/AdminPage";
import { Product } from "@/components/ProductCard";

type Page = "home" | "product" | "login" | "register" | "admin";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    if (window.location.pathname === "/admin") return "admin";
    return "home";
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === "/admin") {
        setCurrentPage("admin");
      } else {
        setCurrentPage("home");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleNavigateToProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage("product");
  };

  const handleNavigateToLogin = () => {
    setCurrentPage("login");
  };

  const handleBack = () => {
    window.history.pushState({}, "", "/");
    setCurrentPage("home");
    setSelectedProduct(null);
  };

  const handleLoginSuccess = () => {
    setCurrentPage("home");
  };

  const handleNavigateToAdmin = () => {
    window.history.pushState({}, "", "/admin");
    setCurrentPage("admin");
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
        {currentPage === "admin" && <AdminPage onBack={handleBack} />}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
