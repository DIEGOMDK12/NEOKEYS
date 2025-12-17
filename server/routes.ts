import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

// Validation schemas
const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1).default(1),
});

const updateCartSchema = z.object({
  quantity: z.number().int().min(0),
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
      res.json(product);
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
      
      // Verify product exists
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

  // Auth API
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
        {
          name: "Cyberpunk 2077",
          imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=500&fit=crop",
          platform: "Steam",
          region: "Global",
          price: "29.99",
          originalPrice: "59.99",
          discount: 50,
          description: "RPG de mundo aberto em Night City",
          category: "rpg",
        },
        {
          name: "Elden Ring",
          imageUrl: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=400&h=500&fit=crop",
          platform: "Steam",
          region: "Global",
          price: "35.99",
          originalPrice: "69.99",
          discount: 49,
          description: "Acao RPG de FromSoftware",
          category: "rpg",
        },
        {
          name: "Hogwarts Legacy",
          imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=500&fit=crop",
          platform: "Steam",
          region: "Global",
          price: "39.99",
          originalPrice: "79.99",
          discount: 50,
          description: "Viva sua fantasia em Hogwarts",
          category: "rpg",
        },
        {
          name: "Red Dead Redemption 2",
          imageUrl: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=400&h=500&fit=crop",
          platform: "Steam",
          region: "Global",
          price: "24.99",
          originalPrice: "59.99",
          discount: 58,
          description: "Aventura epica no velho oeste",
          category: "adventure",
        },
        {
          name: "FIFA 24",
          imageUrl: "https://images.unsplash.com/photo-1493711662062-fa541f7f75a3?w=400&h=500&fit=crop",
          platform: "EA",
          region: "Global",
          price: "34.99",
          originalPrice: "69.99",
          discount: 50,
          description: "O melhor futebol do mundo",
          category: "sports",
        },
        {
          name: "Fortnite Bundle",
          imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=500&fit=crop",
          platform: "Epic",
          region: "Global",
          price: "19.99",
          originalPrice: "39.99",
          discount: 50,
          description: "Pack exclusivo Fortnite",
          category: "action",
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
