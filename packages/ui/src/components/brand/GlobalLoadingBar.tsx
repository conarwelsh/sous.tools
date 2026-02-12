"use client";

import React, { useEffect, useState } from "react";
import { useLoading } from "../loading-provider";
import { Logo } from "./Logo";
import { cn } from "../../lib/utils";

export function GlobalLoadingBar() {
  const { isLoading } = useLoading();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      setVisible(true);
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timeout);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!visible && !isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      {/* Progress Bar */}
      <div 
        className={cn(
          "h-0.5 bg-primary transition-all duration-300 ease-out shadow-[0_0_10px_rgba(14,165,233,0.5)]",
          !visible && "opacity-0"
        )}
        style={{ width: `${progress}%` }}
      />

      {/* Floating Lettermark */}
      <div 
        className={cn(
          "fixed top-4 right-6 transition-all duration-500 ease-in-out transform",
          isLoading ? "translate-y-0 opacity-100 scale-100" : "-translate-y-4 opacity-0 scale-90"
        )}
      >
        <div className="bg-background/80 backdrop-blur-md border border-border p-2 rounded-xl shadow-2xl">
          <Logo variant="cloud" size={24} showWordmark={false} animate />
        </div>
      </div>
    </div>
  );
}
