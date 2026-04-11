import CollaboratorsClient from "@/components/collaborators/CollaboratorsClient";
import {
  getReceivedInvitations,
  getRoomCollab,
  getSentInvitations,
} from "@/lib/api";

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
  const collab = await getRoomCollab(tripId);
  const pendingInvitations = await getSentInvitations(tripId);
  const receivedInvitations = await getReceivedInvitations();

  return (
    <CollaboratorsClient
      collaborators={collab}
      pendingInvitations={pendingInvitations}
      receivedInvitations={receivedInvitations}
      tripId={tripId}
      isCompleted={isCompleted === "true"}
    />
  );
};

export default page;
