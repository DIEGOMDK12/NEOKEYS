import FloatingChatButton from "../FloatingChatButton";

export default function FloatingChatButtonExample() {
  return (
    <div className="h-40 bg-background relative">
      <FloatingChatButton unreadCount={1} onClick={() => console.log("Chat clicked")} />
    </div>
  );
}
