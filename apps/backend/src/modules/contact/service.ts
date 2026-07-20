import { MedusaService } from "@medusajs/framework/utils";
import ContactRequest from "./models/contact-request";
import Feedback from "./models/feedback";

class ContactModuleService extends MedusaService({
  ContactRequest,
  Feedback,
}) {}

export default ContactModuleService;
