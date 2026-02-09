import type { Metadata } from "next";
import { Inter, Outfit, Geist_Mono } from "next/font/google";
import { FlavorGate } from "../components/FlavorGate";
import { GraphQLProvider } from "../lib/apollo-provider";
import { AuthProvider } from "@sous/features";
import { ThemeProvider } from "@sous/ui";

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
          <AuthProvider>
            <GraphQLProvider>
              <FlavorGate />
              {children}
              {modal}
            </GraphQLProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
