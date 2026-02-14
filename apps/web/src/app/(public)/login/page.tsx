"use client";

import React, { useEffect, Suspense } from "react";
import { LoginForm, useAuth } from "@sous/features";
import { useRouter, useSearchParams } from "next/navigation";
import { View } from "@sous/ui";
import { Loader2 } from "lucide-react";

function LoginContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  let callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  
  if (callbackUrl.includes("/login")) {
    callbackUrl = "/dashboard";
  }

  useEffect(() => {
    if (user) {
      router.push(callbackUrl);
    }
  }, [user, router, callbackUrl]);

  return (
    <main className="flex-1 bg-background flex flex-col justify-center items-center px-8 py-12 min-h-screen">
      <LoginForm callbackUrl={callbackUrl} />
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <View className="flex-1 items-center justify-center min-h-screen bg-background">
          <Loader2 className="animate-spin text-primary" />
        </View>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
