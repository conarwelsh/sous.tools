"use client";

import React from "react";
import Link from "next/link";
import { Button, Wordmark, Input, View, Text } from "@sous/ui";
import { MoveLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      {/* Animated Background Elements (Tailwind purely) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 blur-[120px] rounded-full animate-pulse duration-[10s]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-destructive/5 blur-[120px] rounded-full animate-pulse duration-[15s]" />
      </div>

      <div className="relative z-10 space-y-12 max-w-2xl w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Animated Chef SVG */}
        <div className="flex justify-center">
          <svg
            width="240"
            height="240"
            viewBox="0 0 240 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-foreground"
          >
            {/* Chef Hat */}
            <path
              d="M100 60C100 40 140 40 140 60C160 60 160 90 140 90H100C80 90 80 60 100 60Z"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="105"
              y="90"
              width="30"
              height="15"
              stroke="currentColor"
              strokeWidth="4"
              rx="2"
            />

            {/* Confused Face */}
            <g className="animate-chef-head">
              <circle
                cx="120"
                cy="130"
                r="40"
                stroke="currentColor"
                strokeWidth="4"
              />
              {/* Eyes */}
              <circle cx="105" cy="125" r="3" fill="currentColor" />
              <circle cx="135" cy="125" r="3" fill="currentColor" />
              {/* Confused Mouth */}
              <path
                d="M110 150C110 150 115 145 120 145C125 145 130 150 130 150"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Eyebrows */}
              <path
                d="M100 115L110 118"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="animate-eyebrow"
              />
              <path
                d="M130 118L140 115"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="animate-eyebrow-alt"
              />
            </g>

            {/* Table/Surface */}
            <line
              x1="40"
              y1="200"
              x2="200"
              y2="200"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Cloche Animation */}
            <g className="animate-cloche-lift">
              {/* Cloche Top Handle */}
              <circle
                cx="120"
                cy="155"
                r="6"
                stroke="currentColor"
                strokeWidth="4"
              />
              {/* Cloche Dome */}
              <path
                d="M70 195C70 155 170 155 170 195"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="70"
                y1="195"
                x2="170"
                y2="195"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Where's the <span className="text-destructive">Lamb Sauce?!</span>
          </h1>
          <div className="space-y-2 animate-in fade-in duration-700 delay-400">
            <h2 className="text-2xl font-bold italic uppercase tracking-tight text-primary">
              This URL is RAW!
            </h2>
            <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-lg mx-auto">
              We couldn't find the page you were looking for. It’s either been
              86’d or it never made the menu.
            </p>
          </div>
        </div>

        {/* Sous-Chef Search Bar */}
        <div className="max-w-md mx-auto space-y-3 animate-in fade-in zoom-in-95 duration-700 delay-500">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="What were you trying to cook up?"
              className="h-14 pl-12 rounded-2xl border-2 focus-visible:ring-primary/20 text-lg shadow-lg shadow-black/5"
            />
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 italic">
            Pro-Tip: Use the Sous-Chef to find your way back.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in duration-700 delay-700">
          <Button
            variant="outline"
            className="rounded-2xl h-14 px-8 font-black italic uppercase tracking-tighter gap-2 hover:bg-muted transition-all"
            onClick={() => window.history.back()}
          >
            <MoveLeft size={20} />
            Get Out!
          </Button>
          <Button
            asChild
            className="rounded-2xl h-14 px-8 font-black italic uppercase tracking-tighter gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Link href="/">
              <Home size={20} />
              Back to Kitchen
            </Link>
          </Button>
        </div>

        <div className="pt-8 opacity-20 hover:opacity-100 transition-opacity animate-in fade-in duration-1000 delay-1000">
          <Wordmark className="h-10 w-auto mx-auto" />
        </div>
      </div>
    </div>
  );
}
