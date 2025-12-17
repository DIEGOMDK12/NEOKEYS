import { useState } from "react";
import CartDrawer, { CartItem } from "../CartDrawer";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

// todo: remove mock functionality
const initialItems: CartItem[] = [
  {
    product: {
      id: "1",
      name: "Beholder 2",
      imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=500&fit=crop",
      platform: "Steam",
      region: "Global",
      price: 9.56,
      originalPrice: 39.99,
      discount: 76,
    },
    quantity: 1,
  },
];

export default function CartDrawerExample() {
  const [isOpen, setIsOpen] = useState(true);
  const [items, setItems] = useState<CartItem[]>(initialItems);

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      setItems(items.filter((item) => item.product.id !== productId));
    } else {
      setItems(
        items.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (productId: string) => {
    setItems(items.filter((item) => item.product.id !== productId));
  };

  return (
    <div className="min-h-[400px] bg-background">
      <Button onClick={() => setIsOpen(true)} variant="outline">
        <ShoppingCart className="h-4 w-4 mr-2" />
        Abrir Carrinho
      </Button>
      <CartDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={items}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => console.log("Checkout")}
        onViewCart={() => console.log("View cart")}
      />
    </div>
  );
}
