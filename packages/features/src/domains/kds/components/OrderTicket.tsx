import React from "react";
import { Card, View, Text, Button } from "@sous/ui";

interface Props {
  order: any;
  onBump: (id: string) => void;
}

export const OrderTicket = ({ order, onBump }: Props) => {
  const age = Math.floor(
    (Date.now() - new Date(order.createdAt).getTime()) / 1000 / 60,
  );
  const bgClass =
    age > 10
      ? "bg-destructive text-destructive-foreground"
      : age > 5
        ? "bg-amber-500 text-amber-950"
        : "bg-card text-card-foreground";

  return (
    <Card
      className={`w-[250px] m-2 overflow-hidden border-2 flex flex-col ${bgClass}`}
    >
      <div className="bg-muted p-2 flex flex-row justify-between text-muted-foreground">
        <span className="font-bold font-mono">#{order.number}</span>
        <span className="font-mono">{age}m</span>
      </div>
      <div className="p-2 flex flex-col gap-2 flex-1">
        {order.items.map((item: any, idx: number) => (
          <span key={idx} className="text-lg font-bold">
            {item.quantity}x {item.name}
          </span>
        ))}
      </div>
      <Button
        className="rounded-none h-12 bg-primary hover:bg-primary/90"
        onClick={() => onBump(order.id)}
      >
        <span className="text-primary-foreground font-black tracking-widest">
          BUMP
        </span>
      </Button>
    </Card>
  );
};
