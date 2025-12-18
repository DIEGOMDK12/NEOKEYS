import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import ProductPage from "@/pages/ProductPage";
import AdminPage from "@/pages/AdminPage";
import CustomerAuth from "@/pages/CustomerAuth";
import CustomerDashboard from "@/pages/CustomerDashboard";
import PixCheckout from "@/pages/PixCheckout";
import { Product } from "@/components/ProductCard";
import { api } from "@/lib/api";

type Page = "home" | "product" | "customer-login" | "customer-dashboard" | "admin" | "pix-checkout";

interface CheckoutData {
  productId?: string;
  productName?: string;
  productImage?: string;
  productPrice?: number;
  quantity?: number;
  cartItems?: Array<{
    productId: string;
    name: string;
    imageUrl: string;
    quantity: number;
    price: number;
  }>;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const path = window.location.pathname;
    if (path === "/admin") return "admin";
    if (path === "/login" || path === "/register") return "customer-login";
    if (path === "/minha-conta") return "customer-dashboard";
    return "home";
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/admin") {
        setCurrentPage("admin");
      } else if (path === "/login") {
        setAuthMode("login");
        setCurrentPage("customer-login");
      } else if (path === "/register") {
        setAuthMode("register");
        setCurrentPage("customer-login");
      } else if (path === "/minha-conta") {
        setCurrentPage("customer-dashboard");
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
    window.history.pushState({}, "", "/login");
    setAuthMode("login");
    setCurrentPage("customer-login");
  };

  const handleNavigateToRegister = () => {
    window.history.pushState({}, "", "/register");
    setAuthMode("register");
    setCurrentPage("customer-login");
  };

  const handleNavigateToDashboard = () => {
    window.history.pushState({}, "", "/minha-conta");
    setCurrentPage("customer-dashboard");
  };

  const handleBack = () => {
    window.history.pushState({}, "", "/");
    setCurrentPage("home");
    setSelectedProduct(null);
  };

  const handleAuthSuccess = () => {
    window.history.pushState({}, "", "/minha-conta");
    setCurrentPage("customer-dashboard");
  };

  const handleNavigateToPixCheckout = (data: CheckoutData) => {
    setCheckoutData(data);
    window.history.pushState({}, "", "/checkout");
    setCurrentPage("pix-checkout");
  };

  const handleCheckoutSuccess = () => {
    window.history.pushState({}, "", "/minha-conta");
    setCurrentPage("customer-dashboard");
    setCheckoutData(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {currentPage === "home" && (
          <Home
            onNavigateToProduct={handleNavigateToProduct}
            onNavigateToLogin={handleNavigateToLogin}
            onNavigateToDashboard={handleNavigateToDashboard}
            onNavigateToPixCheckout={handleNavigateToPixCheckout}
          />
        )}
        {currentPage === "product" && selectedProduct && (
          <ProductPage
            product={selectedProduct}
            onBack={handleBack}
            onNavigateToProduct={handleNavigateToProduct}
            onNavigateToLogin={handleNavigateToLogin}
            onNavigateToDashboard={handleNavigateToDashboard}
            onNavigateToPixCheckout={handleNavigateToPixCheckout}
          />
        )}
        {currentPage === "pix-checkout" && checkoutData && (
          <PixCheckout
            productId={checkoutData.productId}
            productName={checkoutData.productName}
            productImage={checkoutData.productImage}
            productPrice={checkoutData.productPrice}
            quantity={checkoutData.quantity}
            cartItems={checkoutData.cartItems}
            onBack={handleBack}
            onSuccess={handleCheckoutSuccess}
            onLoginRequired={handleNavigateToLogin}
          />
        )}
        {currentPage === "customer-login" && (
          <CustomerAuth
            mode={authMode}
            onBack={handleBack}
            onSuccess={handleAuthSuccess}
          />
        )}
        {currentPage === "customer-dashboard" && (
          <CustomerDashboard
            onBack={handleBack}
            onLoginRequired={handleNavigateToLogin}
          />
        )}
        {currentPage === "admin" && <AdminPage onBack={handleBack} />}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
