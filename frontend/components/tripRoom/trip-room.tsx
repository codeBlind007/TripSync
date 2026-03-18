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
  const [messages, setMessages] = useState<Message[]>(chatMessage);
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("join-room", tripId);

    const handleReceive = (data: Message) => {
      const normalizedMessage: Message = {
        text: data.text,
        timestamp: new Date(),
        sender: data.sender,
      };

      setMessages((prev) => [...prev, normalizedMessage]);
    };

    socket.on("recieve-msg", handleReceive);

    return () => {
      socket.off("recieve-msg", handleReceive);
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
    <div className="flex h-[calc(100dvh-6rem)] min-h-[28rem] flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-100 md:h-[calc(100dvh-3rem)] md:flex-row">
      <CollaboratorsSidebar collaborators={roomCollab} />

      <div className="flex min-w-0 flex-1 flex-col">
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
