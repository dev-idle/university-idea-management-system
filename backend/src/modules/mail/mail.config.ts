import { join } from 'node:path';
import type { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

const DEFAULT_FROM = '"UIMS System" <noreply@gre.ac.uk>';

/**
 * Mailer config — 2026 standard.
 * - Port 587 + STARTTLS (secure: false) — recommended over 465.
 * - Supports SMTP_* and MAIL_* env vars (Brevo, Gmail, or any SMTP provider).
 */
export function getMailerOptions(config: ConfigService) {
  const host =
    config.get<string>('MAIL_HOST') ?? config.get<string>('SMTP_HOST');
  const port =
    config.get<number>('MAIL_PORT') ?? config.get<number>('SMTP_PORT');
  const user =
    config.get<string>('MAIL_USER') ?? config.get<string>('SMTP_USER');
  const pass =
    config.get<string>('MAIL_PASS') ?? config.get<string>('SMTP_PASS');

  const transport =
    host && port != null && user && pass
      ? {
          host,
          port: Number(port),
          secure: config.get<boolean>('SMTP_SECURE') ?? false,
          auth: { user, pass },
        }
      : { jsonTransport: true };

  const from = config.get<string>('SMTP_FROM')
    ? `"UIMS System" <${config.get<string>('SMTP_FROM')}>`
    : DEFAULT_FROM;

  return {
    transport,
    defaults: { from },
    template: {
      dir: join(__dirname, 'templates'),
      adapter: new HandlebarsAdapter(),
      options: { strict: true },
    },
  };
}
