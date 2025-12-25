// lib/email/templates/user-in-progress.tsx

import { BaseEmail } from "./base";

type Props = {
  appUrl: string;
  username: string;
  requestTitle: string;
  ctaUrl: string;
};

export function UserInProgressEmail(props: Props): string {
  const { username, requestTitle, ctaUrl } = props;

  return BaseEmail({
    title: "შეკვეთა გზაშია",
    preheader: "🚚 სტატუსი განახლდა — გზაშია",
    children: `
      <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;color:#374151;">
        გამარჯობა <strong>${username}</strong>,<br/>
        კარგი ამბავია — შენი შეკვეთა უკვე <strong>გზაშია</strong>.
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

        <div style="margin-top:12px;font-size:13px;line-height:1.7;color:#374151;">
          როგორც კი ჩამოვა საქართველოში, მაშინვე შეგატყობინებთ.
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
