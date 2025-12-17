import { Button } from "@/components/ui/button";

interface PriceFiltersProps {
  onFilterSelect: (maxPrice: number) => void;
  selectedFilter?: number;
}

const priceOptions = [
  { label: "ATÉ 10R$", value: 10 },
  { label: "ATÉ 20R$", value: 20 },
  { label: "ATÉ 30R$", value: 30 },
  { label: "ATÉ 40R$", value: 40 },
  { label: "ATÉ 50R$", value: 50 },
];

export default function PriceFilters({ onFilterSelect, selectedFilter }: PriceFiltersProps) {
  return (
    <div className="px-4 py-2">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {priceOptions.map((option) => (
          <Button
            key={option.value}
            variant={selectedFilter === option.value ? "default" : "outline"}
            className={`h-10 px-5 font-semibold text-sm rounded-full whitespace-nowrap transition-all ${
              selectedFilter === option.value 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                : "border-primary/50 text-primary hover:bg-primary/10"
            }`}
            onClick={() => onFilterSelect(option.value)}
            data-testid={`filter-price-${option.value}`}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
