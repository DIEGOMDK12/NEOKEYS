import { X, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
        data-testid="overlay-cart"
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 flex flex-col shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-white" />
            <h2 className="font-bold text-lg">Seu Carrinho</h2>
            {items.length > 0 && (
              <Badge variant="default" className="ml-2">
                {items.length}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-cart" className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
              <ShoppingCart className="h-12 w-12 opacity-20" />
              <p className="text-center">Seu carrinho está vazio</p>
              <p className="text-sm">Adicione produtos para começar</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map((item) => (
                <div 
                  key={item.product.id} 
                  className="bg-card border border-border rounded-lg p-3 hover-elevate transition-all"
                >
                  <div className="flex gap-3">
                    <div className="relative">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-20 h-24 object-cover rounded-md"
                      />
                      {item.product.discount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 text-xs"
                        >
                          -{item.product.discount}%
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-sm line-clamp-2">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.product.platform} • {item.product.region}
                        </p>
                      </div>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-white font-bold text-sm">
                            R$ {(item.product.price).toFixed(2).replace(".", ",")}
                          </span>
                          <span className="text-xs text-muted-foreground line-through">
                            R$ {item.product.originalPrice.toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 bg-muted rounded-md p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                onUpdateQuantity(item.product.id, Math.max(0, item.quantity - 1))
                              }
                              data-testid={`button-decrease-${item.product.id}`}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              data-testid={`button-increase-${item.product.id}`}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => onRemoveItem(item.product.id)}
                            data-testid={`button-remove-${item.product.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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
            <div className="p-4 space-y-3 border-t border-border bg-card/30">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">R$ {originalTotal.toFixed(2).replace(".", ",")}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400 font-medium">Economia</span>
                    <span className="text-green-600 dark:text-green-400 font-bold">
                      -R$ {savings.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                )}
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold text-white">R$ {total.toFixed(2).replace(".", ",")} BRL</span>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onViewCart}
                  data-testid="button-view-cart"
                >
                  Editar
                </Button>
                <Button 
                  className="flex-1 bg-white hover:bg-white/90" 
                  onClick={onCheckout} 
                  data-testid="button-checkout"
                >
                  Comprar Agora
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
