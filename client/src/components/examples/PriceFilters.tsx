import { useState } from "react";
import PriceFilters from "../PriceFilters";

export default function PriceFiltersExample() {
  const [selected, setSelected] = useState<number | undefined>();

  return (
    <div className="max-w-md bg-card p-4 rounded-lg">
      <PriceFilters onFilterSelect={setSelected} selectedFilter={selected} />
    </div>
  );
}
