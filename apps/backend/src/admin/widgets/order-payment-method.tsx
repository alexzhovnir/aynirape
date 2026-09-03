import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type { DetailWidgetProps, AdminOrder } from "@medusajs/types";
import { Badge, Container, Heading, Text } from "@medusajs/ui";
import { useEffect, useState } from "react";

type PaymentRow = {
  id: string;
  payment_method: string;
  payment_collection_status: string | null;
};

const OrderPaymentMethodWidget = ({
  data: order,
}: DetailWidgetProps<AdminOrder>) => {
  const [row, setRow] = useState<PaymentRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch(`/admin/custom/order-payments?order_id=${order.id}`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data: { rows: PaymentRow[] }) => {
        if (isMounted) {
          setRow(data.rows?.[0] ?? null);
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
  }, [order.id]);

  const paymentStatus = (order as any).payment_status as string | undefined;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Payment</Heading>
      </div>

      <div className="flex flex-col gap-y-3 px-6 py-4">
        <div className="flex items-center justify-between">
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Method
          </Text>
          <Text size="small">
            {isLoading ? "…" : (row?.payment_method ?? "—")}
          </Text>
        </div>

        <div className="flex items-center justify-between">
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Status
          </Text>
          <Badge
            size="2xsmall"
            color={paymentStatus === "captured" ? "green" : "orange"}
          >
            {paymentStatus ?? "—"}
          </Badge>
        </div>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "order.details.side.before",
});

export default OrderPaymentMethodWidget;
