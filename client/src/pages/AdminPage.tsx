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
  backgroundColor: "#1f1a3d",
  primaryColor: "#8b5cf6",
  accentColor: "#fbbf24",
};

type AdminSection = "dashboard" | "products" | "keys" | "orders" | "customers" | "banner" | "colors";

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
        <CardTitle className="text-2xl">Painel Administrativo</CardTitle>
        <CardDescription>Entre com suas credenciais de administrador</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">E-mail</Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@exemplo.com"
              required
              data-testid="input-admin-email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Senha</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
              data-testid="input-admin-password"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loginMutation.isPending}
            data-testid="button-admin-login"
          >
            {loginMutation.isPending ? "Entrando..." : "Entrar"}
          </Button>
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
    { id: "colors" as AdminSection, title: "Cores", icon: Palette },
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

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    isActive={currentSection === item.id}
                    data-testid={`sidebar-${item.id}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
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
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Sucesso", description: "Produto excluido com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao excluir produto", variant: "destructive" });
    },
  });

  const handleCreateProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.originalPrice) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatorios", variant: "destructive" });
      return;
    }
    createProductMutation.mutate(newProduct);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    updateProductMutation.mutate({ id: editingProduct.id, data: editingProduct });
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      deleteProductMutation.mutate(id);
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
                <Label>Nome do Produto *</Label>
                <Input
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Ex: Cyberpunk 2077"
                  data-testid="input-product-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Imagem do Produto</Label>
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
                  <img src={newProduct.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-md mt-2" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plataforma</Label>
                  <Select
                    value={newProduct.platform}
                    onValueChange={(value) => setNewProduct({ ...newProduct, platform: value })}
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
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preco *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="29.99"
                    data-testid="input-product-price"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preco Original *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                    placeholder="59.99"
                    data-testid="input-product-original-price"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Desconto %</Label>
                  <Input
                    type="number"
                    value={newProduct.discount}
                    onChange={(e) => setNewProduct({ ...newProduct, discount: parseInt(e.target.value) || 0 })}
                    placeholder="50"
                    data-testid="input-product-discount"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    placeholder="action, rpg, etc"
                    data-testid="input-product-category"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descricao</Label>
                <Textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Descricao do produto..."
                  rows={3}
                  data-testid="input-product-description"
                />
              </div>
              <div className="space-y-2">
                <Label>URL do Video (YouTube, Vimeo, etc)</Label>
                <Input
                  value={newProduct.videoUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/embed/..."
                  data-testid="input-product-video"
                />
              </div>
              <div className="space-y-2">
                <Label>Requisitos de Sistema</Label>
                <Textarea
                  value={newProduct.systemRequirements}
                  onChange={(e) => setNewProduct({ ...newProduct, systemRequirements: e.target.value })}
                  placeholder="Sistema Operacional: Windows 7/8/10&#10;Processador: Intel Core i3&#10;Memoria: 4 GB de RAM&#10;etc..."
                  rows={3}
                  data-testid="input-product-system-requirements"
                />
              </div>
              <div className="space-y-2">
                <Label>Imagens da Galeria</Label>
                <p className="text-xs text-muted-foreground mb-2">Carregue imagens do seu dispositivo</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    Promise.all(
                      files.map(file => {
                        return new Promise<string>((resolve) => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            resolve(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        });
                      })
                    ).then(dataUrls => {
                      setNewProduct({ ...newProduct, galleryImages: [...newProduct.galleryImages, ...dataUrls] });
                    });
                  }}
                  className="block w-full text-sm border border-input rounded-md cursor-pointer px-3 py-2"
                  data-testid="input-product-gallery-upload"
                />
                {newProduct.galleryImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {newProduct.galleryImages.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img src={img} alt={`Gallery ${idx}`} className="w-full h-20 object-cover rounded-md" />
                        <button
                          type="button"
                          onClick={() => {
                            const newGallery = newProduct.galleryImages.filter((_, i) => i !== idx);
                            setNewProduct({ ...newProduct, galleryImages: newGallery });
                          }}
                          className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80"
                          data-testid={`button-remove-gallery-${idx}`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button
                onClick={handleCreateProduct}
                disabled={createProductMutation.isPending}
                className="w-full"
                data-testid="button-create-product"
              >
                {createProductMutation.isPending ? "Criando..." : "Criar Produto"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden" data-testid={`card-product-${product.id}`}>
            <div className="aspect-[4/3] relative">
              <img
                src={product.imageUrl || "https://via.placeholder.com/400x300"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.discount > 0 && (
                <span className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md">
                  -{product.discount}%
                </span>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold truncate">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.platform} - {product.region}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-bold text-white">R$ {product.price}</span>
                {parseFloat(product.originalPrice) > parseFloat(product.price) && (
                  <span className="text-sm text-muted-foreground line-through">R$ {product.originalPrice}</span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2">
                {(product.availableStock ?? 0) > 0 ? (
                  <span className="text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full" data-testid={`stock-${product.id}`}>
                    Em estoque: {product.availableStock}
                  </span>
                ) : (
                  <span className="text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full" data-testid={`stock-${product.id}`}>
                    Sem estoque
                  </span>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditingProduct(product)}
                      data-testid={`button-edit-product-${product.id}`}
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Editar Produto</DialogTitle>
                    </DialogHeader>
                    {editingProduct && editingProduct.id === product.id && (
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label>Nome do Produto</Label>
                          <Input
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Imagem do Produto</Label>
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
                          {editingProduct.imageUrl && (
                            <img src={editingProduct.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-md mt-2" />
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Plataforma</Label>
                            <Select
                              value={editingProduct.platform}
                              onValueChange={(value) => setEditingProduct({ ...editingProduct, platform: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Steam">Steam</SelectItem>
                                <SelectItem value="Epic">Epic Games</SelectItem>
                                <SelectItem value="Origin">Origin</SelectItem>
                                <SelectItem value="Uplay">Uplay</SelectItem>
                                <SelectItem value="GOG">GOG</SelectItem>
                                <SelectItem value="EA">EA</SelectItem>
                                <SelectItem value="Xbox">Xbox</SelectItem>
                                <SelectItem value="PlayStation">PlayStation</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Região</Label>
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
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Preco</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingProduct.price}
                              onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Preco Original</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingProduct.originalPrice}
                              onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>URL do Video</Label>
                          <Input
                            value={editingProduct.videoUrl || ""}
                            onChange={(e) => setEditingProduct({ ...editingProduct, videoUrl: e.target.value })}
                            placeholder="https://www.youtube.com/embed/..."
                            data-testid="input-edit-product-video"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Requisitos de Sistema</Label>
                          <Textarea
                            value={editingProduct.systemRequirements || ""}
                            onChange={(e) => setEditingProduct({ ...editingProduct, systemRequirements: e.target.value })}
                            placeholder="Sistema Operacional: Windows 7/8/10&#10;Processador: Intel Core i3&#10;etc..."
                            rows={3}
                            data-testid="input-edit-product-system-requirements"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Imagens da Galeria</Label>
                          <p className="text-xs text-muted-foreground mb-2">Carregue imagens do seu dispositivo</p>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              Promise.all(
                                files.map(file => {
                                  return new Promise<string>((resolve) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      resolve(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  });
                                })
                              ).then(dataUrls => {
                                setEditingProduct({ 
                                  ...editingProduct, 
                                  galleryImages: [...(editingProduct.galleryImages || []), ...dataUrls] 
                                });
                              });
                            }}
                            className="block w-full text-sm border border-input rounded-md cursor-pointer px-3 py-2"
                            data-testid="input-edit-product-gallery-upload"
                          />
                          {editingProduct.galleryImages && editingProduct.galleryImages.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mt-3">
                              {editingProduct.galleryImages.map((img, idx) => (
                                <div key={idx} className="relative">
                                  <img src={img} alt={`Gallery ${idx}`} className="w-full h-20 object-cover rounded-md" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newGallery = editingProduct.galleryImages!.filter((_, i) => i !== idx);
                                      setEditingProduct({ ...editingProduct, galleryImages: newGallery });
                                    }}
                                    className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80"
                                    data-testid={`button-edit-remove-gallery-${idx}`}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Desconto %</Label>
                          <Input
                            type="number"
                            value={editingProduct.discount}
                            onChange={(e) => setEditingProduct({ ...editingProduct, discount: parseInt(e.target.value) || 0 })}
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
                              <Check className="h-4 w-4 text-green-500" />
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
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}>
                          {order.status === "delivered" ? "Entregue" : "Pendente"}
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
                              <Check className="h-4 w-4 text-green-500" />
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
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Carregando clientes...</p>
          </CardContent>
        </Card>
      ) : customers.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Nome</th>
                    <th className="px-6 py-3 text-left font-medium">Email</th>
                    <th className="px-6 py-3 text-left font-medium">WhatsApp</th>
                    <th className="px-6 py-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b border-border hover:bg-muted/50">
                      <td className="px-6 py-3" data-testid={`text-customer-name-${customer.id}`}>
                        {customer.firstName} {customer.lastName}
                      </td>
                      <td className="px-6 py-3" data-testid={`text-customer-email-${customer.id}`}>
                        {customer.email}
                      </td>
                      <td className="px-6 py-3" data-testid={`text-customer-whatsapp-${customer.id}`}>
                        {customer.whatsapp || "-"}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer.id)}
                          disabled={deleteCustomerMutation.isPending}
                          data-testid={`button-delete-customer-${customer.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ColorsSection({ settings, setSettings }: { settings: typeof defaultSettings; setSettings: (s: typeof defaultSettings) => void }) {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Cores e Tema</h2>
          <p className="text-muted-foreground">Personalize as cores do seu site</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setSettings({
              ...settings,
              backgroundColor: defaultSettings.backgroundColor,
              primaryColor: defaultSettings.primaryColor,
              accentColor: defaultSettings.accentColor,
            });
            toast({ title: "Cores restauradas", description: "As cores foram restauradas para o padrao" });
          }}
          data-testid="button-restore-colors"
        >
          Restaurar Padrao
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Cor de Fundo</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  id="backgroundColor"
                  value={settings.backgroundColor}
                  onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                  className="w-12 h-9 p-1 cursor-pointer"
                  data-testid="input-bg-color"
                />
                <Input
                  value={settings.backgroundColor}
                  onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                  placeholder="#1a1a2e"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Cor Primaria</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  id="primaryColor"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-12 h-9 p-1 cursor-pointer"
                  data-testid="input-primary-color"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  placeholder="#8b5cf6"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accentColor">Cor de Destaque</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  id="accentColor"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  className="w-12 h-9 p-1 cursor-pointer"
                  data-testid="input-accent-color"
                />
                <Input
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  placeholder="#fbbf24"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <div className="p-4 rounded-md border" style={{ backgroundColor: settings.backgroundColor }}>
            <p className="text-sm" style={{ color: settings.primaryColor }}>Pre-visualizacao das cores</p>
            <p className="text-xs mt-1" style={{ color: settings.accentColor }}>Cor de destaque</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboard({ admin, onLogout, onBack }: { admin: AdminUser; onLogout: () => void; onBack: () => void }) {
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState<AdminSection>("dashboard");
  const [settings, setSettings] = useState<typeof defaultSettings>({
    ...defaultSettings,
    heroPlatform: "STEAM",
    heroRegion: "Global",
  });

  const { data: savedSettings = {} } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: () => api.getSettings(),
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: () => api.getProducts(),
  });

  const { data: allOrders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  // Filter only paid and delivered orders
  const orders = allOrders.filter(o => o.status === "paid" || o.status === "delivered");

  const logoutMutation = useMutation({
    mutationFn: () => api.adminLogout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/me"] });
      onLogout();
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: (newSettings: Record<string, string>) => api.saveSettings(newSettings),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Configuracoes salvas com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao salvar configuracoes", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (Object.keys(savedSettings).length > 0 && !saveSettingsMutation.isPending) {
      // Garante que SEMPRE temos valores válidos, mesmo para configurações antigas
      const processedSettings = {
        ...defaultSettings,
        ...savedSettings,
        heroPlatform: (savedSettings.heroPlatform || '').trim() || defaultSettings.heroPlatform,
        heroRegion: (savedSettings.heroRegion || '').trim() || defaultSettings.heroRegion,
      };
      setSettings(processedSettings);
    }
  }, [savedSettings, saveSettingsMutation.isPending]);

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background">
        <AdminSidebar
          admin={admin}
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
          onLogout={handleLogout}
          onBack={onBack}
        />

        <div className="flex flex-col flex-1 min-w-0">
          <header className="sticky top-0 z-50 flex items-center justify-between gap-4 px-4 py-3 border-b border-border bg-background">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-lg font-semibold capitalize">{currentSection}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {admin.firstName} {admin.lastName}
              </span>
              {(currentSection === "banner" || currentSection === "colors") && (
                <Button 
                  onClick={handleSaveSettings} 
                  disabled={saveSettingsMutation.isPending}
                  data-testid="button-save-settings"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveSettingsMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6">
            {currentSection === "dashboard" && (
              <DashboardSection products={products} orders={orders} />
            )}
            {currentSection === "products" && (
              <ProductsSection products={products} onSave={() => {}} />
            )}
            {currentSection === "keys" && (
              <KeysSection products={products} />
            )}
            {currentSection === "orders" && (
              <OrdersSection orders={orders} />
            )}
            {currentSection === "customers" && (
              <CustomersSection />
            )}
            {currentSection === "banner" && (
              <BannerSection settings={settings} setSettings={setSettings} products={products} />
            )}
            {currentSection === "colors" && (
              <ColorsSection settings={settings} setSettings={setSettings} />
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function AdminPage({ onBack }: AdminPageProps) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const { data: adminData, isLoading, error } = useQuery({
    queryKey: ["/api/admin/me"],
    queryFn: () => api.adminMe(),
    retry: false,
  });

  useEffect(() => {
    if (!isLoading) {
      if (adminData && !error) {
        setAdmin(adminData);
      }
      setIsCheckingAuth(false);
    }
  }, [adminData, isLoading, error]);

  const handleLogout = () => {
    setAdmin(null);
  };

  if (isCheckingAuth || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Verificando autenticação...</div>
      </div>
    );
  }

  if (!admin) {
    return <AdminLoginForm onLoginSuccess={(user) => setAdmin(user)} />;
  }

  return <AdminDashboard admin={admin} onLogout={handleLogout} onBack={onBack} />;
}
