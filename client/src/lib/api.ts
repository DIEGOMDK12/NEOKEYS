const getSessionId = (): string => {
  let sessionId = localStorage.getItem("elitevault-session-id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("elitevault-session-id", sessionId);
  }
  return sessionId;
};

async function fetchWithSession(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set("x-session-id", getSessionId());
  if (options.body) {
    headers.set("Content-Type", "application/json");
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  
  return response.json();
}

export const api = {
  // Products
  getProducts: async (params?: { maxPrice?: number; platform?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.maxPrice) queryParams.set("maxPrice", params.maxPrice.toString());
    if (params?.platform) queryParams.set("platform", params.platform);
    if (params?.search) queryParams.set("search", params.search);
    
    const url = `/api/products${queryParams.toString() ? `?${queryParams}` : ""}`;
    return fetchWithSession(url);
  },

  getProduct: async (id: string) => {
    return fetchWithSession(`/api/products/${id}`);
  },

  // Cart
  getCart: async () => {
    return fetchWithSession("/api/cart");
  },

  addToCart: async (productId: string, quantity = 1) => {
    return fetchWithSession("/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  },

  updateCartQuantity: async (productId: string, quantity: number) => {
    return fetchWithSession(`/api/cart/${productId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
  },

  removeFromCart: async (productId: string) => {
    return fetchWithSession(`/api/cart/${productId}`, {
      method: "DELETE",
    });
  },

  // Auth
  register: async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    return fetchWithSession("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login: async (email: string, password: string) => {
    return fetchWithSession("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  // Seed
  seedProducts: async () => {
    return fetchWithSession("/api/seed", {
      method: "POST",
    });
  },

  // Settings
  getSettings: async () => {
    return fetchWithSession("/api/settings");
  },

  saveSetting: async (key: string, value: string) => {
    return fetchWithSession("/api/settings", {
      method: "POST",
      body: JSON.stringify({ key, value }),
    });
  },

  saveSettings: async (settings: Record<string, string>) => {
    return fetchWithSession("/api/settings/bulk", {
      method: "POST",
      body: JSON.stringify(settings),
    });
  },

  // Product Management
  createProduct: async (data: {
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
  }) => {
    return fetchWithSession("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateProduct: async (id: string, data: Partial<{
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
  }>) => {
    return fetchWithSession(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteProduct: async (id: string) => {
    return fetchWithSession(`/api/products/${id}`, {
      method: "DELETE",
    });
  },

  // Admin Auth
  adminLogin: async (email: string, password: string) => {
    return fetchWithSession("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  adminMe: async () => {
    return fetchWithSession("/api/admin/me");
  },

  adminLogout: async () => {
    return fetchWithSession("/api/admin/logout", {
      method: "POST",
    });
  },

  seedAdmin: async () => {
    return fetchWithSession("/api/admin/seed", {
      method: "POST",
    });
  },
};
