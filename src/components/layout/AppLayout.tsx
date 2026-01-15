import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { AssistantPanel } from "./AssistantPanel";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <div
        className={cn(
          "transition-all duration-300",
          isSidebarCollapsed ? "ml-14" : "ml-60"
        )}
      >
        <AppHeader onOpenAssistant={() => setIsAssistantOpen(true)} />
        
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      <AssistantPanel
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </div>
  );
}
