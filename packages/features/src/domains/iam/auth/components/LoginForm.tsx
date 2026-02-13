"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Button,
  Card,
  Input,
  Logo,
  DialogClose,
  CardHeader,
  CardContent,
  GoogleLogo,
} from "@sous/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { getHttpClient } from "@sous/client-sdk";

const LoginFormContent = ({
  onSuccess,
  showClose = false,
  callbackUrl = "/dashboard",
}: {
  onSuccess?: () => void;
  showClose?: boolean;
  callbackUrl?: string;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, refresh } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");

    if (token) {
      localStorage.setItem("token", token);
      void (async () => {
        setLoading(true);
        const http = await getHttpClient();
        http.setToken(token);
        await refresh();
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(callbackUrl);
        }
      })();
    }

    if (errorParam) {
      setError(errorParam);
    }
  }, [searchParams, refresh, onSuccess, router, callbackUrl]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(callbackUrl);
      }
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google-login`;
  };

  return (
    <div className="relative">
      {/* Reference-inspired Frosted Glass Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-8">
            <Logo size={120} animate loading showWordmark={false} />
            <div className="text-center space-y-3">
              <p className="font-black italic uppercase tracking-tighter text-2xl text-foreground animate-pulse">
                Authenticating...
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground ml-1">
                Secure Access in Progress
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="w-full max-w-md mx-auto shadow-2xl shadow-primary/5 bg-card border-border/50 rounded-[2.5rem] overflow-hidden">
        {showClose && (
          <DialogClose className="absolute right-8 top-8 z-10 rounded-full p-2 bg-secondary/50 hover:bg-secondary transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </DialogClose>
        )}

        <CardHeader className="flex flex-col items-center pt-12 pb-8 bg-muted/30 border-b border-border/50">
          <Logo size={60} showWordmark variant="neon" />
        </CardHeader>

        <CardContent className="p-10 space-y-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-8"
            autoComplete="off"
          >
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground uppercase ml-1 block tracking-[0.2em]">
                Email Address
              </label>
              <Input
                placeholder="chef@dtown.cafe"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="h-14 bg-muted/20 border-border/50 rounded-2xl px-6 text-foreground text-base focus:border-primary/50 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground uppercase ml-1 block tracking-[0.2em]">
                Password
              </label>
              <Input
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="h-14 bg-muted/20 border-border/50 rounded-2xl px-6 text-foreground text-base focus:border-primary/50 transition-all"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-2xl">
                <p className="text-destructive text-[10px] font-black text-center uppercase tracking-widest">
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <Button
                type="submit"
                disabled={loading}
                className="h-14 w-full rounded-2xl shadow-xl shadow-primary/10 transition-all hover:scale-[1.01] active:scale-[0.99] font-black italic uppercase tracking-tighter text-lg"
              >
                Login
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-[8px] uppercase font-black">
                  <span className="bg-card px-4 text-muted-foreground tracking-[0.3em]">Identity Hub</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGoogleLogin}
                variant="outline"
                className="h-14 w-full rounded-2xl border-border/50 bg-muted/10 hover:bg-muted transition-all font-black uppercase tracking-widest text-[10px] flex-row gap-3"
              >
                <GoogleLogo size={18} />
                Continue with Google
              </Button>
            </div>

            <button
              type="button"
              className="w-full flex flex-col items-center pt-2"
            >
              <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors cursor-pointer">
                Lost Access?
              </span>
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export const LoginForm = (props: {
  onSuccess?: () => void;
  showClose?: boolean;
  callbackUrl?: string;
}) => (
  <React.Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>}>
    <LoginFormContent {...props} />
  </React.Suspense>
);
