import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type { DetailWidgetProps, AdminProduct } from "@medusajs/types";
import { Button, Container, Heading, Input, Label, Text, toast } from "@medusajs/ui";
import { useState } from "react";

const ProductDisplayOrderWidget = ({
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const metadata = (product.metadata ?? {}) as Record<string, unknown>;

  const initialSortOrder = Number(metadata.sort_order);
  const [sortOrder, setSortOrder] = useState(
    metadata.sort_order !== undefined &&
      metadata.sort_order !== null &&
      Number.isFinite(initialSortOrder)
      ? String(initialSortOrder)
      : "",
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = sortOrder.trim();
    const parsed = trimmed === "" ? null : Number(trimmed);

    if (parsed !== null && !Number.isFinite(parsed)) {
      toast.error("Invalid value", {
        description: "Sort order must be a number.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/admin/products/${product.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            ...metadata,
            sort_order: parsed,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast.success("Saved", {
        description: "Display order was updated.",
      });
    } catch (error) {
      toast.error("Failed to save", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Display Order</Heading>
      </div>

      <div className="grid grid-cols-1 gap-4 px-6 py-4 sm:grid-cols-3">
        <div className="flex flex-col gap-y-2">
          <Label size="small">Sort order</Label>
          <Input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            placeholder="e.g. 10"
          />
          <Text size="small" className="text-ui-fg-subtle">
            Lower numbers show first. Leave empty to keep default order.
          </Text>
        </div>
      </div>

      <div className="flex items-center justify-end px-6 py-4">
        <Button size="small" onClick={handleSave} isLoading={isSaving}>
          Save
        </Button>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default ProductDisplayOrderWidget;
