import { X, Phone, Mail, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SiSteam, SiEpicgames, SiGogdotcom, SiPlaystation } from "react-icons/si";
import { Gamepad2 } from "lucide-react";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelect: (category: string) => void;
}

const platforms = [
  { name: "STEAM", icon: SiSteam },
  { name: "EA", icon: null },
  { name: "EPIC GAMES", icon: SiEpicgames },
  { name: "GOG", icon: SiGogdotcom },
  { name: "WINDOWS", icon: null },
  { name: "ROCKSTAR", icon: null },
  { name: "UBI CONNECT", icon: null },
  { name: "XBOX", icon: Gamepad2 },
  { name: "PLAYSTATION", icon: SiPlaystation },
];

export default function SideMenu({ isOpen, onClose, onCategorySelect }: SideMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        data-testid="overlay-menu"
      />
      <div className="fixed left-0 top-0 h-full w-72 bg-background z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-menu">
            <X className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <img src="/keys-jogos-logo.png" alt="KEYS JOGOS" className="h-8 w-8 object-contain" />
            <span className="font-bold text-lg text-foreground">KEYS JOGOS</span>
          </div>
          <div className="w-9" />
        </div>

        <ScrollArea className="flex-1">
          <nav className="p-4">
            {platforms.map((platform) => (
              <button
                key={platform.name}
                onClick={() => {
                  onCategorySelect(platform.name);
                  onClose();
                }}
                className="flex items-center gap-3 w-full py-3 text-left text-foreground hover-elevate active-elevate-2 rounded-md px-2"
                data-testid={`menu-${platform.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {platform.icon && <platform.icon className="h-5 w-5 text-muted-foreground" />}
                <span className="font-medium">{platform.name}</span>
              </button>
            ))}

            <button
              onClick={() => onCategorySelect("CATEGORIAS")}
              className="flex items-center justify-between w-full py-3 text-left text-foreground hover-elevate active-elevate-2 rounded-md px-2"
              data-testid="menu-categorias"
            >
              <span className="font-medium">CATEGORIAS</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </nav>
        </ScrollArea>

        <Separator />
        <div className="p-4">
          <p className="text-sm font-medium text-muted-foreground mb-3">PRECISA DE AJUDA?</p>
          <div className="flex items-center gap-3 text-sm text-foreground">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>support@keysjogos.com</span>
          </div>
        </div>
      </div>
    </>
  );
}
