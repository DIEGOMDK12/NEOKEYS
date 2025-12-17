import { db } from "./db";
import { users, products, cartItems, type InsertUser, type User, type InsertProduct, type Product, type InsertCartItem, type CartItem } from "@shared/schema";
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

  // Cart
  getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(sessionId: string, productId: string, quantity: number): Promise<CartItem>;
  updateCartItemQuantity(sessionId: string, productId: string, quantity: number): Promise<CartItem | null>;
  removeFromCart(sessionId: string, productId: string): Promise<void>;
  clearCart(sessionId: string): Promise<void>;
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
}

export const storage = new DatabaseStorage();
