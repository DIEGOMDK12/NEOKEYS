import { useState } from "react";
import SideMenu from "../SideMenu";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function SideMenuExample() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-[400px] bg-background">
      <Button onClick={() => setIsOpen(true)} variant="outline">
        <Menu className="h-4 w-4 mr-2" />
        Abrir Menu
      </Button>
      <SideMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onCategorySelect={(cat) => console.log("Selected:", cat)}
      />
    </div>
  );
}
