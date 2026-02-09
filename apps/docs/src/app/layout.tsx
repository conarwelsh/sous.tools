import type { Metadata } from "next";
// Triggering rebuild
import { Inter, Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { KnowledgeShell, type DocFile } from "@sous/features";
import { getKnowledgeBaseDocs } from "@sous/features/server";
import { ThemeProvider } from "@sous/ui";

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
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${geistMono.variable}`}
    >
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider>
          <KnowledgeShell docs={docs as DocFile[]}>{children}</KnowledgeShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
