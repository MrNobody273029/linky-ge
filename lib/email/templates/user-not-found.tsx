// lib/email/templates/user-not-found.tsx

import { BaseEmail } from "./base";

type Props = {
  appUrl: string;
  username: string;
  requestTitle: string;
  ctaUrl: string;
};

export function UserNotFoundEmail(props: Props): string {
  const { username, requestTitle, ctaUrl } = props;

  return BaseEmail({
    title: "ამ ეტაპზე უკეთესი ფასი ვერ ვიპოვეთ",
    preheader: "ზოგჯერ საქართველოში არსებული ფასი უკვე საუკეთესოა",
    children: `
      <p style="
        margin:0 0 14px 0;
        font-size:15px;
        line-height:1.7;
        color:#374151;
      ">
        გამარჯობა <strong>${username}</strong>,<br/>
        ვცადეთ რამდენიმე სანდო წყარო და ვარიანტი შენი მოთხოვნისთვის — <strong>${requestTitle}</strong>,
        მაგრამ ამ ეტაპზე <strong>საქართველოში არსებულზე უკეთესი შეთავაზება ვერ მოიძებნა</strong>.
      </p>

      <div style="
        margin:16px 0 20px 0;
        padding:14px 14px;
        border-radius:12px;
        background:#f9fafb;
        border:1px solid #e5e7eb;
        font-size:14px;
        line-height:1.7;
        color:#374151;
      ">
        💡 თუ გინდა, შეგიძლია მოგვწერო/გამოგვიგზავნო <strong>სხვა ლინკი</strong> იგივე პროდუქტზე,
        ან მოგვიანებით ისევ ვცადოთ — ფასები ხშირად იცვლება.
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
          font-weight:700;
        ">
          ჩემი მოთხოვნების ნახვა
        </a>
      </div>

      <p style="
        margin:0;
        font-size:12px;
        color:#6b7280;
        text-align:center;
      ">
        ღილაკი გაგიხსნის შენს გვერდს, სადაც სტატუსს ნახავ და სურვილის შემთხვევაში ახალ მოთხოვნასაც დაამატებ.
      </p>
    `
  });
}
