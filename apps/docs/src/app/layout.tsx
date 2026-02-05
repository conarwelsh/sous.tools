import type { Metadata } from "next";
import { Inter, Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { KnowledgeShell } from "@sous/features";
import { getKnowledgeBaseDocs } from "@sous/features/server";

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
  title: "sous.tools | Documentation Hub",
  description: "Centralized intelligence, CDD, and branding lab.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const docs = await getKnowledgeBaseDocs();

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-zinc-950 text-white">
        <KnowledgeShell docs={docs}>
          {children}
        </KnowledgeShell>
      </body>
    </html>
  );
}