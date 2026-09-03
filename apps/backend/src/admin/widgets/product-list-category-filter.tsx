import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Label, Select } from "@medusajs/ui";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

type ProductCategory = {
  id: string;
  name: string;
};

const ALL_CATEGORIES_VALUE = "__all__";

const ProductListCategoryFilterWidget = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  useEffect(() => {
    let isMounted = true;

    fetch("/admin/product-categories?limit=1000", { credentials: "include" })
      .then((response) => response.json())
      .then((data: { product_categories?: ProductCategory[] }) => {
        if (isMounted) {
          setCategories(data.product_categories ?? []);
        }
      })
      .catch(() => {
        // Silently ignore — the filter simply won't offer any options.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const currentCategoryId = searchParams.get("category_id") ?? undefined;

  const handleChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      if (value === ALL_CATEGORIES_VALUE) {
        next.delete("category_id");
      } else {
        next.set("category_id", value);
      }

      next.delete("offset");

      return next;
    });
  };

  return (
    <Container className="flex items-center gap-x-3 px-6 py-4">
      <Label size="small">Category</Label>
      <div className="w-60">
        <Select
          value={currentCategoryId ?? ALL_CATEGORIES_VALUE}
          onValueChange={handleChange}
        >
          <Select.Trigger>
            <Select.Value placeholder="All categories" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={ALL_CATEGORIES_VALUE}>
              All categories
            </Select.Item>
            {categories.map((category) => (
              <Select.Item key={category.id} value={category.id}>
                {category.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.list.before",
});

export default ProductListCategoryFilterWidget;
