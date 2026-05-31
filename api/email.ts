import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { env } from "./lib/env";
import { Resend } from "resend";

// Only initialize Resend if API key is available
const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

export const emailRouter = createRouter({
  sendQuote: publicQuery
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Valid email is required"),
        phone: z.string().optional(),
        description: z.string().min(1, "Description is required"),
        quantity: z.string(),
        material: z.string(),
        files: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // If no Resend API key, return a mock success for development
      if (!resend || !env.resendApiKey) {
        console.log("[EMAIL MOCK] Quote request:", input);
        return {
          success: true,
          message: "Email sent successfully (mock mode - add RESEND_API_KEY env var for production)",
        };
      }

      try {
        // Send notification to business owner
        await resend.emails.send({
          from: `KiwiKoru 3D <${env.emailFrom}>`,
          to: env.emailTo,
          subject: `New Quote Request from ${input.name}`,
          html: `
            <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
              <div style="background: #2d4a3e; padding: 32px; text-align: center;">
                <h1 style="color: #d4b896; margin: 0; font-size: 24px;">KiwiKoru 3D</h1>
                <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">New Quote Request</p>
              </div>
              <div style="padding: 32px; background: #ffffff; border: 1px solid #e5e5e5; border-top: none;">
                <h2 style="font-size: 18px; margin: 0 0 16px;">Customer Details</h2>
                <table style="width: 100%; font-size: 14px; line-height: 2;">
                  <tr><td style="color: #4a4a4a; width: 140px;"><strong>Name</strong></td><td>${input.name}</td></tr>
                  <tr><td style="color: #4a4a4a;"><strong>Email</strong></td><td><a href="mailto:${input.email}">${input.email}</a></td></tr>
                  <tr><td style="color: #4a4a4a;"><strong>Phone</strong></td><td>${input.phone || "Not provided"}</td></tr>
                  <tr><td style="color: #4a4a4a;"><strong>Quantity</strong></td><td>${input.quantity}</td></tr>
                  <tr><td style="color: #4a4a4a;"><strong>Material</strong></td><td>${input.material}</td></tr>
                </table>
                <h2 style="font-size: 18px; margin: 24px 0 8px;">Project Description</h2>
                <p style="background: #f5f5f0; padding: 16px; border-radius: 8px; font-size: 14px; line-height: 1.6; margin: 0;">${input.description.replace(/\n/g, "<br/>")}</p>
                ${input.files && input.files.length > 0 ? `
                <h2 style="font-size: 18px; margin: 24px 0 8px;">Attached Files</h2>
                <ul style="font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
                  ${input.files.map((f) => `<li>${f}</li>`).join("")}
                </ul>
                ` : ""}
              </div>
              <div style="padding: 20px 32px; background: #f5f5f0; font-size: 12px; color: #4a4a4a; text-align: center;">
                <p style="margin: 0;">Sent from KiwiKoru 3D Quote Form · ${new Date().toLocaleString("en-NZ")}</p>
              </div>
            </div>
          `,
        });

        // Send confirmation to customer
        await resend.emails.send({
          from: `KiwiKoru 3D <${env.emailFrom}>`,
          to: input.email,
          subject: "We've Received Your Quote Request",
          html: `
            <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
              <div style="background: #2d4a3e; padding: 32px; text-align: center;">
                <h1 style="color: #d4b896; margin: 0; font-size: 24px;">KiwiKoru 3D</h1>
                <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">Quote Request Confirmation</p>
              </div>
              <div style="padding: 32px; background: #ffffff; border: 1px solid #e5e5e5; border-top: none;">
                <p style="font-size: 16px; line-height: 1.6;">Hi ${input.name},</p>
                <p style="font-size: 14px; line-height: 1.7; color: #4a4a4a;">We've received your quote request and will review it shortly. Our team typically responds within <strong>24 hours</strong> with a detailed estimate.</p>
                <div style="background: #f5f5f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="font-size: 14px; margin: 0 0 12px; color: #2d4a3e;">Your Request Summary</h3>
                  <table style="width: 100%; font-size: 13px; line-height: 2; color: #4a4a4a;">
                    <tr><td style="width: 100px;">Quantity</td><td><strong>${input.quantity}</strong></td></tr>
                    <tr><td>Material</td><td><strong>${input.material}</strong></td></tr>
                  </table>
                </div>
                <p style="font-size: 14px; line-height: 1.7; color: #4a4a4a;">If you have any questions in the meantime, feel free to reply to this email or message us on WhatsApp at <strong>+64 027 260 2954</strong>.</p>
                <p style="font-size: 14px; line-height: 1.7; color: #4a4a4a; margin-top: 24px;">Best regards,<br/><strong>The KiwiKoru 3D Team</strong></p>
              </div>
              <div style="padding: 20px 32px; background: #f5f5f0; font-size: 12px; color: #4a4a4a; text-align: center;">
                <p style="margin: 0;">KiwiKoru 3D · Morningside, Whangārei, New Zealand</p>
                <p style="margin: 4px 0 0;"><a href="https://kiwikoru3d.com" style="color: #2d4a3e;">kiwikoru3d.com</a></p>
              </div>
            </div>
          `,
        });

        return { success: true, message: "Quote request sent successfully. Check your email for confirmation." };
      } catch (error) {
        console.error("Email send error:", error);
        throw new Error("Failed to send email. Please try again or contact us directly.");
      }
    }),
});
