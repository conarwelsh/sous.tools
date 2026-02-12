"use client";

import React, { useState, useEffect, Suspense } from "react";
import { View, Text, Button, Card, Logo, GoogleDriveLogo, SquareLogo, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input } from "@sous/ui";
import { Link, Plus, Store, HardDrive, Loader2, CheckCircle2, ShieldCheck, AlertCircle, Trash2, AlertTriangle } from "lucide-react";
import { getHttpClient } from "@sous/client-sdk";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@sous/features";

function IntegrationsContent() {
  const { isInitialized, isAuthenticated, user } = useAuth();
  const [activeIntegrations, setActiveIntegrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [disconnectingProvider, setDisconnectingProvider] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({ accessToken: "" });
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");
  const provider = searchParams.get("provider");

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      fetchIntegrations();
    }
  }, [isInitialized, isAuthenticated, user?.organizationId]);

  const fetchIntegrations = async () => {
    try {
      const http = await getHttpClient();
      const data = await http.get<any[]>("/integrations");
      setActiveIntegrations(data);
    } catch (e) {
      console.error("[IntegrationsPage] Failed to fetch integrations:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const connectors = [
    { 
      id: "square", 
      name: "Square", 
      description: "Sync sales, catalog, and inventory.", 
      icon: SquareLogo,
      className: "text-foreground",
      type: "oauth",
      canSync: true,
      canSeed: true
    },
    { 
      id: "google-drive", 
      name: "Google Drive", 
      description: "Auto-sync recipe PDFs and images.", 
      icon: GoogleDriveLogo,
      className: "",
      type: "oauth",
      canSync: false,
      canSeed: false
    }
  ];

  const handleConnect = async (c: any) => {
    if (c.type === "oauth") {
      setIsSubmitting(true);
      try {
        const http = await getHttpClient();
        const { url } = await http.get<any>(`/integrations/${c.id}/authorize`);
        window.location.href = url;
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Failed to start OAuth flow");
        setIsSubmitting(false);
      }
    } else {
      setConnecting(c.id);
    }
  };

  const handleSync = async (providerId: string) => {
    setIsSyncing(providerId);
    try {
      const http = await getHttpClient();
      await http.post("/integrations/sync", { provider: providerId });
      await fetchIntegrations();
    } catch (e: any) {
      console.error(e);
      setError(e.message || `Failed to sync ${providerId}`);
    } finally {
      setIsSyncing(null);
    }
  };

  const handleSeed = async (providerId: string) => {
    setIsSeeding(providerId);
    try {
      const http = await getHttpClient();
      await http.post("/integrations/seed", { provider: providerId });
      // Auto-sync after seeding
      await http.post("/integrations/sync", { provider: providerId });
      await fetchIntegrations();
    } catch (e: any) {
      console.error(e);
      setError(e.message || `Failed to seed ${providerId}`);
    } finally {
      setIsSeeding(null);
    }
  };

  const handleDisconnect = async () => {
    if (!disconnectingProvider) return;
    setIsDisconnecting(true);
    try {
      const http = await getHttpClient();
      await http.delete(`/integrations/${disconnectingProvider}`);
      await fetchIntegrations();
      setDisconnectingProvider(null);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to disconnect integration");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleManualConnect = async () => {
    if (!connecting) return;
    setIsSubmitting(true);
    try {
      const http = await getHttpClient();
      await http.post("/integrations/connect", {
        provider: connecting,
        credentials
      });
      await fetchIntegrations();
      setConnecting(null);
      setCredentials({ accessToken: "" });
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to connect");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-background p-8">
      <View className="flex-row justify-between items-end mb-12">
        <View>
          <Text className="text-muted-foreground font-bold uppercase text-xs tracking-widest mb-2">
            Integrations / Ecosystem
          </Text>
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">
            Connectors
          </h1>
        </View>
      </View>

      {status === "success" && (
        <View className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-500" />
            <Text className="text-emerald-500 font-bold uppercase text-xs tracking-widest">
              Successfully connected {provider === 'google-drive' ? 'Google Drive' : provider}
            </Text>
          </View>
          <button onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("status");
            params.delete("provider");
            router.replace(`/settings/integrations?${params.toString()}`);
          }}>
            <Text className="text-emerald-500/50 font-bold uppercase text-[10px]">Dismiss</Text>
          </button>
        </View>
      )}

      {status === "error" && (
        <View className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <AlertCircle size={20} className="text-rose-500" />
            <Text className="text-rose-500 font-bold uppercase text-xs tracking-widest">
              Failed to connect {provider === 'google-drive' ? 'Google Drive' : provider}. Please try again.
            </Text>
          </View>
          <button onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("status");
            params.delete("provider");
            router.replace(`/settings/integrations?${params.toString()}`);
          }}>
            <Text className="text-rose-500/50 font-bold uppercase text-[10px]">Dismiss</Text>
          </button>
        </View>
      )}

      {error && (
        <View className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <AlertCircle size={20} className="text-rose-500" />
            <Text className="text-rose-500 font-bold uppercase text-xs tracking-widest">
              {error}
            </Text>
          </View>
          <button onClick={() => setError(null)}>
            <Text className="text-rose-500/50 hover:text-rose-500 font-bold uppercase text-[10px]">Dismiss</Text>
          </button>
        </View>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connectors.map((c) => {
          const Icon = c.icon;
          const integration = activeIntegrations.find(ai => ai.provider === c.id);
          const isConnected = !!integration && (integration.isActive === true || integration.is_active === true || integration.isActive === 't' || integration.is_active === 't');

          return (
            <Card key={c.id} className="p-8 bg-card border-border border-2 hover:border-primary/50 transition-all flex flex-col group">
              <View className="flex-row justify-between items-start mb-6">
                <Icon size={48} className={c.className} />
                
                {isConnected && (
                  <View className="flex-row items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <Text className="text-emerald-500 font-black uppercase text-[8px] tracking-widest">Connected</Text>
                  </View>
                )}
              </View>
              
              <Text className="text-xl font-black text-foreground uppercase tracking-tight mb-2">
                {c.name}
              </Text>
              <Text className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-8 leading-relaxed">
                {c.description}
              </Text>

              {isConnected ? (
                <View className="mt-auto gap-3">
                  {c.canSync && (
                    <Button 
                      onClick={() => handleSync(c.id)}
                      disabled={isSyncing === c.id}
                      className="h-12 bg-primary"
                    >
                      {isSyncing === c.id ? (
                        <Loader2 className="animate-spin text-primary-foreground" size={18} />
                      ) : (
                        <View className="flex-row items-center gap-2">
                          <HardDrive size={16} className="text-primary-foreground" />
                          <Text className="text-primary-foreground font-black uppercase tracking-widest text-[10px]">
                            Sync Sales & Catalog
                          </Text>
                        </View>
                      )}
                    </Button>
                  )}

                  {c.canSeed && (
                    <Button 
                      onClick={() => handleSeed(c.id)}
                      disabled={isSeeding === c.id}
                      variant="outline"
                      className="h-12 border-primary/30 hover:bg-primary/5 group/seed"
                    >
                      {isSeeding === c.id ? (
                        <Loader2 className="animate-spin text-primary" size={18} />
                      ) : (
                        <View className="flex-row items-center gap-2">
                          <Plus size={16} className="text-primary" />
                          <Text className="text-primary font-black uppercase tracking-widest text-[10px]">
                            Seed Sandbox Data
                          </Text>
                        </View>
                      )}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline"
                    onClick={() => setDisconnectingProvider(c.id)}
                    className="h-12 border-border hover:bg-destructive/10 hover:border-destructive/20 group/disconnect"
                  >
                    <View className="flex-row items-center gap-2">
                      <Trash2 size={16} className="text-muted-foreground group-hover/disconnect:text-destructive" />
                      <Text className="text-muted-foreground group-hover/disconnect:text-destructive font-black uppercase tracking-widest text-[10px]">
                        Disconnect
                      </Text>
                    </View>
                  </Button>

                  {c.canSync && (
                    <Text className="text-[8px] text-muted-foreground text-center font-bold uppercase tracking-[0.2em]">
                      Last Synced: {integration.lastSyncedAt ? new Date(integration.lastSyncedAt).toLocaleString() : 'Never'}
                    </Text>
                  )}
                </View>
              ) : (
                <Button 
                  onClick={() => handleConnect(c)}
                  disabled={isSubmitting}
                  className="mt-auto h-12 bg-muted hover:bg-primary transition-colors group"
                >
                  {isSubmitting && connecting === null ? (
                    <Loader2 className="animate-spin text-foreground group-hover:text-primary-foreground" size={18} />
                  ) : (
                    <span className="text-foreground group-hover:text-primary-foreground font-black uppercase tracking-widest text-[10px]">
                      Connect {c.name}
                    </span>
                  )}
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {/* Confirmation Dialog for Disconnection */}
      <Dialog open={!!disconnectingProvider} onOpenChange={(open) => !open && setDisconnectingProvider(null)}>
        <DialogContent className="sm:max-w-[425px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground font-black uppercase tracking-tight flex items-center gap-2">
              <AlertTriangle size={20} className="text-destructive" />
              Disconnect Integration
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6">
            <Text className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to disconnect <span className="text-foreground font-bold">{connectors.find(c => c.id === disconnectingProvider)?.name}</span>? 
              This will stop all automated data synchronization. 
              Historical data will remain in your system but will no longer be updated.
            </Text>
          </div>

          <DialogFooter className="gap-3">
            <Button 
              variant="outline"
              onClick={() => setDisconnectingProvider(null)}
              className="flex-1 h-12 border-border"
            >
              <Text className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Cancel</Text>
            </Button>
            <Button 
              onClick={handleDisconnect} 
              disabled={isDisconnecting}
              className="flex-1 h-12 bg-destructive hover:bg-destructive/90"
            >
              {isDisconnecting ? (
                <Loader2 className="animate-spin text-destructive-foreground" size={20} />
              ) : (
                <Text className="text-destructive-foreground font-black uppercase text-[10px] tracking-widest">
                  Confirm & Disconnect
                </Text>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!connecting} onOpenChange={(open) => !open && setConnecting(null)}>
        <DialogContent className="sm:max-w-[425px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground font-black uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck size={20} className="text-primary" />
              Connect {connecting}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            <View className="p-4 bg-muted/50 rounded-2xl border border-border">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Setup Instructions
              </Text>
              <Text className="text-xs text-muted-foreground leading-relaxed">
                Enter your Access Token to enable secure data synchronization.
              </Text>
            </View>

            <div className="space-y-2">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                Access Token
              </Text>
              <Input
                type="password"
                value={credentials.accessToken}
                onChange={(e) => setCredentials({ ...credentials, accessToken: e.target.value })}
                placeholder="TOKEN..."
                className="bg-muted border-border h-12"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={handleManualConnect} 
              disabled={isSubmitting || !credentials.accessToken}
              className="w-full h-12 bg-primary"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin text-primary-foreground" size={20} />
              ) : (
                <View className="flex-row items-center gap-2">
                  <CheckCircle2 size={18} className="text-primary-foreground" />
                  <Text className="text-primary-foreground font-bold uppercase text-[10px] tracking-widest">
                    Verify & Connect
                  </Text>
                </View>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<View className="flex-1 items-center justify-center"><Loader2 className="animate-spin text-primary" /></View>}>
      <IntegrationsContent />
    </Suspense>
  );
}
