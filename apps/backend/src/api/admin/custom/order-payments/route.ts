import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { collectPaymentMethods } from "../../../../utils/payment-method";

const DEFAULT_LIMIT = 50;

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { order_id, limit } = req.query as Record<string, string | undefined>;

  const take = Number(limit) > 0 ? Math.min(Number(limit), 200) : DEFAULT_LIMIT;

  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "created_at",
      "payment_collections.status",
      "payment_collections.payments.provider_id",
    ],
    ...(order_id ? { filters: { id: order_id } } : {}),
    pagination: { take, order: { created_at: "DESC" } },
  } as any);

  const rows = (orders as any[]).map((order) => ({
    id: order.id,
    display_id: order.display_id,
    email: order.email ?? null,
    created_at: order.created_at ?? null,
    payment_method: collectPaymentMethods(order.payment_collections),
    payment_collection_status: order.payment_collections?.[0]?.status ?? null,
  }));

  res.json({ rows, count: rows.length });
}
