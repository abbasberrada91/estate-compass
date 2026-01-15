import { Construction } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Placeholder() {
  const location = useLocation();
  
  // Extract page name from path
  const pageName = location.pathname
    .split("/")
    .filter(Boolean)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" > ");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Construction className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-xl font-semibold mb-2">{pageName || "Page"}</h1>
      <p className="text-muted-foreground max-w-md">
        Cette page est en cours de développement. Elle sera bientôt disponible.
      </p>
    </div>
  );
}
