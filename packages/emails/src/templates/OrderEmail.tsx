import { Section, Text, Heading, Hr } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface OrderEmailProps {
  orderNumber: string;
  orgName: string;
  vendorName: string;
  items: Array<{ name: string; quantity: number; unit: string }>;
  notes?: string;
}

export const OrderEmail = ({
  orderNumber,
  orgName,
  vendorName,
  items,
  notes,
}: OrderEmailProps) => (
  <BaseLayout preview={`Purchase Order ${orderNumber} from ${orgName}`}>
    <Heading className="text-xl font-black uppercase tracking-tight text-zinc-900 mb-4">
      Purchase Order
    </Heading>
    <Text className="text-zinc-600 text-sm mb-6">
      Dear {vendorName}, please find the purchase order from **{orgName}**
      below.
    </Text>

    <Section className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 mb-8">
      <Text className="text-[10px] font-black uppercase text-zinc-400 mb-4 tracking-widest">
        Items Requested
      </Text>
      {items.map((item, idx) => (
        <div key={idx} className="flex justify-between items-center mb-3">
          <Text className="text-sm font-bold text-zinc-900 m-0 uppercase">
            {item.name}
          </Text>
          <Text className="text-sm font-mono text-zinc-500 m-0">
            {item.quantity} {item.unit}
          </Text>
        </div>
      ))}
      {notes && (
        <>
          <Hr className="border-zinc-200 my-4" />
          <Text className="text-[10px] font-black uppercase text-zinc-400 mb-1 tracking-widest">
            Notes
          </Text>
          <Text className="text-xs text-zinc-600 italic">{notes}</Text>
        </>
      )}
    </Section>

    <Text className="text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
      Order Ref: {orderNumber}
    </Text>
  </BaseLayout>
);

export default OrderEmail;
