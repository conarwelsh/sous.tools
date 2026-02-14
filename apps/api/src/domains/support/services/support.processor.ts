import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { logger } from '@sous/logger';
import { SupportService, SupportReport } from './support.service.js';
import { Octokit } from 'octokit';
import { config } from '@sous/config';
import { MailService } from '../../core/mail/mail.service.js';
import { PlatformService } from '../../core/services/platform.service.js';
import { DatabaseService } from '../../core/database/database.service.js';
import { users } from '../../core/database/schema.js';
import { eq } from 'drizzle-orm';

@Processor('support-queue')
export class SupportProcessor extends WorkerHost {
  private octokit: Octokit | null = null;

  constructor(
    private readonly mailService: MailService,
    private readonly platformService: PlatformService,
    private readonly dbService: DatabaseService,
  ) {
    super();
    if (config.github.token) {
      this.octokit = new Octokit({ auth: config.github.token });
    }
  }

  async process(job: Job<SupportReport>): Promise<any> {
    const data = job.data;
    logger.info(`⚙️ Processing Support Job: ${job.id} (${data.type})`);

    // 1. GitHub Issue Creation
    let githubIssueUrl: string | undefined;
    if (this.octokit) {
      try {
        const [owner, repo] = config.github.repo.split('/');
        const labels = [data.type.toLowerCase()];
        if (data.priority)
          labels.push(`priority:${data.priority.toLowerCase()}`);

        const body = `
### Description
${data.description}

### Metadata
- **User:** ${data.metadata.userId}
- **Org:** ${data.metadata.orgId}
- **App Version:** ${data.metadata.appVersion}
- **OS/Browser:** ${data.metadata.userAgent}
- **URL:** ${data.metadata.url}

---
*Reported via Sous OS Support System*
        `;

        const response = await this.octokit.rest.issues.create({
          owner,
          repo,
          title: `[${data.type}] ${data.subject}`,
          body,
          labels,
        });
        githubIssueUrl = response.data.html_url;
        logger.info(`[Support] GitHub Issue created: ${githubIssueUrl}`);
      } catch (e: any) {
        logger.error(`[Support] Failed to create GitHub issue: ${e.message}`);
      }
    }

    // 2. Email Notification (to Team)
    try {
      const supportEmail =
        (await this.platformService.getSetting('support_email')) ||
        config.support.email;
      await this.mailService.sendEmail({
        to: supportEmail,
        subject: `[Support ${data.type}] ${data.subject}`,
        template: 'support-notification' as any,
        context: {
          ...data,
          githubIssueUrl,
        },
      });
    } catch (e: any) {
      logger.error(`[Support] Failed to send team notification: ${e.message}`);
    }

    // 3. Email Confirmation (to User)
    try {
      const user = await this.dbService.readDb.query.users.findFirst({
        where: eq(users.id, data.metadata.userId),
      });

      if (user) {
        await this.mailService.sendEmail({
          to: user.email,
          subject: `We've received your ${data.type.toLowerCase()} report`,
          template: 'support-ticket' as any,
          context: {
            userName: user.firstName || 'Chef',
            subject: data.subject,
            message: data.description,
            priority: data.priority?.toLowerCase() || 'low',
            ticketId: githubIssueUrl?.split('/').pop() || 'PENDING',
          },
        });
      }
    } catch (e: any) {
      logger.error(`[Support] Failed to send user confirmation: ${e.message}`);
    }

    return { githubIssueUrl };
  }
}
