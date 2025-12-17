import { db } from "./db";
import { users, products, cartItems, siteSettings, type InsertUser, type User, type InsertProduct, type Product, type InsertCartItem, type CartItem, type SiteSettings } from "@shared/schema";
import { eq, and, lte, ilike, or } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validatePassword(email: string, password: string): Promise<User | null>;

  // Products
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByPriceRange(maxPrice: number): Promise<Product[]>;
  getProductsByPlatform(platform: string): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // Cart
  getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(sessionId: string, productId: string, quantity: number): Promise<CartItem>;
  updateCartItemQuantity(sessionId: string, productId: string, quantity: number): Promise<CartItem | null>;
  removeFromCart(sessionId: string, productId: string): Promise<void>;
  clearCart(sessionId: string): Promise<void>;

  // Site Settings
  getAllSettings(): Promise<SiteSettings[]>;
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<SiteSettings>;
  deleteSetting(key: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
    }).returning();
    return user;
  }

  async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductsByPriceRange(maxPrice: number): Promise<Product[]> {
    return db.select().from(products).where(lte(products.price, maxPrice.toString()));
  }

  async getProductsByPlatform(platform: string): Promise<Product[]> {
    return db.select().from(products).where(ilike(products.platform, `%${platform}%`));
  }

  async searchProducts(query: string): Promise<Product[]> {
    return db.select().from(products).where(
      or(
        ilike(products.name, `%${query}%`),
        ilike(products.platform, `%${query}%`),
        ilike(products.category, `%${query}%`)
      )
    );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db.update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.productId, id));
    await db.delete(products).where(eq(products.id, id));
  }

  // Cart
  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const items = await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
    const result: (CartItem & { product: Product })[] = [];
    
    for (const item of items) {
      const product = await this.getProductById(item.productId);
      if (product) {
        result.push({ ...item, product });
      }
    }
    
    return result;
  }

  async addToCart(sessionId: string, productId: string, quantity: number): Promise<CartItem> {
    // Check if item already exists
    const [existing] = await db.select().from(cartItems)
      .where(and(eq(cartItems.sessionId, sessionId), eq(cartItems.productId, productId)));
    
    if (existing) {
      const [updated] = await db.update(cartItems)
        .set({ quantity: existing.quantity + quantity })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    }

    const [item] = await db.insert(cartItems).values({
      sessionId,
      productId,
      quantity,
    }).returning();
    return item;
  }

  async updateCartItemQuantity(sessionId: string, productId: string, quantity: number): Promise<CartItem | null> {
    if (quantity <= 0) {
      await this.removeFromCart(sessionId, productId);
      return null;
    }

    const [updated] = await db.update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.sessionId, sessionId), eq(cartItems.productId, productId)))
      .returning();
    return updated || null;
  }

  async removeFromCart(sessionId: string, productId: string): Promise<void> {
    await db.delete(cartItems)
      .where(and(eq(cartItems.sessionId, sessionId), eq(cartItems.productId, productId)));
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  // Site Settings
  async getAllSettings(): Promise<SiteSettings[]> {
    return db.select().from(siteSettings);
  }

  async getSetting(key: string): Promise<string | null> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting?.value ?? null;
  }

  async setSetting(key: string, value: string): Promise<SiteSettings> {
    const [existing] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    
    if (existing) {
      const [updated] = await db.update(siteSettings)
        .set({ value })
        .where(eq(siteSettings.key, key))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(siteSettings).values({ key, value }).returning();
    return created;
  }

  async deleteSetting(key: string): Promise<void> {
    await db.delete(siteSettings).where(eq(siteSettings.key, key));
  }
}

export const storage = new DatabaseStorage();
