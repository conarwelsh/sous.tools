import { Button, Section, Text, Heading } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface WelcomeEmailProps {
  firstName: string;
}

export const WelcomeEmail = ({ firstName }: WelcomeEmailProps) => (
  <BaseLayout preview="Welcome to the Kitchen">
    <Heading className="text-xl font-black uppercase tracking-tight text-zinc-900 mb-4">
      Welcome, Chef {firstName}.
    </Heading>
    <Text className="text-zinc-600 text-sm leading-relaxed mb-6">
      Your account is now active. You're joining a community of culinary professionals using Sous to automate the "boring stuff" so you can focus on the food.
    </Text>
    <Section className="mb-8">
      <Button
        className="bg-black rounded-xl text-white text-xs font-black uppercase tracking-widest py-4 px-8 text-center"
        href="https://sous.tools/dashboard"
      >
        Go to Dashboard
      </Button>
    </Section>
    <Text className="text-zinc-600 text-sm leading-relaxed mb-4">
      What's next?
    </Text>
    <ul className="text-zinc-600 text-sm leading-relaxed mb-6">
      <li>Connect your Square or Clover POS</li>
      <li>Import your first batch of invoices</li>
      <li>Set up your digital signage</li>
    </ul>
  </BaseLayout>
);

export default WelcomeEmail;
