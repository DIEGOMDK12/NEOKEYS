import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FloatingChatButtonProps {
  unreadCount?: number;
  onClick: () => void;
}

export default function FloatingChatButton({ unreadCount = 0, onClick }: FloatingChatButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40"
      data-testid="button-chat"
    >
      <MessageCircle className="h-6 w-6" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount}
        </Badge>
      )}
    </Button>
  );
}
