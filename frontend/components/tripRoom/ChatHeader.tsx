"use client";

import { ArrowLeft, MoreVertical, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Collaborator {
  collabId: string;
  name: string;
  email: string;
}

interface ChatHeaderProps {
  memberCount?: number;
  collaborators: Collaborator[];
  fallbackHref?: string;
}

const avatarColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-yellow-500",
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const ChatHeader = ({
  memberCount = 0,
  collaborators,
  fallbackHref = "/dashboard",
}: ChatHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          aria-label="Go back"
          className="h-9 w-9 shrink-0 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-gray-800 sm:text-lg">
            Trip Room Chat
          </h2>
          <p className="text-xs text-gray-500">{memberCount} members</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="md:hidden">
              <Users className="mr-2 h-4 w-4" />
              Members
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[86%] p-0 sm:max-w-sm">
            <SheetHeader className="border-b border-gray-200">
              <SheetTitle className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-700" />
                Members
              </SheetTitle>
              <SheetDescription>
                {memberCount} people in this trip
              </SheetDescription>
            </SheetHeader>

            <div className="max-h-[calc(100dvh-6rem)] overflow-y-auto p-4">
              <ul className="space-y-2">
                {collaborators.map((c, idx) => (
                  <li
                    key={c.collabId}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                  >
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium text-white ${avatarColors[idx % avatarColors.length]}`}
                    >
                      {getInitials(c.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {c.name}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {c.email}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </SheetContent>
        </Sheet>

        <button className="hidden rounded-lg p-2 transition-colors hover:bg-gray-100 md:block">
          <MoreVertical size={20} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
