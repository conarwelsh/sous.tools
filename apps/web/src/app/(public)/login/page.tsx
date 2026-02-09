"use client";

import React, { useEffect } from "react";
import { LoginForm, useAuth } from "@sous/features";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  return (
    <main className="flex-1 bg-background flex flex-col justify-center items-center px-8 py-12 min-h-screen">
      <LoginForm />
    </main>
  );
}
