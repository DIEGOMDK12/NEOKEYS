import { useState, useEffect } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, Check, Clock, CheckCircle, Loader2, QrCode } from "lucide-react";

interface CartItem {
  productId: string;
  name: string;
  imageUrl: string;
  quantity: number;
  price: number;
}

interface PixCheckoutProps {
  productId?: string;
  productName?: string;
  productImage?: string;
  productPrice?: number;
  quantity?: number;
  cartItems?: CartItem[];
  onBack: () => void;
  onSuccess: () => void;
  onLoginRequired: () => void;
}

interface PixData {
  orderId: string;
  pixId: string;
  brCode: string;
  qrCodeBase64: string;
  amount: number;
  expiresAt: string;
  items?: CartItem[];
}

interface PixStatusResponse {
  status: "PENDING" | "PAID" | "EXPIRED";
  orderStatus: string;
  deliveredKey?: string;
}

export default function PixCheckout({
  productId,
  productName,
  productImage,
  productPrice,
  quantity,
  cartItems,
  onBack,
  onSuccess,
  onLoginRequired,
}: PixCheckoutProps) {
  const { toast } = useToast();
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [deliveredKey, setDeliveredKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Determine if this is a cart checkout or single product
  const isCartCheckout = !!cartItems && cartItems.length > 0;

  // Create PIX on mount
  useEffect(() => {
    const createPix = async () => {
      try {
        console.log("🚀 Starting PIX checkout...");
        console.log("Is cart checkout?", isCartCheckout);
        console.log("Cart items:", cartItems);
        console.log("Product ID:", productId);
        
        let response;
        
        if (isCartCheckout) {
          console.log("📦 Creating cart checkout with items:", cartItems);
          // Cart checkout
          response = await apiRequest("POST", "/api/customer/checkout/cart", {
            items: cartItems!.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          });
        } else {
          console.log("📄 Creating single product checkout:", { productId, quantity });
          // Single product checkout
          response = await apiRequest("POST", "/api/customer/checkout/pix", {
            productId,
            quantity: quantity || 1,
          });
        }
        
        console.log("✅ Response received:", response.status);
        const data = await response.json();
        console.log("📊 Response data:", data);

        if (data.error) {
          console.error("❌ Error in response:", data.error);
          if (data.error.includes("login") || data.error.includes("Sessao")) {
            onLoginRequired();
            return;
          }
          toast({ title: "Erro", description: data.error, variant: "destructive" });
          setIsLoading(false);
          return;
        }

        console.log("🎉 PIX data set successfully");
        setPixData(data);
      } catch (error: any) {
        console.error("💥 Exception caught:", error);
        toast({
          title: "Erro ao criar pagamento",
          description: error.message || "Tente novamente",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    createPix();
  }, [productId, quantity, cartItems, isCartCheckout, onLoginRequired, toast]);

  // Poll for payment status
  useEffect(() => {
    if (!pixData?.orderId || isPaid) return;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/customer/orders/${pixData.orderId}/pix-status`, {
          credentials: "include",
        });
        const data: PixStatusResponse = await response.json();

        if (data.status === "PAID") {
          setIsPaid(true);
          if (data.deliveredKey) {
            setDeliveredKey(data.deliveredKey);
          }
          queryClient.invalidateQueries({ queryKey: ["/api/customer/orders"] });
          toast({
            title: "Pagamento confirmado!",
            description: "Redirecionando para seus pedidos...",
          });
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      } catch (error) {
        console.error("Error checking status:", error);
      }
    };

    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [pixData?.orderId, isPaid, toast, onSuccess]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "Copiado!" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Erro ao copiar", variant: "destructive" });
    }
  };

  const formatTime = (expiresAt: string) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();
    if (diff <= 0) return "Expirado";
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    if (!pixData?.expiresAt) return;
    const update = () => setTimeLeft(formatTime(pixData.expiresAt));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [pixData?.expiresAt]);

  // Pagamento confirmado
  if (isPaid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
        <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Compra Confirmada!</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-lg">
          <Card className="border-green-500/30 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20">
            <CardContent className="p-8 text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="h-20 w-20 text-green-500 animate-pulse" />
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-2">Pagamento Confirmado!</h2>
                <p className="text-muted-foreground">Sua chave foi entregue</p>
              </div>

              {deliveredKey && (
                <>
                  <Separator />
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <p className="text-sm font-semibold text-left">Sua Chave de Ativação:</p>
                    <div className="flex items-center gap-2 bg-background p-3 rounded-md border">
                      <code className="flex-1 text-sm font-mono break-all text-primary">
                        {deliveredKey}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(deliveredKey)}
                        data-testid="button-copy-key"
                        className="flex-shrink-0"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              <Button onClick={onSuccess} className="w-full" size="lg" data-testid="button-view-orders">
                Ver Meus Pedidos
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Carregando
  if (isLoading || !pixData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Gerando QR Code PIX...</p>
        </div>
      </div>
    );
  }

  // Calcular total
  const displayItems = isCartCheckout ? pixData.items || [] : [{
    productId: productId || "",
    name: productName || "",
    imageUrl: productImage || "",
    quantity: quantity || 1,
    price: productPrice || 0,
  }];

  const totalItems = displayItems.reduce((sum, item) => sum + item.quantity, 0);

  // QR Code PIX
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Pagamento PIX</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg space-y-4">
        {/* Resumo dos Itens */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{isCartCheckout ? "Itens do Carrinho" : "Produto"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {displayItems.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                  <p className="text-sm font-bold text-primary mt-1">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            
            {displayItems.length > 1 && (
              <>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total ({totalItems} itens):</span>
                  <span className="text-primary">R$ {pixData.amount.toFixed(2)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* QR Code PIX */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="flex items-center gap-2 text-base">
                <QrCode className="h-5 w-5" />
                QR Code PIX
              </CardTitle>
              <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {timeLeft}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* QR Code */}
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg">
                <img
                  src={pixData.qrCodeBase64}
                  alt="QR Code PIX"
                  className="w-56 h-56 rounded"
                  data-testid="img-qr-code"
                />
              </div>
            </div>

            {/* Código PIX */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Escaneie o QR Code com seu banco ou copie o código:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={pixData.brCode}
                  className="flex-1 bg-muted px-3 py-2 rounded-md text-xs font-mono truncate"
                  data-testid="input-pix-code"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(pixData.brCode)}
                  data-testid="button-copy-pix"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Status */}
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg text-center space-y-2">
              <div className="flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
              <p className="text-sm font-medium">Aguardando pagamento...</p>
              <p className="text-xs text-muted-foreground">
                O pagamento será confirmado automaticamente
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
