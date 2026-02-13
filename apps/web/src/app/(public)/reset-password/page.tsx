"use client";

import React, { Suspense } from "react";
import { ResetPasswordForm } from "@sous/features";
import { View } from "@sous/ui";

export default function ResetPasswordPage() {
  return (
    <View className="min-h-screen items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </View>
  );
}
