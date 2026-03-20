import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { Metadata } from "next";

import { AppSidebar } from "@/components/app-sidebar";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | Dashboard",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 h-14 flex items-center gap-3 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-4">
          <SidebarTrigger />
          <h1 className="font-semibold">Dashboard</h1>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6">{children}</main>

        <Footer variant="default" />
      </SidebarInset>
    </SidebarProvider>
  );
}
