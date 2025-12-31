import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiSteam, SiEpicgames, SiGogdotcom, SiPlaystation, SiRockstargames, SiUbisoft, SiWindows } from "react-icons/si";
import { Gamepad2, Monitor } from "lucide-react";

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
  Rockstar: SiRockstargames,
  "Ubi Connect": SiUbisoft,
  EA: Gamepad2,
  Windows: SiWindows,
};

export default function ProductCard({ product, onAddToCart, onProductClick }: ProductCardProps) {
  const PlatformIcon = platformIcons[product.platform] || SiSteam;

  return (
    <div
      className="cursor-pointer group fade-in"
      onClick={() => onProductClick(product)}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-zinc-900 mb-2 sm:mb-2 border border-zinc-800 group-hover:border-primary/50 transition-all duration-300 transform hover:scale-[1.02]">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        
        {product.discount > 0 && (
          <div 
            className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-10"
          >
            <div 
              className="absolute top-3 -right-6 bg-red-600 text-white text-[10px] font-bold py-0.5 w-24 text-center shadow-lg"
              style={{ 
                transform: 'rotate(45deg)',
              }}
            >
              -{product.discount}%
            </div>
          </div>
        )}
        
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="secondary" className="text-[9px] gap-1 bg-black/90 text-white border-0 px-1.5 py-0.5 rounded-sm font-semibold">
            <PlatformIcon className="h-2.5 w-2.5" />
            {product.platform.toUpperCase()}
          </Badge>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 pt-6">
          <span className="text-[10px] text-white/70 font-bold uppercase tracking-wider">
            Mídia Digital
          </span>
        </div>
      </div>
      
      <div className="space-y-1 px-1">
        <h3 className="font-bold text-xs text-white line-clamp-1 group-hover:text-primary transition-colors" data-testid={`text-product-name-${product.id}`}>
          {product.name}
        </h3>
        
        <div className="flex items-center gap-1 text-[10px] text-zinc-400">
          <PlatformIcon className="h-2.5 w-2.5 flex-shrink-0" />
          <span className="line-clamp-1">({product.region}, {product.platform})</span>
        </div>
        
        <div className="flex items-baseline gap-1.5 pt-1">
          <span className="text-green-500 font-bold text-sm" data-testid={`text-price-${product.id}`}>
            R$ {product.price.toFixed(2).replace(".", ",")}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-[10px] text-red-500 line-through opacity-80">
              R$ {product.originalPrice.toFixed(2).replace(".", ",")}
            </span>
          )}
        </div>
        
        <Button
          className="w-full bg-primary text-primary-foreground font-bold mt-2 h-9 text-xs rounded-md hover-elevate transition-all"
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
