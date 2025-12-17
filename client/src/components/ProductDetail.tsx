import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SiSteam, SiEpicgames, SiGogdotcom, SiPlaystation } from "react-icons/si";
import { Gamepad2 } from "lucide-react";
import { Globe, Languages, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Product } from "./ProductCard";

interface ProductDetailProps {
  product: Product;
  description: string;
  requirements: {
    minimum: string[];
    recommended?: string[];
  };
  relatedProducts?: Product[];
  onAddToCart: () => void;
  onBuyNow: () => void;
  onRelatedProductClick?: (product: Product) => void;
}

const platformIcons: Record<string, any> = {
  Steam: SiSteam,
  Epic: SiEpicgames,
  GOG: SiGogdotcom,
  Xbox: Gamepad2,
  PlayStation: SiPlaystation,
};

export default function ProductDetail({
  product,
  description,
  requirements,
  onAddToCart,
  onBuyNow,
}: ProductDetailProps) {
  const [showFullRequirements, setShowFullRequirements] = useState(false);
  const PlatformIcon = platformIcons[product.platform] || SiSteam;

  return (
    <div className="pb-24">
      <div className="aspect-video bg-card rounded-lg overflow-hidden mb-4">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="px-4">
        <h1 className="text-2xl font-bold mb-3">{product.name}</h1>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge variant="secondary" className="gap-1">
            <PlatformIcon className="h-4 w-4" />
            {product.platform}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Languages className="h-4 w-4" />
            Multilanguage
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Globe className="h-4 w-4" />
            {product.region}
          </Badge>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-muted-foreground">Preco:</span>
          <span className="text-2xl font-bold text-primary">
            R$ {product.price.toFixed(2).replace(".", ",")}
          </span>
          <span className="text-muted-foreground line-through">
            R$ {product.originalPrice.toFixed(2).replace(".", ",")}
          </span>
        </div>

        <Card className="mb-4">
          <CardContent className="p-4">
            <p className="text-primary font-medium mb-4">
              Essa chave funcionara no Brasil
            </p>
            <div className="space-y-3">
              <Button className="w-full" onClick={onAddToCart} data-testid="button-detail-add-cart">
                Adicionar ao carrinho
              </Button>
              <Button variant="outline" className="w-full" onClick={onBuyNow} data-testid="button-buy-now">
                Compre ja
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3">Descricao</h2>
          <p className="text-muted-foreground whitespace-pre-line">{description}</p>
        </div>

        <Separator className="my-6" />

        <div>
          <h2 className="text-xl font-bold mb-3">REQUISITOS DE SISTEMA</h2>
          <h3 className="text-sm font-semibold text-primary mb-2">MINIMOS:</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {requirements.minimum
              .slice(0, showFullRequirements ? undefined : 3)
              .map((req, idx) => (
                <li key={idx}>• {req}</li>
              ))}
          </ul>
          {requirements.minimum.length > 3 && (
            <Button
              variant="ghost"
              className="text-primary p-0 h-auto mt-2"
              onClick={() => setShowFullRequirements(!showFullRequirements)}
              data-testid="button-toggle-requirements"
            >
              {showFullRequirements ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" /> Ver menos
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" /> Ver mais
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
