"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getHttpClient } from "@sous/client-sdk";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  Button,
  View,
  Text,
  Logo
} from "@sous/ui";
import { CheckCircle2, ShieldCheck, XCircle, Loader2 } from "lucide-react";

export const ConsentView: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  const clientId = searchParams.get("client_id");
  const scope = searchParams.get("scope");
  const redirectUri = searchParams.get("redirect_uri");

  useEffect(() => {
    const fetchInfo = async () => {
      if (!clientId || !scope || !redirectUri) {
        setError("Missing OAuth parameters");
        setLoading(false);
        return;
      }

      try {
        const http = await getHttpClient();
        const data = (await http.get(
          `/oauth/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`,
        )) as any;
        setClientInfo(data);
      } catch (e: any) {
        setError(e.message || "Failed to fetch client info");
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [clientId, scope, redirectUri]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      const http = await getHttpClient();
      const result = (await http.post(`/oauth/approve`, {
        clientId,
        scopes: clientInfo.requestedScopes,
        redirectUri
      })) as any;
      window.location.href = result.redirectUrl;
    } catch (e: any) {
      setError(e.message || "Approval failed");
      setApproving(false);
    }
  };

  const handleDeny = () => {
    const url = new URL(redirectUri!);
    url.searchParams.append("error", "access_denied");
    window.location.href = url.toString();
  };

  if (loading) return (
    <View className="flex flex-col items-center justify-center p-12 space-y-6">
      <Logo size={60} animate />
      <Text className="font-bold uppercase tracking-widest text-[10px]">Verifying Application...</Text>
    </View>
  );

  if (error) return (
    <Card className="max-w-md mx-auto border-destructive/20 bg-destructive/5 rounded-[2rem]">
      <CardContent className="p-12 text-center space-y-6">
        <XCircle className="mx-auto text-destructive" size={48} />
        <View className="space-y-2">
          <Text className="font-bold text-destructive uppercase italic tracking-tighter text-xl">OAuth Error</Text>
          <Text className="text-muted-foreground">{error}</Text>
        </View>
        <Button onClick={() => router.push("/dashboard")} variant="outline" className="w-full">Return to Dashboard</Button>
      </CardContent>
    </Card>
  );

  return (
    <Card className="max-w-lg mx-auto shadow-2xl rounded-[2.5rem] overflow-hidden border-border/50">
      <CardHeader className="pt-12 pb-8 bg-muted/30 border-b border-border/50 text-center space-y-4">
        <Logo size={40} showWordmark variant="neon" />
        <View>
          <CardTitle className="text-2xl font-black italic uppercase tracking-tighter">Authorize Access</CardTitle>
          <CardDescription>An external application is requesting access to your data.</CardDescription>
        </View>
      </CardHeader>
      <CardContent className="p-10 space-y-8">
        <View className="flex flex-row items-center gap-4 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
          <View className="p-3 bg-primary/10 rounded-xl text-primary">
            <ShieldCheck size={24} />
          </View>
          <View>
            <Text className="font-black uppercase text-xs tracking-tight">{clientInfo.client.name}</Text>
            <Text className="text-muted-foreground text-sm">Wants permission to access:</Text>
          </View>
        </View>

        <View className="space-y-3">
          {clientInfo.requestedScopes.map((s: string) => (
            <View key={s} className="flex flex-row items-center gap-3">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <Text className="font-bold text-foreground/80 text-sm">{s}</Text>
            </View>
          ))}
        </View>

        <View className="pt-4 space-y-3">
          <Button 
            onClick={handleApprove} 
            disabled={approving}
            className="w-full h-14 rounded-2xl text-lg font-black italic uppercase tracking-tighter shadow-xl shadow-primary/10"
          >
            {approving ? <Loader2 className="animate-spin" /> : "Allow Access"}
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleDeny}
            disabled={approving}
            className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors"
          >
            Deny & Cancel
          </Button>
        </View>

        <Text className="text-center text-muted-foreground italic text-[10px]">
          By allowing, you grant this app access to the data listed above. You can revoke this access at any time in your Developer Settings.
        </Text>
      </CardContent>
    </Card>
  );
};
