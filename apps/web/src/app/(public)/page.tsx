"use client";

import React, { useEffect, useState } from "react";
import { View, Text, Button, Card, Logo, useTheme } from "@sous/ui";
import { useRouter } from "next/navigation";
import { useAuth, getPricingPlansAction } from "@sous/features";
import {
  ChefHat,
  Gauge,
  Layers,
  ShieldCheck,
  Zap,
  Download,
  Moon,
  Sun,
  LayoutDashboard,
} from "lucide-react";

const DEFAULT_PLANS = [
  {
    name: "Commis",
    price: "Free",
    desc: "Perfect for research and development.",
    features: [
      "1 Active Node",
      "Unlimited Recipes",
      "Basic Inventory",
      "Community Support",
    ],
    action: "Get Started",
    popular: false,
  },
  {
    name: "Chef de Partie",
    price: "$49",
    period: "/mo",
    desc: "For small to medium operations.",
    features: [
      "5 Active Nodes",
      "Advanced Costing",
      "Supplier Integrations",
      "Email Support",
    ],
    action: "Start Trial",
    popular: true,
  },
  {
    name: "Executive Chef",
    price: "$149",
    period: "/mo",
    desc: "Full-scale enterprise infrastructure.",
    features: [
      "Unlimited Nodes",
      "Predictive Analytics",
      "Multi-Unit Management",
      "24/7 Priority Support",
    ],
    action: "Contact Sales",
    popular: false,
  },
];

