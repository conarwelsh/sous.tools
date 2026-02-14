"use client";

import React, { useEffect } from "react";
import { View, Text, ScrollView, Button } from "@sous/ui";
import { OrderTicket } from "./components/OrderTicket";
import { HACCPBar } from "./components/HACCPBar";
import { DevicePairingFlow } from "../hardware/components/DevicePairingFlow";
import { gql } from "@apollo/client";
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import { useAuth } from "../iam/auth/hooks/useAuth";
import { RefreshCcw, Utensils, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GET_ACTIVE_ORDERS = gql`
  query GetActiveOrders {
    activeOrders {
      id
      externalOrderId
      status
      createdAt
      items {
        id
        name
        quantity
      }
    }
  }
`;

const ORDER_SUBSCRIPTION = gql`
  subscription OnOrderUpdated {
    orderUpdated {
      id
      externalOrderId
      status
      createdAt
      items {
        id
        name
        quantity
      }
    }
  }
`;

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: String!, $status: String!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

interface KDSData {
  activeOrders: any[];
}

/**
 * Kitchen Display System (KDS) Feature.
 * Provides real-time visualization of active kitchen orders,
 * utilizing GraphQL Subscriptions for instant updates and
 * Framer Motion for smooth UI transitions.
 *
 * @returns {JSX.Element} The KDS interface.
 */
/**
 * KDSFeature Component
 * 
 * Provides a real-time Kitchen Display System interface.
 * Uses GraphQL Subscriptions to listen for order status changes.
 * Implements Framer Motion layout animations for smooth ticket entry and exit.
 * 
 * @returns React Node
 */
export const KDSFeature = () => {
  const { user } = useAuth();
  const orgId = user?.organizationId || "";

  const { data, loading, refetch } = useQuery<KDSData>(GET_ACTIVE_ORDERS, {
    skip: !orgId,
  });

  // Real-time subscription
  const { data: subData } = useSubscription<{ orderUpdated: any }>(ORDER_SUBSCRIPTION, {
    skip: !orgId,
  });

  // Handle subscription updates
  useEffect(() => {
    if (subData?.orderUpdated) {
      refetch();
    }
  }, [subData, refetch]);

  const [updateStatus] = useMutation(UPDATE_ORDER_STATUS, {
    onCompleted: () => refetch()
  });

  /**
   * Bumps an order from the kitchen display.
   * @param {string} id - The ID of the order to bump.
   */
  const handleBump = async (id: string) => {
    try {
      await updateStatus({
        variables: { id, status: "COMPLETED" }
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !data) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <Text className="text-zinc-500 font-black uppercase tracking-widest text-xs">
          Initialising Kitchen Station...
        </Text>
      </View>
    );
  }

  const orders = data?.activeOrders || [];

  return (
    <DevicePairingFlow type="kds">
      {() => (
        <View className="flex-1 bg-[#050505] min-h-screen flex flex-col overflow-hidden">
          {/* KDS Header */}
          <View className="h-20 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md flex flex-row items-center justify-between px-8">
             <View className="flex flex-row items-center gap-4">
                <View className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                   <Utensils className="text-primary" size={20} />
                </View>
                <h1 className="text-xl font-black uppercase tracking-tighter text-white">
                   Kitchen Display <span className="text-primary">System</span>
                </h1>
             </View>

             <View className="flex flex-row items-center gap-6">
                <View className="flex flex-col items-end">
                   <Text className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Active Tickets</Text>
                   <Text className="text-xl font-mono font-black text-white">{orders.length}</Text>
                </View>
                <Button variant="ghost" size="icon" onClick={() => refetch()} className="text-zinc-500 hover:text-white">
                   <RefreshCcw size={20} />
                </Button>
             </View>
          </View>

          {/* Ticket Grid */}
          <ScrollView className="flex-1 p-6">
            <motion.div 
              layout
              className="flex flex-row flex-wrap gap-6"
            >
              {orders.length === 0 ? (
                <View className="flex-1 items-center justify-center py-32 opacity-20">
                   <Utensils size={64} className="text-white mb-4" />
                   <Text className="text-xl font-black uppercase tracking-widest text-white">Clear Board</Text>
                </View>
              ) : (
                <AnimatePresence mode="popLayout">
                  {orders.map((order: any) => (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    >
                      <OrderTicket 
                        order={{
                          ...order,
                          number: order.externalOrderId.split('-').pop() || order.id.substring(0, 4),
                          items: order.items
                        }} 
                        onBump={handleBump} 
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </motion.div>
          </ScrollView>

          <HACCPBar />
        </View>
      )}
    </DevicePairingFlow>
  );
};
