"use client";

import CollaboratorsList from "./CollaboratorsList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ChevronLeft, Copy, Link2 } from "lucide-react";
import { toast } from "sonner";
import { buildClientApiUrl } from "@/lib/client-api";

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

interface InvitedBy {
  name: string;
  email: string;
  _id: string;
}

export interface ReceivedInvitation {
  _id: string;
  tripId: string;
  tripName: string;
  invitedBy: InvitedBy;
  createdAt: string;
}

interface CollabClientProps {
  collaborators: Collaborators[];
  tripId: string;
  tripTitle: string;
  isCompleted: boolean;
  isOwner: boolean;
}

const CollaboratorsClient = ({
  collaborators = [],
  tripId,
  tripTitle,
  isCompleted,
  isOwner,
}: CollabClientProps) => {
  const [collabList, setCollabList] = useState<Collaborators[]>(collaborators);
  const [inviteLink, setInviteLink] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const router = useRouter();
  const { getToken } = useAuth();

  const handleGenerateInviteLink = async () => {
    if (!isOwner || isCompleted) return;

    setIsGeneratingLink(true);

    try {
      const token = await getToken();
      const res = await fetch(
        buildClientApiUrl(`/api/trips/${tripId}/invite`),
        {
          method: "GET",
          credentials: "include",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Content-Type": "application/json",
          },
        },
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to generate invite link");
      }

      setInviteLink(data?.inviteLink || "");
      toast.success("Invite link generated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate invite link",
      );
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyInviteLink = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied to clipboard");
    } catch {
      toast.error("Unable to copy the invite link");
    }
  };

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
            Manage collaborators for {tripTitle}
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

            {!isCompleted && isOwner && (
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Link2 className="h-5 w-5" />
                    Invite Link
                  </CardTitle>
                  <CardDescription>
                    Generate a shareable link for people you want to add to this
                    trip.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 px-4 sm:px-6 pb-5 sm:pb-6 space-y-3">
                  <Button
                    type="button"
                    onClick={handleGenerateInviteLink}
                    disabled={isGeneratingLink}
                    className="cursor-pointer"
                  >
                    {isGeneratingLink
                      ? "Generating..."
                      : "Generate Invite Link"}
                  </Button>

                  {inviteLink && (
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Input readOnly value={inviteLink} className="bg-muted" />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCopyInviteLink}
                        className="cursor-pointer"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!isCompleted && !isOwner && (
              <Card className="shadow-sm border-dashed">
                <CardContent className="pt-5 sm:pt-6 px-4 sm:px-6 text-sm text-muted-foreground">
                  Only the trip owner can generate an invite link.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorsClient;
