"use client";

import React, { useState, useEffect, useMemo } from "react";
import { POSLayout } from "./components/POSLayout";
import { OrderGrid } from "./components/OrderGrid";
import { Cart } from "./components/Cart";
import { POSSidebar } from "./components/POSSidebar";
import { POSDashboard } from "./components/POSDashboard";
import { POSTables } from "./components/POSTables";
import { PINLoginModal } from "./components/PINLoginModal";
import { DevicePairingFlow } from "../hardware/components/DevicePairingFlow";
import { useAuth } from "../iam/auth/hooks/useAuth";
import { View, Text, Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, cn } from "@sous/ui";
import { gql } from "@apollo/client";
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import { Loader2, AlertCircle, CreditCard, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GET_POS_CATALOG = gql`
  query GetPosCatalog($orgId: String!) {
    products(orgId: $orgId) {
      id
      name
      price
      categoryId
      isSoldOut
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

const CREATE_ORDER = gql`
  mutation CreatePosOrder($orgId: String!, $input: CreateOrderInput!) {
    createOrder(orgId: $orgId, input: $input) {
      id
      status
    }
  }
`;

interface PosCatalogData {
  products: any[];
  categories: any[];
}

export const POSFeature = () => {
  return (
    <DevicePairingFlow type="pos">
      {({ organizationId }) => <POSContent key={organizationId} orgId={organizationId || ""} />}
    </DevicePairingFlow>
  );
};

const POSContent = ({ orgId }: { orgId: string }) => {
  const [activeTab, setActiveTab] = useState<"home" | "orders" | "tables" | "settings">("orders");
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");
  const [autoLogout, setAutoLogout] = useState(true);

  const { data, loading, refetch } = useQuery<PosCatalogData>(GET_POS_CATALOG, {
    variables: { orgId },
    skip: !orgId,
  });

  const { data: subData } = useSubscription<any>(CATALOG_UPDATED_SUBSCRIPTION, {
    variables: { orgId },
    skip: !orgId,
  });

  useEffect(() => {
    if (subData?.catalogUpdated) {
      void refetch();
    }
  }, [subData, refetch]);

  const [createOrder, { loading: isSubmitting }] = useMutation(CREATE_ORDER);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showModifiers, setShowModifiers] = useState(false);

  const handleAddItem = (item: any) => {
    setSelectedProduct(item);
    setShowModifiers(true);
  };

  const confirmAddItem = (modifiers: any = []) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === selectedProduct.id && JSON.stringify(i.modifiers) === JSON.stringify(modifiers));
      if (existing) {
        return prev.map((i) =>
          (i.id === selectedProduct.id && JSON.stringify(i.modifiers) === JSON.stringify(modifiers)) ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...selectedProduct, quantity: 1, modifiers }];
    });
    setShowModifiers(false);
    setSelectedProduct(null);
  };

  const handleUpdateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleSendToKitchen = async () => {
    if (cart.length === 0) return;
    try {
      const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
            totalAmount,
            paymentMethod: "PENDING", 
            source: "sous-pos"
          }
        }
      });
      alert("Ticket sent to kitchen!");
      setCart([]);
    } catch (err) {
      console.error(err);
      alert("Failed to send ticket");
    }
  };

  const handleCheckout = () => {
    setShowPayment(true);
  };

  const processPayment = async () => {
    setPaymentStatus("processing");
    // Mock payment delay
    await new Promise(r => setTimeout(r, 2000));
    
    try {
      const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
            totalAmount,
            paymentMethod: "CARD", 
            source: "sous-pos"
          }
        }
      });
      setPaymentStatus("success");
      setTimeout(() => {
        setShowPayment(false);
        setCart([]);
        setPaymentStatus("idle");
        if (autoLogout) {
          logout();
        }
      }, 2000);
    } catch (err) {
      setPaymentStatus("idle");
      alert("Payment failed at order creation");
    }
  };

  if (loading && !data) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <Text className="text-zinc-500 font-black uppercase tracking-widest text-xs">
          Initialising Station...
        </Text>
      </View>
    );
  }

  const products = data?.products || [];
  const categories = data?.categories || [];
  const filteredProducts = selectedCategoryId 
    ? products.filter((p: any) => p.categoryId === selectedCategoryId)
    : products;

  return (
    <POSLayout>
      <POSSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        user={user}
        onLogin={() => setShowLogin(true)}
        onLogout={() => logout()}
      />

      <View className="flex-1 flex flex-col bg-[#050505] relative">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
              <POSDashboard orgId={orgId} />
            </motion.div>
          )}

          {activeTab === "orders" && (
            <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
              {/* Category Bar */}
              <View className="h-20 border-b border-zinc-800/50 flex flex-row items-center px-8 gap-4 overflow-x-auto whitespace-nowrap bg-zinc-900/10">
                <button 
                  onClick={() => setSelectedCategoryId(null)}
                  className={cn(
                    "px-6 h-10 rounded-full font-black uppercase text-[10px] tracking-widest transition-all",
                    selectedCategoryId === null ? "bg-primary text-black shadow-[0_0_20px_rgba(var(--primary),0.4)]" : "text-zinc-500 hover:text-white"
                  )}
                >
                  All Items
                </button>
                {categories.map((cat: any) => (
                  <button 
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={cn(
                      "px-6 h-10 rounded-full font-black uppercase text-[10px] tracking-widest transition-all",
                      selectedCategoryId === cat.id ? "bg-primary text-black shadow-[0_0_20px_rgba(var(--primary),0.4)]" : "text-zinc-500 hover:text-white"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </View>

              <OrderGrid items={filteredProducts} onItemPress={handleAddItem} />
            </motion.div>
          )}

          {activeTab === "tables" && (
            <motion.div key="tables" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
              <POSTables orgId={orgId} />
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 p-12 max-w-2xl mx-auto space-y-12">
               <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Station Settings</h2>
               
               <div className="space-y-6">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Security & Session</h3>
                 <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">Auto-Logout</div>
                      <div className="text-zinc-500 text-xs">Sign out user after each transaction</div>
                    </div>
                    <button 
                      onClick={() => setAutoLogout(!autoLogout)}
                      className={cn(
                        "w-14 h-8 rounded-full border-2 transition-all flex items-center px-1",
                        autoLogout ? "bg-primary/20 border-primary justify-end" : "bg-zinc-800 border-zinc-700 justify-start"
                      )}
                    >
                      <div className={cn("w-5 h-5 rounded-full", autoLogout ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "bg-zinc-600")} />
                    </button>
                 </div>
               </div>

               <div className="space-y-6">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Hardware</h3>
                 <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl text-zinc-600 text-sm font-bold uppercase tracking-widest text-center py-12 border-dashed">
                    No connected peripherals
                 </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </View>

      {activeTab === "orders" && (
        <Cart 
          items={cart} 
          onPay={handleCheckout} 
          onSend={handleSendToKitchen}
          onClear={() => setCart([])} 
          onUpdateQty={handleUpdateQty}
          onRemove={handleRemoveItem}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Modals */}
      <AnimatePresence>
        {showLogin && (
          <PINLoginModal 
            onClose={() => setShowLogin(false)}
            onSuccess={() => { setShowLogin(false); }}
          />
        )}
      </AnimatePresence>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="bg-zinc-950 border-zinc-800 max-w-xl p-0 overflow-hidden rounded-[3rem]">
          <div className="p-12 flex flex-col items-center">
            {paymentStatus === "idle" && (
              <>
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8 text-primary">
                  <CreditCard size={48} />
                </div>
                <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter mb-4 text-center">
                  Total Due: ${(cart.reduce((s, i) => s + i.price * i.quantity, 0) * 1.08 / 100).toFixed(2)}
                </DialogTitle>
                <div className="text-zinc-500 text-center mb-12 uppercase font-bold tracking-widest text-xs">
                  Please swipe card or select payment method
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Button className="h-20 rounded-[2rem] bg-zinc-900 border-zinc-800 hover:bg-zinc-800 font-black uppercase tracking-widest" onClick={processPayment}>
                    Credit Card
                  </Button>
                  <Button className="h-20 rounded-[2rem] bg-zinc-900 border-zinc-800 hover:bg-zinc-800 font-black uppercase tracking-widest" onClick={processPayment}>
                    Cash
                  </Button>
                </div>
              </>
            )}

            {paymentStatus === "processing" && (
              <div className="py-20 flex flex-col items-center gap-8">
                <Loader2 size={64} className="text-primary animate-spin" />
                <span className="text-xl font-black text-white uppercase tracking-widest animate-pulse">Processing...</span>
              </div>
            )}

            {paymentStatus === "success" && (
              <div className="py-20 flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)]">
                  <CheckCircle2 size={64} />
                </div>
                <span className="text-2xl font-black text-white uppercase tracking-widest">Transaction Success</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showModifiers} onOpenChange={setShowModifiers}>
        <DialogContent className="bg-zinc-950 border-zinc-800 max-w-2xl rounded-[3rem] p-0 overflow-hidden">
          <div className="p-12 space-y-8">
            <DialogHeader>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Customize Item</span>
                <DialogTitle className="text-4xl font-black text-white uppercase tracking-tighter italic">
                  {selectedProduct?.name}
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Temperature / Prep</h3>
                <div className="grid grid-cols-3 gap-3">
                  {["Rare", "Medium", "Well Done"].map(m => (
                    <button key={m} className="h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 hover:border-primary hover:text-primary transition-all uppercase tracking-widest">
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Add-ons</h3>
                <div className="grid grid-cols-2 gap-3">
                  {["Extra Cheese", "Add Bacon", "No Onions", "Gluten Free"].map(m => (
                    <button key={m} className="h-14 px-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 hover:border-primary hover:text-primary transition-all flex items-center justify-between uppercase tracking-widest">
                      {m}
                      <span className="text-[10px] opacity-40">+$1.50</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button 
              className="w-full h-20 rounded-[2rem] bg-primary text-black font-black uppercase tracking-[0.2em] shadow-[0_0_30px_-5px_rgba(var(--primary),0.5)]" 
              onClick={() => confirmAddItem()}
            >
              Add to Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </POSLayout>
  );
};
