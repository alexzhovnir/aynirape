import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createContactRequestWorkflow } from "../../../workflows/create-contact-request";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { name, email, message } = req.body as any;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email, and message are required" });
  }

  try {
    const { result } = await createContactRequestWorkflow(req.scope).run({
      input: { name, email, message },
    });

    console.log(`[Email Notification] New Contact Request from ${name} (${email}): ${message}`);

    return res.status(200).json({ contactRequest: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
