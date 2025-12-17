import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiSteam, SiEpicgames, SiGogdotcom, SiPlaystation } from "react-icons/si";
import { Gamepad2 } from "lucide-react";

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
      className="overflow-hidden cursor-pointer hover-elevate active-elevate-2"
      onClick={() => onProductClick(product)}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative aspect-[3/4]">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.discount > 0 && (
          <div className="absolute top-0 left-0">
            <div className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 transform -rotate-0"
              style={{
                clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)",
                paddingRight: "1rem",
              }}
            >
              -{product.discount}%
            </div>
          </div>
        )}
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="text-xs gap-1">
            <PlatformIcon className="h-3 w-3" />
            {product.platform}
          </Badge>
        </div>
        <div className="absolute bottom-2 right-2">
          <Badge variant="secondary" className="text-xs">
            MIDIA DIGITAL
          </Badge>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm truncate mb-1" data-testid={`text-product-name-${product.id}`}>
          {product.name}
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <PlatformIcon className="h-3 w-3" />
          <span>({product.region}, {product.platform})</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-primary font-bold" data-testid={`text-price-${product.id}`}>
            R$ {product.price.toFixed(2).replace(".", ",")}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              R$ {product.originalPrice.toFixed(2).replace(".", ",")}
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          data-testid={`button-add-cart-${product.id}`}
        >
          Adicionar ao carrinho
        </Button>
      </div>
    </Card>
  );
}
