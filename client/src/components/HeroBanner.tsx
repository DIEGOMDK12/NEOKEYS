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
    <div className="relative w-full aspect-[21/9] min-h-[200px] overflow-hidden rounded-2xl shadow-2xl">
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
        <div className="max-w-md">
          {subtitle && (
            <p className="text-xs md:text-sm text-white/80 uppercase tracking-wide mb-1">
              {subtitle}
            </p>
          )}
          <h2 className="text-xl md:text-3xl font-bold text-white mb-2">{title}</h2>
          <p className="text-sm text-white/80 mb-3">
            POR APENAS <span className="text-white font-bold text-lg">{price}</span>
          </p>
          <Button onClick={onBuyClick} data-testid="button-hero-buy" className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-bold hover:bg-gray-300 dark:hover:bg-gray-600">
            🛒 COMPRE AGORA!
          </Button>
        </div>
      </div>
    </div>
  );
}
