"use client";

import React, { useState } from "react";
import { ScrollView, Logo, KioskLoading } from "@sous/ui";
import { OrderTicket } from "./components/OrderTicket";
import { HACCPBar } from "./components/HACCPBar";
import { DevicePairingFlow } from "../hardware/components/DevicePairingFlow";

export const KDSFeature = () => {
  const [orders, setOrders] = useState([
    {
      id: "1",
      number: 101,
      createdAt: new Date(Date.now() - 1000 * 60 * 2),
      items: [{ name: "Burger", quantity: 1 }],
    },
    {
      id: "2",
      number: 102,
      createdAt: new Date(Date.now() - 1000 * 60 * 12),
      items: [{ name: "Fries", quantity: 2 }],
    },
  ]);

  const handleBump = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <DevicePairingFlow type="kds">
      {({ socket }) => (
        <div className="flex-1 bg-[#0a0a0a] min-h-screen flex flex-col overflow-hidden">
          <ScrollView className="flex-1 p-4">
            <div className="flex flex-row flex-wrap gap-2">
              {orders.map((order) => (
                <OrderTicket key={order.id} order={order} onBump={handleBump} />
              ))}
            </div>
          </ScrollView>
          <HACCPBar />
        </div>
      )}
    </DevicePairingFlow>
  );
};
