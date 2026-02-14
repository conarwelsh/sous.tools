import { Button, Section, Text, Heading } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface PasswordResetEmailProps {
  resetLink: string;
}

export const PasswordResetEmail = ({ resetLink }: PasswordResetEmailProps) => (
  <BaseLayout preview="Reset your Sous password">
    <Heading className="text-xl font-black uppercase tracking-tight text-zinc-900 mb-4">
      Lost Access?
    </Heading>
    <Text className="text-zinc-600 text-sm leading-relaxed mb-6">
      We received a request to reset your Sous password. If this was you, click
      the button below to set a new one. This link will expire in 1 hour.
    </Text>
    <Section className="mb-8">
      <Button
        className="bg-black rounded-xl text-white text-xs font-black uppercase tracking-widest py-4 px-8 text-center"
        href={resetLink}
      >
        Set New Password
      </Button>
    </Section>
    <Text className="text-zinc-400 text-xs">
      If you didn't request this, please ensure your account is secure.
    </Text>
  </BaseLayout>
);

export default PasswordResetEmail;
