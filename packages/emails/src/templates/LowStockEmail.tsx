import { Section, Text, Heading } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface LowStockEmailProps {
  items: Array<{
    name: string;
    current: number;
    threshold: number;
    unit: string;
  }>;
}

export const LowStockEmail = ({ items }: LowStockEmailProps) => (
  <BaseLayout preview="Inventory Alert: Low Stock Items">
    <Heading className="text-xl font-black uppercase tracking-tight text-rose-600 mb-4">
      Low Stock Alert
    </Heading>
    <Text className="text-zinc-600 text-sm leading-relaxed mb-6">
      The following items have fallen below their par levels and may need to be
      reordered soon.
    </Text>
    <Section className="mb-8">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="bg-rose-50 border border-rose-100 p-4 rounded-xl mb-3"
        >
          <Text className="text-sm font-bold text-zinc-900 m-0 uppercase">
            {item.name}
          </Text>
          <Text className="text-xs text-rose-600 m-0 font-bold">
            Current: {item.current} {item.unit} (Threshold: {item.threshold})
          </Text>
        </div>
      ))}
    </Section>
  </BaseLayout>
);

export default LowStockEmail;
