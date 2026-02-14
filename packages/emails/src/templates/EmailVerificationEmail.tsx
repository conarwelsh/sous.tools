import { Button, Section, Text, Heading } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface EmailVerificationEmailProps {
  userName: string;
  verificationLink: string;
}

export const EmailVerificationEmail = ({
  userName,
  verificationLink,
}: EmailVerificationEmailProps) => (
  <BaseLayout preview="Please verify your email address to secure your Sous account.">
    <Heading className="text-2xl font-black uppercase tracking-tight text-zinc-900 mb-4">
      Verify your Identity
    </Heading>
    <Text className="text-zinc-600 text-sm mb-6">
      Hello {userName}, please click the button below to verify your email
      address and activate your kitchen profile.
    </Text>

    <Section className="mb-8 text-center">
      <Button
        className="bg-black rounded-xl text-white text-xs font-black uppercase tracking-widest py-4 px-8"
        href={verificationLink}
      >
        Verify Email Address
      </Button>
    </Section>

    <Text className="text-zinc-400 text-xs text-center">
      If you did not create a Sous account, you can safely ignore this email.
    </Text>
  </BaseLayout>
);

export default EmailVerificationEmail;
