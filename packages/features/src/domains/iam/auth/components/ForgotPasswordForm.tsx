"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Input,
  Logo,
  CardHeader,
  CardContent,
} from "@sous/ui";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getHttpClient } from "@sous/client-sdk";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const client = await getHttpClient();
      await client.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl shadow-primary/5 bg-card border-border/50 rounded-[2.5rem] overflow-hidden">
      <CardHeader className="flex flex-col items-center pt-12 pb-8 bg-muted/30 border-b border-border/50 relative">
        <button 
          onClick={() => router.push("/login")}
          className="absolute left-8 top-12 p-2 hover:bg-background/50 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-muted-foreground" />
        </button>
        <Logo size={60} showWordmark variant="neon" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mt-4">Account Recovery</p>
      </CardHeader>

      <CardContent className="p-10 space-y-6">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Forgot Password?</h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Enter your email address below and we'll send you a secure link to reset your password.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground uppercase ml-1 block tracking-[0.2em]">Email Address</label>
              <Input
                placeholder="chef@dtown.cafe"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
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
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-6 py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
              <div className="w-8 h-8 bg-primary rounded-full animate-ping opacity-75 absolute" />
              <div className="w-8 h-8 bg-primary rounded-full relative" />
            </div>
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Check your inbox</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We've sent a password reset link to <span className="font-bold text-foreground">{email}</span>.
            </p>
            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              className="mt-8 h-12 w-full rounded-2xl border-border/50 font-black uppercase tracking-widest text-xs"
            >
              Back to Login
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
