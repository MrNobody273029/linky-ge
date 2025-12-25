// lib/email/templates/user-offer-created.tsx

import { BaseEmail } from "./base";

type Props = {
  appUrl: string;
  username: string;
  requestTitle: string;

  // prices
  originalPriceGel?: number | null;
  offerPriceGel: number;

  etaDays: number;
  ctaUrl: string;

  imageUrl?: string | null;
  expiresInDays?: number;
};

export function UserOfferCreatedEmail(props: Props): string {
  const {
    username,
    requestTitle,
    originalPriceGel,
    offerPriceGel,
    etaDays,
    ctaUrl,
    imageUrl,
    expiresInDays = 7
  } = props;

  const saved =
    originalPriceGel != null
      ? Math.max(0, originalPriceGel - offerPriceGel)
      : null;

  return BaseEmail({
    title: "შეთავაზება მზადაა 🎉",
    preheader: "ჩვენ ვიპოვეთ უკეთესი ფასი შენი შეკვეთისთვის",
    children: `
      <p style="
        margin:0 0 16px 0;
        font-size:15px;
        line-height:1.6;
        color:#374151;
      ">
        გამარჯობა <strong>${username}</strong>,<br/>
        შენი მოთხოვნისთვის <strong>${requestTitle}</strong> უკვე მზად არის შეთავაზება.
      </p>

      ${
        imageUrl
          ? `
        <div style="
          margin:20px 0;
          border-radius:14px;
          overflow:hidden;
          border:1px solid #e5e7eb;
        ">
          <img
            src="${imageUrl}"
            alt="${requestTitle}"
            style="
              width:100%;
              display:block;
              object-fit:cover;
            "
          />
        </div>
      `
          : ``
      }

      <div style="
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:12px;
        margin:20px 0;
      ">
        <div style="
          padding:14px;
          border-radius:12px;
          background:#f9fafb;
          border:1px solid #e5e7eb;
        ">
          <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">
            საქართველოს ფასი
          </div>
          <div style="
            font-size:16px;
            font-weight:700;
            color:#9ca3af;
            text-decoration:line-through;
          ">
            ${originalPriceGel != null ? `${originalPriceGel} GEL` : "—"}
          </div>
        </div>

        <div style="
          padding:14px;
          border-radius:12px;
          background:#ecfeff;
          border:1px solid #67e8f9;
        ">
          <div style="font-size:12px;color:#0369a1;margin-bottom:4px;">
            Linky ფასი
          </div>
          <div style="
            font-size:20px;
            font-weight:800;
            color:#0f172a;
          ">
            ${offerPriceGel} GEL
          </div>
        </div>
      </div>

      ${
        saved != null
          ? `
        <div style="
          margin:14px 0 20px 0;
          padding:14px;
          border-radius:12px;
          background:#f0fdf4;
          border:1px solid #86efac;
          font-size:14px;
          color:#166534;
          text-align:center;
        ">
          💸 დაზოგავ <strong>${saved} GEL</strong>-ს
        </div>
      `
          : ``
      }

      <div style="
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:12px;
        margin-bottom:16px;
      ">
        <div style="
          padding:14px;
          border-radius:12px;
          background:#f9fafb;
          border:1px solid #e5e7eb;
        ">
          <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">
            ჩამოსვლის დრო
          </div>
          <div style="font-size:16px;font-weight:700;color:#111827;">
            ${etaDays} დღე
          </div>
        </div>

        <div style="
          padding:14px;
          border-radius:12px;
          background:#fff7ed;
          border:1px solid #fed7aa;
        ">
          <div style="font-size:12px;color:#9a3412;margin-bottom:4px;">
            შეთავაზების ვადა
          </div>
          <div style="font-size:16px;font-weight:700;color:#9a3412;">
            ${expiresInDays} დღე
          </div>
        </div>
      </div>

      <div style="margin:24px 0;text-align:center;">
        <a href="${ctaUrl}" style="
          display:inline-block;
          padding:14px 22px;
          background:#111827;
          color:#ffffff;
          text-decoration:none;
          border-radius:12px;
          font-size:15px;
          font-weight:700;
        ">
          შეთავაზების ნახვა
        </a>
      </div>

      <p style="
        margin:0;
        font-size:13px;
        color:#6b7280;
        text-align:center;
      ">
        ღილაკზე დაჭერით გადახვალ შენს პირად გვერდზე და შეძლებ შეთავაზების მიღებას.
      </p>
    `
  });
}
