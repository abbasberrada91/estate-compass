import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  Home,
  Users,
  FolderKanban,
  FileText,
  FileStack,
  Calendar,
  Settings,
  ChevronDown,
  ChevronRight,
  Target,
  Inbox,
  Building2,
  CheckSquare,
  PenTool,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  badge?: number | string;
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Prospection",
    icon: Search,
    children: [
      { title: "PIJE (Particuliers)", href: "/prospection/pije", icon: Target },
      { title: "CONQ (Agences)", href: "/prospection/conq", icon: Building2 },
      { title: "Recherches", href: "/prospection/recherches", icon: Search, badge: "100" },
      { title: "Inbox", href: "/prospection/inbox", icon: Inbox },
    ],
  },
  {
    title: "Biens",
    href: "/biens",
    icon: Home,
  },
  {
    title: "Contacts",
    href: "/contacts",
    icon: Users,
  },
  {
    title: "Suivi",
    icon: FolderKanban,
    children: [
      { title: "Affaires", href: "/affaires", icon: FolderKanban },
      { title: "Tâches", href: "/taches", icon: CheckSquare },
    ],
  },
  {
    title: "Modelo Legal",
    icon: FileText,
    children: [
      { title: "Documents", href: "/documents", icon: FileText },
      { title: "Modèles", href: "/modeles", icon: FileStack },
      { title: "Signatures", href: "/signatures", icon: PenTool },
    ],
  },
  {
    title: "Agenda",
    href: "/agenda",
    icon: Calendar,
  },
  {
    title: "Paramètres",
    href: "/parametres",
    icon: Settings,
  },
];

interface SidebarItemProps {
  item: NavItem;
  isCollapsed: boolean;
  depth?: number;
}

function SidebarItem({ item, isCollapsed, depth = 0 }: SidebarItemProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  
  const isActive = item.href 
    ? location.pathname === item.href || location.pathname.startsWith(item.href + "/")
    : item.children?.some(child => 
        child.href && (location.pathname === child.href || location.pathname.startsWith(child.href + "/"))
      );

  const isChildActive = item.children?.some(child => 
    child.href && (location.pathname === child.href || location.pathname.startsWith(child.href + "/"))
  );

  // Auto-open if a child is active
  useState(() => {
    if (isChildActive) setIsOpen(true);
  });

  const Icon = item.icon;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          )}
        >
          <Icon className="h-5 w-5 shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </>
          )}
        </button>
        {!isCollapsed && isOpen && (
          <div className="mt-1 ml-4 pl-4 border-l border-sidebar-border space-y-1">
            {item.children?.map((child) => (
              <SidebarItem
                key={child.title}
                item={child}
                isCollapsed={isCollapsed}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.href || "#"}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && (
        <>
          <span className="flex-1">{item.title}</span>
          {item.badge && (
            <span className="px-1.5 py-0.5 text-xs bg-sidebar-accent rounded">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isCollapsed, onToggle }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col",
        isCollapsed ? "w-14" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 h-14 border-b border-sidebar-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Menu className="h-5 w-5" />
        </Button>
        {!isCollapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <Home className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">ImmoGest</span>
          </Link>
        )}
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="px-3 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-muted" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-sidebar-accent/50 border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-1 focus:ring-sidebar-ring"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {navigation.map((item) => (
          <SidebarItem
            key={item.title}
            item={item}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-muted text-center">
            ImmoGest v1.0
          </div>
        </div>
      )}
    </aside>
  );
}
