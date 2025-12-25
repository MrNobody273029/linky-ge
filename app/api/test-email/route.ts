import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json({ ok: false, error: "Missing RESEND_API_KEY" }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  try {
    const result = await resend.emails.send({
      from: "Linky <support@linky.ge>",
      to: "nutsarogava30@gmail.com", // შეცვალე თუ გინდა
      subject: "Resend test ✅",
      html: "<p>თუ ეს მოვიდა, Resend მუშაობს.</p>",
    });

    return Response.json({ ok: true, result });
  } catch (e: any) {
    return Response.json(
      { ok: false, error: e?.message ?? "Unknown error", details: e },
      { status: 500 }
    );
  }
}
