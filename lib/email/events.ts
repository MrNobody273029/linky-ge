// lib/email/events.ts

import { sendEmail } from "@/lib/email/sendEmail";
import { buildAppUrl } from "@/lib/email/buildLinks";

// templates
import { AdminNewRequestEmail } from "@/lib/email/templates/admin-new-request";
import { AdminPaymentReceivedEmail } from "@/lib/email/templates/admin-payment-received";

import { UserOfferCreatedEmail } from "@/lib/email/templates/user-offer-created";
import { UserPaymentReceivedEmail } from "@/lib/email/templates/user-payment-received";
import { UserDeliveredEmail } from "@/lib/email/templates/user-delivered";

// ✅ status-specific templates
import { UserInProgressEmail } from "@/lib/email/templates/user-in-progress";
import { UserArrivedPayRemainingEmail } from "@/lib/email/templates/user-arrived-pay-remaining";

export type EmailEvent =
  | "ADMIN_NEW_REQUEST"
  | "ADMIN_PAYMENT_RECEIVED"
  | "USER_OFFER_CREATED"
  | "USER_PAYMENT_RECEIVED"
  | "USER_IN_PROGRESS"
  | "USER_ARRIVED_PAY_REMAINING"
  | "USER_DELIVERED";

type SendArgs = {
  event: EmailEvent;
  to: string;
  payload: any;
};

export async function triggerEmail({ event, to, payload }: SendArgs) {
  const appUrl = buildAppUrl();

  let subject = "";
  let html = "";

  switch (event) {
    case "ADMIN_NEW_REQUEST":
      subject = `🆕 ახალი მოთხოვნა მიღებულია`;
      html = AdminNewRequestEmail({ appUrl, ...payload });
      break;

    case "ADMIN_PAYMENT_RECEIVED":
      subject = `💰 გადახდა მიღებულია`;
      html = AdminPaymentReceivedEmail({ appUrl, ...payload });
      break;

    case "USER_OFFER_CREATED":
      subject = `💛 შეთავაზება მზადაა`;
      html = UserOfferCreatedEmail({ appUrl, ...payload });
      break;

    case "USER_PAYMENT_RECEIVED":
      subject = `🧾 გადახდა მიღებულია`;
      html = UserPaymentReceivedEmail({ appUrl, ...payload });
      break;

    case "USER_IN_PROGRESS":
      subject = `🚚 შეკვეთა გზაშია`;
      html = UserInProgressEmail({ appUrl, ...payload });
      break;

    case "USER_ARRIVED_PAY_REMAINING":
      subject = `📦 შეკვეთა ჩამოსულია — დარჩენილი გადახდა`;
      html = UserArrivedPayRemainingEmail({ appUrl, ...payload });
      break;

    case "USER_DELIVERED":
      subject = `🎉 ჩაბარებულია`;
      html = UserDeliveredEmail({ appUrl, ...payload });
      break;

    default:
      throw new Error(`Unknown email event: ${event}`);
  }

  return sendEmail({
    to,
    subject,
    html
  });
}
