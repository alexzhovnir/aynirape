import { createWorkflow, createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

interface CreateFeedbackInput {
  name: string;
  rating: number;
  comment: string;
}

const saveFeedbackStep = createStep(
  "save-feedback-step",
  async (input: CreateFeedbackInput, { container }) => {
    const contactModuleService = container.resolve("contact") as any;
    const feedback = await contactModuleService.createFeedbacks({
      ...input,
      is_approved: false,
    });
    return new StepResponse(feedback, feedback.id);
  },
  async (id: string, { container }) => {
    const contactModuleService = container.resolve("contact") as any;
    await contactModuleService.deleteFeedbacks(id);
  }
);

export const createFeedbackWorkflow = createWorkflow(
  "create-feedback",
  (input: CreateFeedbackInput) => {
    const feedback = saveFeedbackStep(input);
    return feedback;
  }
);
