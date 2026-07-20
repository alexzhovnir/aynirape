import { model } from "@medusajs/framework/utils";

const Feedback = model.define("feedback", {
  id: model.id().primaryKey(),
  name: model.text(),
  rating: model.number(),
  comment: model.text(),
  is_approved: model.boolean().default(false),
});

export default Feedback;
