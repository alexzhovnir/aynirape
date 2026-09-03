import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  batchShippingOptionRulesWorkflow,
  createShippingOptionsWorkflow,
} from "@medusajs/core-flows";
import {
  FREE_SHIPPING_RULE_ATTRIBUTE,
  FREE_SHIPPING_THRESHOLD,
} from "../utils/free-shipping";

const PAID_STANDARD_NAME = "Standard Shipping";
const FREE_STANDARD_NAME = "Free Shipping";

/**
 * Splits standard shipping into a paid option and a free one, each gated by the
 * `free_shipping_eligible` context that src/workflows/hooks/free-shipping-context.ts
 * derives from the cart subtotal. Only one of the two is ever offered to a cart.
 */
export default async function freeShippingOverThreshold({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: shippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: [
      "id",
      "name",
      "service_zone_id",
      "shipping_profile_id",
      "provider_id",
      "rules.id",
      "rules.attribute",
      "rules.value",
    ],
  });

  const paidStandard = shippingOptions.find(
    (option: any) => option.name === PAID_STANDARD_NAME
  );

  if (!paidStandard) {
    logger.warn(
      `"${PAID_STANDARD_NAME}" shipping option not found — skipping free shipping setup.`
    );
    return;
  }

  const alreadyGated = paidStandard.rules?.some(
    (rule: any) => rule.attribute === FREE_SHIPPING_RULE_ATTRIBUTE
  );

  if (!alreadyGated) {
    await batchShippingOptionRulesWorkflow(container).run({
      input: {
        create: [
          {
            attribute: FREE_SHIPPING_RULE_ATTRIBUTE,
            value: "false",
            operator: "eq",
            shipping_option_id: paidStandard.id,
          },
        ],
      },
    });
    logger.info(
      `Gated "${PAID_STANDARD_NAME}" to carts below €${FREE_SHIPPING_THRESHOLD}.`
    );
  }

  const freeAlreadyExists = shippingOptions.some(
    (option: any) => option.name === FREE_STANDARD_NAME
  );

  if (freeAlreadyExists) {
    logger.info(`"${FREE_STANDARD_NAME}" already exists — nothing to create.`);
    return;
  }

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: FREE_STANDARD_NAME,
        price_type: "flat",
        provider_id: paidStandard.provider_id,
        service_zone_id: paidStandard.service_zone_id,
        shipping_profile_id: paidStandard.shipping_profile_id,
        type: {
          label: FREE_STANDARD_NAME,
          description: `Delivery in 5-7 business days. Free for orders over €${FREE_SHIPPING_THRESHOLD}.`,
          code: "standard-free",
        },
        prices: [
          { currency_code: "usd", amount: 0 },
          { currency_code: "eur", amount: 0 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
          {
            attribute: FREE_SHIPPING_RULE_ATTRIBUTE,
            value: "true",
            operator: "eq",
          },
        ],
      },
    ],
  });

  logger.info(
    `Created "${FREE_STANDARD_NAME}" for carts from €${FREE_SHIPPING_THRESHOLD}.`
  );
}
