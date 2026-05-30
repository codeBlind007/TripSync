import MessageBubble from "./MessageBubble";
import { useRef, useEffect } from "react";
import { Users } from "lucide-react";
interface Message {
  sender: Sender;
  text: string;
  timestamp: Date;
}

interface Sender {
  _id: string;
  name: string;
  email: string;
}

interface Props {
  messages: Message[];
  userId: string;
}

const ChatBody = ({ messages, userId }: Props) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-slate-100 px-3 py-4 [overscroll-behavior:contain] [-webkit-overflow-scrolling:touch]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        {messages.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-gray-400">
            <Users size={48} className="mb-3 opacity-50" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble
              key={i}
              message={msg}
              isOwn={msg.sender._id === userId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatBody;
