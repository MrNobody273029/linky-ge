import { resend, EMAIL_FROM } from "./resend";

type SendEmailArgs = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, html, replyTo }: SendEmailArgs) {
  const result = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    html,
    replyTo,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data; // { id: ... }
}
