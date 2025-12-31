import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  ArrowLeft, Save, Plus, Trash2, Edit2, Image, Package, 
  LayoutDashboard, LogOut, Lock, Key, ShoppingBag, Palette, 
  Copy, Check, Users, TrendingUp, Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  platform: string;
  region: string;
  price: string;
  originalPrice: string;
  discount: number;
  description?: string;
  category?: string;
  galleryImages?: string[];
  videoUrl?: string;
  systemRequirements?: string;
  availableStock?: number;
}

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

interface AdminPageProps {
  onBack: () => void;
}

interface ProductKey {
  id: string;
  productId: string;
  keyValue: string;
  isUsed: boolean;
  orderId: string | null;
}

interface Order {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  totalPrice: string;
  status: string;
  deliveredKey: string | null;
  createdAt: string;
  product: Product;
  user: {
    id: string;
    email: string;
    firstName: string;
    whatsapp: string | null;
  };
}

const defaultSettings = {
  heroTitle: "RIMS RACING ULTIMATE EDITION",
  heroSubtitle: "DISPONIVEL AGORA!",
  heroPrice: "R$ 46,92",
  heroImageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&h=600&fit=crop",
  heroProductId: "",
  heroPlatform: "STEAM",
  heroRegion: "Global",
  siteName: "EliteVault",
  contactPhone: "000-000-0000",
  contactEmail: "info@elitevault.com",
  footerText: "2024 EliteVault. Todos os direitos reservados.",
  backgroundColor: "#000000",
  primaryColor: "#FF006E",
  accentColor: "#00FFFF",
};

type AdminSection = "dashboard" | "products" | "keys" | "orders" | "customers" | "banner" | "colors" | "backup";

import { MatrixBackground } from "@/components/MatrixBackground";

