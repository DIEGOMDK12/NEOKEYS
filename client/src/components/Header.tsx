import { useState } from "react";
import { Menu, Search, ShoppingCart, User, UserCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  cartCount: number;
  onMenuClick: () => void;
  onCartClick: () => void;
  onUserClick: () => void;
  onSearch: (query: string) => void;
  onLogoClick?: () => void;
  menuOpen?: boolean;
  isLoggedIn?: boolean;
}

export default function Header({
  cartCount,
  onMenuClick,
  onCartClick,
  onUserClick,
  onSearch,
  onLogoClick,
  menuOpen = false,
  isLoggedIn = false,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="flex items-center justify-between gap-3 px-4 py-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            data-testid="button-menu"
            className="h-8 w-8"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <button
            onClick={onLogoClick}
            className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
            data-testid="button-logo"
          >
            <span className="text-xs font-bold text-foreground">ELITEVAULT</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onUserClick}
            data-testid="button-user"
            className={`h-8 w-8 ${isLoggedIn ? "text-white" : ""}`}
          >
            {isLoggedIn ? <UserCheck className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCartClick}
            className="relative h-8 w-8"
            data-testid="button-cart"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <Badge
                variant="default"
                className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
              >
                {cartCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="px-4 pb-2">
        <div className="relative flex gap-1">
          <Input
            type="search"
            placeholder="Pesquisar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-card/50 border-border rounded-r-none flex-1 h-8 text-xs"
            data-testid="input-search"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-l-none bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-3 h-8 w-8"
            data-testid="button-search"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </header>
  );
}
