import CollaboratorsClient from "@/components/collaborators/CollaboratorsClient";
import { getRoomCollab, getTripDetails, getUserInfo } from "@/lib/api";

interface PageProps {
  params: Promise<{
    tripId: string;
  }>;
  searchParams: Promise<{
    isCompleted?: string;
  }>;
}

const page = async ({ params, searchParams }: PageProps) => {
  const { tripId } = await params;
  const { isCompleted } = await searchParams;
  const user = await getUserInfo();
  const trip = await getTripDetails(tripId);
  const collab = await getRoomCollab(tripId);

  if (!user) {
    return <div>Unauthorized</div>;
  }

  return (
    <CollaboratorsClient
      collaborators={collab}
      tripId={tripId}
      tripTitle={trip?.title || "Trip"}
      isCompleted={isCompleted === "true"}
      isOwner={String(trip?.owner) === String(user._id)}
    />
  );
};

export default page;
