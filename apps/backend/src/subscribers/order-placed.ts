import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderService = container.resolve("order") as any;

  try {
    const order = await orderService.retrieveOrder(data.id, {
      relations: ["items", "shipping_address"],
    });

    console.log(`[Notification Engine] Processing transactional confirmation email for Order #${order.display_id || order.id} to ${order.email}`);
    // Email dispatch handler (Resend / SMTP integration)
  } catch (error) {
    console.error(`Failed to handle order.placed subscriber for order ${data.id}:`, error);
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
