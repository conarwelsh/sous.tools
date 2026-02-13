import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Resend } from 'resend';
import { config } from '@sous/config';
import { logger } from '@sous/logger';
import { render } from '@react-email/components';
import * as React from 'react';
import { 
  InvitationEmail, 
  PasswordResetEmail, 
  WelcomeEmail, 
  OrderEmail, 
  LowStockEmail 
} from '@sous/emails';
import { EmailJobData } from './mail.service.js';

@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
  private resend: Resend | null = null;

  constructor() {
    super();
    if (config.resend.apiKey) {
      this.resend = new Resend(config.resend.apiKey);
    }
  }

  async process(job: Job<EmailJobData>): Promise<any> {
    const { to, subject, template, context } = job.data;
    
    logger.info(`⚙️ Processing Email Job: ${job.id} (${template})`);

    let component: React.ReactElement;

    switch (template) {
      case 'invitation':
        component = React.createElement(InvitationEmail, context as any);
        break;
      case 'password-reset':
        component = React.createElement(PasswordResetEmail, context as any);
        break;
      case 'welcome':
        component = React.createElement(WelcomeEmail, context as any);
        break;
      case 'order':
        component = React.createElement(OrderEmail, context as any);
        break;
      case 'low-stock':
        component = React.createElement(LowStockEmail, context as any);
        break;
      default:
        throw new Error(`Unknown template: ${template}`);
    }

    const html = await render(component);

    if (!this.resend) {
      logger.warn(`✉️ Resend API Key not configured. Mocking send to ${to}`);
      logger.debug(html);
      return { status: 'mocked' };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: config.resend.from,
        to,
        subject,
        html,
      });

      if (error) {
        logger.error(`❌ Resend Error:`, error);
        throw error;
      }

      return data;
    } catch (e) {
      logger.error(`❌ Failed to send email to ${to}:`, e);
      throw e;
    }
  }
}
