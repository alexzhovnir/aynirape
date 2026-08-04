import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createContactRequestWorkflow } from "../../../workflows/create-contact-request";
import { getClientIp, isRateLimited, isValidEmail, sanitizeText } from "../../../utils/security";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const clientIp = getClientIp(req);
  if (isRateLimited(clientIp, 5, 10 * 60 * 1000)) {
    return res.status(429).json({ message: "Too many contact requests. Please try again later." });
  }

  const { name: rawName, email: rawEmail, message: rawMessage } = req.body as any;

  const name = sanitizeText(rawName, 100);
  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
  const message = sanitizeText(rawMessage, 3000);

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email, and message are required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email address format" });
  }

  try {
    const { result } = await createContactRequestWorkflow(req.scope).run({
      input: { name, email, message },
    });

    console.log(`[Email Notification] New Contact Request from ${name.replace(/[\r\n]/g, "")} (${email}): ${message.slice(0, 100)}`);

    return res.status(200).json({ contactRequest: result });
  } catch (error) {
    console.error("Contact request creation error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
