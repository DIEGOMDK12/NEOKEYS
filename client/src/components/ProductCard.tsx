import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiSteam, SiEpicgames, SiGogdotcom, SiPlaystation } from "react-icons/si";
import { Gamepad2, ShoppingCart } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  platform: string;
  region: string;
  price: number;
  originalPrice: number;
  discount: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

const platformIcons: Record<string, any> = {
  Steam: SiSteam,
  Epic: SiEpicgames,
  GOG: SiGogdotcom,
  Xbox: Gamepad2,
  PlayStation: SiPlaystation,
};

export default function ProductCard({ product, onAddToCart, onProductClick }: ProductCardProps) {
  const PlatformIcon = platformIcons[product.platform] || SiSteam;

  return (
    <Card
      className="overflow-hidden cursor-pointer hover-elevate active-elevate-2 bg-card border-0 rounded-lg"
      onClick={() => onProductClick(product)}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative aspect-[3/4]">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover rounded-t-lg"
        />
        {product.discount > 0 && (
          <div className="absolute top-4 -left-2">
            <div 
              className="bg-primary text-primary-foreground text-lg font-black px-4 py-2 rounded-r-md shadow-lg"
              style={{
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
              }}
            >
              -{product.discount}%
            </div>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-[10px] gap-1 bg-black/80 text-white border-0 px-2 py-1">
            <PlatformIcon className="h-3 w-3" />
            {product.platform.toUpperCase()}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-12">
          <h3 className="text-white font-bold text-sm mb-1 line-clamp-2" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
          <Badge variant="secondary" className="text-[10px] bg-primary text-primary-foreground border-0 font-bold px-2 py-1">
            MIDIA DIGITAL
          </Badge>
        </div>
      </div>
      <div className="p-3 bg-card">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div>
            <span className="text-primary font-bold text-lg" data-testid={`text-price-${product.id}`}>
              R$ {product.price.toFixed(2).replace(".", ",")}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-muted-foreground line-through ml-2">
                R$ {product.originalPrice.toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>
        </div>
        <Button
          size="sm"
          className="w-full bg-primary text-primary-foreground gap-2"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          data-testid={`button-add-cart-${product.id}`}
        >
          <ShoppingCart className="h-4 w-4" />
          Comprar
        </Button>
      </div>
    </Card>
  );
}
