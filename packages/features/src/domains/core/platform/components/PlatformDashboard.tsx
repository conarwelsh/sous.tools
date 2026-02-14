"use client";

import React from "react";
import { usePlatformMetrics } from "../hooks/usePlatformMetrics";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  View, 
  Text
} from "@sous/ui";
import { Globe, Users, ShoppingCart, DollarSign, Activity, Server, Database, Loader2 } from "lucide-react";

export const PlatformDashboard: React.FC = () => {
  const { metrics, loading } = usePlatformMetrics();

  if (loading) return (
    <View className="flex items-center justify-center p-12">
      <Loader2 className="animate-spin text-primary" size={32} />
    </View>
  );

  return (
    <View className="space-y-12">
      {/* Platform Stats */}
      <View className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Organizations" value={metrics.totalOrganizations} icon={Globe} color="text-sky-500" />
        <StatCard title="Total Users" value={metrics.totalUsers} icon={Users} color="text-purple-500" />
        <StatCard title="Total Orders" value={metrics.totalOrders} icon={ShoppingCart} color="text-amber-500" />
        <StatCard title="Monthly Revenue" value={`$${metrics.monthlyRevenue.toFixed(2)}`} icon={DollarSign} color="text-emerald-500" />
      </View>

      {/* Infrastructure Health */}
      <View className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-border/50 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 p-6 flex flex-row items-center gap-3">
            <Activity className="text-primary" size={20} />
            <CardTitle className="text-sm font-black uppercase tracking-widest">Core Infrastructure</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <HealthItem name="API Gateway" status="Healthy" uptime="99.9%" />
            <HealthItem name="PostgreSQL Cluster" status="Healthy" uptime="100%" />
            <HealthItem name="Redis Cache" status="Healthy" uptime="99.8%" />
            <HealthItem name="AI Ingestion Worker" status="Active" uptime="99.5%" />
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 p-6 flex flex-row items-center gap-3">
            <Server className="text-primary" size={20} />
            <CardTitle className="text-sm font-black uppercase tracking-widest">Edge Fleet Health</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <HealthItem name="Total Active Nodes" status="142" />
            <HealthItem name="Syncing Nodes" status="12" />
            <HealthItem name="Disconnected Nodes" status="3" color="text-rose-500" />
            <HealthItem name="Average Latency" status="42ms" />
          </CardContent>
        </Card>
      </View>
    </View>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <Card className="border-border/50 shadow-lg rounded-2xl">
    <CardContent className="p-6 flex flex-row items-center gap-4">
      <View className={`p-3 rounded-xl bg-muted ${color}`}>
        <Icon size={24} />
      </View>
      <View>
        <Text className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</Text>
        <Text className="text-2xl font-black italic uppercase tracking-tighter">{value}</Text>
      </View>
    </CardContent>
  </Card>
);

const HealthItem = ({ name, status, uptime, color = "text-emerald-500" }: any) => (
  <View className="flex flex-row items-center justify-between py-2 border-b border-border/20 last:border-0">
    <View className="flex flex-row items-center gap-2">
      <View className={`w-2 h-2 rounded-full bg-emerald-500 animate-pulse`} />
      <Text className="text-xs font-bold uppercase tracking-tight">{name}</Text>
    </View>
    <View className="text-right">
      <Text className={`text-xs font-black uppercase tracking-widest ${color}`}>{status}</Text>
      {uptime && <Text className="text-[8px] text-muted-foreground uppercase">{uptime} Uptime</Text>}
    </View>
  </View>
);
