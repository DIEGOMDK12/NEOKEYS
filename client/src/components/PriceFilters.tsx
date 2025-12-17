import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
    <Card className="mx-4 p-4 bg-card/80">
      <div className="grid grid-cols-2 gap-3">
        {priceOptions.map((option) => (
          <Button
            key={option.value}
            variant={selectedFilter === option.value ? "default" : "outline"}
            className={`h-12 font-bold text-base border-2 ${
              selectedFilter === option.value 
                ? "bg-primary text-primary-foreground border-primary" 
                : "border-primary text-primary bg-transparent"
            } ${option.value === 50 ? "col-span-2" : ""}`}
            onClick={() => onFilterSelect(option.value)}
            data-testid={`filter-price-${option.value}`}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}
