import { Button } from "@/components/ui/button";

interface HeroBannerProps {
  title: string;
  subtitle?: string;
  price: string;
  imageUrl: string;
  onBuyClick: () => void;
}

export default function HeroBanner({
  title,
  subtitle,
  price,
  imageUrl,
  onBuyClick,
}: HeroBannerProps) {
  return (
    <div className="relative w-full aspect-[16/6] min-h-[120px] overflow-hidden rounded-lg shadow-lg">
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-center p-3 md:p-4">
        <div className="max-w-sm">
          {subtitle && (
            <p className="text-[10px] md:text-xs text-white/80 uppercase tracking-wide mb-0.5">
              {subtitle}
            </p>
          )}
          <h2 className="text-base md:text-xl font-bold text-white mb-1 line-clamp-2">{title}</h2>
          <p className="text-xs text-white/80 mb-2">
            POR APENAS <span className="text-white font-bold">{price}</span>
          </p>
          <Button onClick={onBuyClick} data-testid="button-hero-buy" className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-bold hover:bg-gray-300 dark:hover:bg-gray-600 text-xs h-7 px-3">
            COMPRE AGORA
          </Button>
        </div>
      </div>
    </div>
  );
}
