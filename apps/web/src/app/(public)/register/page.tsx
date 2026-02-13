"use client";

import React, { Suspense } from "react";
import { RegisterForm } from "@sous/features";
import { View } from "@sous/ui";

export default function RegistrationPage() {
  return (
    <View className="min-h-screen items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>
      </div>
    </View>
  );
}
