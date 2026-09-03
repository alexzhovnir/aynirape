export type OrderSummary = {
  id: string;
  display_id: number;
  email: string | null;
  status: string;
  fulfillment_status: string;
  payment_status: string;
};

export type RawOrderDetail = {
  id: string;
  display_id: number;
  email?: string | null;
  status: string;
  fulfillment_status?: string | null;
  payment_status?: string | null;
};

export function toOrderSummary(order: RawOrderDetail): OrderSummary {
  return {
    id: order.id,
    display_id: order.display_id,
    email: order.email ?? null,
    status: order.status,
    fulfillment_status: order.fulfillment_status ?? "not_fulfilled",
    payment_status: order.payment_status ?? "not_paid",
  };
}
