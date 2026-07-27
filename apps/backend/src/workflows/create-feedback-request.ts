import { createWorkflow, createStep, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk";

interface CreateFeedbackInput {
  name: string;
  rating: number;
  comment: string;
}

const saveFeedback = createStep(
  "save-feedback",
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
    const feedback = saveFeedback(input);
    return new WorkflowResponse(feedback);
  }
);
