// lib/email/templates/user-arrived-pay-remaining.tsx

import { BaseEmail } from "./base";

type Props = {
  appUrl: string;
  username: string;
  requestTitle: string;
  totalGel: number | null;
  ctaUrl: string;
};

function calcPay50(total: number) {
  return Math.ceil(total * 0.5);
}
function calcPayRest(total: number) {
  const p50 = calcPay50(total);
  return Math.max(0, total - p50);
}

export function UserArrivedPayRemainingEmail(props: Props): string {
  const { username, requestTitle, totalGel, ctaUrl } = props;

  const rest =
    typeof totalGel === "number" && Number.isFinite(totalGel) ? calcPayRest(totalGel) : null;

  return BaseEmail({
    title: "შეკვეთა ჩამოსულია",
    preheader: "📦 ჩამოსულია — დარჩენილი თანხის გადახდა",
    children: `
      <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;color:#374151;">
        გამარჯობა <strong>${username}</strong>,<br/>
        შენი შეკვეთა <strong>ჩამოსულია</strong>. ✅
      </p>

      <div style="
        padding:14px;
        border:1px solid #e5e7eb;
        background:#f9fafb;
        border-radius:12px;
      ">
        <div style="font-size:12px;color:#6b7280;font-weight:800;">პროდუქტი</div>
        <div style="margin-top:6px;font-size:14px;font-weight:900;color:#111827;">
          ${requestTitle}
        </div>

        <div style="height:12px;"></div>

        <div style="font-size:12px;color:#6b7280;font-weight:800;">შემდეგი ნაბიჯი</div>
        <div style="margin-top:6px;font-size:13px;line-height:1.7;color:#374151;">
          შეკვეთის მისაღებად საჭიროა დარჩენილი თანხის გადახდა.
          ${rest != null ? `<br/><strong>დარჩენილი: ${rest} GEL</strong>` : ``}
        </div>

        <div style="margin-top:10px;font-size:12px;line-height:1.7;color:#6b7280;">
          გადახდის შემდეგ გადავცემთ მიწოდებაზე და მალე მიიღებ შენს მისამართზე.
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
          გადახდა / ჩემი შეკვეთები
        </a>
      </div>

      <p style="margin:0;text-align:center;font-size:12px;color:#6b7280;">
        ღილაკი გახსნის შენს გვერდს (ავტორიზაცია აუცილებელია) და იქიდან შეძლებ გადახდას.
      </p>
    `
  });
}
