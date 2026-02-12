"use client";

import React, { useEffect, Suspense } from "react";
import { LoginForm, useAuth } from "@sous/features";
import { useRouter } from "next/navigation";
import { View } from "@sous/ui";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  return (
    <Suspense fallback={<View className="flex-1 items-center justify-center min-h-screen bg-background"><Loader2 className="animate-spin text-primary" /></View>}>
      <main className="flex-1 bg-background flex flex-col justify-center items-center px-8 py-12 min-h-screen">
        <LoginForm />
      </main>
    </Suspense>
  );
}
