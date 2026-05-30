import { useState } from "react";
import { Send } from "lucide-react";

const ChatInput = ({ onSend }: { onSend: (text: string) => void }) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    console.log(text);
    onSend(text);
    console.log("executed");
    setText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="shrink-0 border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:px-4 sm:py-4">
      <div className="mx-auto flex max-w-3xl items-center gap-2 sm:gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-400 focus:bg-white sm:px-5"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 sm:h-12 sm:w-12"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
