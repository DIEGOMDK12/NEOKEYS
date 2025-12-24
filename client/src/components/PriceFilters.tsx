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
    <div className="px-2 sm:px-4 py-1 sm:py-1.5">
      <div className="flex gap-1 sm:gap-1.5 overflow-x-auto pb-1 sm:pb-1.5 scrollbar-hide">
        {priceOptions.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={selectedFilter === option.value ? "default" : "outline"}
            className={`h-6 sm:h-7 px-2 sm:px-3 font-semibold text-[10px] sm:text-xs rounded-full whitespace-nowrap transition-all ${
              selectedFilter === option.value 
                ? "bg-gray-200 dark:bg-gray-700 text-black dark:text-white" 
                : "border-white/50 text-white hover:bg-white/10"
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
