// lib/email/templates/admin-new-request.tsx

import { BaseEmail } from "./base";

type Props = {
  appUrl: string;
  username: string;
  requestTitle: string;
  requestUrl: string;
};

export function AdminNewRequestEmail(props: Props): string {
  const { username, requestTitle, requestUrl } = props;

  return BaseEmail({
    title: "ახალი მოთხოვნა მიღებულია",
    preheader: "მომხმარებელმა ახალი ლინკი გამოგიგზავნა",
    children: `
      <p style="
        margin:0 0 16px 0;
        font-size:15px;
        line-height:1.6;
        color:#374151;
        text-align:center;
      ">
        მომხმარებელმა <strong>${username}</strong> გამოგიგზავნა ახალი მოთხოვნა
      </p>

      <div style="
        padding:16px;
        background:#f9fafb;
        border-radius:12px;
        margin-bottom:24px;
        font-size:14px;
        color:#111827;
        text-align:center;
      ">
        ${requestTitle}
      </div>

      <div style="text-align:center;">
        <a href="${requestUrl}" style="
          display:inline-block;
          padding:14px 26px;
          background:#111827;
          color:#ffffff;
          text-decoration:none;
          border-radius:999px;
          font-size:14px;
          font-weight:600;
        ">
          გახსნა ადმინ პანელში →
        </a>
      </div>
    `
  });
}
