import { useState } from "react";
import { Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

interface HeaderProps {
  cartCount: number;
  onMenuClick: () => void;
  onCartClick: () => void;
  onUserClick: () => void;
  onSearch: (query: string) => void;
  menuOpen?: boolean;
}

export default function Header({
  cartCount,
  onMenuClick,
  onCartClick,
  onUserClick,
  onSearch,
  menuOpen = false,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            data-testid="button-menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-1">
            <Zap className="h-6 w-6 text-primary fill-primary" />
            <span className="font-bold text-lg">
              <span className="text-foreground">Thunder</span>
              <span className="text-primary">Keys</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onUserClick}
            data-testid="button-user"
          >
            <User className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCartClick}
            className="relative"
            data-testid="button-cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge
                variant="default"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {cartCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="px-4 pb-3">
        <div className="relative flex">
          <Input
            type="search"
            placeholder="Pesquisar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12 bg-card/50 border-border rounded-r-none flex-1"
            data-testid="input-search"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-l-none bg-primary text-primary-foreground px-4"
            data-testid="button-search"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </header>
  );
}
