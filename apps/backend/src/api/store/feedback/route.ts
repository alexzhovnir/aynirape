import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createFeedbackWorkflow } from "../../../workflows/create-feedback-request";
import { getClientIp, isRateLimited, sanitizeText } from "../../../utils/security";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const clientIp = getClientIp(req);
  if (isRateLimited(clientIp, 5, 10 * 60 * 1000)) {
    return res.status(429).json({ message: "Too many feedback submissions. Please try again later." });
  }

  const { name: rawName, rating: rawRating, comment: rawComment } = req.body as any;

  const name = sanitizeText(rawName, 100);
  const comment = sanitizeText(rawComment, 2000);
  const rating = Number(rawRating);

  if (!name || rawRating === undefined || !comment) {
    return res.status(400).json({ message: "Name, rating, and comment are required" });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be an integer between 1 and 5" });
  }

  try {
    const { result } = await createFeedbackWorkflow(req.scope).run({
      input: { name, rating, comment },
    });

    console.log(`[Email Notification] New Feedback submitted by ${name.replace(/[\r\n]/g, "")} (Rating: ${rating} stars): ${comment.slice(0, 100)}`);

    return res.status(200).json({ feedback: result });
  } catch (error) {
    console.error("Feedback creation error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const contactModuleService = req.scope.resolve("contact") as any;
    const feedbacks = await contactModuleService.listFeedbacks({
      is_approved: true,
    }, {
      order: {
        created_at: "DESC",
      }
    });

    return res.status(200).json({ feedbacks });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
