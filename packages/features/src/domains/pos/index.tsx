"use client";

import React, { useState, useEffect } from "react";
import { POSLayout } from "./components/POSLayout";
import { OrderGrid } from "./components/OrderGrid";
import { Cart } from "./components/Cart";
import { DevicePairingFlow } from "../hardware/components/DevicePairingFlow";
import { View, Text, Button } from "@sous/ui";
import { gql } from "@apollo/client";
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import { useAuth } from "../iam/auth/hooks/useAuth";
import { Loader2, Settings, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GET_POS_CATALOG = gql`
  query GetPosCatalog($orgId: String!) {
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
      {({ organizationId }) => <POSContent orgId={organizationId || ""} />}
    </DevicePairingFlow>
  );
};

const POSContent = ({ orgId }: { orgId: string }) => {
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery<PosCatalogData>(GET_POS_CATALOG, {
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

  const [createOrder, { loading: isSubmitting }] = useMutation(CREATE_ORDER);

  const handleAddItem = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handlePay = async () => {
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
            paymentMethod: "CASH", 
            source: "sous-pos"
          }
        }
      });

      alert("Order processed successfully!");
      setCart([]);
    } catch (err) {
      console.error(err);
      alert("Failed to process order");
    }
  };

  if (loading && !data) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <Text className="text-zinc-500 font-black uppercase tracking-widest text-xs">
          Loading Station...
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
      {/* Sidebar */}
      <View className="w-20 bg-zinc-950 border-r border-zinc-800 flex flex-col items-center py-6 gap-8">
         <Button variant="ghost" size="icon" className="text-zinc-600">
            <Settings size={24} />
         </Button>
         <Button variant="ghost" size="icon" className="text-zinc-600">
            <User size={24} />
         </Button>
      </View>

      {/* Catalog & Categories */}
      <View className="flex-1 flex flex-col bg-[#050505]">
         {/* Category Bar */}
         <View className="h-20 border-b border-zinc-800 flex flex-row items-center px-6 gap-4 overflow-x-auto whitespace-nowrap bg-zinc-900/20">
            <Button 
              variant={selectedCategoryId === null ? "default" : "ghost"}
              onClick={() => setSelectedCategoryId(null)}
              className="rounded-full px-6 h-10 font-bold uppercase text-[10px] tracking-widest"
            >
              All Items
            </Button>
            {categories.map((cat: any) => (
              <Button 
                key={cat.id}
                variant={selectedCategoryId === cat.id ? "default" : "ghost"}
                onClick={() => setSelectedCategoryId(cat.id)}
                className="rounded-full px-6 h-10 font-bold uppercase text-[10px] tracking-widest"
              >
                {cat.name}
              </Button>
            ))}
         </View>

         <AnimatePresence mode="wait">
           <motion.div
             key={selectedCategoryId || 'all'}
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             transition={{ duration: 0.2 }}
             className="flex-1 overflow-hidden"
           >
             <OrderGrid items={filteredProducts} onItemPress={handleAddItem} />
           </motion.div>
         </AnimatePresence>
      </View>

      <Cart 
        items={cart} 
        onPay={handlePay} 
        onClear={() => setCart([])} 
        isSubmitting={isSubmitting}
      />
    </POSLayout>
  );
};
