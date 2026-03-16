// app/dashboard/trip-chat/page.tsx
import TripRoom from "@/components/tripRoom/trip-room";
import { getUserInfo } from "@/lib/api";
import { getRoomCollab, getMessHistory } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trip Room",
};

interface TripRoomPageProps {
  params: Promise<{
    tripId: string;
  }>;
  searchParams: Promise<{
    isCompleted?: string;
  }>;
}

interface Sender {
  _id: string;
  name: string;
  email: string;
}

interface MessagesHistory {
  sender: Sender;
  text: string;
  timestamp: Date;
  createdAt: Date;
}

export default async function TripChat({
  params,
  searchParams,
}: TripRoomPageProps) {
  const userDetails = await getUserInfo();
  if (!userDetails) {
    return <div>Unauthorized</div>;
  }
  const awaitedParams = await params;
  const awaitedSearchParams = await searchParams;
  const messages: MessagesHistory[] = await getMessHistory(
    awaitedParams.tripId,
  );
  const collab = await getRoomCollab(awaitedParams.tripId);
  const isCompleted = awaitedSearchParams.isCompleted === "true";
  return (
    <div className="p-4">
      <TripRoom
        tripId={awaitedParams.tripId}
        userDetails={userDetails}
        chatMessage={messages || []}
        roomCollab={collab || []}
        isCompleted={isCompleted}
      />
    </div>
  );
}
