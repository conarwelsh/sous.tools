"use client";

import React from "react";
import { useAuth } from "@sous/features";
import { View, Text, Button, Card } from "@sous/ui";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

import {
  LayoutGrid,
  Users,
  FileText,
  Settings,
  Activity,
  HardDrive,
  Utensils,
  Box,
  DollarSign,
  Loader2,
} from "lucide-react";

const GET_DASHBOARD_METRICS = gql`
  query GetDashboardMetrics($orgId: String!) {
    dashboardMetrics(orgId: $orgId) {
      dailySales {
        value
        unit
      }
      recipesCount {
        value
      }
      ingredientsCount {
        value
      }
      pendingInvoicesCount {
        value
      }
      connectedNodesCount {
        value
      }
    }
  }
`;

interface DashboardData {
  dashboardMetrics: {
    dailySales: { value: number; unit: string };
    recipesCount: { value: number };
    ingredientsCount: { value: number };
    pendingInvoicesCount: { value: number };
    connectedNodesCount: { value: number };
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const orgId = user?.organizationId || "";

  const { data, loading } = useQuery<DashboardData>(GET_DASHBOARD_METRICS, {
    variables: { orgId },
    skip: !orgId,
  });

  const metrics = data?.dashboardMetrics;

  const stats = [
    {
      label: "Today's Sales",
      value: metrics ? `$${metrics.dailySales.value.toFixed(2)}` : "...",
      icon: DollarSign,
      color: "text-blue-500",
    },
    {
      label: "Active Recipes",
      value: metrics?.recipesCount.value.toString() || "...",
      icon: Utensils,
      color: "text-emerald-500",
    },
    {
      label: "Inventory Items",
      value: metrics?.ingredientsCount.value.toString() || "...",
      icon: Box,
      color: "text-sky-500",
    },
    {
      label: "Pending Invoices",
      value: metrics?.pendingInvoicesCount.value.toString() || "...",
      icon: FileText,
      color: "text-amber-500",
    },
  ];

  return (
    <main className="flex-1 bg-background p-8 min-h-screen">
      <View className="mb-12 flex flex-row justify-between items-end">
        <View>
          <Text className="text-muted-foreground font-bold uppercase text-xs tracking-widest mb-2 block">
            Control Center
          </Text>
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">
            Dashboard
          </h1>
        </View>
        <View className="flex flex-col items-end">
          <Text className="text-foreground font-bold">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-muted-foreground text-xs font-mono uppercase">
            {user?.role}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((s, i) => (
          <Card
            key={i}
            className="p-6 bg-card border-border relative overflow-hidden"
          >
            <View className="flex flex-row justify-between items-start mb-4 relative z-10">
              <View className="p-3 bg-muted rounded-xl">
                <s.icon size={20} className={s.color} />
              </View>
              <Text className="text-muted-foreground/50 font-mono text-[10px]">
                LIVE
              </Text>
            </View>
            <View className="relative z-10">
              <Text className="text-3xl font-black text-foreground block">
                {loading ? (
                  <Loader2
                    className="animate-spin text-muted-foreground"
                    size={24}
                  />
                ) : (
                  s.value
                )}
              </Text>
              <Text className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest mt-1 block">
                {s.label}
              </Text>
            </View>

            {/* Background Accent */}
            <div className={`absolute -right-4 -bottom-4 opacity-5 ${s.color}`}>
              <s.icon size={120} />
            </div>
          </Card>
        ))}
      </View>

      <View className="flex flex-row gap-8">
        {/* Main Content Area */}
        <View className="flex-[2] flex flex-col gap-8">
          <Card className="p-8 bg-card border-border h-96 flex flex-col items-center justify-center border-dashed">
            <Activity size={48} className="text-muted mb-4" />
            <Text className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
              System Activity Feed (Coming Soon)
            </Text>
          </Card>
        </View>

        {/* Sidebar Panel */}
        <View className="flex-1 flex flex-col gap-8">
          <Card className="p-6 bg-card border-border">
            <Text className="text-foreground font-bold uppercase text-xs tracking-widest mb-6 block">
              Quick Actions
            </Text>
            <View className="flex flex-col gap-3">
              {[
                { label: "Scan Invoice", href: "/procurement/invoices" },
                { label: "Add Recipe", href: "/operations/recipes" },
                { label: "New Inventory Count", href: "/inventory" },
              ].map((action) => (
                <Button
                  key={action.label}
                  className="p-4 bg-muted rounded-xl border border-border hover:bg-muted/80 transition-colors text-left"
                >
                  <Text className="text-foreground font-bold text-sm uppercase tracking-tight">
                    {action.label}
                  </Text>
                </Button>
              ))}
            </View>
          </Card>
        </View>
      </View>
    </main>
  );
}
