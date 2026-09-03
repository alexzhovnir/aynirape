import { defineWidgetConfig } from "@medusajs/admin-sdk";
import {
  Container,
  Heading,
  Input,
  Label,
  Select,
  Table,
  Text,
} from "@medusajs/ui";
import { useEffect, useMemo, useState } from "react";

type Category = { id: string; name: string };

type SalesRow = {
  id: string;
  sku: string | null;
  title: string | null;
  reserved_quantity: number;
  stocked_quantity: number;
  weight: string | null;
  product_title: string | null;
  category_id: string | null;
  category_name: string | null;
  sold_quantity: number;
};

type Totals = { reserved: number; stocked: number; sold: number };

const ALL_VALUE = "__all__";

const numberFormatter = new Intl.NumberFormat();

const InventorySalesReportWidget = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [weights, setWeights] = useState<string[]>([]);
  const [rows, setRows] = useState<SalesRow[]>([]);
  const [totals, setTotals] = useState<Totals>({ reserved: 0, stocked: 0, sold: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [categoryId, setCategoryId] = useState(ALL_VALUE);
  const [weight, setWeight] = useState(ALL_VALUE);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetch("/admin/product-categories?limit=1000", { credentials: "include" })
      .then((response) => response.json())
      .then((data: { product_categories?: Category[] }) => {
        setCategories(data.product_categories ?? []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (categoryId !== ALL_VALUE) params.set("category_id", categoryId);
    if (weight !== ALL_VALUE) params.set("weight", weight);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);

    setIsLoading(true);
    fetch(`/admin/custom/inventory-sales?${params.toString()}`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data: { rows: SalesRow[]; totals: Totals }) => {
        setRows(data.rows ?? []);
        setTotals(data.totals ?? { reserved: 0, stocked: 0, sold: 0 });
        setWeights((current) => {
          if (current.length > 0) return current;
          const unique = Array.from(
            new Set((data.rows ?? []).map((row) => row.weight).filter(Boolean))
          ) as string[];
          return unique.sort();
        });
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [categoryId, weight, dateFrom, dateTo]);

  const hasActiveFilters = useMemo(
    () => categoryId !== ALL_VALUE || weight !== ALL_VALUE || dateFrom || dateTo,
    [categoryId, weight, dateFrom, dateTo]
  );

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Sales report</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Reserved, in stock, and sold quantities per item.
          </Text>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 px-6 py-4 sm:grid-cols-4">
        <div className="flex flex-col gap-y-2">
          <Label size="small">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <Select.Trigger>
              <Select.Value placeholder="All categories" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value={ALL_VALUE}>All categories</Select.Item>
              {categories.map((category) => (
                <Select.Item key={category.id} value={category.id}>
                  {category.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>

        <div className="flex flex-col gap-y-2">
          <Label size="small">Weight</Label>
          <Select value={weight} onValueChange={setWeight}>
            <Select.Trigger>
              <Select.Value placeholder="All weights" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value={ALL_VALUE}>All weights</Select.Item>
              {weights.map((w) => (
                <Select.Item key={w} value={w}>
                  {w}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>

        <div className="flex flex-col gap-y-2">
          <Label size="small">Sold from</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-y-2">
          <Label size="small">Sold to</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Title</Table.HeaderCell>
              <Table.HeaderCell>SKU</Table.HeaderCell>
              <Table.HeaderCell>Category</Table.HeaderCell>
              <Table.HeaderCell>Weight</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Reserved</Table.HeaderCell>
              <Table.HeaderCell className="text-right">In stock</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Sold</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={row.id}>
                <Table.Cell>{row.product_title ?? row.title ?? "—"}</Table.Cell>
                <Table.Cell>{row.sku ?? "—"}</Table.Cell>
                <Table.Cell>{row.category_name ?? "—"}</Table.Cell>
                <Table.Cell>{row.weight ?? "—"}</Table.Cell>
                <Table.Cell className="text-right">
                  {numberFormatter.format(row.reserved_quantity)}
                </Table.Cell>
                <Table.Cell className="text-right">
                  {numberFormatter.format(row.stocked_quantity)}
                </Table.Cell>
                <Table.Cell className="text-right">
                  {numberFormatter.format(row.sold_quantity)}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {!isLoading && rows.length === 0 && (
          <div className="px-6 py-8 text-center">
            <Text size="small" className="text-ui-fg-subtle">
              No items match the selected filters.
            </Text>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-x-8 px-6 py-4">
        <div className="flex items-center gap-x-2">
          <Text size="small" className="text-ui-fg-subtle">
            {hasActiveFilters ? "Reserved (filtered)" : "Reserved"}
          </Text>
          <Text size="small" weight="plus">
            {numberFormatter.format(totals.reserved)}
          </Text>
        </div>
        <div className="flex items-center gap-x-2">
          <Text size="small" className="text-ui-fg-subtle">
            {hasActiveFilters ? "In stock (filtered)" : "In stock"}
          </Text>
          <Text size="small" weight="plus">
            {numberFormatter.format(totals.stocked)}
          </Text>
        </div>
        <div className="flex items-center gap-x-2">
          <Text size="small" className="text-ui-fg-subtle">
            {hasActiveFilters ? "Sold (filtered)" : "Sold"}
          </Text>
          <Text size="small" weight="plus">
            {numberFormatter.format(totals.sold)}
          </Text>
        </div>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "inventory_item.list.after",
});

export default InventorySalesReportWidget;
