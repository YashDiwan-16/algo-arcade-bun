"use client";

import { Navbar } from "./navbar";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-client";
import LoadingScreen from "@/components/layout/loading";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  // Show loading screen while session is being fetched
  if (isPending) {
    return <LoadingScreen />;
  }

  // If user is not authenticated, show layout without sidebar
  if (!session) {
    return (
      <>
        <Navbar />
        <main>{children}</main>
      </>
    );
  }

  // If user is authenticated, show layout with sidebar
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Navbar />
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
