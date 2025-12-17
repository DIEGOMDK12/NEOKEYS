import { useState } from "react";
import { Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import logoImage from "@assets/generated_images/neonkeys_gaming_logo_green_neon.png";

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
          <div className="flex items-center gap-2">
            <img
              src={logoImage}
              alt="NeonKeys Logo"
              className="h-8 w-8"
            />
            <span className="font-bold text-lg text-primary hidden sm:inline">
              Neon<span className="text-foreground">Keys</span>
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
        <div className="relative">
          <Input
            type="search"
            placeholder="Pesquisar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12 bg-card"
            data-testid="input-search"
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-0 top-0 h-full rounded-l-none"
            data-testid="button-search"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </header>
  );
}
