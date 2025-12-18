import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProductKeySchema } from "@shared/schema";
import { z } from "zod";
import { createPixQrCode, checkPixStatus } from "./abacatepay";

// Validation schemas
const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1).default(1),
});

const updateCartSchema = z.object({
  quantity: z.number().int().min(0),
});

const createOrderSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
});

const checkoutCartSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1),
  })).min(1),
});

const customerRegisterSchema = z.object({
  firstName: z.string().min(1, "Nome e obrigatorio"),
  email: z.string().email("Email invalido"),
  whatsapp: z.string().min(10, "WhatsApp invalido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Products API
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const { maxPrice, platform, search } = req.query;
      
      let products;
      if (search && typeof search === "string") {
        products = await storage.searchProducts(search);
      } else if (maxPrice && typeof maxPrice === "string") {
        products = await storage.getProductsByPriceRange(parseFloat(maxPrice));
      } else if (platform && typeof platform === "string") {
        products = await storage.getProductsByPlatform(platform);
      } else {
        products = await storage.getAllProducts();
      }
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      const availableKeys = await storage.getAvailableKeyCount(req.params.id);
      res.json({ ...product, availableStock: availableKeys });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Cart API
  app.get("/api/cart", async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers["x-session-id"] as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }
      const items = await storage.getCartItems(sessionId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers["x-session-id"] as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }
      
      const parsed = addToCartSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input", details: parsed.error.errors });
      }
      
      const { productId, quantity } = parsed.data;
      
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      const item = await storage.addToCart(sessionId, productId, quantity);
      res.json(item);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ error: "Failed to add to cart" });
    }
  });

  app.patch("/api/cart/:productId", async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers["x-session-id"] as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }
      
      const parsed = updateCartSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input", details: parsed.error.errors });
      }
      
      const { quantity } = parsed.data;
      const item = await storage.updateCartItemQuantity(sessionId, req.params.productId, quantity);
      res.json(item);
    } catch (error) {
      console.error("Error updating cart:", error);
      res.status(500).json({ error: "Failed to update cart" });
    }
  });

  app.delete("/api/cart/:productId", async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers["x-session-id"] as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }
      await storage.removeFromCart(sessionId, req.params.productId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ error: "Failed to remove from cart" });
    }
  });

  // Customer Auth API
  app.post("/api/customer/register", async (req: Request, res: Response) => {
    try {
      const parsed = customerRegisterSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Dados invalidos", details: parsed.error.errors });
      }
      
      const { firstName, email, whatsapp, password } = parsed.data;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email ja cadastrado" });
      }
      
      const user = await storage.createUser({
        email,
        password,
        firstName,
        lastName: "",
        whatsapp,
        isAdmin: false,
      });
      
      const session = await storage.createCustomerSession(user.id);
      
      res.cookie("customer_session", session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
      
      res.json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName,
        whatsapp: user.whatsapp
      });
    } catch (error) {
      console.error("Error registering customer:", error);
      res.status(500).json({ error: "Falha ao criar conta" });
    }
  });

  app.post("/api/customer/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha sao obrigatorios" });
      }
      
      const user = await storage.validatePassword(email, password);
      if (!user) {
        return res.status(401).json({ error: "Email ou senha incorretos" });
      }
      
      if (user.isAdmin) {
        return res.status(403).json({ error: "Use o painel de admin para login de administrador" });
      }
      
      const session = await storage.createCustomerSession(user.id);
      
      res.cookie("customer_session", session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
      
      res.json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName,
        whatsapp: user.whatsapp
      });
    } catch (error) {
      console.error("Error customer login:", error);
      res.status(500).json({ error: "Falha ao fazer login" });
    }
  });

  app.get("/api/customer/me", async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies?.customer_session;
      if (!sessionId) {
        return res.status(401).json({ error: "Nao autenticado" });
      }
      
      const session = await storage.getCustomerSession(sessionId);
      if (!session) {
        res.clearCookie("customer_session");
        return res.status(401).json({ error: "Sessao invalida ou expirada" });
      }
      
      res.json({ 
        id: session.user.id, 
        email: session.user.email, 
        firstName: session.user.firstName,
        whatsapp: session.user.whatsapp
      });
    } catch (error) {
      console.error("Error checking customer session:", error);
      res.status(500).json({ error: "Falha ao verificar sessao" });
    }
  });

  app.post("/api/customer/logout", async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies?.customer_session;
      if (sessionId) {
        await storage.deleteCustomerSession(sessionId);
      }
      res.clearCookie("customer_session");
      res.json({ success: true });
    } catch (error) {
      console.error("Error customer logout:", error);
      res.status(500).json({ error: "Falha ao fazer logout" });
    }
  });

  // Customer Orders API
  app.get("/api/customer/orders", async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies?.customer_session;
      if (!sessionId) {
        return res.status(401).json({ error: "Nao autenticado" });
      }
      
      const session = await storage.getCustomerSession(sessionId);
      if (!session) {
        return res.status(401).json({ error: "Sessao invalida" });
      }
      
      const orders = await storage.getOrdersByUser(session.user.id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Falha ao buscar pedidos" });
    }
  });

  app.post("/api/customer/orders", async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies?.customer_session;
      if (!sessionId) {
        return res.status(401).json({ error: "Faca login para comprar" });
      }
      
      const session = await storage.getCustomerSession(sessionId);
      if (!session) {
        return res.status(401).json({ error: "Sessao invalida" });
      }
      
      const parsed = createOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Dados invalidos" });
      }
      
      const { productId, quantity } = parsed.data;
      
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ error: "Produto nao encontrado" });
      }
      
      const availableKeys = await storage.getAvailableKeyCount(productId);
      if (availableKeys < quantity) {
        return res.status(400).json({ error: "Estoque insuficiente" });
      }
      
      const totalPrice = (parseFloat(product.price) * quantity).toFixed(2);
      
      const order = await storage.createOrder({
        userId: session.user.id,
        productId,
        quantity,
        totalPrice,
        status: "pending",
      });
      
      const deliveredOrder = await storage.deliverOrder(order.id);
      
      if (deliveredOrder) {
        res.json({
          ...deliveredOrder,
          product,
          message: "Pedido realizado com sucesso! Sua chave foi entregue."
        });
      } else {
        res.json({
          ...order,
          product,
          message: "Pedido criado. Aguardando processamento."
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Falha ao criar pedido" });
    }
  });

  // PIX Payment - Checkout entire cart
  app.post("/api/customer/checkout/cart", async (req: Request, res: Response) => {
    try {
      console.log("📦 Cart checkout requested:", req.body);
      const sessionId = req.cookies?.customer_session;
      if (!sessionId) {
        return res.status(401).json({ error: "Faca login para comprar" });
      }
      
      const session = await storage.getCustomerSession(sessionId);
      if (!session) {
        return res.status(401).json({ error: "Sessao invalida" });
      }
      
      const parsed = checkoutCartSchema.safeParse(req.body);
      if (!parsed.success) {
        console.error("❌ Validation error:", parsed.error);
        return res.status(400).json({ error: "Dados invalidos" });
      }
      
      const { items } = parsed.data;
      console.log("✅ Items validated:", items);
      
      // Validate all products and calculate total
      let totalPrice = 0;
      const orderItems: any[] = [];
      
      for (const item of items) {
        const product = await storage.getProductById(item.productId);
        if (!product) {
          return res.status(404).json({ error: `Produto nao encontrado: ${item.productId}` });
        }
        
        const availableKeys = await storage.getAvailableKeyCount(item.productId);
        if (availableKeys < item.quantity) {
          return res.status(400).json({ error: `Estoque insuficiente: ${product.name}` });
        }
        
        const itemPrice = parseFloat(product.price) * item.quantity;
        totalPrice += itemPrice;
        orderItems.push({ product, quantity: item.quantity, price: itemPrice });
      }
      
      const amountInCents = Math.round(totalPrice * 100);
      
      // Create master order for cart checkout
      const order = await storage.createOrder({
        userId: session.user.id,
        productId: items[0].productId, // Primary product (first item)
        quantity: items.length, // Number of different products
        totalPrice: totalPrice.toFixed(2),
        status: "awaiting_payment",
      });
      
      console.log("🔐 Creating PIX QR Code with amount:", amountInCents);
      const pixResponse = await createPixQrCode({
        amount: amountInCents,
        expiresIn: 3600,
        description: `Compra de ${items.length} produtos`,
        metadata: {
          orderId: order.id,
          itemCount: items.length,
        },
      });
      
      console.log("📱 PIX Response:", pixResponse);
      
      if (pixResponse.error) {
        console.error("❌ PIX Error:", pixResponse.error);
        await storage.updateOrderStatus(order.id, "payment_failed");
        return res.status(500).json({ error: "Falha ao gerar QR Code PIX" });
      }
      
      const pixData = pixResponse.data;
      await storage.updateOrderPix(order.id, {
        pixId: pixData.id,
        pixBrCode: pixData.brCode,
        pixQrCodeBase64: pixData.brCodeBase64,
        pixExpiresAt: new Date(pixData.expiresAt),
      });
      
      res.json({
        orderId: order.id,
        pixId: pixData.id,
        brCode: pixData.brCode,
        qrCodeBase64: pixData.brCodeBase64,
        amount: totalPrice,
        expiresAt: pixData.expiresAt,
        items: orderItems.map(item => ({
          name: item.product.name,
          imageUrl: item.product.imageUrl,
          quantity: item.quantity,
          price: item.price,
        })),
      });
    } catch (error) {
      console.error("Error creating cart checkout:", error);
      res.status(500).json({ error: "Falha ao criar pagamento PIX" });
    }
  });

  // PIX Payment - Create checkout with QR Code
  app.post("/api/customer/checkout/pix", async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies?.customer_session;
      if (!sessionId) {
        return res.status(401).json({ error: "Faca login para comprar" });
      }
      
      const session = await storage.getCustomerSession(sessionId);
      if (!session) {
        return res.status(401).json({ error: "Sessao invalida" });
      }
      
      const parsed = createOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Dados invalidos" });
      }
      
      const { productId, quantity } = parsed.data;
      
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ error: "Produto nao encontrado" });
      }
      
      const availableKeys = await storage.getAvailableKeyCount(productId);
      if (availableKeys < quantity) {
        return res.status(400).json({ error: "Estoque insuficiente" });
      }
      
      const totalPrice = parseFloat(product.price) * quantity;
      const amountInCents = Math.round(totalPrice * 100);
      
      const order = await storage.createOrder({
        userId: session.user.id,
        productId,
        quantity,
        totalPrice: totalPrice.toFixed(2),
        status: "awaiting_payment",
      });
      
      const pixResponse = await createPixQrCode({
        amount: amountInCents,
        expiresIn: 3600,
        description: `Compra: ${product.name}`,
        metadata: {
          orderId: order.id,
        },
      });
      
      if (pixResponse.error) {
        await storage.updateOrderStatus(order.id, "payment_failed");
        return res.status(500).json({ error: "Falha ao gerar QR Code PIX" });
      }
      
      const pixData = pixResponse.data;
      await storage.updateOrderPix(order.id, {
        pixId: pixData.id,
        pixBrCode: pixData.brCode,
        pixQrCodeBase64: pixData.brCodeBase64,
        pixExpiresAt: new Date(pixData.expiresAt),
      });
      
      res.json({
        orderId: order.id,
        pixId: pixData.id,
        brCode: pixData.brCode,
        qrCodeBase64: pixData.brCodeBase64,
        amount: totalPrice,
        expiresAt: pixData.expiresAt,
        product: {
          name: product.name,
          imageUrl: product.imageUrl,
        },
      });
    } catch (error) {
      console.error("Error creating PIX checkout:", error);
      res.status(500).json({ error: "Falha ao criar pagamento PIX" });
    }
  });

  // PIX Payment - Check status
  app.get("/api/customer/orders/:orderId/pix-status", async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies?.customer_session;
      if (!sessionId) {
        return res.status(401).json({ error: "Nao autenticado" });
      }
      
      const session = await storage.getCustomerSession(sessionId);
      if (!session) {
        return res.status(401).json({ error: "Sessao invalida" });
      }
      
      const order = await storage.getOrderById(req.params.orderId);
      if (!order) {
        return res.status(404).json({ error: "Pedido nao encontrado" });
      }
      
      if (order.userId !== session.user.id) {
        return res.status(403).json({ error: "Acesso negado" });
      }
      
      if (!order.pixId) {
        return res.status(400).json({ error: "Pedido sem pagamento PIX" });
      }
      
      if (order.status === "delivered") {
        return res.json({ status: "PAID", orderStatus: "delivered" });
      }
      
      const pixStatus = await checkPixStatus(order.pixId);
      
      if (pixStatus.data.status === "PAID" && order.status !== "delivered") {
        const deliveredOrder = await storage.deliverOrder(order.id);
        if (deliveredOrder) {
          return res.json({ 
            status: "PAID", 
            orderStatus: "delivered",
            deliveredKey: deliveredOrder.deliveredKey,
          });
        } else {
          await storage.updateOrderStatus(order.id, "paid");
          return res.json({ status: "PAID", orderStatus: "paid" });
        }
      }
      
      res.json({ 
        status: pixStatus.data.status,
        orderStatus: order.status,
      });
    } catch (error) {
      console.error("Error checking PIX status:", error);
      res.status(500).json({ error: "Falha ao verificar status do pagamento" });
    }
  });

  // Webhook for AbacatePay (automatic payment confirmation)
  app.post("/api/webhooks/abacatepay", async (req: Request, res: Response) => {
    try {
      const { data } = req.body;
      
      if (!data || !data.id) {
        return res.status(400).json({ error: "Invalid webhook payload" });
      }
      
      const order = await storage.getOrderByPixId(data.id);
      if (!order) {
        console.log("Webhook received for unknown PIX ID:", data.id);
        return res.status(200).json({ received: true });
      }
      
      if (data.status === "PAID" && order.status !== "delivered") {
        const deliveredOrder = await storage.deliverOrder(order.id);
        if (!deliveredOrder) {
          await storage.updateOrderStatus(order.id, "paid");
        }
        console.log("Order delivered via webhook:", order.id);
      }
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Auth API (legacy - keeping for compatibility)
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }
      
      const user = await storage.createUser(data);
      res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      const user = await storage.validatePassword(email, password);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // Admin Auth API
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha sao obrigatorios" });
      }
      
      const user = await storage.validatePassword(email, password);
      if (!user) {
        return res.status(401).json({ error: "Email ou senha incorretos" });
      }
      
      if (!user.isAdmin) {
        return res.status(403).json({ error: "Acesso restrito a administradores" });
      }
      
      const session = await storage.createAdminSession(user.id);
      
      res.cookie("admin_session", session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });
      
      res.json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName,
        isAdmin: user.isAdmin 
      });
    } catch (error) {
      console.error("Error admin login:", error);
      res.status(500).json({ error: "Falha ao fazer login" });
    }
  });

  app.get("/api/admin/me", async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies?.admin_session;
      if (!sessionId) {
        return res.status(401).json({ error: "Nao autenticado" });
      }
      
      const session = await storage.getAdminSession(sessionId);
      if (!session) {
        res.clearCookie("admin_session");
        return res.status(401).json({ error: "Sessao invalida ou expirada" });
      }
      
      res.json({ 
        id: session.user.id, 
        email: session.user.email, 
        firstName: session.user.firstName, 
        lastName: session.user.lastName,
        isAdmin: session.user.isAdmin 
      });
    } catch (error) {
      console.error("Error checking admin session:", error);
      res.status(500).json({ error: "Falha ao verificar sessao" });
    }
  });

  app.post("/api/admin/logout", async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies?.admin_session;
      if (sessionId) {
        await storage.deleteAdminSession(sessionId);
      }
      res.clearCookie("admin_session");
      res.json({ success: true });
    } catch (error) {
      console.error("Error admin logout:", error);
      res.status(500).json({ error: "Falha ao fazer logout" });
    }
  });

  app.post("/api/admin/seed", async (req: Request, res: Response) => {
    try {
      if (process.env.NODE_ENV === "production") {
        return res.status(403).json({ error: "Nao disponivel em producao" });
      }
      
      const admin = await storage.seedAdminUser();
      res.json({ 
        message: "Admin criado/encontrado", 
        email: admin.email,
        hint: "Senha padrao: admin123" 
      });
    } catch (error) {
      console.error("Error seeding admin:", error);
      res.status(500).json({ error: "Falha ao criar admin" });
    }
  });

  // Admin Orders API
  app.get("/api/admin/orders", async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies?.admin_session;
      if (!sessionId) {
        return res.status(401).json({ error: "Nao autenticado" });
      }
      
      const session = await storage.getAdminSession(sessionId);
      if (!session) {
        return res.status(401).json({ error: "Sessao invalida" });
      }
      
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ error: "Falha ao buscar pedidos" });
    }
  });

  // Product Keys API (Admin only)
  app.get("/api/admin/products/:id/keys", async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies?.admin_session;
      if (!sessionId) {
        return res.status(401).json({ error: "Nao autenticado" });
      }
      
      const session = await storage.getAdminSession(sessionId);
      if (!session) {
        return res.status(401).json({ error: "Sessao invalida" });
      }
      
      const keys = await storage.getProductKeys(req.params.id);
      res.json(keys);
    } catch (error) {
      console.error("Error fetching product keys:", error);
      res.status(500).json({ error: "Falha ao buscar chaves" });
    }
  });

  app.post("/api/admin/products/:id/keys", async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies?.admin_session;
      if (!sessionId) {
        return res.status(401).json({ error: "Nao autenticado" });
      }
      
      const session = await storage.getAdminSession(sessionId);
      if (!session) {
        return res.status(401).json({ error: "Sessao invalida" });
      }
      
      const { keyValue } = req.body;
      if (!keyValue) {
        return res.status(400).json({ error: "Chave e obrigatoria" });
      }
      
      const key = await storage.addProductKey({
        productId: req.params.id,
        keyValue,
      });
      
      res.json(key);
    } catch (error) {
      console.error("Error adding product key:", error);
      res.status(500).json({ error: "Falha ao adicionar chave" });
    }
  });

  app.post("/api/admin/products/:id/keys/bulk", async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies?.admin_session;
      if (!sessionId) {
        return res.status(401).json({ error: "Nao autenticado" });
      }
      
      const session = await storage.getAdminSession(sessionId);
      if (!session) {
        return res.status(401).json({ error: "Sessao invalida" });
      }
      
      const { keys } = req.body;
      if (!keys || !Array.isArray(keys)) {
        return res.status(400).json({ error: "Lista de chaves e obrigatoria" });
      }
      
      const addedKeys = [];
      for (const keyValue of keys) {
        if (keyValue.trim()) {
          const key = await storage.addProductKey({
            productId: req.params.id,
            keyValue: keyValue.trim(),
          });
          addedKeys.push(key);
        }
      }
      
      res.json({ success: true, count: addedKeys.length, keys: addedKeys });
    } catch (error) {
      console.error("Error adding bulk keys:", error);
      res.status(500).json({ error: "Falha ao adicionar chaves" });
    }
  });

  app.delete("/api/admin/keys/:id", async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies?.admin_session;
      if (!sessionId) {
        return res.status(401).json({ error: "Nao autenticado" });
      }
      
      const session = await storage.getAdminSession(sessionId);
      if (!session) {
        return res.status(401).json({ error: "Sessao invalida" });
      }
      
      await storage.deleteProductKey(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting key:", error);
      res.status(500).json({ error: "Falha ao deletar chave" });
    }
  });

  // Site Settings API
  app.get("/api/settings", async (req: Request, res: Response) => {
    try {
      const settings = await storage.getAllSettings();
      const settingsMap: Record<string, string> = {};
      for (const s of settings) {
        settingsMap[s.key] = s.value;
      }
      res.json(settingsMap);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/settings/:key", async (req: Request, res: Response) => {
    try {
      const value = await storage.getSetting(req.params.key);
      if (value === null) {
        return res.status(404).json({ error: "Setting not found" });
      }
      res.json({ key: req.params.key, value });
    } catch (error) {
      console.error("Error fetching setting:", error);
      res.status(500).json({ error: "Failed to fetch setting" });
    }
  });

  app.post("/api/settings", async (req: Request, res: Response) => {
    try {
      const { key, value } = req.body;
      if (!key || value === undefined) {
        return res.status(400).json({ error: "Key and value are required" });
      }
      const setting = await storage.setSetting(key, value);
      res.json(setting);
    } catch (error) {
      console.error("Error saving setting:", error);
      res.status(500).json({ error: "Failed to save setting" });
    }
  });

  app.post("/api/settings/bulk", async (req: Request, res: Response) => {
    try {
      const settings = req.body as Record<string, string>;
      const results = [];
      for (const [key, value] of Object.entries(settings)) {
        const setting = await storage.setSetting(key, value);
        results.push(setting);
      }
      res.json({ success: true, count: results.length });
    } catch (error) {
      console.error("Error saving settings:", error);
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  app.delete("/api/settings/:key", async (req: Request, res: Response) => {
    try {
      await storage.deleteSetting(req.params.key);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting setting:", error);
      res.status(500).json({ error: "Failed to delete setting" });
    }
  });

  // Products management
  app.put("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      const updated = await storage.updateProduct(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  app.post("/api/products", async (req: Request, res: Response) => {
    try {
      const product = await storage.createProduct(req.body);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // Seed products (for initial setup)
  app.post("/api/seed", async (req: Request, res: Response) => {
    try {
      const existingProducts = await storage.getAllProducts();
      if (existingProducts.length > 0) {
        return res.json({ message: "Products already seeded", count: existingProducts.length });
      }

      const sampleProducts = [
        {
          name: "Beholder 2",
          imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=500&fit=crop",
          platform: "Steam",
          region: "Global",
          price: "9.56",
          originalPrice: "39.99",
          discount: 76,
          description: "Beholder 2 - Agora voce faz parte do Ministerio!",
          category: "adventure",
        },
        {
          name: "Gravity Circuit",
          imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=500&fit=crop",
          platform: "Steam",
          region: "Global",
          price: "8.66",
          originalPrice: "52.49",
          discount: 84,
          description: "Acao e plataforma com mecanicas de combo",
          category: "action",
        },
        {
          name: "Nomad Survival",
          imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=500&fit=crop",
          platform: "Steam",
          region: "Global",
          price: "4.99",
          originalPrice: "19.99",
          discount: 75,
          description: "Sobreviva em um mundo hostil",
          category: "survival",
        },
        {
          name: "S.W.I.N.E.",
          imageUrl: "https://images.unsplash.com/photo-1493711662062-fa541f7f75a3?w=400&h=500&fit=crop",
          platform: "Steam",
          region: "Global",
          price: "7.50",
          originalPrice: "24.99",
          discount: 70,
          description: "Estrategia tatica em tempo real",
          category: "strategy",
        },
      ];

      for (const product of sampleProducts) {
        await storage.createProduct(product);
      }

      res.json({ message: "Products seeded successfully", count: sampleProducts.length });
    } catch (error) {
      console.error("Error seeding products:", error);
      res.status(500).json({ error: "Failed to seed products" });
    }
  });

  return httpServer;
}
