import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Product } from "./ProductCard";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  onViewCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onViewCart,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const originalTotal = items.reduce(
    (sum, item) => sum + item.product.originalPrice * item.quantity,
    0
  );
  const savings = originalTotal - total;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        data-testid="overlay-cart"
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-bold text-lg">Carrinho</h2>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-cart">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <p>Seu carrinho esta vazio</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-16 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {item.product.name} - {item.product.platform} / {item.product.region}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-primary font-bold text-sm">
                        R$ {item.product.price.toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        R$ {item.product.originalPrice.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          onUpdateQuantity(item.product.id, Math.max(0, item.quantity - 1))
                        }
                        data-testid={`button-decrease-${item.product.id}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        data-testid={`button-increase-${item.product.id}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto text-muted-foreground"
                        onClick={() => onRemoveItem(item.product.id)}
                        data-testid={`button-remove-${item.product.id}`}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {items.length > 0 && (
          <>
            <Separator />
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total</span>
                <span className="font-bold">R$ {total.toFixed(2).replace(".", ",")} BRL</span>
              </div>
              {savings > 0 && (
                <p className="text-primary text-sm">
                  Voce economizou R$ {savings.toFixed(2).replace(".", ",")}!
                </p>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onViewCart}
                  data-testid="button-view-cart"
                >
                  Ver carrinho
                </Button>
                <Button className="flex-1" onClick={onCheckout} data-testid="button-checkout">
                  Checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
