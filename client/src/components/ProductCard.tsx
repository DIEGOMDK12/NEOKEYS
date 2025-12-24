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
  videoUrl?: string;
  galleryImages?: string[];
  systemRequirements?: string;
  description?: string;
  availableStock?: number;
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
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-card mb-1 sm:mb-2 shadow hover-elevate transition-shadow duration-300">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        
        {product.discount > 0 && (
          <div 
            className="absolute -top-1 -right-1 w-16 h-16 overflow-hidden"
            style={{ transform: 'rotate(0deg)' }}
          >
            <div 
              className="absolute top-3 -right-6 bg-red-600 text-white text-[7px] sm:text-xs font-bold py-0.5 w-24 text-center"
              style={{ 
                transform: 'rotate(45deg)',
                transformOrigin: 'center',
              }}
            >
              -{product.discount}%
            </div>
          </div>
        )}
        
        <div className="absolute top-1 sm:top-1.5 left-1 sm:left-1.5">
          <Badge variant="secondary" className="text-[7px] sm:text-[8px] gap-0.5 bg-black/90 text-white border-0 px-1 sm:px-1.5 py-0.5 rounded-sm">
            <PlatformIcon className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
            {product.platform.toUpperCase()}
          </Badge>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-1.5 sm:p-2 pt-4 sm:pt-6">
          <Badge variant="secondary" className="text-[6px] sm:text-[7px] bg-green-500 text-white border-0 font-bold px-0.5 sm:px-1 py-0 rounded-sm">
            DIGITAL
          </Badge>
        </div>
      </div>
      
      <div className="space-y-0.5">
        <h3 className="font-semibold text-[10px] sm:text-xs text-foreground line-clamp-1" data-testid={`text-product-name-${product.id}`}>
          {product.name}
        </h3>
        
        <div className="flex items-center gap-0.5 text-[8px] sm:text-[10px] text-muted-foreground">
          <PlatformIcon className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
          <span className="line-clamp-1">({product.region})</span>
        </div>
        
        <div className="flex items-baseline gap-1 pt-0.5">
          <span className="text-success font-bold text-[10px] sm:text-xs" data-testid={`text-price-${product.id}`}>
            R$ {product.price.toFixed(2).replace(".", ",")}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-[7px] sm:text-[9px] text-red-500 line-through">
              R${product.originalPrice.toFixed(2).replace(".", ",")}
            </span>
          )}
        </div>
        
        <Button
          size="sm"
          className="w-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-bold mt-1 sm:mt-2 h-6 sm:h-7 text-xs hover:bg-gray-300 dark:hover:bg-gray-600 pulse-button"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          data-testid={`button-add-cart-${product.id}`}
        >
          Comprar
        </Button>
      </div>
    </div>
  );
}
