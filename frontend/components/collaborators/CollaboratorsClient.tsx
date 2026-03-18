"use client";

import SendInvitation from "./SendInvitation";
import PendingInvitations from "./PendingInvitations";
import CollaboratorsList from "./CollaboratorsList";
import ReceivedPendingInvitations from "./RecievedInvitation";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface InvitedBy {
  name: string;
  email: string;
  _id: string;
}

export interface Collaborators {
  _id: string;
  name: string;
  email: string;
}

export interface PendingInvitation {
  _id: string;
  email: string;
  createdAt: string;
}

interface ReceivedInvitation {
  _id: string;
  tripId: string;
  tripName: string;
  invitedBy: InvitedBy;
  createdAt: string;
}

interface CollabClientProps {
  collaborators: Collaborators[];
  pendingInvitations: PendingInvitation[];
  receivedInvitations: ReceivedInvitation[];
  tripId: string;
  isCompleted: boolean;
}

const CollaboratorsClient = ({
  collaborators = [],
  pendingInvitations = [],
  receivedInvitations = [],
  tripId,
  isCompleted,
}: CollabClientProps) => {
  const [pendInvi, setPendInvi] =
    useState<PendingInvitation[]>(pendingInvitations);

  const [collabList, setCollabList] = useState<Collaborators[]>(collaborators);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-3 py-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start sm:items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full flex-none mt-1 sm:mt-0 cursor-pointer"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
              Manage Collaborators
            </h1>
          </div>

          <p className="text-sm sm:text-lg text-slate-600 max-w-xl">
            Invite people to collaborate on this trip and manage access
          </p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-5 lg:space-y-6">
            {/* Collaborators */}
            <Card className="shadow-sm">
              <CardContent className="pt-5 sm:pt-6 px-4 sm:px-6">
                <CollaboratorsList
                  tripId={tripId}
                  collaborators={collabList}
                  onModifyCollab={setCollabList}
                  isCompleted={isCompleted}
                />
              </CardContent>
            </Card>

            {/* Invite Collaborator */}
            {!isCompleted && (
              <Card className="shadow-sm">
                <CardContent className="pt-5 sm:pt-6 px-4 sm:px-6">
                  <SendInvitation tripId={tripId} onSent={setPendInvi} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-5 lg:space-y-6">
            {/* Received Invitations */}
            {receivedInvitations.length > 0 && (
              <Card className="shadow-sm border-blue-200 bg-blue-50/30">
                <CardContent className="pt-5 sm:pt-6 px-4 sm:px-6">
                  <ReceivedPendingInvitations
                    invitations={receivedInvitations}
                  />
                </CardContent>
              </Card>
            )}

            {/* Pending Invitations */}
            <Card className="shadow-sm border-amber-200 bg-amber-50/30">
              <CardContent className="pt-5 sm:pt-6 px-4 sm:px-6">
                <PendingInvitations invitations={pendInvi} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorsClient;
