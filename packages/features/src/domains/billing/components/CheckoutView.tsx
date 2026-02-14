"use client";

import React, { useState } from "react";
import { View, Text, Button, Card, CardContent, Logo } from "@sous/ui";
import { PlanSelector } from "./PlanSelector";
import { PlanType } from "../../../constants/plans";
import { getHttpClient } from "@sous/client-sdk";
import { useRouter } from "next/navigation";
import { ShieldCheck, CreditCard, Loader2 } from "lucide-react";

export const CheckoutView: React.FC = () => {
  const [step, setStep] = useState<"plan" | "payment">("plan");
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSelectPlan = (plan: PlanType) => {
    setSelectedPlan(plan);
    setStep("payment");
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const http = await getHttpClient();
      await http.post("/billing/subscribe", {
        planSlug: selectedPlan,
        provider: "stripe",
      });
      // In a real app, we'd handle Stripe redirect/elements here.
      // Since this is a dev environment, we assume success.
      alert("Subscription activated successfully!");
      router.push("/dashboard");
    } catch (e: any) {
      alert(`Subscription failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="max-w-6xl mx-auto space-y-12">
      <View className="text-center space-y-4">
        <Logo size={60} showWordmark variant="neon" className="mx-auto" />
        <View>
          <Text className="text-5xl font-black italic uppercase tracking-tighter">
            Activate your Kitchen
          </Text>
          <Text className="text-muted-foreground text-lg">
            Choose a plan to get started with Sous OS.
          </Text>
        </View>
      </View>

      {step === "plan" ? (
        <PlanSelector onSelect={handleSelectPlan} />
      ) : (
        <Card className="max-w-md mx-auto border-border/50 shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-10 space-y-8">
            <View className="flex flex-row items-center gap-4 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
              <View className="p-3 bg-primary/10 rounded-xl text-primary">
                <CreditCard size={24} />
              </View>
              <View>
                <Text className="font-black uppercase text-xs tracking-tight">
                  Complete Payment
                </Text>
                <Text className="text-muted-foreground text-sm">
                  Selected: {selectedPlan}
                </Text>
              </View>
            </View>

            <View className="space-y-4">
              <Text className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
                Secure checkout powered by Stripe
              </Text>
              {/* Mock Credit Card UI */}
              <View className="h-48 bg-zinc-900 rounded-2xl p-6 relative overflow-hidden border border-white/10 shadow-xl">
                <View className="absolute top-0 right-0 p-8 opacity-10">
                  <CreditCard size={120} />
                </View>
                <View className="space-y-8 relative z-10">
                  <View className="w-12 h-8 bg-amber-500/20 rounded-md border border-amber-500/30" />
                  <Text className="text-xl font-mono tracking-[0.2em] text-white/90">
                    •••• •••• •••• 4242
                  </Text>
                  <View className="flex flex-row justify-between">
                    <Text className="text-[10px] font-mono uppercase text-white/40">
                      Exp: 12/28
                    </Text>
                    <Text className="text-[10px] font-mono uppercase text-white/40">
                      CVC: •••
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <Button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full h-14 rounded-2xl text-lg font-black italic uppercase tracking-tighter shadow-xl shadow-primary/10"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Activate Now"}
            </Button>

            <Button
              variant="ghost"
              onClick={() => setStep("plan")}
              className="w-full text-[10px] font-bold uppercase tracking-widest"
            >
              ← Change Plan
            </Button>
          </CardContent>
        </Card>
      )}

      <View className="flex flex-row items-center justify-center gap-2 text-muted-foreground">
        <ShieldCheck size={14} className="text-emerald-500" />
        <Text className="italic text-sm">
          Encrypted, PCI-compliant payment processing
        </Text>
      </View>
    </View>
  );
};
