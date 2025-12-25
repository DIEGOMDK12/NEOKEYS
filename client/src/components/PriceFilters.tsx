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
    <div className="px-2 sm:px-4 py-2 sm:py-2.5 bg-secondary/50 border-y border-primary/20">
      <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-1 sm:pb-1.5 scrollbar-hide">
        {priceOptions.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={selectedFilter === option.value ? "default" : "outline"}
            className={`h-7 sm:h-8 px-3 sm:px-4 font-bold text-[11px] sm:text-xs rounded-full whitespace-nowrap transition-all ${
              selectedFilter === option.value 
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/50" 
                : "border-primary/40 text-primary hover:border-primary/70 hover:bg-primary/10"
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
