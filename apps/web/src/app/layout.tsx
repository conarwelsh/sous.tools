import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Inter, Outfit, Geist_Mono } from "next/font/google";
import { FlavorGate } from "../components/FlavorGate";
import { GraphQLProvider } from "../lib/apollo-provider";
import { AuthProvider } from "@sous/features";
import {
  ThemeProvider,
  LoadingProvider,
  GlobalLoadingBar,
  FONT_SANS_VAR,
  FONT_BRAND_VAR,
  FONT_MONO_VAR,
} from "@sous/ui";
import { RouterChangeTracker } from "../components/RouterChangeTracker";

import "./globals.css";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-brand",
  weight: ["700", "800", "900"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "sous.tools | Culinary Operations Platform",
  description:
    "Unified platform for administration, digital signage, and kitchen operations.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${geistMono.variable}`}
    >
      <body className="antialiased overflow-x-hidden">
        <ThemeProvider>
          <LoadingProvider>
            <AuthProvider>
              <GraphQLProvider>
                <FlavorGate />
                <GlobalLoadingBar />
                <Suspense fallback={null}>
                  <RouterChangeTracker />
                </Suspense>
                {children}
                {modal}
              </GraphQLProvider>
            </AuthProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
