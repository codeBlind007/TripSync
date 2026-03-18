"use client";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { Collaborators } from "./CollaboratorsClient";
import { removeCollaborator } from "@/lib/api";
import { Dispatch, SetStateAction } from "react";

interface pageProps {
  tripId: string;
  collaborators: Collaborators[];
  onModifyCollab: Dispatch<SetStateAction<Collaborators[]>>;
  isCompleted?: boolean;
}

const CollaboratorsList = ({
  collaborators,
  tripId,
  onModifyCollab,
  isCompleted = false,
}: pageProps) => {
  const handleRemoveCollaborator = async (
    e: React.MouseEvent,
    tripId: string,
    collaboratorId: string,
  ) => {
    e.preventDefault();

    try {
      const res = await removeCollaborator(tripId, collaboratorId);
      if (res.success) {
        onModifyCollab((prev) =>
          prev.filter((collab) => collab._id !== collaboratorId),
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-slate-700" />
        <h3 className="text-lg font-semibold">Collaborators</h3>
        <span className="text-sm text-muted-foreground">
          ({collaborators.length})
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        People who have access to this trip
      </p>
      <div className="space-y-2">
        {collaborators.map((collab) => (
          <div
            key={collab._id}
            className="flex items-center justify-between p-3 rounded-lg border bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {collab.name[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-sm">{collab.name}</p>
                <p className="text-xs text-muted-foreground">{collab.email}</p>
              </div>
            </div>
            {!isCompleted && (
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                onClick={(e) => handleRemoveCollaborator(e, tripId, collab._id)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollaboratorsList;
