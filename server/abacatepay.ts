const ABACATEPAY_API_URL = "https://api.abacatepay.com/v1";

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
  const webhookUrl = process.env.WEBHOOK_URL || "https://elitevault.fun/webhook";
  
  if (!apiKey) {
    console.error("ABACATEPAY_API_KEY is not configured!");
    throw new Error("ABACATEPAY_API_KEY not configured");
  }

  const payload = {
    ...request,
    returnUrl: request.returnUrl || webhookUrl,
    completionUrl: request.completionUrl || webhookUrl,
  };

  try {
    const response = await fetch(`${ABACATEPAY_API_URL}/pixQrCode/create`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AbacatePay API Error Status:", response.status);
      console.error("AbacatePay API Error Body:", errorText);
      throw new Error(`AbacatePay API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error calling AbacatePay API:", error);
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
