import { createWorkflow, createStep, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk";

interface CreateContactRequestInput {
  name: string;
  email: string;
  message: string;
}

const saveContactRequest = createStep(
  "save-contact-request",
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
    const contactRequest = saveContactRequest(input);
    return new WorkflowResponse(contactRequest);
  }
);
