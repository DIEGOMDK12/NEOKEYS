import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SiSteam, SiEpicgames, SiGogdotcom, SiPlaystation } from "react-icons/si";
import { Gamepad2, Play } from "lucide-react";
import { Globe, Languages, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import { Product } from "./ProductCard";

interface ProductDetailProps {
  product: Product & { galleryImages?: string[]; videoUrl?: string };
  description: string;
  requirements: string[];
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
  
  if (url.includes("youtube.com/embed") || url.includes("vimeo.com/video")) {
    return url;
  }
  
  if (url.includes("youtube.com/watch")) {
    const videoId = url.split("v=")[1]?.split("&")[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }
  
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }
  
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
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const PlatformIcon = platformIcons[product.platform] || SiSteam;
  
  const editingRequirements = Array.isArray(requirements) ? requirements : [];
  const editingDescription = description || "";
  
  const galleryImages = product.galleryImages && product.galleryImages.length > 0 ? product.galleryImages : [];
  const videoEmbedUrl = product.videoUrl ? convertVideoUrl(product.videoUrl) : "";

  const handlePreviousImage = () => {
    setCurrentGalleryIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentGalleryIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe();
  };

  const handleSwipe = () => {
    if (touchStart === 0 || touchEnd === 0) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNextImage();
    } else if (isRightSwipe) {
      handlePreviousImage();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div className="pb-24 fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 px-4 lg:px-6">
        {/* Left column - Images */}
        <div>
          {videoEmbedUrl && (
            <div className="relative aspect-square bg-black rounded-lg overflow-hidden mb-4 group cursor-pointer scale-in" onClick={() => setShowVideoPlayer(true)}>
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <div className="bg-red-600 rounded-full p-4">
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
            <div>
              <div 
                ref={galleryRef}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative aspect-square bg-card rounded-lg overflow-hidden cursor-grab active:cursor-grabbing select-none"
              >
                <img
                  src={galleryImages[currentGalleryIndex]}
                  alt={`Gallery ${currentGalleryIndex + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-300 pointer-events-none"
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
                <div className="flex flex-row flex-nowrap gap-2 overflow-x-auto mt-3 pb-2">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentGalleryIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden transition-all duration-300 ${
                        idx === currentGalleryIndex 
                          ? "ring-3 ring-primary shadow-lg" 
                          : "ring-2 ring-muted-foreground/30 hover:ring-primary/60 opacity-75 hover:opacity-100"
                      }`}
                      data-testid={`button-gallery-thumbnail-${idx}`}
                    >
                      <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column - Info */}
        <div>
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
            <span className="text-2xl font-bold text-success">
              R$ {product.price.toFixed(2).replace(".", ",")}
            </span>
            <span className="text-muted-foreground line-through">
              R$ {product.originalPrice.toFixed(2).replace(".", ",")}
            </span>
          </div>

          <div className="flex gap-2 mb-4">
            {(product as any).availableStock !== undefined && (
              (product as any).availableStock > 0 ? (
                <Badge className="bg-green-600 hover:bg-green-700 text-white gap-1" data-testid={`stock-badge-${product.id}`}>
                  Em estoque: {(product as any).availableStock}
                </Badge>
              ) : (
                <Badge className="bg-red-600 hover:bg-red-700 text-white gap-1" data-testid={`stock-badge-${product.id}`}>
                  Sem estoque
                </Badge>
              )
            )}
          </div>

          <Card className="mb-4">
            <CardContent className="p-4">
              <p className="text-white font-medium mb-4">
                Essa chave funcionara no Brasil
              </p>
              <div className="space-y-3">
                <Button className="w-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-bold hover:bg-gray-300 dark:hover:bg-gray-600 pulse-button border-4 border-green-500 glow-border" onClick={onAddToCart} data-testid="button-detail-add-cart">
                  🛒 Adicionar
                </Button>
                <Button variant="outline" className="w-full font-bold pulse-button border-4 border-green-500 glow-border" onClick={onBuyNow} data-testid="button-buy-now">
                  💳 Comprar (PIX)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-6" />

          <div className="mb-6">
            <div className="mb-3">
              <h2 className="text-xl font-bold">Descricao</h2>
            </div>
            
            <p className="text-muted-foreground whitespace-pre-line">{editingDescription}</p>
          </div>

          <Separator className="my-6" />

          <div>
            <div className="mb-3">
              <h2 className="text-xl font-bold">REQUISITOS DE SISTEMA</h2>
            </div>
            
            <h3 className="text-sm font-semibold text-white mb-2">MINIMOS:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {editingRequirements
                .slice(0, showFullRequirements ? undefined : 3)
                .filter(req => req.trim())
                .map((req, idx) => (
                  <li key={idx}>• {req}</li>
                ))}
            </ul>
            {editingRequirements.filter(r => r.trim()).length > 3 && (
              <Button
                variant="ghost"
                className="text-white p-0 h-auto mt-2"
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
    </div>
  );
}
