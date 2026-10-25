import nodemailer from "nodemailer";

export type LeadNotification = Readonly<{
  subject: string;
  text: string;
  replyTo?: string;
}>;

export type NotificationResult =
  | { status: "not-configured" }
  | { status: "sent"; messageId?: string }
  | { status: "failed"; errorCode: "delivery-failed" };

export interface MailTransport {
  sendMail(options: {
    from: string;
    to: string;
    replyTo?: string;
    subject: string;
    text: string;
  }): Promise<{ messageId?: string }>;
}

type MailDependencies = Readonly<{
  env?: Record<string, string | undefined>;
  transport?: MailTransport;
}>;

export async function sendLeadNotification(
  message: LeadNotification,
  dependencies: MailDependencies = {},
): Promise<NotificationResult> {
  const env = dependencies.env ?? process.env;
  const host = env.SMTP_HOST;
  const portText = env.SMTP_PORT;
  const from = env.SMTP_FROM;
  const to = env.LEAD_NOTIFICATION_TO;

  if (!host || !portText || !from || !to) return { status: "not-configured" };

  const port = Number(portText);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) return { status: "not-configured" };

  const transport =
    dependencies.transport ??
    (nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: env.SMTP_USER && env.SMTP_PASSWORD ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
      connectionTimeout: 10_000,
      socketTimeout: 15_000,
    }) as MailTransport);

  try {
    const result = await transport.sendMail({
      from,
      to,
      replyTo: message.replyTo,
      subject: message.subject.slice(0, 200),
      text: message.text.slice(0, 20_000),
    });
    return { status: "sent", messageId: result.messageId };
  } catch {
    return { status: "failed", errorCode: "delivery-failed" };
  }
}
