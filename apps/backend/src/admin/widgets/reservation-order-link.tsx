import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type { DetailWidgetProps, AdminReservation } from "@medusajs/types";
import { Badge, Container, Heading, Text } from "@medusajs/ui";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type OrderSummary = {
  id: string;
  display_id: number;
  email: string | null;
  status: string;
  fulfillment_status: string;
  payment_status: string;
};

const FULFILLMENT_LABELS: Record<string, string> = {
  not_fulfilled: "Not fulfilled",
  partially_fulfilled: "Partially fulfilled",
  fulfilled: "Fulfilled",
  partially_shipped: "Partially shipped",
  shipped: "Shipped",
  partially_delivered: "Partially delivered",
  delivered: "Delivered",
  canceled: "Canceled",
};

const ReservationOrderLinkWidget = ({
  data: reservation,
}: DetailWidgetProps<AdminReservation>) => {
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!reservation.line_item_id) {
      setIsLoading(false);
      return;
    }

    fetch(`/admin/order-line-items/${reservation.line_item_id}/order`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data: { order: OrderSummary | null }) => {
        if (isMounted) {
          setOrder(data.order);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [reservation.line_item_id]);

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Order</Heading>
      </div>

      <div className="flex flex-col gap-y-3 px-6 py-4">
        {isLoading && (
          <Text size="small" className="text-ui-fg-subtle">
            Loading order details…
          </Text>
        )}

        {!isLoading && !order && (
          <Text size="small" className="text-ui-fg-subtle">
            No order is linked to this reservation.
          </Text>
        )}

        {!isLoading && order && (
          <>
            <div className="flex items-center justify-between">
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Order
              </Text>
              <Link
                to={`/orders/${order.id}`}
                className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover txt-small"
              >
                #{order.display_id}
              </Link>
            </div>

            <div className="flex items-center justify-between">
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Fulfillment
              </Text>
              <Badge size="2xsmall" color={order.fulfillment_status === "not_fulfilled" ? "orange" : "green"}>
                {FULFILLMENT_LABELS[order.fulfillment_status] ?? order.fulfillment_status}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Payment
              </Text>
              <Badge size="2xsmall">{order.payment_status}</Badge>
            </div>

            {order.email && (
              <div className="flex items-center justify-between">
                <Text size="small" leading="compact" className="text-ui-fg-subtle">
                  Customer
                </Text>
                <Text size="small">{order.email}</Text>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "reservation.details.side.after",
});

export default ReservationOrderLinkWidget;
