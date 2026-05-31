// app/[tripId]/expenses/add/page.tsx
import { ExpenseForm } from "@/components/add-tripExpenses";
import { User } from "@/types";
import { getUserInfo, getTripCollaborators } from "@/lib/api";

interface PageProps {
  params: Promise<{
    tripId: string;
  }>;
}


export default async function AddExpensePage({ params }: PageProps) {
  const { tripId } = await params;
  const user: User = await getUserInfo();
  const data = await getUserInfo();
  if (data) {
    user._id = data._id;
  }
  const collaborators: User[] = await getTripCollaborators(tripId);
  return (
    <div className="container mx-auto py-8">
      <ExpenseForm
        tripId={tripId}
        collaborators={collaborators}
        currentUserId={user._id}
      />
    </div>
  );
}
