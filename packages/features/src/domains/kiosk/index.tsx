"use client";

import React, { useState, useEffect } from "react";
import { View, Text, Button, Card, Badge, ScrollView, Logo } from "@sous/ui";
import { DevicePairingFlow } from "../hardware/components/DevicePairingFlow";
import { ShoppingCart, CreditCard, ChevronRight, X, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
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

/**
 * Self-Service Kiosk Feature.
 * provides a customer-facing interface for browsing the menu, managing a cart,
 * and completing orders with integrated payment simulation.
 */
export const KioskFeature = () => {
  const { user } = useAuth();
  const orgId = user?.organizationId || "";
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isCheckout, setIsCheckout] = useState(false);
  const [completed, setCompleted] = useState(false);

  const { data, loading, refetch } = useQuery<KioskCatalogData>(GET_KIOSK_CATALOG, {
    variables: { orgId },
    skip: !orgId,
  });

  // Real-time catalog updates
  const { data: subData } = useSubscription(CATALOG_UPDATED_SUBSCRIPTION, {
    variables: { orgId },
    skip: !orgId,
  });

  useEffect(() => {
    if (subData?.catalogUpdated) {
      void refetch();
    }
  }, [subData, refetch]);

  const [createOrder, { loading: processing }] = useMutation(CREATE_KIOSK_ORDER);

  const products = data?.products || [];
  const categories = data?.categories || [];

  const filteredItems = selectedCategoryId 
    ? products.filter((i: any) => i.categoryId === selectedCategoryId)
    : products;

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePay = async () => {
    try {
      await createOrder({
        variables: {
          orgId,
          input: {
            items: cart.map(i => ({
              productId: i.id,
              name: i.name,
              quantity: i.quantity,
              unitPrice: i.price
            })),
            totalAmount: total,
            paymentMethod: "CARD",
            source: "sous-kiosk"
          }
        }
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
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <Text className="text-zinc-500 font-black uppercase tracking-widest text-xs">
          Loading Menu...
        </Text>
      </View>
    );
  }

  if (completed) {
    return (
      <View className="flex-1 items-center justify-center bg-[#050505] p-8 text-center h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="items-center justify-center flex flex-col"
        >
          <View className="mb-8 rounded-full bg-green-500/20 p-12 border border-green-500/20 shadow-[0_0_100px_rgba(34,197,94,0.1)]">
            <CheckCircle2 size={80} className="text-green-500" />
          </View>
          <h1 className="mb-4 text-8xl text-white font-black tracking-tighter uppercase">Enjoy!</h1>
          <Text className="mb-12 text-2xl text-zinc-400 font-medium">Your order has been sent to the kitchen.</Text>
          <Button size="lg" className="h-20 px-16 rounded-3xl text-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20" onClick={() => {
            setCompleted(false);
            setIsCheckout(false);
          }}>Start New Order</Button>
        </motion.div>
      </View>
    );
  }

  if (isCheckout) {
    return (
      <View className="flex flex-col h-screen bg-zinc-950">
        <View className="p-8 border-b border-zinc-800 flex flex-row items-center bg-black/40">
          <Button variant="ghost" onClick={() => setIsCheckout(false)} className="mr-4 text-zinc-400">
            <ArrowLeft className="mr-2" />
            Back to Menu
          </Button>
          <h2 className="text-2xl text-white font-black uppercase tracking-tighter">Your Tray</h2>
        </View>
        <View className="flex-1 p-8 flex flex-row gap-12 overflow-hidden">
          <View className="flex-1 bg-zinc-900/50 rounded-3xl p-8 border border-zinc-800 flex flex-col">
            <h3 className="text-xl text-zinc-500 mb-8 font-black uppercase tracking-widest">Order Summary</h3>
            <ScrollView className="flex-1">
              {cart.map(item => (
                <View key={item.id} className="flex flex-row items-center justify-between mb-6 pb-6 border-b border-zinc-800/50">
                  <View>
                    <Text className="text-white text-xl font-bold">{item.name}</Text>
                    <Text className="text-primary font-black text-sm">x{item.quantity}</Text>
                  </View>
                  <Text className="text-white font-mono text-xl">${((item.price * item.quantity) / 100).toFixed(2)}</Text>
                </View>
              ))}
            </ScrollView>
            <View className="mt-8 pt-8 border-t border-zinc-700 flex flex-row justify-between items-center">
              <h2 className="text-3xl text-white font-black uppercase tracking-tighter">Total</h2>
              <h2 className="text-4xl text-primary font-black font-mono">${(total / 100).toFixed(2)}</h2>
            </View>
          </View>
          <View className="w-[450px] bg-zinc-900 rounded-3xl p-8 flex flex-col justify-center items-center border border-zinc-800 shadow-2xl">
             <CreditCard size={80} className="text-primary mb-8" />
             <h3 className="text-3xl text-white mb-4 font-black uppercase tracking-tighter">Payment</h3>
             <Text className="text-zinc-500 text-center mb-12 text-lg">Insert, Swipe or Tap your card on the reader below to complete your order.</Text>
             
             <Button 
               size="lg" 
               className="w-full h-24 text-2xl font-black uppercase tracking-tighter rounded-2xl shadow-2xl shadow-primary/20"
               onClick={handlePay}
               disabled={processing}
             >
               {processing ? <Loader2 className="animate-spin" /> : "Simulate Card Tap"}
             </Button>
             <Logo size={24} suffix="pay" className="mt-12 opacity-20" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <DevicePairingFlow type="kiosk">
      {() => (
        <View className="flex flex-col h-screen bg-[#050505] text-white overflow-hidden">
          {/* Header */}
          <View className="h-24 border-b border-zinc-800 flex flex-row items-center justify-between px-12 bg-black/40 backdrop-blur-md sticky top-0 z-10">
            <View className="flex flex-row items-center gap-4">
               <Logo size={40} animate />
               <View className="h-8 w-px bg-zinc-800" />
               <h1 className="text-2xl font-black uppercase tracking-tighter">Self-Service <span className="text-primary">Kiosk</span></h1>
            </View>
            
            {cart.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button onClick={() => setIsCheckout(true)} className="h-16 px-8 rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 active:scale-95 transition-transform">
                  <ShoppingCart className="mr-3 h-6 w-6" />
                  <span className="text-xl font-black uppercase tracking-tighter">View My Tray</span>
                  <Badge className="ml-4 bg-white text-primary rounded-lg px-2 font-black text-lg">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </Badge>
                </Button>
              </motion.div>
            )}
          </View>

          <View className="flex flex-1 flex-row overflow-hidden">
            {/* Sidebar Categories */}
            <View className="w-80 bg-zinc-900/30 border-r border-zinc-800 flex flex-col">
              <View className="p-10">
                <h3 className="text-[10px] font-black uppercase text-zinc-600 mb-8 tracking-[0.3em]">Menu Categories</h3>
                <ScrollView className="flex-1">
                  <View className="gap-4">
                    <Button
                      variant={selectedCategoryId === null ? "default" : "ghost"}
                      className={`w-full h-20 justify-start rounded-3xl px-8 text-lg font-black uppercase tracking-tight transition-all ${selectedCategoryId === null ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20" : "text-zinc-500 hover:text-white hover:bg-zinc-800/50"}`}
                      onClick={() => setSelectedCategoryId(null)}
                    >
                      All Items
                    </Button>
                    {categories.map((cat: any) => (
                      <Button
                        key={cat.id}
                        variant={selectedCategoryId === cat.id ? "default" : "ghost"}
                        className={`w-full h-20 justify-start rounded-3xl px-8 text-lg font-black uppercase tracking-tight transition-all ${selectedCategoryId === cat.id ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20" : "text-zinc-500 hover:text-white hover:bg-zinc-800/50"}`}
                        onClick={() => setSelectedCategoryId(cat.id)}
                      >
                        {cat.name}
                      </Button>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            {/* Main Content */}
            <View className="flex-1 flex flex-col overflow-hidden bg-black/20">
               <ScrollView className="flex-1 p-12">
                 <AnimatePresence mode="wait">
                   <motion.div
                    key={selectedCategoryId || 'all'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10"
                   >
                     {filteredItems.map((product: any) => (
                       <motion.div
                        key={product.id}
                        layout
                        whileHover={{ y: -10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                       >
                         <Card 
                          className="bg-zinc-900/40 border-zinc-800/50 rounded-[3rem] overflow-hidden flex flex-col h-[500px] group hover:border-primary/50 transition-all cursor-pointer shadow-2xl"
                          onClick={() => addToCart(product)}
                         >
                           <View className="h-64 bg-zinc-800/30 flex items-center justify-center relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <Text className="text-8xl group-hover:scale-110 transition-transform duration-700">🍔</Text>
                           </View>
                           <View className="p-10 flex flex-col flex-1">
                             <View className="flex flex-row justify-between items-start mb-4">
                               <h3 className="text-3xl font-black uppercase tracking-tighter text-white">{product.name}</h3>
                             </View>
                             <Text className="text-zinc-500 text-lg line-clamp-2 mb-8 flex-1 font-medium leading-relaxed">Delicious freshly prepared {product.name.toLowerCase()} made with the finest local ingredients.</Text>
                             <View className="flex flex-row items-center justify-between mt-auto">
                                <Text className="text-3xl font-mono font-black text-primary">${(product.price / 100).toFixed(2)}</Text>
                                <Button className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                                  Add to Tray
                                </Button>
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
      )}
    </DevicePairingFlow>
  );
};
