import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Package, Key, Copy, Check, ShoppingBag, LogOut, User } from "lucide-react";

interface CustomerUser {
  id: string;
  email: string;
  firstName: string;
  whatsapp: string | null;
}

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  platform: string;
  price: string;
}

interface Order {
  id: string;
  productId: string;
  quantity: number;
  totalPrice: string;
  status: string;
  deliveredKey: string | null;
  createdAt: string;
  product: Product;
}

interface CustomerDashboardProps {
  onBack: () => void;
  onLoginRequired: () => void;
}

export default function CustomerDashboard({ onBack, onLoginRequired }: CustomerDashboardProps) {
  const { toast } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");

  const { data: user, isLoading: userLoading, error: userError } = useQuery<CustomerUser>({
    queryKey: ["/api/customer/me"],
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/customer/orders"],
    enabled: !!user,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/customer/logout"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/me"] });
      onBack();
    },
  });

  useEffect(() => {
    if (userError) {
      onLoginRequired();
    }
  }, [userError, onLoginRequired]);

  const copyToClipboard = async (key: string, orderId: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(orderId);
      toast({ title: "Chave copiada!" });
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast({ title: "Erro ao copiar", variant: "destructive" });
    }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge variant="default" className="bg-green-600">Entregue</Badge>;
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>;
      case "awaiting_payment":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Aguardando Pagamento</Badge>;
      case "paid":
        return <Badge variant="default" className="bg-blue-600">Pago</Badge>;
      case "payment_failed":
        return <Badge variant="destructive">Falha no Pagamento</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Minha Conta</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Ola, {user.firstName}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => logoutMutation.mutate()}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "orders" ? "default" : "outline"}
            onClick={() => setActiveTab("orders")}
            data-testid="tab-orders"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Minhas Compras
          </Button>
          <Button
            variant={activeTab === "profile" ? "default" : "outline"}
            onClick={() => setActiveTab("profile")}
            data-testid="tab-profile"
          >
            <User className="h-4 w-4 mr-2" />
            Meu Perfil
          </Button>
        </div>

        {activeTab === "orders" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Minhas Compras ({orders.length})
            </h2>

            {ordersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-20 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Voce ainda nao fez nenhuma compra.</p>
                  <Button className="mt-4" onClick={onBack} data-testid="button-start-shopping">
                    Comecar a comprar
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} data-testid={`order-card-${order.id}`}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={order.product.imageUrl}
                          alt={order.product.name}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <h3 className="font-semibold">{order.product.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {order.product.platform} - Qtd: {order.quantity}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">R$ {order.totalPrice}</p>
                              {getStatusBadge(order.status)}
                            </div>
                          </div>

                          {order.deliveredKey && (
                            <div className="mt-4 p-3 bg-muted rounded-md">
                              <div className="flex items-center gap-2 mb-2">
                                <Key className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Sua Chave:</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 bg-background px-3 py-2 rounded text-sm font-mono break-all">
                                  {order.deliveredKey}
                                </code>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => copyToClipboard(order.deliveredKey!, order.id)}
                                  data-testid={`button-copy-key-${order.id}`}
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
        )}

        {activeTab === "profile" && (
          <div className="max-w-md">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Meu Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Nome</Label>
                  <p className="font-medium" data-testid="text-user-name">{user.firstName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium" data-testid="text-user-email">{user.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">WhatsApp</Label>
                  <p className="font-medium" data-testid="text-user-whatsapp">{user.whatsapp || "-"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
