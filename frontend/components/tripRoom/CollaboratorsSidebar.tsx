import { Users } from "lucide-react";

interface Collaborator {
  collabId: string;
  name: string;
  email: string;
}

interface Props {
  collaborators: Collaborator[];
}

const CollaboratorsSidebar = ({ collaborators }: Props) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-yellow-500",
  ];

  return (
    <aside className="hidden w-72 border-r border-gray-200 bg-white md:flex md:flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <Users size={20} className="text-gray-600" />
          <h3 className="font-semibold text-gray-800">Members</h3>
        </div>
        <p className="text-xs text-gray-500">
          {collaborators.length} people in this trip
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {collaborators.map((c, idx) => (
            <li
              key={c.collabId}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div
                className={`w-10 h-10 ${colors[idx % colors.length]} rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0`}
              >
                {getInitials(c.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {c.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{c.email}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default CollaboratorsSidebar;
