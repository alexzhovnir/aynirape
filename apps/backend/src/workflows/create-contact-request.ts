import { createWorkflow, createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

interface CreateContactRequestInput {
  name: string;
  email: string;
  message: string;
}

const saveContactRequestStep = createStep(
  "save-contact-request-step",
  async (input: CreateContactRequestInput, { container }) => {
    const contactModuleService = container.resolve("contact") as any;
    const contactRequest = await contactModuleService.createContactRequests(input);
    return new StepResponse(contactRequest, contactRequest.id);
  },
  async (id: string, { container }) => {
    const contactModuleService = container.resolve("contact") as any;
    await contactModuleService.deleteContactRequests(id);
  }
);

export const createContactRequestWorkflow = createWorkflow(
  "create-contact-request",
  (input: CreateContactRequestInput) => {
    const contactRequest = saveContactRequestStep(input);
    return contactRequest;
  }
);
