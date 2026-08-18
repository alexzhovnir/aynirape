import { sdk } from "@lib/sdk";
import fallbackProductsData from "./products.json";

function mapFallbackProduct(p: any) {
  const imageUrls = p.images && p.images.length > 0 ? p.images : [`/images/products/${p.handle}-0.webp`];
  const thumbnailUrl = imageUrls[0];

  const optionId = `opt_${p.handle}_size`;
  const isMultipleVariants = p.variants && p.variants.length > 1;
  const optionTitle = p.category === "tepi-and-kuripe" || p.category === "ornaments-and-decoration" ? "Style" : "Weight";

  const optionValues = (p.variants && p.variants.length > 0)
    ? p.variants.map((v: any, index: number) => ({
        id: `optval_${p.handle}_${index}`,
        value: v.title || v.size || (index === 0 ? "10g" : index === 1 ? "20g" : "50g"),
        option_id: optionId,
      }))
    : [
        {
          id: `optval_${p.handle}_0`,
          value: "Standard",
          option_id: optionId,
        }
      ];

  const options = [
    {
      id: optionId,
      title: optionTitle,
      values: optionValues,
    }
  ];

  const variants = (p.variants && p.variants.length > 0)
    ? p.variants.map((v: any, index: number) => {
        const price = v.price || p.price || 14.95;
        const optVal = optionValues[index] || { id: `optval_${p.handle}_${index}`, value: v.title || v.size || "10g", option_id: optionId };
        return {
          id: `var_${p.handle}_${index}`,
          title: v.title || v.size || "10g",
          sku: `${p.handle.toUpperCase()}-${(v.size || v.title || `${index + 1}`).toUpperCase()}`,
          options: [
            {
              id: optVal.id,
              option_id: optionId,
              value: optVal.value,
            }
          ],
          calculated_price: {
            calculated_amount: price,
            original_amount: price,
            currency_code: "eur",
            calculated_price: { price_list_type: "default" },
          },
          prices: [
            { amount: price, currency_code: "eur" }
          ]
        };
      })
    : [
        {
          id: `var_${p.handle}_0`,
          title: "Standard",
          sku: `${p.handle.toUpperCase()}-STD`,
          options: [
            {
              id: optionValues[0].id,
              option_id: optionId,
              value: optionValues[0].value,
            }
          ],
          calculated_price: {
            calculated_amount: p.price || 14.95,
            original_amount: p.price || 14.95,
            currency_code: "eur",
            calculated_price: { price_list_type: "default" },
          },
          prices: [
            { amount: p.price || 14.95, currency_code: "eur" }
          ]
        }
      ];

  const categoryName = p.category === "rape" ? "Sacred Rapé" : p.category === "tepi-and-kuripe" ? "Tepi & Kuripe" : p.category === "aromatics" ? "Aromatics & Resins" : p.category === "ornaments-and-decoration" ? "Ornaments & Decoration" : "Botanical Supplements";

  return {
    id: `prod_${p.handle}`,
    title: p.title,
    handle: p.handle,
    description: p.description,
    fullDescriptionHtml: p.fullDescriptionHtml,
    shortDescription: p.shortDescription,
    ingredients: p.ingredients,
    keyCharacteristics: p.keyCharacteristics,
    sections: p.sections,
    thumbnail: thumbnailUrl,
    images: imageUrls.map((url: string, i: number) => ({ id: `img_${i}`, url })),
    options,
    variants,
    categories: [
      {
        id: `cat_${p.category}`,
        name: categoryName,
        handle: p.category
      }
    ],
    metadata: {
      fullDescriptionHtml: p.fullDescriptionHtml,
      shortDescription: p.shortDescription,
      ingredients: p.ingredients,
      keyCharacteristics: p.keyCharacteristics,
      sections: p.sections,
      originalUrl: p.originalUrl,
    }
  };
}

const fallbackProducts: any[] = (fallbackProductsData as any[]).map(mapFallbackProduct);

