import { sendEmail } from "@/lib/email/sendEmail";
import { buildAppUrl } from "@/lib/email/buildLinks";

// templates (რეალურ სახელებზე მორგებული)
import { AdminNewRequestEmail } from "@/lib/email/templates/admin-new-request";
import { AdminPaymentReceivedEmail } from "@/lib/email/templates/admin-payment-received";

import { UserOfferCreatedEmail } from "@/lib/email/templates/user-offer-created";
import { UserRequestAcceptedEmail } from "@/lib/email/templates/user-request-accepted";
import { UserPaymentReceivedEmail } from "@/lib/email/templates/user-payment-received";
import { UserArrivedPaymentReminderEmail } from "@/lib/email/templates/user-arrived-pay-remaining";
import { UserStatusUpdatedEmail } from "@/lib/email/templates/user-status-updated";
import { UserDeliveredEmail } from "@/lib/email/templates/user-delivered";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "support@linky.ge";
const SECRET = process.env.EMAIL_TEST_SECRET;

type EventKey =
  | "ADMIN_NEW_REQUEST"
  | "USER_OFFER_CREATED"
  | "USER_REQUEST_ACCEPTED"
  | "USER_PAYMENT_RECEIVED"
  | "ADMIN_PAYMENT_RECEIVED"
  | "USER_ARRIVED_PAYMENT_REMINDER"
  | "USER_STATUS_UPDATED"
  | "USER_DELIVERED";

function bad(msg: string, status = 400) {
  return Response.json({ ok: false, error: msg }, { status });
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  // ✅ security gate
  if (!SECRET) return bad("Missing EMAIL_TEST_SECRET on server", 500);
  const key = url.searchParams.get("key");
  if (key !== SECRET) return bad("Unauthorized", 401);

  const event = (url.searchParams.get("event") || "") as EventKey;
  if (!event) return bad("Missing ?event=...");

  const to = url.searchParams.get("to") || ADMIN_EMAIL;

  // dummy data (ტესტისთვის)
  const user = { username: "MrNobody27", email: "user@example.com" };
  const request = { id: "req_123", title: "Nike Air Force 1", productUrl: "https://example.com/p" };
  const offer = { linkyPrice: 199, etaDays: 7 };
  const appUrl = buildAppUrl(); // APP_URL-იდან

  // ✅ pick template by event
  let subject = "";
  let html = "";

  switch (event) {
    case "ADMIN_NEW_REQUEST": {
      subject = `🆕 ახალი მოთხოვნა — ${request.title}`;
      html = AdminNewRequestEmail({
        appUrl,
        username: user.username,
        requestTitle: request.title,
        requestUrl: request.productUrl,
      });
      break;
    }

    case "USER_OFFER_CREATED": {
      subject = `💛 შეთავაზება მზადაა — ${request.title}`;
      html = UserOfferCreatedEmail({
        appUrl,
        username: user.username,
        requestTitle: request.title,
        offerPriceGel: offer.linkyPrice,
        etaDays: offer.etaDays,
        ctaUrl: `${appUrl}/mypage?tab=offers`,
      });
      break;
    }

    case "USER_REQUEST_ACCEPTED": {
      subject = `✅ მიღებულია — ${request.title}`;
      html = UserRequestAcceptedEmail({
        appUrl,
        username: user.username,
        requestTitle: request.title,
        ctaUrl: `${appUrl}/mypage?tab=accepted`,
      });
      break;
    }

    case "USER_PAYMENT_RECEIVED": {
      subject = `🧾 მიღებულია გადახდა (50%) — ${request.title}`;
      html = UserPaymentReceivedEmail({
        appUrl,
        username: user.username,
        requestTitle: request.title,
        amountGel: 50,
        paymentStatus: "PARTIAL",
        ctaUrl: `${appUrl}/mypage?tab=accepted`,
      });
      break;
    }

    case "ADMIN_PAYMENT_RECEIVED": {
      subject = `💰 გადახდა მიღებულია — ${user.username}`;
      html = AdminPaymentReceivedEmail({
        appUrl,
        username: user.username,
        userEmail: user.email,
        requestTitle: request.title,
        amountGel: 50,
        paymentStatus: "PARTIAL",
      });
      break;
    }

    case "USER_ARRIVED_PAYMENT_REMINDER": {
      subject = `📦 ჩამოსულია — დარჩენილი 50% გადასახდელია`;
      html = UserArrivedPaymentReminderEmail({
        appUrl,
        username: user.username,
        requestTitle: request.title,
        ctaUrl: `${appUrl}/mypage?tab=accepted`,
      });
      break;
    }

    case "USER_STATUS_UPDATED": {
      subject = `📍 სტატუსი განახლდა — ${request.title}`;
      html = UserStatusUpdatedEmail({
        appUrl,
        username: user.username,
        requestTitle: request.title,
        newStatusKa: "გზაშია",
        newStatusEn: "In progress",
        ctaUrl: `${appUrl}/mypage?tab=accepted`,
      });
      break;
    }

    case "USER_DELIVERED": {
      subject = `🎉 ჩაბარებულია — ${request.title}`;
      html = UserDeliveredEmail({
        appUrl,
        username: user.username,
        requestTitle: request.title,
      });
      break;
    }

    default:
      return bad("Unknown event");
  }

  const data = await sendEmail({ to, subject, html });

  return Response.json({ ok: true, to, event, id: data?.id });
}
