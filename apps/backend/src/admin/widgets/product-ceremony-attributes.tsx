import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type { DetailWidgetProps, AdminProduct } from "@medusajs/types";
import { Button, Container, Heading, Input, Label, Select, toast } from "@medusajs/ui";
import { useState } from "react";

const STRENGTH_OPTIONS = ["Mild", "Medium", "Strong"];

const ProductCeremonyAttributesWidget = ({
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const metadata = (product.metadata ?? {}) as Record<string, unknown>;

  const [tribe, setTribe] = useState(String(metadata.tribe ?? ""));
  const [strength, setStrength] = useState(String(metadata.strength ?? ""));
  const [ingredients, setIngredients] = useState(
    String(metadata.ingredients ?? ""),
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/admin/products/${product.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            ...metadata,
            tribe: tribe.trim() || null,
            strength: strength.trim() || null,
            ingredients: ingredients.trim() || null,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast.success("Saved", {
        description: "Ceremony attributes were updated.",
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
        <Heading level="h2">Ceremony Attributes</Heading>
      </div>

      <div className="grid grid-cols-1 gap-4 px-6 py-4 sm:grid-cols-3">
        <div className="flex flex-col gap-y-2">
          <Label size="small">Tribe</Label>
          <Input
            value={tribe}
            onChange={(e) => setTribe(e.target.value)}
            placeholder="e.g. Huni Kuin"
          />
        </div>

        <div className="flex flex-col gap-y-2">
          <Label size="small">Strength</Label>
          <Select value={strength || undefined} onValueChange={setStrength}>
            <Select.Trigger>
              <Select.Value placeholder="Select strength" />
            </Select.Trigger>
            <Select.Content>
              {STRENGTH_OPTIONS.map((option) => (
                <Select.Item key={option} value={option}>
                  {option}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>

        <div className="flex flex-col gap-y-2">
          <Label size="small">Ingredients</Label>
          <Input
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g. Mapacho, Tsunu ash"
          />
        </div>
      </div>

      <div className="flex items-center justify-end px-6 py-4">
        <Button size="small" onClick={handleSave} isLoading={isSaving}>
          Save attributes
        </Button>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default ProductCeremonyAttributesWidget;
