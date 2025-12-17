import HeroBanner from "../HeroBanner";

export default function HeroBannerExample() {
  return (
    <HeroBanner
      title="RIMS RACING ULTIMATE EDITION"
      subtitle="DISPONIVEL AGORA!"
      price="R$ 46,92"
      imageUrl="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=400&fit=crop"
      onBuyClick={() => console.log("Buy clicked")}
    />
  );
}
