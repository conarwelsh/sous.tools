import { Button, Section, Text, Heading, Hr, Row, Column } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface SubscriptionConfirmedEmailProps {
  userName: string;
  planName: string;
  orgName: string;
}

export const SubscriptionConfirmedEmail = ({
  userName,
  planName,
  orgName,
}: SubscriptionConfirmedEmailProps) => (
  <BaseLayout preview={`Welcome to the ${planName} plan, Chef!`}>
    <Heading className="text-2xl font-black uppercase tracking-tight text-zinc-900 mb-4">
      Kitchen Activated
    </Heading>
    <Text className="text-zinc-600 text-sm mb-6">
      Hello {userName}, your subscription for **{orgName}** is now active. You have full access to the **{planName}** features.
    </Text>
    
    <Section className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 mb-8">
      <Text className="text-xs font-bold text-zinc-900 mb-2 uppercase">Subscription Details</Text>
      <Row className="py-2">
        <Column>
          <Text className="text-xs text-zinc-500 m-0">Organization</Text>
        </Column>
        <Column align="right">
          <Text className="text-xs font-black text-zinc-900 m-0">{orgName}</Text>
        </Column>
      </Row>
      <Row className="py-2">
        <Column>
          <Text className="text-xs text-zinc-500 m-0">Plan</Text>
        </Column>
        <Column align="right">
          <Text className="text-xs font-black text-zinc-900 m-0">{planName}</Text>
        </Column>
      </Row>
      <Row className="py-2">
        <Column>
          <Text className="text-xs text-zinc-500 m-0">Status</Text>
        </Column>
        <Column align="right">
          <Text className="text-xs font-black text-emerald-600 m-0 uppercase">Active</Text>
        </Column>
      </Row>
    </Section>

    <Section className="mb-8 text-center">
      <Button
        className="bg-black rounded-xl text-white text-xs font-black uppercase tracking-widest py-4 px-8"
        href="https://sous.tools/dashboard"
      >
        Enter your Kitchen
      </Button>
    </Section>
  </BaseLayout>
);

export default SubscriptionConfirmedEmail;
