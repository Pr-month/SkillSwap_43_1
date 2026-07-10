import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { mailerConfig, TMailerConfig } from '../config/mailer.config';

@Injectable()
export class MailService implements OnModuleInit {
  constructor(
    private readonly mailerService: MailerService,
    @Inject(mailerConfig.KEY)
    private readonly config: TMailerConfig,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.verifyConnection();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async verifyConnection(): Promise<void> {
    try {
      const transporter = (
        this.mailerService as unknown as {
          transporter: { verify: () => Promise<void> };
        }
      ).transporter;

      if (!transporter) {
        throw new Error('Mailer transporter is not initialized');
      }

      await transporter.verify();
      console.log('✅ SMTP connection verified');
    } catch (error) {
      console.error('❌ SMTP connection failed:', error);
    }
  }

  async sendUserNotification(
    email: string,
    payload: { subject: string; text?: string; html?: string },
  ): Promise<void> {
    const { maxRetries, delayMs } = this.config.retry;

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.mailerService.sendMail({
          to: email,
          subject: payload.subject,
          text: payload.text,
          html: payload.html,
        });

        return;
      } catch (error) {
        lastError = error;
        console.error(
          `Mail send failed (attempt ${attempt}/${maxRetries})`,
          error,
        );

        if (attempt < maxRetries) {
          await this.sleep(delayMs);
        }
      }
    }

    throw lastError;
  }
}
