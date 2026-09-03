import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { getOrderDetailWorkflow } from "@medusajs/core-flows";
import { toOrderSummary } from "../../../../../utils/order-summary";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id"],
    filters: {
      items: {
        id,
      },
    } as Record<string, unknown>,
  });

  const orderId = orders[0]?.id;

  if (!orderId) {
    res.json({ order: null });
    return;
  }

  const { result: order } = await getOrderDetailWorkflow(req.scope).run({
    input: {
      order_id: orderId,
      fields: ["id", "display_id", "email", "status"],
    },
  });

  res.json({ order: toOrderSummary(order as any) });
}
