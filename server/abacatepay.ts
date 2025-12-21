const ABACATEPAY_API_URL = "https://api.abacatepay.com/v1";
const ABACATEPAY_WEBHOOK_ID = process.env.ABACATEPAY_WEBHOOK_KEY || "webh_prod_Qr2yP6eRNfsrDZNfqZ5ELtka";
const ABACATEPAY_WEBHOOK_URL = process.env.WEBHOOK_URL || "https://elitevault.fun/webhook";

interface PixCustomer {
  name: string;
  cellphone: string;
  email: string;
  taxId: string;
}

interface CreatePixQrCodeRequest {
  amount: number;
  expiresIn?: number;
  description?: string;
  customer?: PixCustomer;
  metadata?: Record<string, string>;
  returnUrl?: string;
  completionUrl?: string;
}

interface PixQrCodeResponse {
  data: {
    id: string;
    amount: number;
    status: "PENDING" | "PAID" | "EXPIRED";
    devMode: boolean;
    brCode: string;
    brCodeBase64: string;
    platformFee: number;
    createdAt: string;
    updatedAt: string;
    expiresAt: string;
  };
  error: string | null;
}

interface CheckPixStatusResponse {
  data: {
    id: string;
    status: "PENDING" | "PAID" | "EXPIRED";
    amount: number;
  };
  error: string | null;
}

export async function createPixQrCode(request: CreatePixQrCodeRequest): Promise<PixQrCodeResponse> {
    const apiKey = process.env.ABACATEPAY_API_KEY;
    
    console.log("📡 AbacatePay - Verificando API Key...");
    console.log("API Key exists:", !!apiKey);
    console.log("API Key length:", apiKey?.length || 0);
    console.log("API Key start:", apiKey?.substring(0, 10) + "...");
    
    if (!apiKey) {
      console.error("❌ ABACATEPAY_API_KEY not configured!");
      throw new Error("ABACATEPAY_API_KEY not configured");
    }

    const payload = {
      amount: request.amount,
      expiresIn: request.expiresIn || 3600,
      description: request.description,
      metadata: request.metadata,
      methods: ["PIX"],
      returnUrl: request.returnUrl || "https://elitevault.fun/orders",
      completionUrl: request.completionUrl || "https://elitevault.fun/orders",
      customer: {
        name: request.customer?.name || "Cliente EliteVault",
        cellphone: request.customer?.cellphone || "11999999999",
        email: request.customer?.email || "contato@elitevault.fun",
        taxId: request.customer?.taxId || "00000000000"
      }
    };

    console.log("📦 Payload AbacatePay:", JSON.stringify({ ...payload, customer: "HIDDEN" }, null, 2));

  try {
    console.log(`🚀 Enviando requisição para: ${ABACATEPAY_API_URL}/pixQrCode/create`);
    const response = await fetch(`${ABACATEPAY_API_URL}/pixQrCode/create`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("📥 Resposta recebida com status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ AbacatePay API Error Status:", response.status);
      console.error("❌ AbacatePay API Error Body:", errorText);
      throw new Error(`AbacatePay API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ Resposta QR Code PIX obtida com sucesso!");
    return result;
  } catch (error) {
    console.error("❌ Erro ao chamar AbacatePay API:", error);
    throw error;
  }
}

export async function checkPixStatus(pixId: string): Promise<CheckPixStatusResponse> {
  const apiKey = process.env.ABACATEPAY_API_KEY;
  
  if (!apiKey) {
    throw new Error("ABACATEPAY_API_KEY not configured");
  }

  const response = await fetch(`${ABACATEPAY_API_URL}/pixQrCode/check?id=${pixId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AbacatePay API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function simulatePixPayment(pixId: string): Promise<void> {
  const apiKey = process.env.ABACATEPAY_API_KEY;
  
  if (!apiKey) {
    throw new Error("ABACATEPAY_API_KEY not configured");
  }

  const response = await fetch(`${ABACATEPAY_API_URL}/pixQrCode/simulate`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: pixId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AbacatePay simulate error: ${response.status} - ${errorText}`);
  }
}
