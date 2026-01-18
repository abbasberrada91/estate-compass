import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Contacts from "@/pages/Contacts";
import Biens from "@/pages/Biens";
import BienDetail from "@/pages/BienDetail";
import Documents from "@/pages/Documents";
import Affaires from "@/pages/Affaires";
import ProspectionPije from "@/pages/ProspectionPije";
import Recherches from "@/pages/Recherches";
import QueueActions from "@/pages/QueueActions";
import NewProperty from "@/pages/NewProperty";
import NewContact from "@/pages/NewContact";
import NewSearchProfile from "@/pages/NewSearchProfile";
import NewAffair from "@/pages/NewAffair";
import NewDocument from "@/pages/NewDocument";
import Placeholder from "@/pages/Placeholder";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Protected routes with layout */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Prospection */}
            <Route path="/prospection/pije" element={<ProspectionPije />} />
            <Route path="/prospection/pije/new" element={<NewSearchProfile />} />
            <Route path="/prospection/conq" element={<Placeholder />} />
            <Route path="/prospection/recherches" element={<Recherches />} />
            <Route path="/prospection/inbox" element={<ProspectionPije />} />
            
            {/* Biens */}
            <Route path="/biens" element={<Biens />} />
            <Route path="/biens/new" element={<NewProperty />} />
            <Route path="/biens/nouveau" element={<Placeholder />} />
            <Route path="/biens/:id" element={<BienDetail />} />
            
            {/* Contacts */}
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/new" element={<NewContact />} />
            <Route path="/contacts/nouveau" element={<Placeholder />} />
            <Route path="/contacts/:id" element={<Placeholder />} />
            
            {/* Suivi */}
            <Route path="/affaires" element={<Affaires />} />
            <Route path="/affaires/new" element={<NewAffair />} />
            <Route path="/affaires/nouveau" element={<Placeholder />} />
            <Route path="/affaires/:id" element={<Placeholder />} />
            <Route path="/taches" element={<QueueActions />} />
            
            {/* Modelo Legal */}
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/new" element={<NewDocument />} />
            <Route path="/documents/nouveau" element={<Placeholder />} />
            <Route path="/documents/:id" element={<Placeholder />} />
            <Route path="/modeles" element={<Placeholder />} />
            <Route path="/signatures" element={<Placeholder />} />
            
            {/* Agenda */}
            <Route path="/agenda" element={<Placeholder />} />
            
            {/* Paramètres */}
            <Route path="/parametres" element={<Placeholder />} />
            <Route path="/parametres/utilisateurs" element={<Placeholder />} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
