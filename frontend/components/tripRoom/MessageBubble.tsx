interface Props {
  message: Message;
  isOwn: boolean;
}
interface Sender {
  _id: string;
  name: string;
  email: string;
}

interface Message {
  sender: Sender;
  text: string;
  timestamp: Date;
}

const MessageBubble = ({ message, isOwn }: Props) => {
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-fadeIn`}
    >
      <div
        className={`flex max-w-[85%] flex-col sm:max-w-[70%] ${
          isOwn ? "items-end" : "items-start"
        }`}
      >
        {!isOwn && (
          <span className="mb-1 px-1 text-xs font-medium text-slate-600">
            {message.sender.name}
          </span>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm sm:px-4 sm:py-3 ${
            isOwn
              ? "rounded-br-md bg-blue-600 text-white shadow-blue-100"
              : "rounded-bl-md border border-slate-100 bg-white text-slate-800 shadow-slate-100"
          }`}
        >
          <p className="break-words text-sm leading-relaxed sm:text-[15px]">
            {message.text}
          </p>
        </div>
        <span className="mt-1 px-1 text-xs text-slate-400">{time}</span>
      </div>
    </div>
  );
};

export default MessageBubble;
