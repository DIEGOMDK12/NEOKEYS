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
import { Product } from "@/components/ProductCard";
import { api } from "@/lib/api";

type Page = "home" | "product" | "customer-login" | "customer-dashboard" | "admin";

function hexToHSL(hex: string): string {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function ColorApplier() {
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: () => api.getSettings(),
  });

  useEffect(() => {
    if (settings?.primaryColor) {
      const hsl = hexToHSL(settings.primaryColor);
      document.documentElement.style.setProperty("--primary", hsl);
      document.documentElement.style.setProperty("--ring", hsl);
      document.documentElement.style.setProperty("--accent", hsl);
    }
    if (settings?.backgroundColor) {
      const hsl = hexToHSL(settings.backgroundColor);
      document.documentElement.style.setProperty("--background", hsl);
    }
    if (settings?.accentColor) {
      const hsl = hexToHSL(settings.accentColor);
      document.documentElement.style.setProperty("--chart-1", hsl);
    }
  }, [settings]);

  return null;
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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ColorApplier />
        {currentPage === "home" && (
          <Home
            onNavigateToProduct={handleNavigateToProduct}
            onNavigateToLogin={handleNavigateToLogin}
            onNavigateToDashboard={handleNavigateToDashboard}
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
