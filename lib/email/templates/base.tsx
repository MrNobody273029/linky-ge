// lib/email/templates/base.tsx

type BaseEmailProps = {
  title: string;
  preheader?: string;
  children: string;
};

export function BaseEmail({ title, preheader, children }: BaseEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="ka">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${title}</title>
  </head>

  <body style="
    margin:0;
    padding:0;
    background-color:#f3f4f6;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
    color:#111827;
  ">
    ${preheader ? `
    <div style="
      display:none;
      font-size:1px;
      color:#f3f4f6;
      line-height:1px;
      max-height:0;
      max-width:0;
      opacity:0;
      overflow:hidden;
    ">
      ${preheader}
    </div>` : ``}

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:32px 16px;">

          <!-- Card -->
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
            style="
              max-width:560px;
              background:#ffffff;
              border-radius:18px;
              box-shadow:0 12px 30px rgba(0,0,0,0.08);
              overflow:hidden;
            ">

            <!-- Logo -->
            <tr>
              <td align="center" style="padding:28px 24px 12px 24px;">
                <img
                  src="https://linky.ge/brand/loader-logo.png"
                  alt="Linky"
                  width="56"
                  height="56"
                  style="display:block;border-radius:14px;"
                />
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style="padding:0 24px 16px 24px;">
                <h1 style="
                  margin:0;
                  font-size:20px;
                  font-weight:700;
                  text-align:center;
                  color:#111827;
                ">
                  ${title}
                </h1>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:0 24px 28px 24px;">
                ${children}
              </td>
            </tr>

          </table>

          <!-- Footer -->
          <div style="
            max-width:560px;
            padding:18px 8px 0 8px;
            font-size:12px;
            color:#6b7280;
            text-align:center;
          ">
            © ${new Date().getFullYear()} Linky.ge • უსაფრთხო ონლაინ შეკვეთები
          </div>

        </td>
      </tr>
    </table>
  </body>
</html>
`;
}
