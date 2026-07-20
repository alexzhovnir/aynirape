import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createFeedbackWorkflow } from "../../../workflows/create-feedback-request";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { name, rating, comment } = req.body as any;

  if (!name || rating === undefined || !comment) {
    return res.status(400).json({ message: "Name, rating, and comment are required" });
  }

  try {
    const { result } = await createFeedbackWorkflow(req.scope).run({
      input: { name, rating: Number(rating), comment },
    });

    console.log(`[Email Notification] New Feedback submitted by ${name} (Rating: ${rating} stars): ${comment}`);

    return res.status(200).json({ feedback: result });
  } catch (error) {
    console.error(error);
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
