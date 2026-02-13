import { Button, Section, Text, Heading } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface InvitationEmailProps {
  orgName: string;
  inviteLink: string;
  invitedBy: string;
  role: string;
  isSales?: boolean;
}

export const InvitationEmail = ({
  orgName,
  inviteLink,
  invitedBy,
  role,
  isSales = false,
}: InvitationEmailProps) => {
  const preview = isSales 
    ? `Claim your kitchen workspace: ${orgName}`
    : `Join ${orgName} on Sous`;

  return (
    <BaseLayout preview={preview}>
      <Heading className="text-xl font-black uppercase tracking-tight text-zinc-900 mb-4">
        {isSales ? "Your Kitchen is Ready" : "You've Been Invited"}
      </Heading>
      <Text className="text-zinc-600 text-sm leading-relaxed mb-6">
        {isSales 
          ? `Hello! We've set up a professional workspace for ${orgName}. I'm ${invitedBy} from the Sous team, and I'd like to help you streamline your operations.`
          : `${invitedBy} has invited you to join the ${orgName} workspace on Sous as ${role === 'admin' ? 'an Administrator' : 'a team member'}.`}
      </Text>
      <Section className="mb-8">
        <Button
          className="bg-black rounded-xl text-white text-xs font-black uppercase tracking-widest py-4 px-8 text-center"
          href={inviteLink}
        >
          {isSales ? "Claim My Workspace" : "Accept Invitation"}
        </Button>
      </Section>
      <Text className="text-zinc-400 text-xs italic">
        If you weren't expecting this invitation, you can safely ignore this email.
      </Text>
    </BaseLayout>
  );
};

export default InvitationEmail;
