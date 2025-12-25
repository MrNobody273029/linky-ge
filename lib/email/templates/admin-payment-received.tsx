// lib/email/templates/admin-payment-received.tsx

import { BaseEmail } from "./base";

type Props = {
  appUrl: string;
  username: string;
  userEmail: string;
  requestTitle: string;
  amountGel: number;
  paymentStatus: "PARTIAL" | "FULL";
  requestUrl: string;
};

export function AdminPaymentReceivedEmail(props: Props): string {
  const { username, userEmail, requestTitle, amountGel, paymentStatus, requestUrl } = props;

  const badge =
    paymentStatus === "FULL"
      ? `<span style="display:inline-block;padding:6px 10px;border-radius:999px;background:#16a34a1a;color:#16a34a;font-weight:800;font-size:12px;">FULL</span>`
      : `<span style="display:inline-block;padding:6px 10px;border-radius:999px;background:#f59e0b1a;color:#b45309;font-weight:800;font-size:12px;">PARTIAL</span>`;

  return BaseEmail({
    title: "გადახდა მიღებულია",
    preheader: paymentStatus === "FULL" ? "მომხმარებელმა სრულად გადაიხადა" : "მომხმარებელმა 50% გადაიხადა",
    children: `
      <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;color:#374151;">
        მიღებულია გადახდა მომხმარებლისგან <strong>${username}</strong>
        <span style="color:#6b7280;">(${userEmail})</span>
      </p>

      <div style="margin:10px 0 16px 0;">${badge}</div>

      <div style="
        padding:14px;
        border:1px solid #e5e7eb;
        background:#f9fafb;
        border-radius:12px;
      ">
        <div style="font-size:12px;color:#6b7280;font-weight:800;">მოთხოვნა</div>
        <div style="margin-top:6px;font-size:14px;font-weight:800;color:#111827;">
          ${requestTitle}
        </div>

        <div style="height:12px;"></div>

        <div style="font-size:12px;color:#6b7280;font-weight:800;">გადახდილი თანხა</div>
        <div style="margin-top:6px;font-size:22px;font-weight:900;color:#111827;">
          ${amountGel} <span style="font-size:14px;font-weight:800;color:#6b7280;">GEL</span>
        </div>
      </div>

      <div style="margin:22px 0;text-align:center;">
        <a href="${requestUrl}" style="
          display:inline-block;
          padding:14px 22px;
          background:#111827;
          color:#ffffff;
          text-decoration:none;
          border-radius:12px;
          font-size:15px;
          font-weight:800;
        ">
          გახსნა ადმინ პანელში
        </a>
      </div>

      <p style="margin:0;text-align:center;font-size:12px;color:#6b7280;">
        ღილაკი გახსნის კონკრეტულ მოთხოვნას ადმინ პანელში.
      </p>
    `
  });
}
