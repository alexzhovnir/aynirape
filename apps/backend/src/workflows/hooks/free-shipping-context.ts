import {
  listShippingOptionsForCartWorkflow,
  listShippingOptionsForCartWithPricingWorkflow,
} from "@medusajs/core-flows";
import { StepResponse } from "@medusajs/framework/workflows-sdk";
import { buildFreeShippingContext } from "../../utils/free-shipping";

// Both workflows must expose the same context: the first one lists options during
// checkout, the second one runs again when the method is added to the cart.
const setFreeShippingContext = async ({ cart }: { cart: any }) =>
  new StepResponse(buildFreeShippingContext(cart));

listShippingOptionsForCartWorkflow.hooks.setShippingOptionsContext(
  setFreeShippingContext
);

listShippingOptionsForCartWithPricingWorkflow.hooks.setShippingOptionsContext(
  setFreeShippingContext
);
