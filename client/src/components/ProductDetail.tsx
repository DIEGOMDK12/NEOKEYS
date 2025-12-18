import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SiSteam, SiEpicgames, SiGogdotcom, SiPlaystation } from "react-icons/si";
import { Gamepad2, Play } from "lucide-react";
import { Globe, Languages, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Product } from "./ProductCard";

interface ProductDetailProps {
  product: Product & { galleryImages?: string[]; videoUrl?: string };
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

function convertVideoUrl(url: string): string {
  if (!url) return "";
  
  // If already an embed URL, return as is
  if (url.includes("youtube.com/embed") || url.includes("vimeo.com/video")) {
    return url;
  }
  
  // Convert YouTube URLs to embed format
  if (url.includes("youtube.com/watch")) {
    const videoId = url.split("v=")[1]?.split("&")[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // Convert youtu.be short URLs to embed format
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // Convert Vimeo URLs to embed format
  if (url.includes("vimeo.com/")) {
    const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
    if (videoId) return `https://player.vimeo.com/video/${videoId}`;
  }
  
  return url;
}

export default function ProductDetail({
  product,
  description,
  requirements,
  onAddToCart,
  onBuyNow,
}: ProductDetailProps) {
  const [showFullRequirements, setShowFullRequirements] = useState(false);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const PlatformIcon = platformIcons[product.platform] || SiSteam;
  
  const galleryImages = product.galleryImages && product.galleryImages.length > 0 ? product.galleryImages : [];
  const videoEmbedUrl = product.videoUrl ? convertVideoUrl(product.videoUrl) : "";

  const handlePreviousImage = () => {
    setCurrentGalleryIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentGalleryIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="pb-24">
      <div className="space-y-4">
        {videoEmbedUrl && (
          <div className="relative aspect-square bg-black rounded-lg overflow-hidden mb-4 group cursor-pointer" onClick={() => setShowVideoPlayer(true)}>
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
              <div className="bg-primary rounded-full p-4">
                <Play className="h-8 w-8 text-white fill-white" />
              </div>
            </div>
            {showVideoPlayer && (
              <div className="absolute inset-0 z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowVideoPlayer(false);
                  }}
                  className="absolute top-4 right-4 z-50 bg-black/50 rounded-full p-2 hover:bg-black/70"
                  data-testid="button-close-video"
                >
                  ✕
                </button>
                <iframe
                  src={videoEmbedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay"
                  data-testid="video-player"
                />
              </div>
            )}
          </div>
        )}
        {!videoEmbedUrl && (
          <div className="aspect-square bg-card rounded-lg overflow-hidden mb-4">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {galleryImages.length > 0 && (
          <div className="space-y-3">
            <div className="relative aspect-square bg-card rounded-lg overflow-hidden">
              <img
                src={galleryImages[currentGalleryIndex]}
                alt={`Gallery ${currentGalleryIndex + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 text-white transition-all"
                    data-testid="button-gallery-prev"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 text-white transition-all"
                    data-testid="button-gallery-next"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-4 px-2 snap-x snap-mandatory">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentGalleryIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden snap-center transition-all duration-300 ${
                      idx === currentGalleryIndex 
                        ? "ring-2 ring-primary ring-offset-2 shadow-lg scale-105" 
                        : "ring-2 ring-muted-foreground/20 hover:ring-primary/50 hover:scale-110 opacity-70 hover:opacity-100"
                    }`}
                    data-testid={`button-gallery-thumbnail-${idx}`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover transition-transform duration-300" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
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
                🛒 Adicionar ao Carrinho
              </Button>
              <Button variant="outline" className="w-full" onClick={onBuyNow} data-testid="button-buy-now">
                💳 Comprar Agora (PIX)
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