function enrichProductWithRichData(prod: any) {
  if (!prod) return prod;
  const cleanHandle = prod.handle?.replace(/^prod_/, "") || prod.id?.replace(/^prod_/, "");
  const fallback = (fallbackProductsData as any[]).find(
    (f: any) => f.handle === cleanHandle || f.handle === prod.handle
  );

  if (fallback) {
    prod.metadata = {
      ...(prod.metadata || {}),
      fullDescriptionHtml: prod.metadata?.fullDescriptionHtml || fallback.fullDescriptionHtml,
      shortDescription: prod.metadata?.shortDescription || fallback.shortDescription,
      ingredients: prod.metadata?.ingredients || fallback.ingredients,
      keyCharacteristics: prod.metadata?.keyCharacteristics || fallback.keyCharacteristics,
      sections: prod.metadata?.sections || fallback.sections,
      originalUrl: prod.metadata?.originalUrl || fallback.originalUrl,
    };
    if (!prod.fullDescriptionHtml) prod.fullDescriptionHtml = fallback.fullDescriptionHtml;
    if (!prod.ingredients) prod.ingredients = fallback.ingredients;
    if (!prod.keyCharacteristics) prod.keyCharacteristics = fallback.keyCharacteristics;
    if (!prod.sections) prod.sections = fallback.sections;
  }
  return prod;
}

export const listProducts = async (regionId: string, categoryId?: string) => {
  try {
    const { products } = await sdk.store.product.list({
      region_id: regionId,
      fields: "*variants.calculated_price,*variants.options,*options,*options.values,*categories,*images,+metadata",
      ...(categoryId ? { category_id: [categoryId] } : {}),
    });
    if (products && products.length > 0) {
      return products.map(enrichProductWithRichData);
    }
  } catch (error) {
    console.error("listProducts fetch error:", error);
  }

  // Fallback if Medusa API returns empty or fails
  if (categoryId) {
    const targetCat = categoryId === "rap-e" ? "rape" : categoryId === "rape" ? "rap-e" : categoryId;
    return fallbackProducts.filter((p) =>
      p.categories.some(
        (c: any) =>
          c.id === categoryId ||
          c.handle === categoryId ||
          c.handle === targetCat
      )
    );
  }
  return fallbackProducts;
};

export const listCategories = async () => {
  try {
    const { product_categories } = await sdk.store.category.list();
    if (product_categories && product_categories.length > 0) {
      return product_categories;
    }
  } catch (error) {
    console.error("listCategories fetch error:", error);
  }

  return [
    { id: "cat_rape", name: "Sacred Rapé", handle: "rape" },
    { id: "cat_tepi-and-kuripe", name: "Tepi & Kuripe", handle: "tepi-and-kuripe" },
    { id: "cat_aromatics", name: "Aromatics & Resins", handle: "aromatics" },
    { id: "cat_supplements", name: "Botanical Supplements", handle: "supplements" },
    { id: "cat_ornaments-and-decoration", name: "Ornaments & Decoration", handle: "ornaments-and-decoration" },
  ];
};

export const retrieveProduct = async (
  idOrHandle: string,
  regionId: string,
) => {
  const cleanHandle = idOrHandle.startsWith("prod_") ? idOrHandle.replace(/^prod_/, "") : idOrHandle;
  try {
    const { products } = await sdk.store.product.list({
      handle: cleanHandle,
      region_id: regionId,
      fields:
        "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options,*options,*options.values,+metadata,+tags,*categories,*images",
    });

    if (products && products.length > 0) {
      return enrichProductWithRichData(products[0]);
    }

    const { product } = await sdk.store.product.retrieve(idOrHandle, {
      region_id: regionId,
      fields:
        "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options,*options,*options.values,+metadata,+tags,*categories,*images",
    });
    if (product) return enrichProductWithRichData(product);
  } catch (error) {
    console.error("retrieveProduct fetch error:", error);
  }

  // Fallback to local fallbackProducts
  const found = fallbackProducts.find(
    (p: any) =>
      p.handle === idOrHandle ||
      p.id === idOrHandle ||
      p.handle === cleanHandle ||
      p.id === `prod_${cleanHandle}`
  );
  return found || fallbackProducts[0];
};