function AdminLoginForm({ onLoginSuccess }: { onLoginSuccess: (user: AdminUser) => void }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => api.adminLogin(email, password),
    onSuccess: (data) => {
      toast({ title: "Bem-vindo!", description: `Olá, ${data.firstName}!` });
      onLoginSuccess(data);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro", 
        description: error.message || "E-mail ou senha incorretos",
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <MatrixBackground />
      
      {/* Dynamic glow effect in background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse" />
      
      <Card className="w-full max-w-md bg-zinc-950/40 border-primary/20 backdrop-blur-xl relative z-10 shadow-[0_0_40px_rgba(0,0,0,0.5)] border-t-primary/30">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 bg-black/60 rounded-full flex items-center justify-center mb-6 border border-primary/30 shadow-[0_0_20px_rgba(255,0,110,0.15)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-50" />
            <Lock className="h-10 w-10 text-primary relative z-10 animate-pulse" />
          </div>
          <CardTitle className="text-4xl text-white font-black tracking-tighter uppercase italic drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            PAINEL <span className="text-primary">ADMIN</span>
          </CardTitle>
          <CardDescription className="text-zinc-400 font-bold text-[10px] tracking-[0.2em] uppercase mt-2">
            Sistema de Gerenciamento EliteVault
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="text-zinc-500 text-[9px] uppercase tracking-[0.3em] font-black pl-1">E-mail de Acesso</Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-primary/20 rounded-md blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@elitevault.com"
                  className="bg-black/40 border-zinc-800/50 text-white placeholder:text-zinc-600 focus:ring-0 focus:border-primary/50 h-12 relative z-10 transition-all rounded-md"
                  required
                  data-testid="input-admin-email"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-password" className="text-zinc-500 text-[9px] uppercase tracking-[0.3em] font-black pl-1">Senha Administrativa</Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-primary/20 rounded-md blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-black/40 border-zinc-800/50 text-white placeholder:text-zinc-600 focus:ring-0 focus:border-primary/50 h-12 relative z-10 transition-all rounded-md"
                  required
                  data-testid="input-admin-password"
                />
              </div>
            </div>
            <div className="pt-2 flex justify-center">
              <Button 
                type="submit" 
                className="w-full max-w-[140px] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest h-10 rounded-md hover-elevate active-elevate-2 transition-all shadow-[0_0_20px_rgba(255,0,110,0.4)] relative overflow-hidden group border border-white/10" 
                disabled={loginMutation.isPending}
                data-testid="button-admin-login"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative z-10 text-[11px]">
                  {loginMutation.isPending ? "..." : "ACESSAR"}
                </span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminSidebar({ 
  admin, 
  currentSection, 
  onSectionChange, 
  onLogout, 
  onBack 
}: { 
  admin: AdminUser; 
  currentSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  onLogout: () => void;
  onBack: () => void;
}) {
  const menuItems = [
    { id: "dashboard" as AdminSection, title: "Dashboard", icon: LayoutDashboard },
    { id: "products" as AdminSection, title: "Produtos", icon: Package },
    { id: "keys" as AdminSection, title: "Chaves", icon: Key },
    { id: "orders" as AdminSection, title: "Pedidos", icon: ShoppingBag },
    { id: "customers" as AdminSection, title: "Clientes", icon: Users },
    { id: "banner" as AdminSection, title: "Banner", icon: Image },
    { id: "backup" as AdminSection, title: "Backup", icon: Save },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-white-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">Admin Panel</h2>
            <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="text-zinc-400">
        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-500">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    isActive={currentSection === item.id}
                    className={`text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 ${currentSection === item.id ? 'bg-zinc-800 text-zinc-100' : ''}`}
                    data-testid={`sidebar-${item.id}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-zinc-400">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2" 
            onClick={onBack}
            data-testid="button-back-to-store"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Loja
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 text-destructive" 
            onClick={onLogout}
            data-testid="button-admin-logout"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function DashboardSection({ products, orders }: { products: Product[]; orders: Order[] }) {
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0);
  const deliveredOrders = orders.filter(o => o.status === "delivered").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Visao geral do seu negocio</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-products">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-orders">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">{deliveredOrders} entregues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-revenue">R$ {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">total em vendas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Entrega</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-delivery-rate">
              {totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(0) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">pedidos entregues</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ultimos Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum pedido realizado</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={order.product.imageUrl}
                        alt={order.product.name}
                        className="w-10 h-10 rounded-md object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{order.product.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{order.user.firstName}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">R$ {order.totalPrice}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Produtos Populares</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum produto cadastrado</p>
            ) : (
              <div className="space-y-3">
                {products.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-10 rounded-md object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.platform}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-white">R$ {product.price}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProductsSection({ products, onSave }: { products: Product[]; onSave: () => void }) {
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    imageUrl: "",
    platform: "Steam",
    region: "Global",
    price: "",
    originalPrice: "",
    discount: 0,
    description: "",
    category: "",
    galleryImages: [] as string[],
    videoUrl: "",
    systemRequirements: "",
  });

  const handleImportProduct = (productData: any) => {
    setNewProduct({
      name: productData.name || "",
      imageUrl: productData.imageUrl || "",
      platform: productData.platform || "Steam",
      region: productData.region || "Global",
      price: productData.price || "",
      originalPrice: productData.originalPrice || "",
      discount: productData.discount || 0,
      description: productData.description || "",
      category: productData.category || "",
      galleryImages: productData.galleryImages || [],
      videoUrl: productData.videoUrl || "",
      systemRequirements: productData.systemRequirements || "",
    });
    setIsAddingProduct(true);
    toast({ title: "Dados importados", description: "Verifique as informações antes de salvar." });
  };

  const createProductMutation = useMutation({
    mutationFn: (data: typeof newProduct) => api.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsAddingProduct(false);
      setNewProduct({
        name: "",
        imageUrl: "",
        platform: "Steam",
        region: "Global",
        price: "",
        originalPrice: "",
        discount: 0,
        description: "",
        category: "",
        galleryImages: [],
        videoUrl: "",
        systemRequirements: "",
      });
      toast({ title: "Sucesso", description: "Produto criado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao criar produto", variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => api.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditingProduct(null);
      toast({ title: "Sucesso", description: "Produto atualizado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao atualizar produto", variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Sucesso", description: "Produto excluido com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao excluir produto", variant: "destructive" });
    },
  });

  const handleCreateProduct = () => {
    // Basic validation
    if (!newProduct.name || !newProduct.price || !newProduct.originalPrice) {
      toast({ 
        title: "Campos obrigatórios", 
        description: "Por favor, preencha o nome e os preços do produto.", 
        variant: "destructive" 
      });
      return;
    }

    // Ensure we have at least a main image
    if (!newProduct.imageUrl) {
      toast({ 
        title: "Imagem obrigatória", 
        description: "Por favor, adicione uma imagem principal para o produto.", 
        variant: "destructive" 
      });
      return;
    }

    createProductMutation.mutate(newProduct);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    
    if (!editingProduct.name || !editingProduct.price || !editingProduct.originalPrice) {
      toast({ 
        title: "Campos obrigatórios", 
        description: "Por favor, preencha o nome e os preços do produto.", 
        variant: "destructive" 
      });
      return;
    }

    updateProductMutation.mutate({ id: editingProduct.id, data: editingProduct });
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const deleteAllProductsMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/admin/products/all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Sucesso", description: "Todos os produtos foram removidos." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao remover produtos.", variant: "destructive" });
    },
  });

  const handleDeleteAll = () => {
    if (confirm("ATENÇÃO: Isso removerá TODOS os produtos do catálogo. Continuar?")) {
      deleteAllProductsMutation.mutate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Produtos</h2>
          <p className="text-muted-foreground">Gerencie seu catalogo de produtos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            onClick={handleDeleteAll}
            disabled={deleteAllProductsMutation.isPending}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Apagar Tudo
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              try {
                const clipboardText = prompt("Cole o JSON do produto aqui:");
                if (clipboardText) {
                  const data = JSON.parse(clipboardText);
                  handleImportProduct(data);
                }
              } catch (e) {
                toast({ title: "Erro na importação", description: "JSON inválido", variant: "destructive" });
              }
            }}
          >
            Importar JSON
          </Button>
          <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-product">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Produto</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Galeria de Imagens</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(isAddingProduct ? newProduct.galleryImages : editingProduct?.galleryImages)?.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 group">
                      <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover rounded-md" />
                      <button
                        onClick={() => {
                          if (isAddingProduct) {
                            setNewProduct({
                              ...newProduct,
                              galleryImages: newProduct.galleryImages.filter((_, i) => i !== idx)
                            });
                          } else if (editingProduct) {
                            setEditingProduct({
                              ...editingProduct,
                              galleryImages: (editingProduct.galleryImages || []).filter((_, i) => i !== idx)
                            });
                          }
                        }}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <Label 
                    htmlFor="gallery-upload" 
                    className="w-20 h-20 border-2 border-dashed border-zinc-800 rounded-md flex items-center justify-center cursor-pointer hover:border-zinc-700 transition-colors"
                  >
                    <Plus className="h-6 w-6 text-zinc-600" />
                    <input
                      id="gallery-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (isAddingProduct) {
                              setNewProduct(prev => ({
                                ...prev,
                                galleryImages: [...prev.galleryImages, reader.result as string]
                              }));
                            } else if (editingProduct) {
                              setEditingProduct(prev => prev ? ({
                                ...prev,
                                galleryImages: [...(prev.galleryImages || []), reader.result as string]
                              }) : null);
                            }
                          };
                          reader.readAsDataURL(file);
                        });
                      }}
                    />
                  </Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nome do Produto *</Label>
                <Input
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Ex: Cyberpunk 2077"
                  data-testid="input-product-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Imagem Principal (Capa) *</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewProduct({ ...newProduct, imageUrl: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block w-full text-sm border border-input rounded-md cursor-pointer px-3 py-2"
                  data-testid="input-product-image-file"
                />
                {newProduct.imageUrl && (
                  <div className="relative mt-2">
                    <img src={newProduct.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                    <p className="text-[10px] text-muted-foreground mt-1">Esta será a imagem principal do produto.</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plataforma</Label>
                  <Select
                    value={newProduct.platform}
                    onValueChange={(value) => setNewProduct({ ...newProduct, platform: value, category: value })}
                  >
                    <SelectTrigger data-testid="select-product-platform">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Steam">Steam</SelectItem>
                      <SelectItem value="EA">EA</SelectItem>
                      <SelectItem value="Epic">Epic Games</SelectItem>
                      <SelectItem value="GOG">GOG</SelectItem>
                      <SelectItem value="Windows">Windows</SelectItem>
                      <SelectItem value="Rockstar">Rockstar</SelectItem>
                      <SelectItem value="Ubi Connect">Ubi Connect</SelectItem>
                      <SelectItem value="Xbox">Xbox</SelectItem>
                      <SelectItem value="PlayStation">PlayStation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Região</Label>
                  <Select
                    value={newProduct.region}
                    onValueChange={(value) => setNewProduct({ ...newProduct, region: value })}
                  >
                    <SelectTrigger data-testid="select-product-region">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Global">Global</SelectItem>
                      <SelectItem value="LATAM">LATAM</SelectItem>
                      <SelectItem value="Europe">Europe</SelectItem>
                      <SelectItem value="North America">North America</SelectItem>
                      <SelectItem value="Asia">Asia</SelectItem>
                      <SelectItem value="Brazil">Brazil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  placeholder="Ex: Steam, Rockstar, etc."
                  data-testid="input-product-category"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço Atual *</Label>
                  <Input
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="99.90"
                    data-testid="input-product-price"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço Original *</Label>
                  <Input
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                    placeholder="199.90"
                    data-testid="input-product-original-price"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Desconto (%)</Label>
                <Input
                  type="number"
                  value={newProduct.discount}
                  onChange={(e) => setNewProduct({ ...newProduct, discount: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Digite a descrição do produto..."
                  rows={4}
                  data-testid="input-product-description"
                />
              </div>
              <div className="space-y-2">
                <Label>Link do Vídeo (YouTube)</Label>
                <Input
                  value={newProduct.videoUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  data-testid="input-product-video-url"
                />
              </div>
              <div className="space-y-2">
                <Label>Requisitos do Sistema</Label>
                <Textarea
                  value={newProduct.systemRequirements}
                  onChange={(e) => setNewProduct({ ...newProduct, systemRequirements: e.target.value })}
                  placeholder="Digite os requisitos (cada linha é um requisito)"
                  rows={3}
                  data-testid="input-product-system-requirements"
                />
              </div>
              <Button
                onClick={handleCreateProduct}
                disabled={createProductMutation.isPending}
                className="w-full"
                data-testid="button-save-product"
              >
                {createProductMutation.isPending ? "Salvando..." : "Criar Produto"}
              </Button>
            </div>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden group" data-testid={`product-card-${product.id}`}>
            <div className="relative aspect-square">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <span className="bg-black/70 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                  {product.platform}
                </span>
                <span className="bg-zinc-800 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                  {product.region}
                </span>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold text-sm truncate mb-1">{product.name}</h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground line-through">R$ {product.originalPrice}</p>
                  <p className="text-lg font-bold">R$ {product.price}</p>
                </div>
                {product.availableStock !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${product.availableStock > 0 ? "bg-zinc-950 text-zinc-100 border border-zinc-800" : "bg-zinc-900 text-zinc-500"}`}>
                    {product.availableStock > 0 ? `✓ ${product.availableStock} em estoque` : "✖ Sem estoque"}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Dialog open={editingProduct?.id === product.id} onOpenChange={(open) => !open && setEditingProduct(null)}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditingProduct(product)}>
                      <Edit2 className="h-3 w-3 mr-2" />
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Editar Produto</DialogTitle>
                    </DialogHeader>
                    {editingProduct && (
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label>Galeria de Imagens</Label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {editingProduct?.galleryImages?.map((img: string, idx: number) => (
                              <div key={idx} className="relative w-20 h-20 group">
                                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover rounded-md" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingProduct({
                                      ...editingProduct,
                                      galleryImages: (editingProduct.galleryImages || []).filter((_, i) => i !== idx)
                                    });
                                  }}
                                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                            <Label 
                              htmlFor="edit-gallery-upload" 
                              className="w-20 h-20 border-2 border-dashed border-zinc-800 rounded-md flex items-center justify-center cursor-pointer hover:border-zinc-700 transition-colors"
                            >
                              <Plus className="h-6 w-6 text-zinc-600" />
                              <input
                                id="edit-gallery-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  files.forEach(file => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setEditingProduct(prev => prev ? ({
                                        ...prev,
                                        galleryImages: [...(prev.galleryImages || []), reader.result as string]
                                      }) : null);
                                    };
                                    reader.readAsDataURL(file);
                                  });
                                }}
                              />
                            </Label>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Nome do Produto</Label>
                          <Input
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Imagem Principal (Capa)</Label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setEditingProduct({ ...editingProduct, imageUrl: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="block w-full text-sm border border-input rounded-md cursor-pointer px-3 py-2"
                          />
                          <img src={editingProduct.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-md mt-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Plataforma</Label>
                            <Select
                              value={editingProduct.platform}
                              onValueChange={(value) => setEditingProduct({ ...editingProduct, platform: value, category: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Steam">Steam</SelectItem>
                                <SelectItem value="EA">EA</SelectItem>
                                <SelectItem value="Epic">Epic Games</SelectItem>
                                <SelectItem value="GOG">GOG</SelectItem>
                                <SelectItem value="Windows">Windows</SelectItem>
                                <SelectItem value="Rockstar">Rockstar</SelectItem>
                                <SelectItem value="Ubi Connect">Ubi Connect</SelectItem>
                                <SelectItem value="Xbox">Xbox</SelectItem>
                                <SelectItem value="PlayStation">PlayStation</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Regiao</Label>
                            <Select
                              value={editingProduct.region}
                              onValueChange={(value) => setEditingProduct({ ...editingProduct, region: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Global">Global</SelectItem>
                                <SelectItem value="LATAM">LATAM</SelectItem>
                                <SelectItem value="Europe">Europe</SelectItem>
                                <SelectItem value="North America">North America</SelectItem>
                                <SelectItem value="Asia">Asia</SelectItem>
                                <SelectItem value="Brazil">Brazil</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Categoria</Label>
                          <Input
                            value={editingProduct.category || ""}
                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                            placeholder="Ex: Steam, Rockstar, etc."
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Preço Atual</Label>
                            <Input
                              value={editingProduct.price}
                              onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Preço Original</Label>
                            <Input
                              value={editingProduct.originalPrice}
                              onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Desconto (%)</Label>
                          <Input
                            type="number"
                            value={editingProduct.discount}
                            onChange={(e) => setEditingProduct({ ...editingProduct, discount: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Descrição</Label>
                          <Textarea
                            value={editingProduct.description || ""}
                            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                            placeholder="Digite a descrição do produto..."
                            rows={4}
                            data-testid="input-product-description-edit"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Link do Vídeo (YouTube)</Label>
                          <Input
                            value={editingProduct.videoUrl || ""}
                            onChange={(e) => setEditingProduct({ ...editingProduct, videoUrl: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=..."
                            data-testid="input-product-video-url-edit"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Requisitos do Sistema</Label>
                          <Textarea
                            value={editingProduct.systemRequirements || ""}
                            onChange={(e) => setEditingProduct({ ...editingProduct, systemRequirements: e.target.value })}
                            placeholder="Digite os requisitos (cada linha é um requisito)"
                            rows={3}
                            data-testid="input-product-system-requirements-edit"
                          />
                        </div>
                        <Button
                          onClick={handleUpdateProduct}
                          disabled={updateProductMutation.isPending}
                          className="w-full"
                        >
                          {updateProductMutation.isPending ? "Salvando..." : "Salvar Alteracoes"}
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteProduct(product.id)}
                  disabled={deleteProductMutation.isPending}
                  data-testid={`button-delete-product-${product.id}`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">Nenhum produto cadastrado</h3>
          <p className="text-sm text-muted-foreground mb-4">Comece adicionando seu primeiro produto</p>
          <Button onClick={() => setIsAddingProduct(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Produto
          </Button>
        </Card>
      )}
    </div>
  );
}

function KeysSection({ products }: { products: Product[] }) {
  const { toast } = useToast();
  const [selectedProductForKeys, setSelectedProductForKeys] = useState<Product | null>(null);
  const [newKeyValue, setNewKeyValue] = useState("");
  const [bulkKeys, setBulkKeys] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { data: productKeys = [], isLoading: keysLoading, refetch: refetchKeys } = useQuery<ProductKey[]>({
    queryKey: ["/api/admin/products", selectedProductForKeys?.id, "keys"],
    queryFn: async () => {
      const response = await fetch(`/api/admin/products/${selectedProductForKeys?.id}/keys`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch keys");
      return response.json();
    },
    enabled: !!selectedProductForKeys,
  });

  const addKeyMutation = useMutation({
    mutationFn: async ({ productId, keyValue }: { productId: string; keyValue: string }) => {
      const response = await fetch(`/api/admin/products/${productId}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ keyValue }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Falha ao adicionar chave");
      }
      return response.json();
    },
    onSuccess: () => {
      console.log("✅ Key added! Refetching...");
      refetchKeys();
      setNewKeyValue("");
      toast({ title: "Sucesso", description: "Chave adicionada!" });
    },
    onError: (error: Error) => {
      console.error("❌ Error adding key:", error);
      toast({ title: "Erro", description: error.message || "Falha ao adicionar chave", variant: "destructive" });
    },
  });

  const addBulkKeysMutation = useMutation({
    mutationFn: async ({ productId, keys }: { productId: string; keys: string[] }) => {
      const response = await fetch(`/api/admin/products/${productId}/keys/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ keys }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Falha ao adicionar chaves");
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log("✅ Keys added! Count:", data.count);
      refetchKeys();
      setBulkKeys("");
      toast({ title: "Sucesso", description: `${data.count} chaves adicionadas!` });
    },
    onError: (error: Error) => {
      console.error("❌ Error adding bulk keys:", error);
      toast({ title: "Erro", description: error.message || "Falha ao adicionar chaves", variant: "destructive" });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const response = await fetch(`/api/admin/keys/${keyId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Falha ao remover chave");
      }
      return response.json();
    },
    onSuccess: () => {
      console.log("✅ Key deleted! Refetching...");
      refetchKeys();
      toast({ title: "Sucesso", description: "Chave removida!" });
    },
    onError: (error: Error) => {
      console.error("❌ Error deleting key:", error);
      toast({ title: "Erro", description: error.message || "Falha ao remover chave", variant: "destructive" });
    },
  });

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Chaves de Produto</h2>
        <p className="text-muted-foreground">Gerencie as chaves de ativacao dos produtos</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Selecione o Produto</Label>
            <Select
              value={selectedProductForKeys?.id || ""}
              onValueChange={(v) => {
                const product = products.find((p: Product) => p.id === v);
                setSelectedProductForKeys(product || null);
              }}
            >
              <SelectTrigger data-testid="select-product-for-keys">
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p: Product) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} - {p.platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProductForKeys && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Adicionar Chave Individual</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newKeyValue}
                      onChange={(e) => setNewKeyValue(e.target.value)}
                      placeholder="XXXXX-XXXXX-XXXXX"
                      data-testid="input-new-key"
                    />
                    <Button
                      onClick={() => {
                        if (newKeyValue.trim()) {
                          addKeyMutation.mutate({
                            productId: selectedProductForKeys.id,
                            keyValue: newKeyValue.trim(),
                          });
                        }
                      }}
                      disabled={addKeyMutation.isPending}
                      data-testid="button-add-key"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Adicionar Multiplas Chaves</Label>
                  <Textarea
                    value={bulkKeys}
                    onChange={(e) => setBulkKeys(e.target.value)}
                    placeholder="Uma chave por linha..."
                    rows={3}
                    data-testid="input-bulk-keys"
                  />
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      const keys = bulkKeys.split("\n").filter((k) => k.trim());
                      if (keys.length > 0) {
                        addBulkKeysMutation.mutate({
                          productId: selectedProductForKeys.id,
                          keys,
                        });
                      }
                    }}
                    disabled={addBulkKeysMutation.isPending}
                    data-testid="button-add-bulk-keys"
                  >
                    {addBulkKeysMutation.isPending ? "Adicionando..." : `Adicionar ${bulkKeys.split("\n").filter((k) => k.trim()).length} Chaves`}
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">
                  Chaves do Produto ({productKeys.filter((k) => !k.isUsed).length} disponiveis / {productKeys.length} total)
                </h4>
                {keysLoading ? (
                  <div className="text-center py-4 text-muted-foreground">Carregando...</div>
                ) : productKeys.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">Nenhuma chave cadastrada</div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {productKeys.map((key) => (
                      <div
                        key={key.id}
                        className={`flex items-center justify-between gap-2 p-2 rounded-md border ${key.isUsed ? "bg-muted opacity-60" : ""}`}
                        data-testid={`key-row-${key.id}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Key className={`h-4 w-4 ${key.isUsed ? "text-muted-foreground" : "text-white"}`} />
                          <code className="text-sm font-mono truncate">{key.keyValue}</code>
                          {key.isUsed && <span className="text-xs text-muted-foreground">(Usado)</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(key.keyValue, key.id)}
                          >
                            {copiedKey === key.id ? (
                              <Check className="h-4 w-4" style={{ color: "#00FFB8" }} />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          {!key.isUsed && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteKeyMutation.mutate(key.id)}
                              disabled={deleteKeyMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OrdersSection({ orders }: { orders: Order[] }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pedidos</h2>
        <p className="text-muted-foreground">Visualize todos os pedidos realizados</p>
      </div>

      {orders.length === 0 ? (
        <Card className="p-8 text-center">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">Nenhum pedido realizado</h3>
          <p className="text-sm text-muted-foreground">Os pedidos aparecerao aqui</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} data-testid={`order-row-${order.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4 flex-wrap">
                  <img
                    src={order.product.imageUrl}
                    alt={order.product.name}
                    className="w-16 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-medium">{order.product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Cliente: {order.user.firstName} - {order.user.email}
                        </p>
                        {order.user.whatsapp && (
                          <p className="text-sm text-muted-foreground">
                            WhatsApp: {order.user.whatsapp}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">R$ {order.totalPrice}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          order.status === "delivered" 
                            ? "bg-cyan-950 text-cyan-300" 
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`} style={order.status === "delivered" ? { borderColor: "#00FFB8", border: "1px solid" } : undefined}>
                          {order.status === "delivered" ? "✓ Entregue" : "⏳ Pendente"}
                        </span>
                      </div>
                    </div>
                    {order.deliveredKey && (
                      <div className="mt-2 p-2 bg-muted rounded-md">
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-white" />
                          <code className="text-sm font-mono">{order.deliveredKey}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(order.deliveredKey!, order.id)}
                          >
                            {copiedKey === order.id ? (
                              <Check className="h-4 w-4" style={{ color: "#00FFB8" }} />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function BannerSection({ settings, setSettings, products }: { settings: typeof defaultSettings; setSettings: (s: typeof defaultSettings) => void; products: Product[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Banner Principal</h2>
        <p className="text-muted-foreground">Configure o banner hero da pagina inicial</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="heroTitle">Titulo</Label>
              <Input
                id="heroTitle"
                value={settings.heroTitle}
                onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                placeholder="Titulo do banner"
                data-testid="input-hero-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">Subtitulo</Label>
              <Input
                id="heroSubtitle"
                value={settings.heroSubtitle}
                onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                placeholder="Subtitulo do banner"
                data-testid="input-hero-subtitle"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="heroPrice">Preco Exibido</Label>
              <Input
                id="heroPrice"
                value={settings.heroPrice}
                onChange={(e) => setSettings({ ...settings, heroPrice: e.target.value })}
                placeholder="R$ 99,99"
                data-testid="input-hero-price"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroProductId">Produto Vinculado</Label>
              <Select
                value={settings.heroProductId}
                onValueChange={(value) => setSettings({ ...settings, heroProductId: value })}
              >
                <SelectTrigger data-testid="select-hero-product">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {products.map((p: Product) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Plataforma</Label>
              <Select
                value={settings.heroPlatform && settings.heroPlatform.trim() ? settings.heroPlatform : "STEAM"}
                onValueChange={(value) => setSettings({ ...settings, heroPlatform: value })}
              >
                <SelectTrigger data-testid="select-hero-platform">
                  <SelectValue placeholder="Selecione uma plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STEAM">STEAM</SelectItem>
                  <SelectItem value="EA">EA</SelectItem>
                  <SelectItem value="EPIC GAMES">EPIC GAMES</SelectItem>
                  <SelectItem value="GOG">GOG</SelectItem>
                  <SelectItem value="WINDOWS">WINDOWS</SelectItem>
                  <SelectItem value="ROCKSTAR">ROCKSTAR</SelectItem>
                  <SelectItem value="UBI CONNECT">UBI CONNECT</SelectItem>
                  <SelectItem value="XBOX">XBOX</SelectItem>
                  <SelectItem value="PLAYSTATION">PLAYSTATION</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Região</Label>
              <Select
                value={settings.heroRegion || defaultSettings.heroRegion}
                onValueChange={(value) => setSettings({ ...settings, heroRegion: value })}
              >
                <SelectTrigger data-testid="select-hero-region">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Global">Global</SelectItem>
                  <SelectItem value="LATAM">LATAM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroImageUrl">URL da Imagem</Label>
            <Input
              id="heroImageUrl"
              value={settings.heroImageUrl}
              onChange={(e) => setSettings({ ...settings, heroImageUrl: e.target.value })}
              placeholder="https://..."
              data-testid="input-hero-image"
            />
          </div>
          {settings.heroImageUrl && (
            <div className="mt-4">
              <Label>Pre-visualizacao</Label>
              <div className="relative mt-2 aspect-[21/9] w-full overflow-hidden rounded-lg bg-muted">
                <img
                  src={settings.heroImageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <p className="text-xs text-white/80 uppercase">{settings.heroSubtitle}</p>
                  <h2 className="text-xl font-bold text-white">{settings.heroTitle}</h2>
                  <p className="text-sm text-white/80">
                    POR APENAS <span className="text-white font-bold">{settings.heroPrice}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  whatsapp?: string;
}

function CustomersSection() {
  const { toast } = useToast();
  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/admin/customers"],
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: (customerId: string) => 
      apiRequest("DELETE", `/api/admin/customers/${customerId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      toast({ title: "Sucesso", description: "Cliente deletado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao deletar cliente", variant: "destructive" });
    },
  });

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm("Tem certeza que deseja deletar este cliente?")) {
      deleteCustomerMutation.mutate(customerId);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Clientes</h2>
        <p className="text-muted-foreground">Total de clientes: <span className="font-semibold text-foreground">{customers.length}</span></p>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Carregando...</p>
        </Card>
      ) : customers.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">Nenhum cliente cadastrado</h3>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold truncate">{customer.firstName} {customer.lastName}</h3>
                    <p className="text-sm text-muted-foreground truncate">{customer.email}</p>
                    {customer.whatsapp && (
                      <p className="text-sm text-muted-foreground truncate">Zap: {customer.whatsapp}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive h-8 w-8"
                    onClick={() => handleDeleteCustomer(customer.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ColorsSection({ settings, setSettings }: { settings: typeof defaultSettings; setSettings: (s: typeof defaultSettings) => void }) {
  const { toast } = useToast();
  
  const saveColorsMutation = useMutation({
    mutationFn: async (newSettings: typeof defaultSettings) => {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error("Failed to save settings");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Configurações salvas com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao salvar configurações", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cores e Estilo</h2>
          <p className="text-muted-foreground">Personalize a identidade visual da loja</p>
        </div>
        <Button onClick={() => saveColorsMutation.mutate(settings)} disabled={saveColorsMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Estilos
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cor de Fundo</CardTitle>
            <CardDescription>Cor principal das seções</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
              className="h-12 p-1 cursor-pointer"
            />
            <div className="text-xs font-mono text-center uppercase">{settings.backgroundColor}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cor Primária</CardTitle>
            <CardDescription>Botões e elementos de destaque</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="color"
              value={settings.primaryColor}
              onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
              className="h-12 p-1 cursor-pointer"
            />
            <div className="text-xs font-mono text-center uppercase">{settings.primaryColor}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cor de Destaque</CardTitle>
            <CardDescription>Bordas e detalhes secundários</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="color"
              value={settings.accentColor}
              onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
              className="h-12 p-1 cursor-pointer"
            />
            <div className="text-xs font-mono text-center uppercase">{settings.accentColor}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pré-visualização</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="p-8 rounded-lg space-y-4"
            style={{ backgroundColor: settings.backgroundColor }}
          >
            <div className="flex gap-4">
              <Button style={{ backgroundColor: settings.primaryColor }}>Botão Primário</Button>
              <Button variant="outline" style={{ borderColor: settings.accentColor }}>Botão Outline</Button>
            </div>
            <div className="p-4 rounded border" style={{ borderColor: settings.accentColor }}>
              <p className="text-sm">Exemplo de card com borda personalizada.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BackupSection() {
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/backup/export", { credentials: "include" });
      if (!response.ok) throw new Error("Export failed");
      const data = await response.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({ title: "Sucesso", description: "Backup exportado com sucesso!" });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao exportar backup", variant: "destructive" });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = JSON.parse(event.target?.result as string);
          const response = await fetch("/api/admin/backup/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(content),
          });
          
          if (!response.ok) throw new Error("Import failed");
          
          toast({ title: "Sucesso", description: "Backup importado com sucesso!" });
          queryClient.invalidateQueries();
        } catch (err) {
          toast({ title: "Erro", description: "JSON inválido ou falha na importação", variant: "destructive" });
        }
      };
      reader.readAsText(file);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao ler arquivo", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Backup e Restauração</h2>
        <p className="text-muted-foreground">Gerencie a segurança dos seus dados</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Exportar Dados</CardTitle>
            <CardDescription>Baixe todos os dados da loja em um arquivo JSON</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Baixar Backup
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Importar Dados</CardTitle>
            <CardDescription>Restaure dados a partir de um arquivo JSON</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="file" accept=".json" onChange={handleImport} />
            <p className="text-xs text-amber-500 font-medium italic">
              Aviso: Isso substituirá os dados atuais.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminPage({ onBack }: AdminPageProps) {
  const { toast } = useToast();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [currentSection, setCurrentSection] = useState<AdminSection>("dashboard");
  const [settings, setSettings] = useState(defaultSettings);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    enabled: !!admin,
  });

  const { data: serverSettings } = useQuery({
    queryKey: ["/api/admin/settings"],
    enabled: !!admin,
  });

  useEffect(() => {
    if (serverSettings) {
      setSettings(prev => ({ ...prev, ...serverSettings }));
    }
  }, [serverSettings]);

  useEffect(() => {
    api.adminMe()
      .then(user => setAdmin(user))
      .catch(() => setAdmin(null));
  }, []);

  const logoutMutation = useMutation({
    mutationFn: api.adminLogout,
    onSuccess: () => {
      setAdmin(null);
      toast({ title: "Sessão encerrada" });
    },
  });

  if (!admin) {
    return <AdminLoginForm onLoginSuccess={setAdmin} />;
  }

  const renderSection = () => {
    switch (currentSection) {
      case "dashboard":
        return <DashboardSection products={products} orders={orders} />;
      case "products":
        return <ProductsSection products={products} onSave={() => {}} />;
      case "keys":
        return <KeysSection products={products} />;
      case "orders":
        return <OrdersSection orders={orders} />;
      case "customers":
        return <CustomersSection />;
      case "banner":
        return <BannerSection settings={settings} setSettings={setSettings} products={products} />;
      case "colors":
        return <ColorsSection settings={settings} setSettings={setSettings} />;
      case "backup":
        return <BackupSection />;
      default:
        return <DashboardSection products={products} orders={orders} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <AdminSidebar 
          admin={admin}
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
          onLogout={() => logoutMutation.mutate()}
          onBack={onBack}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Painel Admin</h1>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <div className="max-w-7xl mx-auto">
              {renderSection()}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
