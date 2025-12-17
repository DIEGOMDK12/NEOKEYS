import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, Check, Clock, CheckCircle, Loader2, QrCode } from "lucide-react";

interface PixCheckoutProps {
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  quantity: number;
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
  product: {
    name: string;
    imageUrl: string;
  };
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
  onBack,
  onSuccess,
  onLoginRequired,
}: PixCheckoutProps) {
  const { toast } = useToast();
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [deliveredKey, setDeliveredKey] = useState<string | null>(null);

  const createPixMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/customer/checkout/pix", {
        productId,
        quantity,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.error) {
        if (data.error.includes("login") || data.error.includes("Sessao")) {
          onLoginRequired();
          return;
        }
        toast({ title: "Erro", description: data.error, variant: "destructive" });
        return;
      }
      setPixData(data);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar pagamento",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    createPixMutation.mutate();
  }, []);

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
  }, [pixData?.orderId, isPaid, toast]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "Codigo PIX copiado!" });
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

  if (createPixMutation.isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Gerando QR Code PIX...</p>
        </div>
      </div>
    );
  }

  if (isPaid) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Pagamento Confirmado</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-lg">
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Pagamento Confirmado!</h2>
              <p className="text-muted-foreground mb-6">
                Sua compra foi processada com sucesso.
              </p>

              {deliveredKey && (
                <div className="bg-muted p-4 rounded-lg mb-6">
                  <p className="text-sm font-medium mb-2">Sua Chave:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background px-3 py-2 rounded text-sm font-mono break-all">
                      {deliveredKey}
                    </code>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(deliveredKey)}
                      data-testid="button-copy-key"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}

              <Button onClick={onSuccess} className="w-full" data-testid="button-view-orders">
                Ver Meus Pedidos
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!pixData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Erro ao gerar pagamento</p>
          <Button className="mt-4" onClick={onBack} data-testid="button-try-again">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Pagamento PIX</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <img
                src={productImage}
                alt={productName}
                className="w-16 h-16 object-cover rounded-md"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{productName}</h3>
                <p className="text-sm text-muted-foreground">Quantidade: {quantity}</p>
              </div>
              <p className="text-xl font-bold text-primary">
                R$ {pixData.amount.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code PIX
              </CardTitle>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeLeft}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <img
                src={pixData.qrCodeBase64}
                alt="QR Code PIX"
                className="w-64 h-64 rounded-lg border"
                data-testid="img-qr-code"
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Escaneie o QR Code ou copie o codigo abaixo:
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
                  variant="outline"
                  onClick={() => copyToClipboard(pixData.brCode)}
                  data-testid="button-copy-pix"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  Copiar
                </Button>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Aguardando pagamento...</p>
              <p className="text-xs text-muted-foreground">
                O pagamento sera confirmado automaticamente
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
