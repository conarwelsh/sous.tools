"use client";

import React, { useState } from "react";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@sous/ui";
import {
  Search,
  Bell,
  Settings,
  Plus,
  Info,
  Type,
  AppWindow,
  Layout,
} from "lucide-react";

export const ComponentPlayground: React.FC = () => {
  return (
    <div className="p-12 space-y-16 max-w-6xl mx-auto pb-40">
      {/* Introduction */}
      <div className="space-y-4">
        <h1 className="text-6xl font-black text-white tracking-tighter uppercase">
          ATOMIC<span className="text-emerald-500">.PLAYGROUND</span>
        </h1>
        <p className="text-zinc-500 text-xl max-w-2xl">
          Standardized web components built with Radix UI and Tailwind CSS.
          Designed for high-performance and absolute reliability.
        </p>
      </div>

      {/* Typography */}
      <section className="space-y-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <Type size={20} className="text-purple-500" />
          </div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
            Typography
          </h2>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8 space-y-6">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
            Heading 1
          </h1>
          <h2 className="text-3xl font-bold text-white uppercase tracking-tight">
            Heading 2
          </h2>
          <h3 className="text-2xl font-bold text-white uppercase tracking-tight">
            Heading 3
          </h3>
          <p className="text-zinc-400 leading-relaxed text-lg">
            This is a standard paragraph. It has a comfortable leading and uses
            the standard zinc-400 color for readability in dark mode
            environments.
          </p>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Plus size={20} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            Buttons
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8 space-y-8">
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large / High Visibility</Button>
            </div>
          </div>
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8 flex items-center justify-center">
            <Button className="w-full max-w-xs">Full Width Fluid Button</Button>
          </div>
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
            <Search size={20} className="text-sky-500" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            Forms & Inputs
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">
                Email Address
              </label>
              <Input placeholder="chef@sous.tools" type="email" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">
                Search Inventory
              </label>
              <Input placeholder="Start typing..." />
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <Layout size={20} className="text-purple-500" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            Containment
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <p className="text-zinc-500 text-sm">
                Real-time infrastructure monitoring.
              </p>
            </CardHeader>
            <CardContent>
              <div className="py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-xs font-bold uppercase">
                    Database
                  </span>
                  <span className="text-emerald-500 text-xs font-bold">
                    ACTIVE
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-xs font-bold uppercase">
                    Redis Cache
                  </span>
                  <span className="text-emerald-500 text-xs font-bold">
                    ACTIVE
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Metrics
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-sky-500/20 bg-sky-500/5">
            <CardHeader>
              <div className="flex items-center space-x-2 text-sky-500 mb-2">
                <Bell size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Notification
                </span>
              </div>
              <CardTitle>Inventory Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400 leading-relaxed">
                Stock level for{" "}
                <span className="text-white font-bold">
                  "Butter (Unsalted)"
                </span>{" "}
                is below critical threshold.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-sky-500">Reorder Now</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Info Box */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 flex items-start space-x-6">
        <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <Info size={24} />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black text-white uppercase tracking-tight">
            Standard Web Foundation
          </h3>
          <p className="text-zinc-400 leading-relaxed max-w-3xl text-sm">
            These components use standardized OKLCH color tokens and standard
            CSS properties. They are fully responsive and optimized for both
            touch and mouse interaction.
          </p>
        </div>
      </div>
    </div>
  );
};
