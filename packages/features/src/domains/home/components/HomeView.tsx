"use client";

import React from "react";
import { Button } from "@sous/ui";

export const HomeView = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0a] min-h-screen">
      <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
        Welcome to Sous
      </h1>
      <p className="text-xl text-zinc-500 mb-8 max-w-md text-center">
        The mission-critical platform for modern kitchens.
      </p>
      <Button
        onClick={() => console.log("Get Started pressed")}
        className="h-12 px-8 bg-primary"
      >
        <span className="text-primary-foreground font-bold uppercase tracking-widest">
          Get Started
        </span>
      </Button>
    </div>
  );
};
