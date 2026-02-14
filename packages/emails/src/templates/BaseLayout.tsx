import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export const BaseLayout = ({ preview, children }: BaseLayoutProps) => (
  <Html>
    <Head />
    <Preview>{preview}</Preview>
    <Tailwind
      config={{
        theme: {
          extend: {
            colors: {
              brand: "#000000",
              primary: "#000000",
              muted: "#71717a",
            },
          },
        },
      }}
    >
      <Body className="bg-white font-sans">
        <Container className="mx-auto py-12 px-4 max-w-[580px]">
          <Section className="mb-8">
            <Text className="text-2xl font-black uppercase tracking-tighter italic">
              Sous
            </Text>
          </Section>
          {children}
          <Hr className="border-zinc-200 my-8" />
          <Section>
            <Text className="text-muted text-xs leading-relaxed uppercase tracking-widest font-bold">
              © {new Date().getFullYear()} Sous Tools. All rights reserved.
            </Text>
            <Text className="text-muted text-[10px] mt-2">
              You received this email because it is critical to your Sous
              account operations.
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
