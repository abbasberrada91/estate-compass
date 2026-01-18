import { Bell, MessageSquare, Plus, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppHeaderProps {
  onOpenAssistant: () => void;
}

export function AppHeader({ onOpenAssistant }: AppHeaderProps) {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
      {/* Left side - breadcrumb or page context */}
      <div className="flex items-center gap-4">
        {/* Could add breadcrumbs here */}
      </div>

      {/* Right side - actions */}
      <div className="flex items-center gap-2">
        {/* Quick add */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nouveau</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Créer</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => handleNavigate("/biens/new")}>Nouveau bien</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleNavigate("/contacts/new")}>Nouveau contact</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleNavigate("/prospection/pije/new")}>
              Nouvelle recherche
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleNavigate("/affaires/new")}>Nouvelle affaire</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleNavigate("/documents/new")}>
              Nouveau document (mandat)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* AI Assistant */}
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          onClick={onOpenAssistant}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Assistant IA</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                AB
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>Abbas Berrada</span>
                <span className="text-xs text-muted-foreground font-normal">
                  abbas@immogest.fr
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Mon profil</DropdownMenuItem>
            <DropdownMenuItem>Paramètres</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
