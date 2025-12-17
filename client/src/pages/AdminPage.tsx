import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save, Plus, Trash2, Edit2, Image, Settings, Package, LayoutDashboard, LogOut, Lock } from "lucide-react";
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
};

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

  const seedMutation = useMutation({
    mutationFn: () => api.seedAdmin(),
    onSuccess: (data) => {
      toast({ 
        title: "Admin Criado", 
        description: `Email: ${data.email} - Senha: admin123` 
      });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao criar admin", variant: "destructive" });
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
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              data-testid="button-seed-admin"
            >
              {seedMutation.isPending ? "Criando..." : "Criar Usuario Admin Padrao"}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Cria um admin com email: admin@neonkeys.com e senha: admin123
            </p>
          </div>
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
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="hero" data-testid="tab-hero">
              <Image className="h-4 w-4 mr-2" />
              Banner Hero
            </TabsTrigger>
            <TabsTrigger value="site" data-testid="tab-site">
              <Settings className="h-4 w-4 mr-2" />
              Configuracoes
            </TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">
              <Package className="h-4 w-4 mr-2" />
              Produtos
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
                <CardTitle>Configuracoes do Site</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
