"use client";

import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Button, cn, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@sous/ui";
import { OrderTicket } from "./components/OrderTicket";
import { HACCPBar } from "./components/HACCPBar";
import { DevicePairingFlow } from "../hardware/components/DevicePairingFlow";
import { gql } from "@apollo/client";
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import { useAuth } from "../iam/auth/hooks/useAuth";
import { RefreshCcw, Utensils, Loader2, CheckCircle2, List, Settings, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GET_ORDERS = gql`
  query GetOrders($status: String) {
    orders(status: $status) {
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
  orders: any[];
}

export const KDSFeature = () => {
  return (
    <DevicePairingFlow type="kds">
      {({ organizationId }) => <KDSContent orgId={organizationId || ""} />}
    </DevicePairingFlow>
  );
};

const KDSContent = ({ orgId }: { orgId: string }) => {
  const [showCompleted, setShowCompleted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { data, loading, refetch } = useQuery<KDSData>(GET_ORDERS, {
    variables: { status: showCompleted ? "COMPLETED" : "OPEN" },
    skip: !orgId,
  });

  // Real-time subscription
  const { data: subData } = useSubscription<{ orderUpdated: any }>(ORDER_SUBSCRIPTION, {
    skip: !orgId,
  });

  // Handle subscription updates
  useEffect(() => {
    if (subData?.orderUpdated) {
      void refetch();
    }
  }, [subData, refetch]);

  const [updateStatus] = useMutation(UPDATE_ORDER_STATUS, {
    onCompleted: () => refetch()
  });

  const handleBump = async (id: string) => {
    try {
      await updateStatus({
        variables: { id, status: showCompleted ? "OPEN" : "COMPLETED" }
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

  const orders = data?.orders || [];

  return (
    <View className="flex-1 bg-[#050505] min-h-screen flex flex-col overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:48px_48px] opacity-10 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-500/5 blur-[120px] pointer-events-none" />

      {/* KDS Header */}
      <View className="h-24 border-b border-white/5 bg-zinc-950/50 backdrop-blur-2xl flex flex-row items-center justify-between px-10 relative z-10 shadow-2xl">
         <View className="flex flex-row items-center gap-6">
            <View className="w-12 h-12 bg-sky-500/10 rounded-[1.25rem] flex items-center justify-center border border-sky-500/20 neon-glow shadow-sky-500/5 transition-all hover:scale-110 duration-500">
               <Utensils className="text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" size={24} />
            </View>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 leading-none mb-1.5">Kitchen Operation Center</span>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-white italic leading-none">
                 Kitchen Display <span className="text-sky-500 drop-shadow-[0_0_10px_rgba(14,165,233,0.4)]">System</span>
              </h1>
            </div>
         </View>

         <View className="flex flex-row items-center gap-8">
            <div className="flex flex-row bg-black/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
              <button 
                onClick={() => setShowCompleted(false)}
                className={cn(
                  "h-11 px-8 rounded-xl flex flex-row items-center gap-3 transition-all duration-500 font-black uppercase tracking-widest text-[10px]",
                  !showCompleted 
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 neon-glow" 
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                )}
              >
                <List size={16} className={!showCompleted ? "drop-shadow-[0_0_5px_white]" : ""} />
                Active Tickets
              </button>
              <button 
                onClick={() => setShowCompleted(true)}
                className={cn(
                  "h-11 px-8 rounded-xl flex flex-row items-center gap-3 transition-all duration-500 font-black uppercase tracking-widest text-[10px]",
                  showCompleted 
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 neon-glow" 
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                )}
              >
                <CheckCircle2 size={16} className={showCompleted ? "drop-shadow-[0_0_5px_white]" : ""} />
                Archive
              </button>
            </div>

            <View className="flex flex-col items-end min-w-[100px] pr-6 border-r border-white/10">
               <Text className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-1">
                 {showCompleted ? "Processed" : "Live Board"}
               </Text>
               <Text className="text-3xl font-mono font-black text-white leading-none tracking-tighter">
                 {orders.length < 10 ? `0${orders.length}` : orders.length}
               </Text>
            </View>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => refetch()} className="w-12 h-12 rounded-[1.25rem] text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group">
                 <RefreshCcw size={22} className="group-active:rotate-180 transition-transform duration-500" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="w-12 h-12 rounded-[1.25rem] text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group">
                 <Settings size={22} className="group-hover:rotate-90 transition-transform duration-500" />
              </Button>
            </div>
         </View>
      </View>

      {/* Ticket Grid */}
      <ScrollView className="flex-1 p-10 relative z-10">
        <motion.div 
          layout
          className="flex flex-row flex-wrap gap-10 justify-start"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {orders.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex-1 flex flex-col items-center justify-center py-48 w-full"
              >
                 <div className="w-32 h-32 rounded-[3rem] bg-zinc-900/20 border border-white/5 flex items-center justify-center mb-10 opacity-20">
                    <Utensils size={64} className="text-zinc-500" />
                 </div>
                 <Text className="text-2xl font-black uppercase tracking-[0.5em] text-zinc-700 italic">
                   {showCompleted ? "Board Clear" : "System Standby"}
                 </Text>
              </motion.div>
            ) : (
              orders.map((order: any) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.3 } }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <OrderTicket 
                    order={{
                      ...order,
                      number: order.externalOrderId?.split('-').pop() || order.id.substring(0, 4),
                      items: order.items
                    }} 
                    onBump={handleBump} 
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </ScrollView>

      <HACCPBar orgId={orgId} />

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-zinc-950/90 backdrop-blur-3xl border-white/10 max-w-2xl rounded-[3rem] p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
          <div className="p-12 space-y-10">
            <DialogHeader>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">System Preferences</span>
                <DialogTitle className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">
                  KDS <span className="text-sky-500">Config</span>
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Display Experience</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex flex-col gap-2 group hover:border-sky-500/30 transition-all">
                    <span className="text-zinc-500 font-black uppercase text-[9px] tracking-widest">Font Density</span>
                    <span className="text-white font-black text-xl italic tracking-tight">Compact (14pt)</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex flex-row justify-between items-center group hover:border-sky-500/30 transition-all">
                    <div className="flex flex-col gap-2">
                      <span className="text-zinc-500 font-black uppercase text-[9px] tracking-widest">Order Alerts</span>
                      <span className="text-white font-black text-xl italic tracking-tight">Active Flash</span>
                    </div>
                    <div className="w-14 h-8 bg-emerald-500/10 rounded-full border border-emerald-500/30 flex items-center justify-end px-1 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      <div className="w-6 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Station Maintenance</h3>
                <Button variant="outline" className="w-full h-16 rounded-[1.5rem] border-white/5 bg-white/5 text-zinc-400 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all duration-500 gap-4 group">
                  <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="font-black uppercase tracking-[0.2em] text-[10px]">Clear Local Application Cache</span>
                </Button>
              </div>
            </div>

            <div className="pt-4">
              <Button className="w-full h-20 rounded-[2rem] bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-[0.25em] text-xs italic shadow-xl shadow-sky-500/20 transition-all duration-500" onClick={() => setShowSettings(false)}>
                Commit Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </View>
  );
};
