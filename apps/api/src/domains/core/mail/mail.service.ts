import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { logger } from '@sous/logger';

export type EmailJobData = {
  to: string;
  subject: string;
  template: 'invitation' | 'password-reset' | 'welcome' | 'order' | 'low-stock' | 'verification' | 'subscription-confirmed' | 'weekly-digest';
  context: Record<string, any>;
};

@Injectable()
export class MailService {
  constructor(
    @InjectQueue('email-queue')
    private readonly emailQueue: Queue<EmailJobData>,
  ) {}

  async sendEmail(data: EmailJobData) {
    logger.info(`📬 Queueing email to ${data.to} (Template: ${data.template})`);
    await this.emailQueue.add(data.template, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
  }

  async sendInvitationEmail(
    to: string,
    orgName: string,
    inviteLink: string,
    invitedBy: string,
    role: string,
  ) {
    return this.sendEmail({
      to,
      subject: `You've been invited to join ${orgName} on Sous`,
      template: 'invitation',
      context: { orgName, inviteLink, invitedBy, role },
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    return this.sendEmail({
      to,
      subject: 'Reset your Sous password',
      template: 'password-reset',
      context: { resetLink },
    });
  }

  async sendWelcomeEmail(to: string, firstName: string) {
    return this.sendEmail({
      to,
      subject: `Welcome to the Kitchen, Chef ${firstName}!`,
      template: 'welcome',
      context: { firstName },
    });
  }

  async sendVerificationEmail(to: string, userName: string, verificationLink: string) {
    return this.sendEmail({
      to,
      subject: 'Verify your Sous account',
      template: 'verification',
      context: { userName, verificationLink },
    });
  }

  async sendSubscriptionConfirmedEmail(to: string, userName: string, planName: string, orgName: string) {
    return this.sendEmail({
      to,
      subject: 'Your Kitchen is Activated',
      template: 'subscription-confirmed',
      context: { userName, planName, orgName },
    });
  }

  async sendWeeklyDigestEmail(to: string, userName: string, orgName: string, stats: any) {
    return this.sendEmail({
      to,
      subject: `Weekly Kitchen Digest: ${orgName}`,
      template: 'weekly-digest',
      context: { userName, orgName, stats },
    });
  }
}
