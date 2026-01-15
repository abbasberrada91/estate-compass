import { 
  Home, 
  Users, 
  FileText, 
  TrendingUp, 
  Calendar,
  Clock,
  AlertCircle,
  ChevronRight,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockBiens, mockDocuments, mockAffaires, mockContacts, getContactById, getBienById } from "@/data/mockData";

export default function Dashboard() {
  // Calculate stats
  const biensEnLigne = mockBiens.filter(b => b.enLigne).length;
  const biensTotal = mockBiens.length;
  const affairesEnCours = mockAffaires.filter(a => a.statut !== "finalisee" && a.statut !== "annulee").length;
  const documentsEnAttente = mockDocuments.filter(d => d.statut === "signature_en_cours").length;

  // Recent activity
  const recentActivity = [
    {
      id: "1",
      user: "Léna Pujol",
      action: "a effectué un changement de prix sur le bien",
      target: "VA3129",
      details: "Il est passé de 675 000 € à 598 000 €",
      time: "Il y a 2h",
    },
    {
      id: "2", 
      user: "Léna Pujol",
      action: "a désactivé la multidiffusion sur le bien",
      target: "VA3176",
      time: "Il y a 3h",
    },
    {
      id: "3",
      user: "Léna Pujol",
      action: "a activé la multidiffusion sur le bien",
      target: "VA3176",
      time: "Il y a 4h",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bonjour Abbas !</h1>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("fr-FR", { 
            weekday: "long", 
            year: "numeric", 
            month: "long", 
            day: "numeric" 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Biens en ligne
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{biensEnLigne}</div>
            <p className="text-xs text-muted-foreground">
              sur {biensTotal} biens au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contacts
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockContacts.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Affaires en cours
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affairesEnCours}</div>
            <p className="text-xs text-muted-foreground">
              1 sous compromis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Documents en attente
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentsEnAttente}</div>
            <p className="text-xs text-muted-foreground">
              signatures en cours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Portfolio summary */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Home className="h-4 w-4" />
              Portefeuille de biens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-status-success text-status-success-foreground flex items-center justify-center text-sm font-medium">
                  {biensEnLigne}
                </span>
                <span className="text-sm">publiés</span>
              </div>
              <StatusBadge variant="info">99+</StatusBadge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  27
                </span>
                <span className="text-sm">diffusés</span>
              </div>
              <StatusBadge variant="info">99+</StatusBadge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-status-warning text-status-warning-foreground flex items-center justify-center text-sm font-medium">
                  0
                </span>
                <span className="text-sm">Mandats arrivant à expiration</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-status-error text-status-error-foreground flex items-center justify-center text-sm font-medium">
                  0
                </span>
                <span className="text-sm">Mandats expirés à clôturer</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity feed */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Flux d'activité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium shrink-0">
                  LP
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium text-primary">{activity.user}</span>{" "}
                    {activity.action}{" "}
                    <span className="font-medium text-accent">{activity.target}</span>
                  </p>
                  {activity.details && (
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick stats and agenda */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Agenda du {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Aucune tâche planifiée aujourd'hui
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* This week section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Cette semaine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                  0
                </span>
                <span className="text-sm">Visites planifiées</span>
              </div>
              <span className="text-sm text-muted-foreground">0 effectuées</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                  0
                </span>
                <span className="text-sm">Acquéreurs enregistrés</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                  0
                </span>
                <span className="text-sm">Propositions effectuées</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4" />
              À suivre et finaliser
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                  0
                </span>
                <span className="text-sm">Comptes rendus de visite à saisir</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-status-info text-status-info-foreground flex items-center justify-center text-sm font-medium">
                  3
                </span>
                <span className="text-sm">Compromis en cours</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-status-warning text-status-warning-foreground flex items-center justify-center text-sm font-medium">
                  1
                </span>
                <span className="text-sm">Offres d'achat en cours</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-status-error text-status-error-foreground flex items-center justify-center text-sm font-medium">
                  4
                </span>
                <span className="text-sm">Mandats non reçus</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
