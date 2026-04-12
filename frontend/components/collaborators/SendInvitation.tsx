"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus, Mail, Check, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { inviteCollaborator } from "@/lib/api";
import { PendingInvitation } from "./CollaboratorsClient";
import { Dispatch, SetStateAction } from "react";

interface pageProps {
  tripId: string;
  onSent: Dispatch<SetStateAction<PendingInvitation[]>>;
}

const SendInvitation = ({ tripId, onSent }: pageProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const data = await inviteCollaborator(tripId, email);
      if (!data?.invitation) {
        throw new Error("Failed to send invitation");
      }
      const newInvitation = data.invitation;
      setSuccess(true);
      setEmail("");
      setTimeout(() => setSuccess(false), 3000);
      onSent((pendingInvitations) => [...pendingInvitations, newInvitation]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Invite Collaborator
        </CardTitle>
        <CardDescription>Send an invitation to join this trip</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendInvite} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading} className="cursor-pointer">
              {loading ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2 cursor-pointer" />
                  Send Invite
                </>
              )}
            </Button>
          </div>

          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <Check className="w-4 h-4" />
              <AlertDescription>
                Invitation sent successfully to {email}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default SendInvitation;
