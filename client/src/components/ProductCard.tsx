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
  EA: Gamepad2,
};

export default function ProductCard({ product, onAddToCart, onProductClick }: ProductCardProps) {
  const PlatformIcon = platformIcons[product.platform] || SiSteam;

  return (
    <div
      className="cursor-pointer group"
      onClick={() => onProductClick(product)}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-card mb-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        
        {product.discount > 0 && (
          <div 
            className="absolute -top-1 -right-1 w-20 h-20 overflow-hidden"
            style={{ transform: 'rotate(0deg)' }}
          >
            <div 
              className="absolute top-4 -right-8 bg-red-600 text-white text-sm font-bold py-1 w-32 text-center"
              style={{ 
                transform: 'rotate(45deg)',
                transformOrigin: 'center',
              }}
            >
              -{product.discount}%
            </div>
          </div>
        )}
        
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-[10px] gap-1 bg-black/90 text-white border-0 px-2 py-1 rounded-sm">
            <PlatformIcon className="h-3 w-3" />
            {product.platform.toUpperCase()}
          </Badge>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-8">
          <Badge variant="secondary" className="text-[10px] bg-primary text-primary-foreground border-0 font-bold px-2 py-0.5 rounded-sm">
            MÍDIA DIGITAL
          </Badge>
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="font-semibold text-sm text-foreground line-clamp-1" data-testid={`text-product-name-${product.id}`}>
          {product.name}
        </h3>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <PlatformIcon className="h-3 w-3" />
          <span>({product.region}, {product.platform})</span>
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-primary font-bold" data-testid={`text-price-${product.id}`}>
            R$ {product.price.toFixed(2).replace(".", ",")}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-red-500 line-through">
              R${product.originalPrice.toFixed(2).replace(".", ",")}
            </span>
          )}
        </div>
        
        <Button
          size="sm"
          className="w-full bg-primary text-primary-foreground font-medium mt-2"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          data-testid={`button-add-cart-${product.id}`}
        >
          Adicionar ao carrinho
        </Button>
      </div>
    </div>
  );
}
