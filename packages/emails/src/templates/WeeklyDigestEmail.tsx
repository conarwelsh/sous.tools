import { Section, Text, Heading, Hr } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface WeeklyDigestEmailProps {
  userName: string;
  orgName: string;
  stats: {
    recipesCreated: number;
    ordersPlaced: number;
    totalSpend: number;
    lowStockAlerts: number;
  };
}

export const WeeklyDigestEmail = ({
  userName,
  orgName,
  stats,
}: WeeklyDigestEmailProps) => (
  <BaseLayout preview={`Your Weekly Kitchen Report for ${orgName}`}>
    <Heading className="text-2xl font-black uppercase tracking-tight text-zinc-900 mb-4">
      Weekly Kitchen Digest
    </Heading>
    <Text className="text-zinc-600 text-sm mb-6">
      Hello Chef {userName}, here is a summary of what happened in **{orgName}**
      this week.
    </Text>

    <Section className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 mb-8">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Text className="text-[10px] font-bold text-zinc-400 uppercase m-0">
            Recipes Created
          </Text>
          <Text className="text-lg font-black text-zinc-900 m-0">
            {stats.recipesCreated}
          </Text>
        </div>
        <div>
          <Text className="text-[10px] font-bold text-zinc-400 uppercase m-0">
            Orders Placed
          </Text>
          <Text className="text-lg font-black text-zinc-900 m-0">
            {stats.ordersPlaced}
          </Text>
        </div>
        <Hr className="col-span-2 border-zinc-200 my-4" />
        <div>
          <Text className="text-[10px] font-bold text-zinc-400 uppercase m-0">
            Total Spend
          </Text>
          <Text className="text-lg font-black text-zinc-900 m-0">
            ${(stats.totalSpend / 100).toFixed(2)}
          </Text>
        </div>
        <div>
          <Text className="text-[10px] font-bold text-zinc-400 uppercase m-0">
            Low Stock Alerts
          </Text>
          <Text className="text-lg font-black text-rose-600 m-0">
            {stats.lowStockAlerts}
          </Text>
        </div>
      </div>
    </Section>

    <Text className="text-zinc-400 text-xs text-center italic">
      "You don't have to cook fancy or complicated masterpieces - just good food
      from fresh ingredients." - Julia Child
    </Text>
  </BaseLayout>
);

export default WeeklyDigestEmail;
