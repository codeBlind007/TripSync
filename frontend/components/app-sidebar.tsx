"use client";

import * as React from "react";
import {
  Map,
  PlusCircle,
  LayoutDashboardIcon,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { getUserInfo } from "@/lib/api";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Logo, LogoGlobe } from "@/components/logo";

interface User {
  name: string;
  email: string;
  avatar?: string;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<User | null>(null);
  const { state, isMobile } = useSidebar();
  React.useEffect(() => {
    async function fetchUser() {
      const data = await getUserInfo();
      if (data) {
        setUser({
          name: data.name,
          email: data.email,
          avatar: data.avatar,
        });
      }
    }
    fetchUser();
  }, []);
  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Upcoming",
      url: "/dashboard/trips/upcoming-trips",
      icon: CalendarDays,
    },
    {
      title: "Ongoing",
      url: "/ongoing-trips",
      icon: Map,
    },
    {
      title: "Completed",
      url: "/completed-trips",
      icon: CheckCircle2,
    },
    {
      title: "Create Trip",
      url: "/dashboard/create-trip",
      icon: PlusCircle,
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div
          className={`flex h-14 items-center ${
            isMobile
              ? "pl-2 pr-4 justify-start"
              : state === "collapsed"
                ? "pl-2 pr-2 justify-start"
                : "pl-2 pr-4 justify-start"
          }`}
        >
          <Link href="/" aria-label="Go to home" className="flex items-center">
            {isMobile || state === "expanded" ? (
              <Logo alt="TripSync" className="w-28 sm:w-32" />
            ) : (
              <LogoGlobe className="w-8" />
            )}
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        {user ? (
          <NavUser {...user} />
        ) : (
          <div className="px-4 py-2 text-sm text-muted-foreground">
            Loading user...
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
