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
    <div className="grid grid-cols-2 gap-3 p-4">
      {priceOptions.map((option) => (
        <Button
          key={option.value}
          variant={selectedFilter === option.value ? "default" : "outline"}
          className={`h-12 font-semibold ${option.value === 50 ? "col-span-2" : ""}`}
          onClick={() => onFilterSelect(option.value)}
          data-testid={`filter-price-${option.value}`}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
