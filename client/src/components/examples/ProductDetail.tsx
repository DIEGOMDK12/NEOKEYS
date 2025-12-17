import ProductDetail from "../ProductDetail";

// todo: remove mock functionality
const mockProduct = {
  id: "1",
  name: "Beholder 2",
  imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=450&fit=crop",
  platform: "Steam",
  region: "Global",
  price: 9.56,
  originalPrice: 39.99,
  discount: 76,
};

const mockDescription = `Beholder 2 - Agora voce faz parte do Ministerio!

Voce se tornara um oficial responsavel condecorado ou apenas um denunciante?

Voce e livre pra moldar seu proprio futuro!`;

const mockRequirements = {
  minimum: [
    "Sistema Operacional: Windows 7/8/10 (64-bit OS)",
    "Processador: Intel Core i3 or AMD Athlon II",
    "Memoria: 4 GB de RAM",
    "Placa de video: Intel HD Graphics 4000",
    "DirectX: Versao 11",
    "Armazenamento: 2 GB de espaco disponivel",
  ],
};

export default function ProductDetailExample() {
  return (
    <div className="bg-background min-h-screen">
      <ProductDetail
        product={mockProduct}
        description={mockDescription}
        requirements={mockRequirements}
        onAddToCart={() => console.log("Add to cart")}
        onBuyNow={() => console.log("Buy now")}
      />
    </div>
  );
}
