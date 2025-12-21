import { db } from "./db";
import { 
  users, products, cartItems, siteSettings, adminSessions, customerSessions, productKeys, orders,
  type InsertUser, type User, type InsertProduct, type Product, type InsertCartItem, type CartItem, 
  type SiteSettings, type AdminSession, type CustomerSession, type InsertProductKey, type ProductKey,
  type InsertOrder, type Order
} from "@shared/schema";
import { eq, and, lte, ilike, or, gt, desc } from "drizzle-orm";
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

  // Product Keys
  getProductKeys(productId: string): Promise<ProductKey[]>;
  getAvailableKeys(productId: string): Promise<ProductKey[]>;
  addProductKey(key: InsertProductKey): Promise<ProductKey>;
  deleteProductKey(id: string): Promise<void>;
  markKeyAsUsed(keyId: string, orderId: string): Promise<ProductKey>;
  getAvailableKeyCount(productId: string): Promise<number>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrdersByUser(userId: string): Promise<(Order & { product: Product })[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  deliverOrder(orderId: string): Promise<Order | null>;
  getAllOrders(): Promise<(Order & { product: Product; user: User })[]>;

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

  // Admin Sessions
  createAdminSession(userId: string): Promise<AdminSession>;
  getAdminSession(sessionId: string): Promise<(AdminSession & { user: User }) | null>;
  deleteAdminSession(sessionId: string): Promise<void>;
  seedAdminUser(): Promise<User>;

  // Customer Sessions
  createCustomerSession(userId: string): Promise<CustomerSession>;
  getCustomerSession(sessionId: string): Promise<(CustomerSession & { user: User }) | null>;
  deleteCustomerSession(sessionId: string): Promise<void>;
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
    await db.delete(orders).where(eq(orders.productId, id));
    await db.delete(productKeys).where(eq(productKeys.productId, id));
    await db.delete(products).where(eq(products.id, id));
  }

  // Product Keys
  async getProductKeys(productId: string): Promise<ProductKey[]> {
    return db.select().from(productKeys).where(eq(productKeys.productId, productId));
  }

  async getAvailableKeys(productId: string): Promise<ProductKey[]> {
    return db.select().from(productKeys).where(
      and(eq(productKeys.productId, productId), eq(productKeys.isUsed, false))
    );
  }

  async addProductKey(key: InsertProductKey): Promise<ProductKey> {
    const [newKey] = await db.insert(productKeys).values(key).returning();
    return newKey;
  }

  async deleteProductKey(id: string): Promise<void> {
    await db.delete(productKeys).where(eq(productKeys.id, id));
  }

  async markKeyAsUsed(keyId: string, orderId: string): Promise<ProductKey> {
    const [updated] = await db.update(productKeys)
      .set({ isUsed: true, orderId })
      .where(eq(productKeys.id, keyId))
      .returning();
    return updated;
  }

  async getAvailableKeyCount(productId: string): Promise<number> {
    const keys = await this.getAvailableKeys(productId);
    return keys.length;
  }

  // Orders
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrdersByUser(userId: string): Promise<(Order & { product: Product })[]> {
    const userOrders = await db.select().from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
    
    const result: (Order & { product: Product })[] = [];
    for (const order of userOrders) {
      const product = await this.getProductById(order.productId);
      if (product) {
        result.push({ ...order, product });
      }
    }
    return result;
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [updated] = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async deliverOrder(orderId: string): Promise<Order | null> {
    const order = await this.getOrderById(orderId);
    if (!order) return null;

    const availableKeys = await this.getAvailableKeys(order.productId);
    if (availableKeys.length === 0) return null;

    const key = availableKeys[0];
    await this.markKeyAsUsed(key.id, orderId);

    const [updated] = await db.update(orders)
      .set({ 
        status: "delivered", 
        deliveredKey: key.keyValue,
        productKeyId: key.id
      })
      .where(eq(orders.id, orderId))
      .returning();
    
    return updated;
  }

  async getAllOrders(): Promise<(Order & { product: Product; user: User })[]> {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    
    const result: (Order & { product: Product; user: User })[] = [];
    for (const order of allOrders) {
      const product = await this.getProductById(order.productId);
      const user = await this.getUser(order.userId);
      if (product && user) {
        result.push({ ...order, product, user });
      }
    }
    return result;
  }

  async updateOrderPix(orderId: string, pixData: {
    pixId: string;
    pixBrCode: string;
    pixQrCodeBase64: string;
    pixExpiresAt: Date;
  }): Promise<Order> {
    const [updated] = await db.update(orders)
      .set(pixData)
      .where(eq(orders.id, orderId))
      .returning();
    return updated;
  }

  async getOrderByPixId(pixId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.pixId, pixId));
    return order;
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

  // Admin Sessions
  async createAdminSession(userId: string): Promise<AdminSession> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const [session] = await db.insert(adminSessions).values({
      userId,
      expiresAt,
    }).returning();
    return session;
  }

  async getAdminSession(sessionId: string): Promise<(AdminSession & { user: User }) | null> {
    const [session] = await db.select().from(adminSessions)
      .where(and(
        eq(adminSessions.id, sessionId),
        gt(adminSessions.expiresAt, new Date())
      ));
    if (!session) return null;

    const user = await this.getUser(session.userId);
    if (!user || !user.isAdmin) return null;

    return { ...session, user };
  }

  async deleteAdminSession(sessionId: string): Promise<void> {
    await db.delete(adminSessions).where(eq(adminSessions.id, sessionId));
  }

  async seedAdminUser(): Promise<User> {
    const existingAdmin = await db.select().from(users).where(eq(users.isAdmin, true));
    const adminEmail = "diego.ndk999@gmail.com";
    const hashedPassword = await bcrypt.hash("506731", 10);

    if (existingAdmin.length > 0) {
      const admin = existingAdmin[0];
      const [updatedAdmin] = await db.update(users)
        .set({
          email: adminEmail,
          password: hashedPassword,
          firstName: "Diego",
          lastName: "Marinho",
        })
        .where(eq(users.id, admin.id))
        .returning();
      return updatedAdmin;
    }

    const [admin] = await db.insert(users).values({
      email: adminEmail,
      password: hashedPassword,
      firstName: "Diego",
      lastName: "Marinho",
      isAdmin: true,
      taxId: "00000000000",
    }).returning();
    return admin;
  }

  // Customer Sessions
  async createCustomerSession(userId: string): Promise<CustomerSession> {
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const [session] = await db.insert(customerSessions).values({
      userId,
      expiresAt,
    }).returning();
    return session;
  }

  async getCustomerSession(sessionId: string): Promise<(CustomerSession & { user: User }) | null> {
    const [session] = await db.select().from(customerSessions)
      .where(and(
        eq(customerSessions.id, sessionId),
        gt(customerSessions.expiresAt, new Date())
      ));
    if (!session) return null;

    const user = await this.getUser(session.userId);
    if (!user) return null;

    return { ...session, user };
  }

  async deleteCustomerSession(sessionId: string): Promise<void> {
    await db.delete(customerSessions).where(eq(customerSessions.id, sessionId));
  }
}

export const storage = new DatabaseStorage();
