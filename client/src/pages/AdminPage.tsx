import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save, Plus, Trash2, Edit2, Image, Settings, Package, LayoutDashboard, LogOut, Lock, Key, ShoppingBag, Palette, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

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

const defaultSettings = {
  heroTitle: "RIMS RACING ULTIMATE EDITION",
  heroSubtitle: "DISPONIVEL AGORA!",
  heroPrice: "R$ 46,92",
  heroImageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&h=600&fit=crop",
  heroProductId: "",
  siteName: "NeonKeys",
  contactPhone: "000-000-0000",
  contactEmail: "info@neonkeys.com",
  footerText: "2024 NeonKeys. Todos os direitos reservados.",
  backgroundColor: "#1a1a2e",
  primaryColor: "#16a34a",
  accentColor: "#22c55e",
};

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

function AdminLoginForm({ onLoginSuccess }: { onLoginSuccess: (user: AdminUser) => void }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => api.adminLogin(email, password),
    onSuccess: (data) => {
      toast({ title: "Bem-vindo!", description: `Ola, ${data.firstName}!` });
      onLoginSuccess(data);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro", 
        description: error.message || "Email ou senha incorretos",
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
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Painel Administrativo</CardTitle>
          <CardDescription>Entre com suas credenciais de administrador</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
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

function AdminDashboard({ admin, onLogout, onBack }: { admin: AdminUser; onLogout: () => void; onBack: () => void }) {
  const { toast } = useToast();
  const [settings, setSettings] = useState(defaultSettings);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [selectedProductForKeys, setSelectedProductForKeys] = useState<Product | null>(null);
  const [newKeyValue, setNewKeyValue] = useState("");
  const [bulkKeys, setBulkKeys] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
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
  });

  const { data: savedSettings = {} } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: () => api.getSettings(),
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: () => api.getProducts(),
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const { data: productKeys = [], isLoading: keysLoading, refetch: refetchKeys } = useQuery<ProductKey[]>({
    queryKey: ["/api/admin/products", selectedProductForKeys?.id, "keys"],
    enabled: !!selectedProductForKeys,
  });

  useEffect(() => {
    if (Object.keys(savedSettings).length > 0) {
      setSettings((prev) => ({
        ...prev,
        ...savedSettings,
      }));
    }
  }, [savedSettings]);

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
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Sucesso", description: "Configuracoes salvas com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao salvar configuracoes", variant: "destructive" });
    },
  });

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

  const addKeyMutation = useMutation({
    mutationFn: ({ productId, keyValue }: { productId: string; keyValue: string }) =>
      fetch(`/api/admin/products/${productId}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ keyValue }),
      }).then((r) => r.json()),
    onSuccess: () => {
      refetchKeys();
      setNewKeyValue("");
      toast({ title: "Sucesso", description: "Chave adicionada!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao adicionar chave", variant: "destructive" });
    },
  });

  const addBulkKeysMutation = useMutation({
    mutationFn: ({ productId, keys }: { productId: string; keys: string[] }) =>
      fetch(`/api/admin/products/${productId}/keys/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ keys }),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      refetchKeys();
      setBulkKeys("");
      toast({ title: "Sucesso", description: `${data.count} chaves adicionadas!` });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao adicionar chaves", variant: "destructive" });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: (keyId: string) =>
      fetch(`/api/admin/keys/${keyId}`, {
        method: "DELETE",
        credentials: "include",
      }).then((r) => r.json()),
    onSuccess: () => {
      refetchKeys();
      toast({ title: "Sucesso", description: "Chave removida!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao remover chave", variant: "destructive" });
    },
  });

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

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settings);
  };

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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold">Painel Administrativo</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {admin.firstName} {admin.lastName}
            </span>
            <Button onClick={handleSaveSettings} disabled={saveSettingsMutation.isPending} data-testid="button-save-settings">
              <Save className="h-4 w-4 mr-2" />
              {saveSettingsMutation.isPending ? "Salvando..." : "Salvar Tudo"}
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-admin-logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-6xl mx-auto">
        <Tabs defaultValue="hero" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="hero" data-testid="tab-hero">
              <Image className="h-4 w-4 mr-2" />
              Banner
            </TabsTrigger>
            <TabsTrigger value="site" data-testid="tab-site">
              <Palette className="h-4 w-4 mr-2" />
              Cores
            </TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">
              <Package className="h-4 w-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="keys" data-testid="tab-keys">
              <Key className="h-4 w-4 mr-2" />
              Chaves
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Pedidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Banner Principal (Hero)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                          POR APENAS <span className="text-primary font-bold">{settings.heroPrice}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="site">
            <Card>
              <CardHeader>
                <CardTitle>Cores e Configuracoes</CardTitle>
                <CardDescription>Personalize as cores do seu site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Cores do Site</h3>
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
                          placeholder="#16a34a"
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
                          placeholder="#22c55e"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-md border" style={{ backgroundColor: settings.backgroundColor }}>
                    <p className="text-sm" style={{ color: settings.primaryColor }}>Pre-visualizacao das cores</p>
                    <p className="text-xs mt-1" style={{ color: settings.accentColor }}>Texto de destaque</p>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-medium">Informacoes do Site</h3>
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Nome do Site</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      placeholder="Nome do site"
                      data-testid="input-site-name"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Telefone de Contato</Label>
                      <Input
                        id="contactPhone"
                        value={settings.contactPhone}
                        onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                        placeholder="(00) 0000-0000"
                        data-testid="input-contact-phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email de Contato</Label>
                      <Input
                        id="contactEmail"
                        value={settings.contactEmail}
                        onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                        placeholder="email@exemplo.com"
                        data-testid="input-contact-email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footerText">Texto do Rodape</Label>
                    <Textarea
                      id="footerText"
                      value={settings.footerText}
                      onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                      placeholder="Texto do rodape"
                      data-testid="input-footer-text"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <CardTitle>Gerenciar Produtos</CardTitle>
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
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          placeholder="Nome do produto"
                          data-testid="input-new-product-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>URL da Imagem</Label>
                        <Input
                          value={newProduct.imageUrl}
                          onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                          placeholder="https://..."
                          data-testid="input-new-product-image"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Plataforma</Label>
                          <Select
                            value={newProduct.platform}
                            onValueChange={(v) => setNewProduct({ ...newProduct, platform: v })}
                          >
                            <SelectTrigger data-testid="select-new-product-platform">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Steam">Steam</SelectItem>
                              <SelectItem value="Epic">Epic Games</SelectItem>
                              <SelectItem value="EA">EA</SelectItem>
                              <SelectItem value="GOG">GOG</SelectItem>
                              <SelectItem value="Xbox">Xbox</SelectItem>
                              <SelectItem value="PlayStation">PlayStation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Regiao</Label>
                          <Select
                            value={newProduct.region}
                            onValueChange={(v) => setNewProduct({ ...newProduct, region: v })}
                          >
                            <SelectTrigger data-testid="select-new-product-region">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Global">Global</SelectItem>
                              <SelectItem value="BR">Brasil</SelectItem>
                              <SelectItem value="US">Estados Unidos</SelectItem>
                              <SelectItem value="EU">Europa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Preco</Label>
                          <Input
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                            placeholder="29.99"
                            data-testid="input-new-product-price"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Preco Original</Label>
                          <Input
                            value={newProduct.originalPrice}
                            onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                            placeholder="59.99"
                            data-testid="input-new-product-original-price"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Desconto %</Label>
                          <Input
                            type="number"
                            value={newProduct.discount}
                            onChange={(e) => setNewProduct({ ...newProduct, discount: parseInt(e.target.value) || 0 })}
                            placeholder="50"
                            data-testid="input-new-product-discount"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select
                          value={newProduct.category}
                          onValueChange={(v) => setNewProduct({ ...newProduct, category: v })}
                        >
                          <SelectTrigger data-testid="select-new-product-category">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="action">Acao</SelectItem>
                            <SelectItem value="adventure">Aventura</SelectItem>
                            <SelectItem value="rpg">RPG</SelectItem>
                            <SelectItem value="strategy">Estrategia</SelectItem>
                            <SelectItem value="sports">Esportes</SelectItem>
                            <SelectItem value="survival">Sobrevivencia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Descricao</Label>
                        <Textarea
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          placeholder="Descricao do produto"
                          data-testid="input-new-product-description"
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={handleCreateProduct}
                        disabled={createProductMutation.isPending}
                        data-testid="button-create-product"
                      >
                        {createProductMutation.isPending ? "Criando..." : "Criar Produto"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Carregando produtos...</div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Nenhum produto cadastrado</div>
                ) : (
                  <div className="space-y-2">
                    {products.map((product: Product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between gap-4 p-3 rounded-md border border-border"
                        data-testid={`product-row-${product.id}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-16 object-cover rounded-md"
                          />
                          <div className="min-w-0">
                            <h3 className="font-medium truncate">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {product.platform} - R$ {product.price}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingProduct(product)}
                                data-testid={`button-edit-${product.id}`}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Editar Produto</DialogTitle>
                              </DialogHeader>
                              {editingProduct && editingProduct.id === product.id && (
                                <div className="space-y-4 pt-4">
                                  <div className="space-y-2">
                                    <Label>Nome</Label>
                                    <Input
                                      value={editingProduct.name}
                                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                      data-testid="input-edit-product-name"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>URL da Imagem</Label>
                                    <Input
                                      value={editingProduct.imageUrl}
                                      onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                                      data-testid="input-edit-product-image"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Plataforma</Label>
                                      <Select
                                        value={editingProduct.platform}
                                        onValueChange={(v) => setEditingProduct({ ...editingProduct, platform: v })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Steam">Steam</SelectItem>
                                          <SelectItem value="Epic">Epic Games</SelectItem>
                                          <SelectItem value="EA">EA</SelectItem>
                                          <SelectItem value="GOG">GOG</SelectItem>
                                          <SelectItem value="Xbox">Xbox</SelectItem>
                                          <SelectItem value="PlayStation">PlayStation</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Regiao</Label>
                                      <Select
                                        value={editingProduct.region}
                                        onValueChange={(v) => setEditingProduct({ ...editingProduct, region: v })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Global">Global</SelectItem>
                                          <SelectItem value="BR">Brasil</SelectItem>
                                          <SelectItem value="US">Estados Unidos</SelectItem>
                                          <SelectItem value="EU">Europa</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                      <Label>Preco</Label>
                                      <Input
                                        value={editingProduct.price}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                        data-testid="input-edit-product-price"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Preco Original</Label>
                                      <Input
                                        value={editingProduct.originalPrice}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: e.target.value })}
                                        data-testid="input-edit-product-original-price"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Desconto %</Label>
                                      <Input
                                        type="number"
                                        value={editingProduct.discount}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, discount: parseInt(e.target.value) || 0 })}
                                        data-testid="input-edit-product-discount"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Categoria</Label>
                                    <Select
                                      value={editingProduct.category || ""}
                                      onValueChange={(v) => setEditingProduct({ ...editingProduct, category: v })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="action">Acao</SelectItem>
                                        <SelectItem value="adventure">Aventura</SelectItem>
                                        <SelectItem value="rpg">RPG</SelectItem>
                                        <SelectItem value="strategy">Estrategia</SelectItem>
                                        <SelectItem value="sports">Esportes</SelectItem>
                                        <SelectItem value="survival">Sobrevivencia</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Descricao</Label>
                                    <Textarea
                                      value={editingProduct.description || ""}
                                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                      data-testid="input-edit-product-description"
                                    />
                                  </div>
                                  <Button
                                    className="w-full"
                                    onClick={handleUpdateProduct}
                                    disabled={updateProductMutation.isPending}
                                    data-testid="button-update-product"
                                  >
                                    {updateProductMutation.isPending ? "Salvando..." : "Salvar Alteracoes"}
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deleteProductMutation.isPending}
                            data-testid={`button-delete-${product.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keys">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Chaves de Produto</CardTitle>
                <CardDescription>Adicione e gerencie as chaves de ativacao dos produtos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                                <Key className={`h-4 w-4 ${key.isUsed ? "text-muted-foreground" : "text-primary"}`} />
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
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos</CardTitle>
                <CardDescription>Visualize todos os pedidos realizados</CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Carregando pedidos...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Nenhum pedido realizado</div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-start gap-4 p-4 rounded-md border"
                        data-testid={`order-row-${order.id}`}
                      >
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
                                <Key className="h-4 w-4 text-primary" />
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
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
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
        <div className="text-muted-foreground">Verificando autenticacao...</div>
      </div>
    );
  }

  if (!admin) {
    return <AdminLoginForm onLoginSuccess={(user) => setAdmin(user)} />;
  }

  return <AdminDashboard admin={admin} onLogout={handleLogout} onBack={onBack} />;
}
