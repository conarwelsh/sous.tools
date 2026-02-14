import React from "react";
import { Button, Card, View, Text, ScrollView } from "@sous/ui";
import { Loader2 } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Props {
  items: CartItem[];
  onPay: () => void;
  onClear: () => void;
  isSubmitting?: boolean;
}

export const Cart = ({ items, onPay, onClear, isSubmitting }: Props) => {
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="w-[400px] border-l border-border bg-card p-4 flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-4">Current Order</h2>

      <ScrollView className="flex-1 mb-4 pr-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-row justify-between items-center py-3 border-b border-border"
          >
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{item.name}</span>
              <span className="text-sm text-muted-foreground font-mono">
                x{item.quantity}
              </span>
            </div>
            <span className="font-mono text-foreground">
              ${((item.price * item.quantity) / 100).toFixed(2)}
            </span>
          </div>
        ))}
      </ScrollView>

      <div className="flex flex-col gap-4 mt-auto">
        <div className="flex flex-row justify-between items-center">
          <span className="text-xl font-bold text-foreground uppercase tracking-tight">
            Total
          </span>
          <span className="text-3xl font-mono text-primary font-black">
            ${(total / 100).toFixed(2)}
          </span>
        </div>

        <div className="flex flex-row gap-4">
          <Button
            variant="destructive"
            className="flex-1 h-12"
            onClick={onClear}
            disabled={isSubmitting}
          >
            <span className="font-bold uppercase tracking-widest">Clear</span>
          </Button>
          <Button
            className="flex-[2] bg-emerald-600 hover:bg-emerald-700 h-12"
            onClick={onPay}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : (
              <span className="text-xl font-black uppercase tracking-widest">
                Pay
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
