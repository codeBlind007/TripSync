"use client";

import { useEffect, useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatBody from "./ChatBody";
import ChatInput from "./ChatInput";
import CollaboratorsSidebar from "./CollaboratorsSidebar";
import { socket } from "@/lib/socket";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Sender {
  _id: string;
  name: string;
  email: string;
}

interface Collaborator {
  collabId: string;
  name: string;
  email: string;
}

interface Message {
  sender: Sender;
  text: string;
  timestamp: Date;
}

const normalizeMessage = (message: Partial<Message> & { message?: string }) => {
  const timestamp = message.timestamp
    ? new Date(message.timestamp)
    : new Date();

  return {
    sender: message.sender as Sender,
    text: message.text ?? message.message ?? "",
    timestamp,
  };
};

interface TripRoomProps {
  tripId: string;
  userDetails: User;
  chatMessage: Message[];
  roomCollab: Collaborator[];
  isCompleted: boolean;
}

const TripRoom = ({
  tripId,
  userDetails,
  chatMessage,
  roomCollab,
  isCompleted,
}: TripRoomProps) => {
  const [messages, setMessages] = useState<Message[]>(
    chatMessage.map((message) => normalizeMessage(message)),
  );
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("join-room", tripId);

    const handleReceive = (data: Message & { message?: string }) => {
      const normalizedMessage = normalizeMessage({
        sender: data.sender,
        text: data.text ?? data.message,
        timestamp: data.timestamp ?? new Date(),
      });

      setMessages((prev) => [...prev, normalizedMessage]);
    };

    socket.on("receive-msg", handleReceive);

    return () => {
      socket.off("receive-msg", handleReceive);
      socket.disconnect();
    };
  }, [tripId]);

  const sendMessage = (text: string) => {
    console.log("called");
    const sender: User = {
      _id: userDetails._id,
      name: userDetails.name,
      email: userDetails.email,
    };
    socket.emit("message", { text, tripId, sender });
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.12)] ring-1 ring-black/5 md:flex-row">
      <CollaboratorsSidebar collaborators={roomCollab} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-slate-50">
        <ChatHeader
          memberCount={roomCollab.length}
          collaborators={roomCollab}
          fallbackHref={isCompleted ? "/completed-trips" : "/ongoing-trips"}
        />
        <ChatBody messages={messages} userId={userDetails._id} />
        {!isCompleted && <ChatInput onSend={sendMessage} />}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TripRoom;
