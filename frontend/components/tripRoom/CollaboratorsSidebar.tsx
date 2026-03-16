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
      <div className="border-b border-gray-200 p-3 md:p-4">
        <div className="flex items-center gap-2 mb-1">
          <Users size={20} className="text-gray-600" />
          <h3 className="font-semibold text-gray-800">Members</h3>
        </div>
        <p className="text-xs text-gray-500">
          {collaborators.length} people in this trip
        </p>
      </div>

      <div className="p-3 md:flex-1 md:overflow-y-auto">
        <ul className="flex gap-2 overflow-x-auto pb-1 md:block md:space-y-1 md:overflow-visible md:pb-0">
          {collaborators.map((c, idx) => (
            <li
              key={c.collabId}
              className="flex min-w-[170px] items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-2.5 transition-colors md:min-w-0 md:gap-3 md:border-0 md:bg-transparent md:p-3 md:hover:bg-gray-50"
            >
              <div
                className={`h-8 w-8 ${colors[idx % colors.length]} flex-shrink-0 rounded-full text-xs font-medium text-white flex items-center justify-center md:h-10 md:w-10 md:text-sm`}
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
