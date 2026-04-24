const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { Resend } = require("resend");

admin.initializeApp();

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

exports.onLoginEventCreated = onDocumentCreated(
  {
    document: "login_events/{eventId}",
    secrets: [RESEND_API_KEY]
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const toEmail = data.emailTarget || "gauravvishwakarma8840@gmail.com";
    const resend = new Resend(RESEND_API_KEY.value());

    const phone = data.phone || "Unknown";
    const time = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
    const userAgent = data.userAgent || "Unknown";

    await resend.emails.send({
      from: "KaamSetu Alerts <onboarding@resend.dev>",
      to: [toEmail],
      subject: "KaamSetu Login Alert",
      text: `New login detected\nPhone: ${phone}\nTime: ${time}\nUserAgent: ${userAgent}`
    });
  }
);
