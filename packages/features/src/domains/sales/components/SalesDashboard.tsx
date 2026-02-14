"use client";

import React, { useState } from "react";
import { useSales } from "../hooks/useSales";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  View,
  Text,
  Button
} from "@sous/ui";
import { Users, DollarSign, TrendingUp, ArrowUpRight, Search, ShieldCheck, Loader2 } from "lucide-react";
import { getHttpClient } from "@sous/client-sdk";
import { useAuth } from "../../iam/auth/hooks/useAuth";

export const SalesDashboard: React.FC = () => {
  const { metrics, organizations, loading } = useSales();
  const { refresh: refreshAuth } = useAuth();
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  const handleImpersonate = async (orgId: string) => {
    setImpersonatingId(orgId);
    try {
      const http = await getHttpClient();
      const res = (await http.post(`/sales/impersonate/${orgId}`)) as any;
      if (res.access_token) {
        localStorage.setItem("token", res.access_token);
        http.setToken(res.access_token);
        await refreshAuth();
        window.location.href = "/dashboard";
      }
    } catch (e) {
      alert("Impersonation failed");
    } finally {
      setImpersonatingId(null);
    }
  };

  if (loading) return (
    <View className="flex items-center justify-center p-12">
      <Loader2 className="animate-spin text-primary" size={32} />
    </View>
  );

  return (
    <View className="space-y-12">
      {/* Metrics Row */}
      <View className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="border-border/50 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-8 flex flex-row items-center justify-between">
            <View className="space-y-1">
              <Text className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Clients</Text>
              <Text className="text-4xl font-black italic uppercase tracking-tighter">{metrics.activeClients}</Text>
            </View>
            <View className="p-4 bg-primary/10 rounded-2xl text-primary">
              <Users size={32} />
            </View>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-8 flex flex-row items-center justify-between">
            <View className="space-y-1">
              <Text className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Earned</Text>
              <Text className="text-4xl font-black italic uppercase tracking-tighter">${(metrics.totalEarned / 100).toFixed(2)}</Text>
            </View>
            <View className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
              <DollarSign size={32} />
            </View>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-8 flex flex-row items-center justify-between">
            <View className="space-y-1">
              <Text className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pending Payouts</Text>
              <Text className="text-4xl font-black italic uppercase tracking-tighter">${(metrics.pendingCommissions / 100).toFixed(2)}</Text>
            </View>
            <View className="p-4 bg-amber-500/10 rounded-2xl text-amber-500">
              <TrendingUp size={32} />
            </View>
          </CardContent>
        </Card>
      </View>

      {/* Organizations List */}
      <View className="space-y-6">
        <View className="flex flex-row items-center justify-between">
          <Text className="text-2xl font-black italic uppercase tracking-tighter">Your Book of Business</Text>
          <View className="flex flex-row gap-2">
            <Button variant="outline" size="sm" className="rounded-xl gap-2 font-bold uppercase italic text-[10px]">
              <Search size={14} />
              Filter Clients
            </Button>
          </View>
        </View>

        <View className="grid grid-cols-1 gap-4">
          {organizations.map((org) => (
            <Card key={org.id} className="border-border/50 hover:border-primary/30 transition-all rounded-2xl overflow-hidden shadow-sm">
              <CardContent className="p-6 flex flex-row items-center justify-between">
                <View className="flex flex-row items-center gap-6">
                  <View className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center font-black text-lg">
                    {org.name[0].toUpperCase()}
                  </View>
                  <View>
                    <Text className="font-black uppercase text-sm tracking-tight">{org.name}</Text>
                    <Text className="text-muted-foreground font-mono text-[10px] uppercase">
                      {org.plan?.name || "No Plan"} • {org.planStatus}
                    </Text>
                  </View>
                </View>
                <View className="flex flex-row items-center gap-4">
                  <View className="text-right">
                    <Text className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Rate</Text>
                    <Text className="text-sm font-bold">{org.commissionBps / 100}%</Text>
                  </View>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleImpersonate(org.id)}
                    disabled={!!impersonatingId}
                    className="rounded-lg text-[10px] font-bold uppercase tracking-widest gap-2 h-10 px-4"
                  >
                    {impersonatingId === org.id ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                    Support Access
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                    <ArrowUpRight size={20} />
                  </Button>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>
      </View>
    </View>
  );
};