export default function MarketingPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<any[]>(DEFAULT_PLANS);

  function getPlanDescription(slug: string) {
    if (slug.startsWith("commis"))
      return "Perfect for research and development.";
    if (slug.startsWith("chef-de-partie"))
      return "For small to medium operations.";
    if (slug.startsWith("executive-chef"))
      return "Full-scale enterprise infrastructure.";
    return "Custom culinary solution.";
  }

  function getPlanFeatures(slug: string) {
    if (slug.startsWith("commis"))
      return [
        "1 Active Node",
        "Unlimited Recipes",
        "Basic Inventory",
        "Community Support",
      ];
    if (slug.startsWith("chef-de-partie"))
      return [
        "5 Active Nodes",
        "Advanced Costing",
        "Supplier Integrations",
        "Email Support",
      ];
    if (slug.startsWith("executive-chef"))
      return [
        "Unlimited Nodes",
        "Predictive Analytics",
        "Multi-Unit Management",
        "24/7 Priority Support",
      ];
    return [];
  }

  useEffect(() => {
    async function loadPlans() {
      const result = await getPricingPlansAction();
      if (result.success && result.data && result.data.length > 0) {
        const formattedPlans = result.data.map((p: any) => ({
          name: p.name.replace(" Monthly", ""),
          price: `$${(p.priceMonthly / 100).toFixed(0)}`,
          period: "/mo",
          desc: getPlanDescription(p.slug),
          features: getPlanFeatures(p.slug),
          action:
            p.slug === "executive-chef-monthly"
              ? "Contact Sales"
              : "Get Started",
          popular: p.slug === "chef-de-partie-monthly",
        }));
        setPlans(formattedPlans);
      }
    }
    loadPlans();
  }, []);

  const features = [
    {
      title: "Culinary Intelligence",
      description:
        "AI-powered recipe costing and profit margin analysis that updates in real-time as your supply prices fluctuate.",
      icon: Gauge,
    },
    {
      title: "Universal Ecosystem",
      description:
        "Run your kitchen on any device. Web for management, RPi for signage, and Android for KDS and POS.",
      icon: Layers,
    },
    {
      title: "Precision Scaling",
      description:
        "Professional-grade scaling with support for Bakers Percentages and dynamic container-based yields.",
      icon: ChefHat,
    },
    {
      title: "Industrial Reliability",
      description:
        "Offline-first safety mode ensures your POS and KDS never stop, even when the internet does.",
      icon: ShieldCheck,
    },
  ];

  return (
    <main className="flex-1 bg-background min-h-screen relative overflow-hidden transition-colors duration-500">
      {/* Subtle Radial Gradient for Depth */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
        style={{
          background:
            theme === "dark"
              ? "radial-gradient(circle at 50% 50%, var(--color-sky-500) 0%, transparent 70%)"
              : "radial-gradient(circle at 50% 50%, var(--color-sky-200) 0%, transparent 70%)",
          filter: "blur(120px)",
          transform: "translateY(-20%)",
        }}
      />

      {/* Navbar */}
      <View className="flex flex-row items-center justify-between px-8 py-6 border-b border-border/50 bg-background/20 backdrop-blur-xl sticky top-0 z-50">
        <Logo size={28} suffix="tools" />
        <View className="flex flex-row items-center gap-6">
          <button onClick={() => router.push("/download")}>
            <Text className="text-muted-foreground font-bold uppercase text-xs tracking-widest hover:text-foreground transition-colors">
              Download
            </Text>
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-10 h-10 border border-border/50"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {isAuthenticated ? (
            <Button
              onClick={() => router.push("/dashboard")}
              className="px-6 h-10 bg-primary border border-primary"
            >
              <View className="flex flex-row items-center gap-2">
                <LayoutDashboard
                  size={16}
                  className="text-primary-foreground"
                />
                <Text className="text-primary-foreground font-bold uppercase text-xs tracking-widest">
                  Dashboard
                </Text>
              </View>
            </Button>
          ) : (
            <Button
              onClick={() => router.push("/login")}
              className="px-6 h-10 bg-secondary border border-border"
            >
              <Text className="text-foreground font-bold uppercase text-xs tracking-widest">
                Login
              </Text>
            </Button>
          )}

          {!isAuthenticated && (
            <Button
              onClick={() => router.push("/register")}
              className="px-6 h-10 bg-primary"
            >
              <Text className="text-primary-foreground font-bold uppercase text-xs tracking-widest">
                Get Started
              </Text>
            </Button>
          )}
        </View>
      </View>

      {/* Hero Section */}
      <View className="px-8 py-32 items-center text-center flex flex-col relative z-10">
        <View className="bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-8 shadow-[0_0_20px_rgba(var(--primary),0.2)]">
          <Text className="text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
            The Kitchen Operating System
          </Text>
        </View>
        <Text className="text-6xl md:text-8xl font-black text-foreground tracking-tighter uppercase leading-[0.9] max-w-4xl text-center">
          Intelligence for the <Text className="text-primary">Modern</Text>{" "}
          Kitchen.
        </Text>
        <Text className="text-muted-foreground text-xl mt-8 max-w-2xl text-center leading-relaxed">
          The all-in-one infrastructure for professional culinary operations.
          Inventory, Costing, Signage, and POS. Managed from one azure terminal.
        </Text>

        <View className="flex flex-row gap-4 mt-12">
          <Button
            onClick={() => router.push("/register")}
            className="px-10 h-16 bg-primary shadow-[0_0_30px_rgba(var(--primary),0.3)]"
          >
            <Text className="text-primary-foreground font-black text-lg uppercase tracking-widest">
              Start Building
            </Text>
          </Button>
          <Button
            onClick={() => router.push("/download")}
            className="px-10 h-16 bg-secondary border border-border"
          >
            <View className="flex flex-row items-center gap-3">
              <Download size={20} className="text-foreground" />
              <Text className="text-foreground font-black text-lg uppercase tracking-widest">
                Download App
              </Text>
            </View>
          </Button>
        </View>
      </View>

      {/* Features Grid */}
      <View className="px-8 py-24 bg-card/30 border-y border-border/50 relative z-10">
        <View className="flex flex-row flex-wrap gap-8 justify-center max-w-7xl mx-auto">
          {features.map((f, i) => (
            <Card
              key={i}
              className="p-8 w-full md:w-[calc(50%-16px)] bg-card border-border/50 hover:border-primary/50 transition-all flex flex-col"
            >
              <View className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <f.icon size={28} className="text-primary" />
              </View>
              <Text className="text-2xl font-bold text-foreground uppercase tracking-tight mb-4">
                {f.title}
              </Text>
              <Text className="text-muted-foreground leading-relaxed text-lg">
                {f.description}
              </Text>
            </Card>
          ))}
        </View>
      </View>

      {/* Pricing Section */}
      <View className="px-8 py-32 items-center flex flex-col relative z-10">
        <View className="mb-16 text-center">
          <Text className="text-primary font-bold text-xs uppercase tracking-[0.3em] mb-4 block">
            Pricing Plans
          </Text>
          <Text className="text-5xl font-black text-foreground tracking-tighter uppercase">
            Scales with your <Text className="text-primary">Kitchen</Text>
          </Text>
        </View>

        <View className="flex flex-row flex-wrap gap-8 justify-center max-w-7xl mx-auto w-full">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-10 w-full md:w-[calc(33.33%-22px)] bg-card flex flex-col relative ${plan.popular ? "border-primary shadow-[0_0_40px_rgba(var(--primary),0.1)]" : "border-border/50"}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary px-4 py-1 rounded-full">
                  <Text className="text-[10px] font-black uppercase text-primary-foreground tracking-widest">
                    Most Popular
                  </Text>
                </div>
              )}
              <Text className="text-xl font-bold text-foreground uppercase tracking-tight mb-2">
                {plan.name}
              </Text>
              <View className="flex-row items-baseline gap-1 mb-4">
                <Text className="text-4xl font-black text-foreground tracking-tighter">
                  {plan.price}
                </Text>
                {plan.period && (
                  <Text className="text-muted-foreground font-bold">
                    {plan.period}
                  </Text>
                )}
              </View>
              <Text className="text-muted-foreground text-sm mb-8 leading-relaxed">
                {plan.desc}
              </Text>

              <View className="flex flex-col gap-4 mb-10">
                {plan.features.map((f: string) => (
                  <View key={f} className="flex-row items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <Text className="text-sm text-foreground/80 font-medium">
                      {f}
                    </Text>
                  </View>
                ))}
              </View>

              <Button
                onClick={() => router.push("/register")}
                variant={plan.popular ? "default" : "outline"}
                className="mt-auto h-12 uppercase font-black tracking-widest text-xs"
              >
                {plan.action}
              </Button>
            </Card>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View className="px-8 py-16 border-t border-border flex flex-col items-center relative z-10">
        <Logo size={24} suffix="tools" />
        <Text className="text-muted-foreground mt-6 text-[10px] font-mono uppercase tracking-[0.3em]">
          CULINARY OPERATIONS PLATFORM // v0.1.0
        </Text>
      </View>
    </main>
  );
}
