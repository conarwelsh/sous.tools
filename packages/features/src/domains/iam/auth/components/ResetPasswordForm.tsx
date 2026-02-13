"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Input,
  Logo,
  CardHeader,
  CardContent,
} from "@sous/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { getHttpClient } from "@sous/client-sdk";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const client = await getHttpClient();
      await client.post("/auth/reset-password", { token, newPass: password });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (e: any) {
      setError(e.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="w-full max-w-md mx-auto bg-destructive/10 border-destructive/20 p-8 text-center rounded-[2.5rem]">
        <p className="text-destructive font-black uppercase tracking-widest">Invalid Link</p>
        <Button onClick={() => router.push("/login")} variant="link" className="mt-4">Back to Login</Button>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl shadow-primary/5 bg-card border-border/50 rounded-[2.5rem] overflow-hidden">
      <CardHeader className="flex flex-col items-center pt-12 pb-8 bg-muted/30 border-b border-border/50">
        <Logo size={60} showWordmark variant="neon" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mt-4">Secure Reset</p>
      </CardHeader>

      <CardContent className="p-10 space-y-6">
        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground uppercase ml-1 block tracking-[0.2em]">New Password</label>
              <Input
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="h-14 bg-muted/20 border-border/50 rounded-2xl px-6 text-foreground text-base focus:border-primary/50 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground uppercase ml-1 block tracking-[0.2em]">Confirm Password</label>
              <Input
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                required
                className="h-14 bg-muted/20 border-border/50 rounded-2xl px-6 text-foreground text-base focus:border-primary/50 transition-all"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-2xl">
                <p className="text-destructive text-[10px] font-black text-center uppercase tracking-widest">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-2xl shadow-xl shadow-primary/10 transition-all font-black italic uppercase tracking-tighter text-lg mt-4"
            >
              {loading ? "Updating..." : "Set New Password"}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-6 py-8 animate-in fade-in duration-500">
             <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Password Updated</h2>
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
