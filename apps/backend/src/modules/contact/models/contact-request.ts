import { model } from "@medusajs/framework/utils";

const ContactRequest = model.define("contact_request", {
  id: model.id().primaryKey(),
  name: model.text(),
  email: model.text(),
  message: model.text(),
});

export default ContactRequest;
