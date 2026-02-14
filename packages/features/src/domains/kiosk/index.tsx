"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  Card,
  Badge,
  ScrollView,
  Logo,
  KioskLoading,
  cn,
} from "@sous/ui";
import { DevicePairingFlow } from "../hardware/components/DevicePairingFlow";
import {
  ShoppingCart,
  CreditCard,
  ChevronRight,
  X,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Info,
  Grid,
  Plus,
} from "lucide-react";
import { gql } from "@apollo/client";
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import { useAuth } from "../iam/auth/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

const GET_KIOSK_CATALOG = gql`
  query GetKioskCatalog($orgId: String!) {
    products(orgId: $orgId) {
      id
      name
      price
      categoryId
    }
    categories(orgId: $orgId) {
      id
      name
    }
  }
`;

const CATALOG_UPDATED_SUBSCRIPTION = gql`
  subscription OnCatalogUpdated($orgId: String!) {
    catalogUpdated(orgId: $orgId)
  }
`;

const CREATE_KIOSK_ORDER = gql`
  mutation CreateKioskOrder($orgId: String!, $input: CreateOrderInput!) {
    createOrder(orgId: $orgId, input: $input) {
      id
      status
    }
  }
`;

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface KioskCatalogData {
  products: any[];
  categories: any[];
}

export const KioskFeature = () => {
  return (
    <DevicePairingFlow type="kiosk">
      {({ organizationId }) => (
        <KioskContent key={organizationId} orgId={organizationId || ""} />
      )}
    </DevicePairingFlow>
  );
};

