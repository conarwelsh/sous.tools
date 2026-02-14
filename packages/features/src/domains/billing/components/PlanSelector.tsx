"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  View,
  Text,
} from "@sous/ui";
import { Check } from "lucide-react";
import { PlanType } from "../../../constants/plans";

interface Plan {
  slug: PlanType;
  name: string;
  price: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    slug: PlanType.COMMIS,
    name: "Commis",
    price: "$29",
    features: ["10 Recipes", "2 Users", "Basic Inventory", "Cook Mode"],
  },
  {
    slug: PlanType.CHEF_DE_PARTIE,
    name: "Chef de Partie",
    price: "$79",
    features: [
      "100 Recipes",
      "10 Users",
      "AI Recipe Ingestion",
      "Invoice OCR",
      "Advanced Procurement",
    ],
  },
  {
    slug: PlanType.EXECUTIVE_CHEF,
    name: "Executive Chef",
    price: "$199",
    features: [
      "Unlimited Recipes",
      "100 Users",
      "Advanced Analytics",
      "Global Intelligence",
      "Priority Support",
    ],
  },
];

export const PlanSelector: React.FC<{ onSelect: (slug: PlanType) => void }> = ({
  onSelect,
}) => {
  return (
    <View className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {PLANS.map((plan) => (
        <Card
          key={plan.slug}
          className="flex flex-col border-border/50 hover:border-primary/50 transition-all rounded-[2rem] overflow-hidden shadow-xl"
        >
          <CardHeader className="text-center p-8 bg-muted/30 border-b border-border/50">
            <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">
              {plan.name}
            </Text>
            <CardTitle className="text-4xl font-black italic uppercase tracking-tighter">
              {plan.price}
              <span className="text-sm font-normal not-italic tracking-normal text-muted-foreground ml-1">
                /mo
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-8 space-y-6">
            <View className="space-y-4">
              {plan.features.map((f) => (
                <View key={f} className="flex flex-row items-center gap-3">
                  <Check size={14} className="text-emerald-500" />
                  <Text className="text-sm font-bold text-foreground/80">
                    {f}
                  </Text>
                </View>
              ))}
            </View>
            <Button
              onClick={() => onSelect(plan.slug)}
              className="w-full h-12 rounded-xl font-bold uppercase italic tracking-tight mt-4"
            >
              Select {plan.name}
            </Button>
          </CardContent>
        </Card>
      ))}
    </View>
  );
};
