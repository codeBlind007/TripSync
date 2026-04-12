"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import { Mail } from "lucide-react";
import { acceptInvitation } from "@/lib/api";
interface InvitedBy {
  name: string,
  email: string,
  _id: string
}

interface ReceivedInvitation {
  _id: string;
  tripId: string;
  tripName: string;
  invitedBy: InvitedBy;
  createdAt: string;
}

const ReceivedPendingInvitations = ({ 
  invitations 
}: { 
  invitations: ReceivedInvitation[] 
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleAccept = async (tripId: string, invitationId: string) => {
    setLoadingId(invitationId);
    try {
      await acceptInvitation(tripId, invitationId);
      setRemovedIds(prev => new Set(prev).add(invitationId));
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDecline = async (tripId: string, invitationId: string) => {
    setLoadingId(invitationId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRemovedIds(prev => new Set(prev).add(invitationId));
    } catch (error) {
      console.error('Failed to decline invitation:', error);
    } finally {
      setLoadingId(null);
    }
  };

  const visibleInvitations = invitations.filter(inv => !removedIds.has(inv._id));

  if (invitations.length === 0 || visibleInvitations.length === 0) {
    return(
      <div className="text-center py-10">
        <Mail className="mx-auto mb-4 w-10 h-10 text-blue-600" />
        <h3 className="text-lg font-semibold">No Received Invitations</h3>
        <p className="text-sm text-muted-foreground mt-2">You have not received any trip invitations yet.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Received Invitations</h3>
        <span className="text-sm text-muted-foreground">({visibleInvitations.length})</span>
      </div>
      <p className="text-sm text-muted-foreground mb-4">Trip invitations you have received</p>
      
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {visibleInvitations.map((invitation) => (
          <div
            key={invitation._id}
            className="p-4 rounded-lg border bg-white border-blue-200 shadow-sm"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{invitation.tripName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  by {invitation.invitedBy.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(invitation.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDecline(invitation.tripId, invitation._id)}
                disabled={loadingId === invitation._id}
                className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
              >
                {loadingId === invitation._id ? 'Processing...' : 'Decline'}
              </Button>
              <Button
                size="sm"
                onClick={() => handleAccept(invitation.tripId, invitation._id)}
                disabled={loadingId === invitation._id}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loadingId === invitation._id ? 'Processing...' : 'Accept'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReceivedPendingInvitations;