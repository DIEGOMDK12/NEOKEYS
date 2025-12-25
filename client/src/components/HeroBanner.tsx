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
    <div className="relative w-full max-w-5xl mx-auto aspect-[16/8] h-[110px] sm:h-[140px] md:h-[180px] overflow-hidden rounded-md shadow-lg">
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-center p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-md sm:max-w-lg md:max-w-xl">
          {subtitle && (
            <p className="text-[11px] sm:text-xs md:text-sm text-white/90 uppercase tracking-wide mb-1 sm:mb-1.5 line-clamp-1 font-semibold">
              {subtitle}
            </p>
          )}
          <h2 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-white mb-1.5 sm:mb-2 line-clamp-2 leading-tight">{title}</h2>
          <p className="text-[11px] sm:text-xs md:text-sm text-white/85 mb-2 sm:mb-3 font-medium">
            POR APENAS <span className="text-white font-bold text-xs sm:text-sm md:text-base">{price}</span>
          </p>
          <Button onClick={onBuyClick} data-testid="button-hero-buy" className="bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold hover:from-green-300 hover:to-cyan-300 text-xs sm:text-sm h-8 sm:h-8 px-4 sm:px-5 rounded-md transition-all shadow-lg shadow-green-500/50">
            COMPRE AGORA
          </Button>
        </div>
      </div>
    </div>
  );
}
