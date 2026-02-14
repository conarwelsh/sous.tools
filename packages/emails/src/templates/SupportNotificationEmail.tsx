import { Section, Text, Heading, Hr, Link } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface SupportNotificationEmailProps {
  type: string;
  subject: string;
  description: string;
  priority?: string;
  githubIssueUrl?: string;
  metadata: {
    appVersion: string;
    orgId: string;
    userId: string;
    userAgent: string;
    url: string;
  };
}

export const SupportNotificationEmail = ({
  type,
  subject,
  description,
  priority,
  githubIssueUrl,
  metadata,
}: SupportNotificationEmailProps) => (
  <BaseLayout preview={`[Support ${type}] ${subject}`}>
    <Heading className="text-xl font-black uppercase tracking-tight text-zinc-900 mb-4">
      New Support Request
    </Heading>
    
    <Section className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase bg-zinc-900 text-white`}>
          {type}
        </div>
        {priority && (
          <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
            priority === 'HIGH' ? 'bg-rose-500 text-white' : 'bg-zinc-200 text-zinc-600'
          }`}>
            {priority} Priority
          </div>
        )}
      </div>
      <Text className="text-sm font-bold text-zinc-900 mb-2 uppercase">{subject}</Text>
      <Hr className="border-zinc-200 my-4" />
      <Text className="text-xs text-zinc-600 leading-relaxed mb-4">{description}</Text>
      
      {githubIssueUrl && (
        <Link href={githubIssueUrl} className="text-blue-600 text-[10px] font-bold underline">
          View GitHub Issue
        </Link>
      )}
    </Section>

    <Section className="p-4 bg-zinc-100 rounded-xl">
      <Text className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Environment Metadata</Text>
      <Text className="text-[9px] text-zinc-400 font-mono leading-tight">
        User: {metadata.userId}<br />
        Org: {metadata.orgId}<br />
        App: v{metadata.appVersion}<br />
        URL: {metadata.url}<br />
        UA: {metadata.userAgent}
      </Text>
    </Section>
  </BaseLayout>
);

export default SupportNotificationEmail;
