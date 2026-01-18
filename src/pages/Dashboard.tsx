import {
  Home,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  AlertCircle,
  ChevronRight,
  Activity,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { getDocuments, getLeads, getListings, getProperties, getTasks, getSearchProfiles } from "@/lib/api";
import type { DocumentRecord, LeadRecord, Listing, Property, SearchProfile, Task } from "@/lib/types";

export default function Dashboard() {
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: () => getProperties() as Promise<Property[]>,
  });
  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ["listings"],
    queryFn: () => getListings() as Promise<Listing[]>,
  });
  const { data: searchProfiles = [], isLoading: searchProfilesLoading } = useQuery({
    queryKey: ["search-profiles"],
    queryFn: () => getSearchProfiles() as Promise<SearchProfile[]>,
  });
  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: () => getDocuments() as Promise<DocumentRecord[]>,
  });
  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: () => getLeads() as Promise<LeadRecord[]>,
  });
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => getTasks() as Promise<Task[]>,
  });

  const biensTotal = properties.length;
  const biensEnLigne = properties.filter((item) => item.online).length;
  const listingsTotal = listings.length;
  const recherchesTotal = searchProfiles.length;
  const leadsTotal = leads.length;
  const leadsContactes = leads.filter((lead) => lead.status === "CONTACTE").length;
  const leadsOuiProprio = leads.filter((lead) => lead.status === "OUI_PROPRIO").length;
  const documentsEnAttente = documents.filter((item) => item.status === "signature_en_cours").length;
  const isStatsLoading = propertiesLoading || leadsLoading || listingsLoading || searchProfilesLoading;

  const recentActivity = [
    {
      id: "1",
      user: "Lena Pujol",
      action: "a effectue un changement de prix sur le bien",
      target: "VA3129",
      details: "Il est passe de 675 000 EUR a 598 000 EUR",
      time: "Il y a 2h",
    },
    {
      id: "2",
      user: "Lena Pujol",
      action: "a desactive la multidiffusion sur le bien",
      target: "VA3176",
      time: "Il y a 3h",
    },
    {
      id: "3",
      user: "Lena Pujol",
      action: "a active la multidiffusion sur le bien",
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
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-3 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{leadsTotal}</div>
                <p className="text-xs text-muted-foreground">total en base</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contactes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-3 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{leadsContactes}</div>
                <p className="text-xs text-muted-foreground">leads contactes</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Oui proprio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-3 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{leadsOuiProprio}</div>
                <p className="text-xs text-muted-foreground">leads qualifies</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Biens crees
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-3 w-28" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{biensTotal}</div>
                <p className="text-xs text-muted-foreground">dans le portefeuille</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* PIJE summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recherches
            </CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-3 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{recherchesTotal}</div>
                <p className="text-xs text-muted-foreground">profils actifs</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-3 w-20" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{leadsTotal}</div>
                <p className="text-xs text-muted-foreground">total</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Listings
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-3 w-32" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{listingsTotal}</div>
                <p className="text-xs text-muted-foreground">annonces detectees</p>
              </>
            )}
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
                <span className="text-sm">publies</span>
              </div>
              <StatusBadge variant="info">{biensTotal}</StatusBadge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {biensTotal}
                </span>
                <span className="text-sm">diffuses</span>
              </div>
              <StatusBadge variant="info">{biensTotal}</StatusBadge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-status-warning text-status-warning-foreground flex items-center justify-center text-sm font-medium">
                  0
                </span>
                <span className="text-sm">Mandats arrivant a expiration</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-status-error text-status-error-foreground flex items-center justify-center text-sm font-medium">
                  0
                </span>
                <span className="text-sm">Mandats expires a cloturer</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity feed */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Flux d'activite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
              >
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
                {tasksLoading ? (
                  <Skeleton className="h-4 w-48 mx-auto" />
                ) : tasks.length ? (
                  `${tasks.length} tache(s) planifiee(s)`
                ) : (
                  "Aucune tache planifiee aujourd'hui"
                )}
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
                <span className="text-sm">Visites planifiees</span>
              </div>
              <Link to="/agenda" className="text-xs text-primary flex items-center gap-1">
                Voir <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                  0
                </span>
                <span className="text-sm">Rendez-vous prospect</span>
              </div>
              <Link to="/agenda" className="text-xs text-primary flex items-center gap-1">
                Voir <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                  0
                </span>
                <span className="text-sm">Rappels</span>
              </div>
              <Link to="/taches" className="text-xs text-primary flex items-center gap-1">
                Voir <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4" />
              A surveiller
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-status-warning text-status-warning-foreground flex items-center justify-center text-sm font-medium">
                  0
                </span>
                <span className="text-sm">Mandats a renouveler</span>
              </div>
              <Link to="/documents" className="text-xs text-primary flex items-center gap-1">
                Voir <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-status-error text-status-error-foreground flex items-center justify-center text-sm font-medium">
                  {documentsEnAttente}
                </span>
                <span className="text-sm">Documents en attente</span>
              </div>
              <Link to="/documents" className="text-xs text-primary flex items-center gap-1">
                Voir <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
