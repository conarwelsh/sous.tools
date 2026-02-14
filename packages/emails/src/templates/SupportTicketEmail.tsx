import { Button, Section, Text, Heading, Hr } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface SupportTicketEmailProps {
  ticketId: string;
  subject: string;
  message: string;
  userName: string;
  priority: "low" | "medium" | "high";
}

export const SupportTicketEmail = ({
  ticketId,
  subject,
  message,
  userName,
  priority,
}: SupportTicketEmailProps) => (
  <BaseLayout preview={`Support Ticket #${ticketId}: ${subject}`}>
    <Heading className="text-xl font-black uppercase tracking-tight text-zinc-900 mb-4">
      Support Request Received
    </Heading>
    <Text className="text-zinc-600 text-sm mb-6">
      Hello {userName}, we've received your request and our team is already on
      it. You can track this ticket using the ID below.
    </Text>

    <Section className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 mb-8">
      <div className="flex justify-between items-center mb-4">
        <Text className="text-[10px] font-black uppercase text-zinc-400 m-0 tracking-widest">
          Ticket #{ticketId}
        </Text>
        <div
          className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
            priority === "high"
              ? "bg-rose-500 text-white"
              : "bg-zinc-200 text-zinc-600"
          }`}
        >
          {priority} Priority
        </div>
      </div>
      <Text className="text-sm font-bold text-zinc-900 mb-2 uppercase">
        {subject}
      </Text>
      <Hr className="border-zinc-200 my-4" />
      <Text className="text-xs text-zinc-600 italic leading-relaxed">
        {message}
      </Text>
    </Section>

    <Section className="mb-8 text-center">
      <Button
        className="bg-black rounded-xl text-white text-xs font-black uppercase tracking-widest py-4 px-8"
        href={`https://sous.tools/support/tickets/${ticketId}`}
      >
        View Ticket Progress
      </Button>
    </Section>
  </BaseLayout>
);

export default SupportTicketEmail;
