// lib/email/templates/user-payment-received.tsx

import { BaseEmail } from "./base";

type Props = {
  appUrl: string;
  username: string;
  requestTitle: string;
  amountGel: number;
  paymentStatus: "PARTIAL" | "FULL";
  ctaUrl: string;
};

export function UserPaymentReceivedEmail(props: Props): string {
  const { username, requestTitle, amountGel, paymentStatus, ctaUrl } = props;

  const badge =
    paymentStatus === "FULL"
      ? `<span style="display:inline-block;padding:6px 10px;border-radius:999px;background:#16a34a1a;color:#16a34a;font-weight:700;font-size:12px;">სრულად გადახდილია</span>`
      : `<span style="display:inline-block;padding:6px 10px;border-radius:999px;background:#f59e0b1a;color:#b45309;font-weight:700;font-size:12px;">50% გადახდილია</span>`;

  const nextText =
    paymentStatus === "FULL"
      ? "გადახდა სრულად მიღებულია — შეკვეთას კურიერი უმოკლეს დროში მოგიტანთ მისამართზე."
      : "ეს არის წინასწარი 50% — შეკვეთის დასადასტურებლად. დარჩენილი თანხა გადაიხდება მაშინ, როცა შეკვეთა ჩამოვა.";

  return BaseEmail({
    title: "გადახდა მიღებულია",
    preheader: paymentStatus === "FULL" ? "გადახდა სრულად მიღებულია" : "50% წინასწარი გადახდა მიღებულია",
    children: `
      <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;color:#374151;">
        გამარჯობა <strong>${username}</strong>,<br/>
        მივიღეთ გადახდა შენი მოთხოვნისთვის: <strong>${requestTitle}</strong>
      </p>

      <div style="margin:10px 0 16px 0;">${badge}</div>

      <div style="
        padding:14px;
        border:1px solid #e5e7eb;
        background:#f9fafb;
        border-radius:12px;
      ">
        <div style="font-size:12px;color:#6b7280;font-weight:700;">გადახდილი თანხა</div>
        <div style="margin-top:6px;font-size:22px;font-weight:900;color:#111827;">
          ${amountGel} <span style="font-size:14px;font-weight:800;color:#6b7280;">GEL</span>
        </div>
        <div style="margin-top:10px;font-size:13px;line-height:1.7;color:#374151;">
          ${nextText}
        </div>
      </div>

      <div style="margin:22px 0;text-align:center;">
        <a href="${ctaUrl}" style="
          display:inline-block;
          padding:14px 22px;
          background:#111827;
          color:#ffffff;
          text-decoration:none;
          border-radius:12px;
          font-size:15px;
          font-weight:800;
        ">
          ჩემი შეკვეთების ნახვა
        </a>
      </div>

      <p style="margin:0;text-align:center;font-size:12px;color:#6b7280;">
        ღილაკი გახსნის შენს გვერდს (ავტორიზაცია აუცილებელია).
      </p>
    `
  });
}
