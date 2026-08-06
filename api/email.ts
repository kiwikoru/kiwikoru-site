import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { env } from "./lib/env";
import { Resend } from "resend";
import { brandedEmail, emailDetails, emailSafe } from './lib/branded-email.js';

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
          html: brandedEmail({ internal: true, eyebrow: 'New quote request', title: `A new project from ${input.name}`, intro: 'A customer has asked KiwiKoru to help materialise an idea. Their complete enquiry is below.', content: `${emailDetails([['Name', emailSafe(input.name)], ['Email', `<a href="mailto:${emailSafe(input.email)}" style="color:#3f572d;font-weight:700">${emailSafe(input.email)}</a>`], ['Phone', emailSafe(input.phone || 'Not provided')], ['Quantity', emailSafe(input.quantity)], ['Material', emailSafe(input.material)], ['Received', emailSafe(new Date().toLocaleString('en-NZ'))]])}<h2 style="margin:26px 0 10px;color:#253126;font-size:18px">Project description</h2><div style="padding:17px;border-radius:12px;background:#f2f4ea;color:#334237;font-size:14px;line-height:1.65">${emailSafe(input.description).replace(/\n/g, '<br>')}</div>${input.files?.length ? `<h2 style="margin:26px 0 10px;color:#253126;font-size:18px">Files</h2><ul>${input.files.map(file => `<li>${emailSafe(file)}</li>`).join('')}</ul>` : ''}` }),
        });

        // Send confirmation to customer
        await resend.emails.send({
          from: `KiwiKoru 3D <${env.emailFrom}>`,
          to: input.email,
          subject: "We've Received Your Quote Request",
          html: brandedEmail({ eyebrow: 'Request safely received', title: `Thanks, ${input.name} — let’s make it real.`, intro: 'Your idea is now with the KiwiKoru team. We’ll review the details and normally reply within 24 hours with the clearest way forward.', content: `${emailDetails([['Quantity', `<strong>${emailSafe(input.quantity)}</strong>`], ['Material', `<strong>${emailSafe(input.material)}</strong>`]])}<p style="margin:22px 0 0;color:#526158;font-size:14px;line-height:1.7">If you remember another useful detail, simply reply to this email. We’re here to help shape the practical path from digital idea to finished object.</p>` }),
        });

        return { success: true, message: "Quote request sent successfully. Check your email for confirmation." };
      } catch (error) {
        console.error("Email send error:", error);
        throw new Error("Failed to send email. Please try again or contact us directly.");
      }
    }),
});