const KioskContent = ({ orgId }: { orgId: string }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [isCheckout, setIsCheckout] = useState(false);
  const [completed, setCompleted] = useState(false);

  const { data, loading, refetch } = useQuery<KioskCatalogData>(
    GET_KIOSK_CATALOG,
    {
      variables: { orgId },
      skip: !orgId,
    },
  );

  const { data: subData } = useSubscription<any>(CATALOG_UPDATED_SUBSCRIPTION, {
    variables: { orgId },
    skip: !orgId,
  });

  useEffect(() => {
    if (subData?.catalogUpdated) {
      void refetch();
    }
  }, [subData, refetch]);

  const [createOrder, { loading: processing }] =
    useMutation(CREATE_KIOSK_ORDER);

  const products = data?.products || [];
  const categories = data?.categories || [];

  const filteredItems = selectedCategoryId
    ? products.filter((i: any) => i.categoryId === selectedCategoryId)
    : products;

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p,
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePay = async () => {
    try {
      await createOrder({
        variables: {
          orgId,
          input: {
            items: cart.map((i) => ({
              productId: i.id,
              name: i.name,
              quantity: i.quantity,
              unitPrice: i.price,
            })),
            totalAmount: total,
            paymentMethod: "CARD",
            source: "sous-kiosk",
          },
        },
      });
      setCompleted(true);
      setCart([]);

      setTimeout(() => {
        setCompleted(false);
        setIsCheckout(false);
        setSelectedCategoryId(null);
      }, 10000);
    } catch (err) {
      console.error(err);
      alert("Payment failed. Please try again.");
    }
  };

  if (loading && !data) {
    return <KioskLoading suffix="kiosk" />;
  }

  if (completed) {
    return (
      <View className="flex-1 items-center justify-center bg-[#050505] p-8 text-center h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary),0.1)_0%,transparent_70%)]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="items-center justify-center flex flex-col z-10"
        >
          <View className="mb-12 rounded-full bg-emerald-500/20 p-16 border border-emerald-500/30 shadow-[0_0_100px_rgba(16,185,129,0.2)]">
            <CheckCircle2 size={120} className="text-emerald-500" />
          </View>
          <h1 className="mb-6 text-9xl text-white font-black tracking-tighter uppercase italic">
            Enjoy!
          </h1>
          <Text className="mb-16 text-3xl text-zinc-500 font-bold uppercase tracking-widest">
            Order sent to the kitchen.
          </Text>
          <Button
            size="lg"
            className="h-24 px-20 rounded-[3rem] text-3xl font-black uppercase tracking-widest bg-primary text-black shadow-[0_0_50px_rgba(var(--primary),0.4)] transition-all hover:scale-105 active:scale-95"
            onClick={() => {
              setCompleted(false);
              setIsCheckout(false);
            }}
          >
            Start New Order
          </Button>
        </motion.div>
      </View>
    );
  }

  if (isCheckout) {
    return (
      <View className="flex flex-col h-screen bg-zinc-950">
        <View className="p-12 border-b border-zinc-800/50 flex flex-row items-center bg-black/40 backdrop-blur-xl">
          <button
            onClick={() => setIsCheckout(false)}
            className="mr-8 text-zinc-500 hover:text-white flex items-center gap-3 transition-colors"
          >
            <ArrowLeft size={32} />
            <span className="text-xl font-black uppercase tracking-widest">
              Back to Menu
            </span>
          </button>
          <div className="h-12 w-px bg-zinc-800 mx-4" />
          <h2 className="text-4xl text-white font-black uppercase tracking-tighter italic">
            Your Tray
          </h2>
        </View>

        <View className="flex-1 p-12 flex flex-row gap-12 overflow-hidden bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:40px_40px] bg-opacity-5">
          <View className="flex-1 bg-zinc-900/40 backdrop-blur-md rounded-[3rem] p-12 border border-zinc-800/50 flex flex-col shadow-2xl">
            <h3 className="text-sm text-zinc-500 mb-12 font-black uppercase tracking-[0.4em]">
              Tray Contents
            </h3>
            <ScrollView className="flex-1 pr-4">
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-row items-center justify-between mb-8 pb-8 border-b border-zinc-800/50 group"
                >
                  <View>
                    <Text className="text-white text-3xl font-black uppercase tracking-tighter group-hover:text-primary transition-colors">
                      {item.name}
                    </Text>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-primary font-black font-mono text-lg">
                        x{item.quantity}
                      </span>
                      <div className="h-1 w-8 bg-zinc-800 rounded-full" />
                      <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
                        Standard Serving
                      </span>
                    </div>
                  </View>
                  <Text className="text-white font-mono text-3xl font-black">
                    ${((item.price * item.quantity) / 100).toFixed(2)}
                  </Text>
                </motion.div>
              ))}
            </ScrollView>
            <View className="mt-12 pt-12 border-t-4 border-double border-zinc-800 flex flex-row justify-between items-end">
              <div>
                <span className="text-xs font-black text-zinc-600 uppercase tracking-[0.4em] block mb-2">
                  Total Amount
                </span>
                <h2 className="text-5xl text-white font-black uppercase tracking-tighter italic">
                  Order Total
                </h2>
              </div>
              <h2 className="text-7xl text-primary font-black font-mono drop-shadow-[0_0_20px_rgba(var(--primary),0.4)]">
                ${(total / 100).toFixed(2)}
              </h2>
            </View>
          </View>

          <View className="w-[500px] bg-zinc-900/60 backdrop-blur-xl rounded-[3rem] p-16 flex flex-col justify-center items-center border border-zinc-800/50 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary),0.05)_0%,transparent_50%)]" />
            <div className="w-32 h-32 rounded-[2.5rem] bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-12 shadow-inner">
              <CreditCard size={64} className="text-primary" />
            </div>
            <h3 className="text-4xl text-white mb-6 font-black uppercase tracking-tighter italic text-center">
              Ready for Payment
            </h3>
            <Text className="text-zinc-500 text-center mb-16 text-xl leading-relaxed font-medium">
              Please Insert, Swipe or Tap your card on the terminal below.
            </Text>

            <Button
              className="w-full h-28 text-3xl font-black uppercase tracking-tighter rounded-[2rem] bg-primary text-black shadow-[0_0_50px_-10px_rgba(var(--primary),0.5)] transition-all hover:scale-[1.02] active:scale-95"
              onClick={handlePay}
              disabled={processing}
            >
              {processing ? (
                <Loader2 className="animate-spin size-10" />
              ) : (
                "Complete Order"
              )}
            </Button>

            <div className="mt-16 flex items-center gap-4 opacity-30 grayscale contrast-200">
              <Logo variant="cloud" size={24} showWordmark={false} />
              <div className="h-4 w-px bg-white" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                Secure Transaction
              </span>
            </div>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex flex-col h-screen bg-[#050505] text-white overflow-hidden relative">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:64px_64px] opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sky-500/5 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/4" />

      {/* Header */}
      <View className="h-32 border-b border-white/5 flex flex-row items-center justify-between px-16 bg-zinc-950/40 backdrop-blur-3xl sticky top-0 z-20 shadow-2xl relative">
        <View className="flex flex-row items-center gap-10">
          <div className="p-4 bg-sky-500/10 rounded-[2rem] border border-sky-500/20 neon-glow shadow-sky-500/5">
            <Logo variant="kiosk" size={64} animate />
          </div>
          <View className="h-16 w-px bg-white/10 mx-2" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 mb-1.5 leading-none">
              Automated Service Node
            </span>
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none italic text-white">
              Self-Service{" "}
              <span className="text-sky-500 drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]">
                Station
              </span>
            </h1>
          </div>
        </View>

        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            className="relative z-30"
          >
            <Button
              onClick={() => setIsCheckout(true)}
              className="h-24 px-14 rounded-[2.5rem] bg-sky-500 hover:bg-sky-400 text-white shadow-[0_0_50px_rgba(14,165,233,0.3)] neon-glow active:scale-95 transition-all duration-500 group overflow-hidden relative border border-sky-400/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
              <ShoppingCart
                className="mr-5 h-9 w-9 drop-shadow-[0_0_10px_white]"
                strokeWidth={3}
              />
              <span className="text-3xl font-black uppercase tracking-tighter italic mr-8">
                View My Tray
              </span>
              <div className="bg-black/40 backdrop-blur-md text-sky-400 rounded-2xl px-5 py-2 font-black text-3xl shadow-inner border border-white/10">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </div>
            </Button>
          </motion.div>
        )}
      </View>

      <View className="flex flex-1 flex-row overflow-hidden relative z-10">
        {/* Sidebar Categories */}
        <View className="w-[360px] bg-zinc-950/20 backdrop-blur-xl border-r border-white/5 flex flex-col">
          <View className="p-14 flex-1 flex flex-col">
            <div className="flex items-center gap-4 mb-12 opacity-60">
              <Grid size={18} className="text-sky-500" />
              <h3 className="text-[11px] font-black uppercase text-zinc-400 tracking-[0.5em]">
                Explore Menu
              </h3>
            </div>
            <ScrollView className="flex-1 -mx-6 px-6 no-scrollbar">
              <View className="gap-8 pb-16">
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className={cn(
                    "w-full h-28 rounded-[2.5rem] px-10 text-2xl font-black uppercase tracking-tighter text-left transition-all duration-500 relative group overflow-hidden border",
                    selectedCategoryId === null
                      ? "bg-sky-500 text-white shadow-[0_0_40px_rgba(14,165,233,0.25)] border-sky-400/30 translate-x-4 neon-glow"
                      : "bg-white/5 border-white/5 text-zinc-500 hover:text-white hover:bg-white/10 hover:border-white/10",
                  )}
                >
                  <span className="relative z-10 italic">All Items</span>
                  {selectedCategoryId === null && (
                    <motion.div
                      layoutId="active-cat"
                      className="absolute right-8 top-1/2 -translate-y-1/2 z-10"
                    >
                      <ChevronRight
                        size={32}
                        className="drop-shadow-[0_0_10px_white]"
                      />
                    </motion.div>
                  )}
                </button>
                {categories.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={cn(
                      "w-full h-28 rounded-[2.5rem] px-10 text-2xl font-black uppercase tracking-tighter text-left transition-all duration-500 relative group overflow-hidden border",
                      selectedCategoryId === cat.id
                        ? "bg-sky-500 text-white shadow-[0_0_40px_rgba(14,165,233,0.25)] border-sky-400/30 translate-x-4 neon-glow"
                        : "bg-white/5 border-white/5 text-zinc-500 hover:text-white hover:bg-white/10 hover:border-white/10",
                    )}
                  >
                    <span className="relative z-10 italic">{cat.name}</span>
                    {selectedCategoryId === cat.id && (
                      <motion.div
                        layoutId="active-cat"
                        className="absolute right-8 top-1/2 -translate-y-1/2 z-10"
                      >
                        <ChevronRight
                          size={32}
                          className="drop-shadow-[0_0_10px_white]"
                        />
                      </motion.div>
                    )}
                  </button>
                ))}
              </View>
            </ScrollView>

            {/* Help / Call Attendant */}
            <div className="mt-auto pt-10 border-t border-white/5">
              <Button
                variant="ghost"
                className="w-full h-20 rounded-3xl text-zinc-600 hover:text-sky-400 gap-4 border border-transparent hover:border-sky-500/20 hover:bg-sky-500/5 transition-all duration-500"
              >
                <Info size={24} />
                <span className="text-xs font-black uppercase tracking-[0.3em]">
                  Need Assistance?
                </span>
              </Button>
            </div>
          </View>
        </View>

        {/* Main Content */}
        <View className="flex-1 flex flex-col overflow-hidden bg-black/10">
          <ScrollView className="flex-1 p-16 no-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategoryId || "all"}
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.02, y: -20 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-16 pb-32"
              >
                {filteredItems.map((product: any) => (
                  <motion.div
                    key={product.id}
                    layout
                    whileTap={{ scale: 0.96 }}
                  >
                    <Card
                      className="bg-zinc-900/40 backdrop-blur-md border-2 border-white/5 rounded-[4rem] overflow-hidden flex flex-col h-[650px] group hover:border-sky-500/40 transition-all duration-700 cursor-pointer shadow-2xl relative"
                      onClick={() => addToCart(product)}
                    >
                      {/* Floating Shadow/Glow */}
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                      <View className="h-80 bg-zinc-800/20 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                        <Text className="text-[10rem] group-hover:scale-110 group-hover:rotate-6 transition-all duration-[2s] ease-out drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                          🍔
                        </Text>

                        <div className="absolute bottom-10 right-10 opacity-0 group-hover:opacity-100 transition-all translate-y-6 group-hover:translate-y-0 duration-700">
                          <div className="bg-sky-500 p-6 rounded-[2rem] shadow-[0_0_30px_rgba(14,165,233,0.6)] neon-glow">
                            <Plus
                              size={40}
                              className="text-white drop-shadow-[0_0_5px_white]"
                              strokeWidth={4}
                            />
                          </div>
                        </div>
                      </View>

                      <View className="p-14 flex flex-col flex-1 relative z-10">
                        <div className="flex flex-col gap-2 mb-6">
                          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 group-hover:text-sky-500 transition-colors duration-500">
                            Premium Curation
                          </span>
                          <h3 className="text-5xl font-black uppercase tracking-tighter text-white italic leading-none group-hover:text-sky-400 transition-all duration-500">
                            {product.name}
                          </h3>
                        </div>
                        <Text className="text-zinc-400 text-xl line-clamp-3 mb-12 flex-1 font-medium leading-relaxed group-hover:text-zinc-300 transition-colors duration-500">
                          Hand-crafted {product.name.toLowerCase()} prepared
                          fresh using premium local ingredients. 100%
                          Chef-certified.
                        </Text>
                        <View className="flex flex-row items-end justify-between mt-auto">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase text-zinc-600 tracking-[0.4em] mb-2">
                              Service Total
                            </span>
                            <Text className="text-5xl font-mono font-black text-sky-500 drop-shadow-[0_0_15px_rgba(14,165,233,0.4)] tracking-tighter italic">
                              ${(product.price / 100).toFixed(2)}
                            </Text>
                          </div>
                          <div className="h-24 w-24 rounded-[2.5rem] border-4 border-white/5 flex items-center justify-center group-hover:border-sky-500/50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 bg-white/5">
                            <Plus
                              size={32}
                              className="text-zinc-700 group-hover:text-sky-400 group-hover:drop-shadow-[0_0_10px_rgba(56,189,248,0.5)] transition-all"
                              strokeWidth={3}
                            />
                          </div>
                        </View>
                      </View>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};
