import { describe, expect, it, vi } from "vitest";
import { sendLeadNotification, type MailTransport } from "./mailer";

const message = {
  subject: "New quote request GGQ-123",
  text: "A persisted quotation request is ready for review.",
  replyTo: "buyer@example.cn",
};

describe("sendLeadNotification", () => {
  it("reports not-configured without attempting delivery", async () => {
    const sendMail = vi.fn();
    const result = await sendLeadNotification(message, { env: {}, transport: { sendMail } });
    expect(result).toEqual({ status: "not-configured" });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("delivers with configured SMTP details", async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: "mail-1" });
    const transport: MailTransport = { sendMail };
    const env = {
      SMTP_HOST: "smtp.example",
      SMTP_PORT: "587",
      SMTP_FROM: "website@example",
      LEAD_NOTIFICATION_TO: "sales@example",
    };
    const result = await sendLeadNotification(message, { env, transport });
    expect(result).toEqual({ status: "sent", messageId: "mail-1" });
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "website@example",
        to: "sales@example",
        replyTo: "buyer@example.cn",
        subject: message.subject,
        text: message.text,
      }),
    );
  });

  it("returns a bounded failure result instead of throwing transport errors", async () => {
    const sendMail = vi.fn().mockRejectedValue(new Error("password=not-for-output"));
    const env = {
      SMTP_HOST: "smtp.example",
      SMTP_PORT: "587",
      SMTP_FROM: "website@example",
      LEAD_NOTIFICATION_TO: "sales@example",
    };
    const result = await sendLeadNotification(message, { env, transport: { sendMail } });
    expect(result).toEqual({ status: "failed", errorCode: "delivery-failed" });
    expect(JSON.stringify(result)).not.toContain("password");
  });
});
