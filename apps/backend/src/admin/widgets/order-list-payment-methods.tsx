import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Table, Text } from "@medusajs/ui";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type PaymentRow = {
  id: string;
  display_id: number;
  email: string | null;
  created_at: string | null;
  payment_method: string;
  payment_collection_status: string | null;
};

const OrderListPaymentMethodsWidget = () => {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch("/admin/custom/order-payments?limit=50", { credentials: "include" })
      .then((response) => response.json())
      .then((data: { rows: PaymentRow[] }) => {
        if (isMounted) {
          setRows(data.rows ?? []);
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
  }, []);

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Payment methods</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          How the 50 most recent orders were paid.
        </Text>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Order</Table.HeaderCell>
              <Table.HeaderCell>Customer</Table.HeaderCell>
              <Table.HeaderCell>Payment method</Table.HeaderCell>
              <Table.HeaderCell>Payment collection</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={row.id}>
                <Table.Cell>
                  <Link
                    to={`/orders/${row.id}`}
                    className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                  >
                    #{row.display_id}
                  </Link>
                </Table.Cell>
                <Table.Cell>{row.email ?? "—"}</Table.Cell>
                <Table.Cell>{row.payment_method}</Table.Cell>
                <Table.Cell>{row.payment_collection_status ?? "—"}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {!isLoading && rows.length === 0 && (
          <div className="px-6 py-8 text-center">
            <Text size="small" className="text-ui-fg-subtle">
              No orders yet.
            </Text>
          </div>
        )}
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "order.list.after",
});

export default OrderListPaymentMethodsWidget;
