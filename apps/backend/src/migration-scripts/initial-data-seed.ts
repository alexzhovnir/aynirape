import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductOptionsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  const countries = ["gb", "de", "dk", "se", "fr", "es", "it"];

  logger.info("Seeding store data...");
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Default Sales Channel",
          description: "Created by Medusa",
        },
      ],
    },
  });

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Default Publishable API Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  });

  const {
    result: [store],
  } = await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "Ayni Rape Store",
          supported_currencies: [
            {
              currency_code: "eur",
              is_default: true,
            },
            {
              currency_code: "usd",
              is_default: false,
            },
          ],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  });

  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Europe",
          currency_code: "eur",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "European Warehouse",
          address: {
            city: "Copenhagen",
            country_code: "DK",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "European Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Europe",
        geo_zones: [
          { country_code: "gb", type: "country" },
          { country_code: "de", type: "country" },
          { country_code: "dk", type: "country" },
          { country_code: "se", type: "country" },
          { country_code: "fr", type: "country" },
          { country_code: "es", type: "country" },
          { country_code: "it", type: "country" },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard Shipping",
          description: "Delivery in 5-7 business days. Free for orders over €150.",
          code: "standard",
        },
        prices: [
          { currency_code: "usd", amount: 6 },
          { currency_code: "eur", amount: 5 },
          { region_id: region.id, amount: 5 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
      {
        name: "DHL Express",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "DHL Express",
          description: "Delivery in 3-5 business days.",
          code: "express",
        },
        prices: [
          { currency_code: "usd", amount: 14 },
          { currency_code: "eur", amount: 12 },
          { region_id: region.id, amount: 12 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  });

  logger.info("Seeding categories...");
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        { name: "Rapé", is_active: true },
        { name: "Tepi and Kuripe", is_active: true },
        { name: "Aromatics", is_active: true },
        { name: "Supplements", is_active: true },
        { name: "Ornaments and decoration", is_active: true },
      ],
    },
  });

  logger.info("Seeding options...");
  const { result: productOptionsResult } = await createProductOptionsWorkflow(
    container
  ).run({
    input: {
      product_options: [
        { title: "Weight", values: ["5g", "10g", "20g"] },
        { title: "Standard", values: ["Default"] },
      ],
    },
  });
  const weightOption = productOptionsResult.find((o) => o.title === "Weight")!;
  const standardOption = productOptionsResult.find((o) => o.title === "Standard")!;

  logger.info("Seeding products...");
  const getCatId = (name: string) => categoryResult.find((c) => c.name === name)!.id;

  const productsToCreate = [
    // --- RAPÉ ---
    {
      title: "Nukini Sansara",
      category_ids: [getCatId("Rapé")],
      thumbnail: "/images/blog/rape/nukini-1504.23abece79ac5bad050fdc8779f1c5b53.webp",
      images: [{ url: "/images/blog/rape/nukini-1504.23abece79ac5bad050fdc8779f1c5b53.webp" }],
      description: "Prepared by the Nukini tribe, including rare Sansara leaves. Sansara is highly respected in indigenous medicine for deep spiritual strength, clarity, and grounding.",
      handle: "nukini-sansara",
      weight: 100,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {
        tribe: "Nukini",
        strength: "Medium",
        ingredients: "Mapacho, Tsunu ash, Sansara leaves",
      },
      options: [{ id: weightOption.id }],
      variants: [
        {
          title: "5g",
          sku: "RAPE-NUKINI-5G",
          options: { Weight: "5g" },
          prices: [
            { amount: 15, currency_code: "eur" },
            { amount: 18, currency_code: "usd" },
          ],
        },
        {
          title: "10g",
          sku: "RAPE-NUKINI-10G",
          options: { Weight: "10g" },
          prices: [
            { amount: 28, currency_code: "eur" },
            { amount: 32, currency_code: "usd" },
          ],
        },
        {
          title: "20g",
          sku: "RAPE-NUKINI-20G",
          options: { Weight: "20g" },
          prices: [
            { amount: 50, currency_code: "eur" },
            { amount: 58, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
    },
    {
      title: "Huni Kuin",
      category_ids: [getCatId("Rapé")],
      thumbnail: "/images/blog/rape/huni-kuin-1404.c8a1014cf868eec84ebc440a5301bfcd.webp",
      images: [{ url: "/images/blog/rape/huni-kuin-1404.c8a1014cf868eec84ebc440a5301bfcd.webp" }],
      description: "Traditional Huni Kuin blend. Grounded in deep forest energy, providing excellent clarity, focus, and alignment during rituals.",
      handle: "huni-kuin",
      weight: 100,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {
        tribe: "Huni Kuin",
        strength: "Strong",
        ingredients: "Mapacho, Tsunu ash, local herbs",
      },
      options: [{ id: weightOption.id }],
      variants: [
        {
          title: "5g",
          sku: "RAPE-HUNIKUIN-5G",
          options: { Weight: "5g" },
          prices: [
            { amount: 14, currency_code: "eur" },
            { amount: 16, currency_code: "usd" },
          ],
        },
        {
          title: "10g",
          sku: "RAPE-HUNIKUIN-10G",
          options: { Weight: "10g" },
          prices: [
            { amount: 26, currency_code: "eur" },
            { amount: 30, currency_code: "usd" },
          ],
        },
        {
          title: "20g",
          sku: "RAPE-HUNIKUIN-20G",
          options: { Weight: "20g" },
          prices: [
            { amount: 48, currency_code: "eur" },
            { amount: 54, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
    },
    {
      title: "Yawanawa Tsunu",
      category_ids: [getCatId("Rapé")],
      thumbnail: "/images/blog/rape/yavanawa-1504.aa960525f69629782ccf9275b27102c6.webp",
      images: [{ url: "/images/blog/rape/yavanawa-1504.aa960525f69629782ccf9275b27102c6.webp" }],
      description: "Classical Yawanawa blend made with Mapacho and Tsunu ash. Highly cleansing, centering, and protective.",
      handle: "yawanawa-tsunu",
      weight: 100,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {
        tribe: "Yawanawa",
        strength: "Strong",
        ingredients: "Mapacho, Tsunu ash",
      },
      options: [{ id: weightOption.id }],
      variants: [
        {
          title: "5g",
          sku: "RAPE-YAWANAWA-5G",
          options: { Weight: "5g" },
          prices: [
            { amount: 15, currency_code: "eur" },
            { amount: 18, currency_code: "usd" },
          ],
        },
        {
          title: "10g",
          sku: "RAPE-YAWANAWA-10G",
          options: { Weight: "10g" },
          prices: [
            { amount: 28, currency_code: "eur" },
            { amount: 32, currency_code: "usd" },
          ],
        },
        {
          title: "20g",
          sku: "RAPE-YAWANAWA-20G",
          options: { Weight: "20g" },
          prices: [
            { amount: 50, currency_code: "eur" },
            { amount: 58, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
    },
    {
      title: "Spiritual Cleanse",
      category_ids: [getCatId("Rapé")],
      thumbnail: "/images/blog/rape/spiritual-cleanse-1504.acee2e127356f3967513c528b9ee0ad6.webp",
      images: [{ url: "/images/blog/rape/spiritual-cleanse-1504.acee2e127356f3967513c528b9ee0ad6.webp" }],
      description: "A special blend designed for deep energetic cleansing, removal of negative vibes, and deep meditation.",
      handle: "spiritual-cleanse",
      weight: 100,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {
        tribe: "Mixed",
        strength: "Strong",
        ingredients: "Mapacho, forest ashes, sacred flowers",
      },
      options: [{ id: weightOption.id }],
      variants: [
        {
          title: "5g",
          sku: "RAPE-CLEANSE-5G",
          options: { Weight: "5g" },
          prices: [
            { amount: 16, currency_code: "eur" },
            { amount: 19, currency_code: "usd" },
          ],
        },
        {
          title: "10g",
          sku: "RAPE-CLEANSE-10G",
          options: { Weight: "10g" },
          prices: [
            { amount: 30, currency_code: "eur" },
            { amount: 35, currency_code: "usd" },
          ],
        },
        {
          title: "20g",
          sku: "RAPE-CLEANSE-20G",
          options: { Weight: "20g" },
          prices: [
            { amount: 55, currency_code: "eur" },
            { amount: 62, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
    },
    {
      title: "Força Feminina",
      category_ids: [getCatId("Rapé")],
      thumbnail: "/images/blog/rape/forca-feminina-1504.ef7ddad446abde456364aaf765e77e78.webp",
      images: [{ url: "/images/blog/rape/forca-feminina-1504.ef7ddad446abde456364aaf765e77e78.webp" }],
      description: "A gentle yet deep blend supporting feminine energy, emotional balance, and heart-centered connection.",
      handle: "forca-feminina",
      weight: 100,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {
        tribe: "Yawanawa",
        strength: "Medium",
        ingredients: "Mapacho, Tsunu ash, native herbs",
      },
      options: [{ id: weightOption.id }],
      variants: [
        {
          title: "5g",
          sku: "RAPE-FORCA-5G",
          options: { Weight: "5g" },
          prices: [
            { amount: 15, currency_code: "eur" },
            { amount: 18, currency_code: "usd" },
          ],
        },
        {
          title: "10g",
          sku: "RAPE-FORCA-10G",
          options: { Weight: "10g" },
          prices: [
            { amount: 28, currency_code: "eur" },
            { amount: 32, currency_code: "usd" },
          ],
        },
        {
          title: "20g",
          sku: "RAPE-FORCA-20G",
          options: { Weight: "20g" },
          prices: [
            { amount: 50, currency_code: "eur" },
            { amount: 58, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
    },

    // --- TEPI AND KURIPE ---
    {
      title: "Kuripe Wolf Sawo",
      category_ids: [getCatId("Tepi and Kuripe")],
      thumbnail: "/images/blog/kuripe-wolf-sawo.02682445cd108ab57e6f69e9a16ce418.webp",
      images: [{ url: "/images/blog/kuripe-wolf-sawo.02682445cd108ab57e6f69e9a16ce418.webp" }],
      description: "Handcrafted personal applicator made from premium Sawo wood, beautifully carved with a wolf design.",
      handle: "kuripe-wolf-sawo",
      weight: 50,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {},
      options: [{ id: standardOption.id }],
      variants: [
        {
          title: "Default",
          sku: "KURIPE-WOLF",
          options: { Standard: "Default" },
          prices: [
            { amount: 35, currency_code: "eur" },
            { amount: 40, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
    },
    {
      title: "Kuripe Colibri Teak",
      category_ids: [getCatId("Tepi and Kuripe")],
      thumbnail: "/images/blog/kolibri-teak.c6c0e21a20358358ba4cfc9a759bfa19.webp",
      images: [{ url: "/images/blog/kolibri-teak.c6c0e21a20358358ba4cfc9a759bfa19.webp" }],
      description: "Elegant personal applicator crafted from durable Teak wood, featuring a colibri pattern.",
      handle: "kuripe-colibri-teak",
      weight: 50,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {},
      options: [{ id: standardOption.id }],
      variants: [
        {
          title: "Default",
          sku: "KURIPE-COLIBRI",
          options: { Standard: "Default" },
          prices: [
            { amount: 38, currency_code: "eur" },
            { amount: 44, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
    },
    {
      title: "Tepi Shipibo Large",
      category_ids: [getCatId("Tepi and Kuripe")],
      thumbnail: "/images/blog/shipibo-large.fcfb9e6259c49036440a5c7a50dd18f2.webp",
      images: [{ url: "/images/blog/shipibo-large.fcfb9e6259c49036440a5c7a50dd18f2.webp" }],
      description: "A long ceremonial blow pipe with traditional Shipibo geometric patterns, hand carved by native craftsmen.",
      handle: "tepi-shipibo-large",
      weight: 150,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {},
      options: [{ id: standardOption.id }],
      variants: [
        {
          title: "Default",
          sku: "TEPI-SHIPIBO",
          options: { Standard: "Default" },
          prices: [
            { amount: 65, currency_code: "eur" },
            { amount: 75, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
    },
    {
      title: "Kuripe Standard",
      category_ids: [getCatId("Tepi and Kuripe")],
      thumbnail: "/images/blog/kuripe-peru-standard.ed06a9022699de6ffdfb24d54859a8fe.webp",
      images: [{ url: "/images/blog/kuripe-peru-standard.ed06a9022699de6ffdfb24d54859a8fe.webp" }],
      description: "Classic V-shaped bamboo applicator for personal use. Simple, authentic, and functional.",
      handle: "kuripe-standard",
      weight: 30,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {},
      options: [{ id: standardOption.id }],
      variants: [
        {
          title: "Default",
          sku: "KURIPE-STANDARD",
          options: { Standard: "Default" },
          prices: [
            { amount: 15, currency_code: "eur" },
            { amount: 18, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
    },
    {
      title: "Kuripe Eagle Teak",
      category_ids: [getCatId("Tepi and Kuripe")],
      thumbnail: "/images/blog/eagle-kuripe-teak.7fa1b057159ba87f1513d1a7ce647a64.webp",
      images: [{ url: "/images/blog/eagle-kuripe-teak.7fa1b057159ba87f1513d1a7ce647a64.webp" }],
      description: "Artisanal personal applicator crafted from Teak wood, designed with a majestic eagle motif.",
      handle: "kuripe-eagle-teak",
      weight: 50,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {},
      options: [{ id: standardOption.id }],
      variants: [
        {
          title: "Default",
          sku: "KURIPE-EAGLE-TEAK",
          options: { Standard: "Default" },
          prices: [
            { amount: 42, currency_code: "eur" },
            { amount: 48, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
    },
    {
      title: "Kuripe Double Crocodile",
      category_ids: [getCatId("Tepi and Kuripe")],
      thumbnail: "/images/blog/kuripe-double-crocodile.69913c0a83836468859722db90ae46ed.webp",
      images: [{ url: "/images/blog/kuripe-double-crocodile.69913c0a83836468859722db90ae46ed.webp" }],
      description: "Dual-nostril personal applicator (blows into both nostrils at once) carved from dense wood with crocodile styling.",
      handle: "kuripe-double-crocodile",
      weight: 80,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {},
      options: [{ id: standardOption.id }],
      variants: [
        {
          title: "Default",
          sku: "KURIPE-DBL-CROCODILE",
          options: { Standard: "Default" },
          prices: [
            { amount: 55, currency_code: "eur" },
            { amount: 65, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
    },
    {
      title: "Tepi Colibri Teak",
      category_ids: [getCatId("Tepi and Kuripe")],
      thumbnail: "/images/blog/tepi-colibri-teak.99e2742211b7f34b92c1dbe12d029150.webp",
      images: [{ url: "/images/blog/tepi-colibri-teak.99e2742211b7f34b92c1dbe12d029150.webp" }],
      description: "Beautiful two-person blow applicator carved out of solid Teak, adorned with a delicate colibri representation.",
      handle: "tepi-colibri-teak",
      weight: 120,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {},
      options: [{ id: standardOption.id }],
      variants: [
        {
          title: "Default",
          sku: "TEPI-COLIBRI-TEAK",
          options: { Standard: "Default" },
          prices: [
            { amount: 58, currency_code: "eur" },
            { amount: 68, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
    },

    // --- AROMATICS ---
    {
      title: "Agua de Florida",
      category_ids: [getCatId("Aromatics")],
      thumbnail: "/images/blog/img-2710.e9938d08de0e6f90824a4609394272f1.webp",
      images: [{ url: "/images/blog/img-2710.e9938d08de0e6f90824a4609394272f1.webp" }],
      description: "Traditional Peruvian Agua de Florida cologne. Highly valued in ceremonies for energy cleansing, protection, and deep relaxation.",
      handle: "agua-de-florida",
      weight: 270,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {},
      options: [{ id: standardOption.id }],
      variants: [
        {
          title: "Default",
          sku: "AROMATIC-AGUA-FLORIDA",
          options: { Standard: "Default" },
          prices: [
            { amount: 12, currency_code: "eur" },
            { amount: 14, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
    },
    {
      title: "Palo Santo",
      category_ids: [getCatId("Aromatics")],
      thumbnail: "/images/blog/img-2713.96931ba9e48733486e1a6034b802af1a.webp",
      images: [{ url: "/images/blog/img-2713.96931ba9e48733486e1a6034b802af1a.webp" }],
      description: "Premium sustainable Palo Santo incense sticks. Perfect for purifying spaces and tools before meditation.",
      handle: "palo-santo",
      weight: 100,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {},
      options: [{ id: standardOption.id }],
      variants: [
        {
          title: "Default",
          sku: "AROMATIC-PALO-SANTO",
          options: { Standard: "Default" },
          prices: [
            { amount: 8, currency_code: "eur" },
            { amount: 10, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
    },

    // --- SUPPLEMENTS ---
    {
      title: "Maca Root Powder",
      category_ids: [getCatId("Supplements")],
      thumbnail: "/images/blog/img-2717.3b7c6984b91d2f5fa96a953b80115937.webp",
      images: [{ url: "/images/blog/img-2717.3b7c6984b91d2f5fa96a953b80115937.webp" }],
      description: "Organic Maca root powder from the Peruvian Andes. A powerful adaptogen supporting energy, hormonal balance, and vitality.",
      handle: "maca-root-powder",
      weight: 250,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {},
      options: [{ id: standardOption.id }],
      variants: [
        {
          title: "Default",
          sku: "SUPPLEMENT-MACA",
          options: { Standard: "Default" },
          prices: [
            { amount: 14, currency_code: "eur" },
            { amount: 16, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
    },
    {
      title: "Guarana Seed Powder",
      category_ids: [getCatId("Supplements")],
      thumbnail: "/images/blog/img-2720.d6513282b024f827b591ae2913ec6c21.webp",
      images: [{ url: "/images/blog/img-2720.d6513282b024f827b591ae2913ec6c21.webp" }],
      description: "Natural energizing Guarana seed powder from the Brazilian Amazon. Provides sustained release energy and focus.",
      handle: "guarana-seed-powder",
      weight: 250,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {},
      options: [{ id: standardOption.id }],
      variants: [
        {
          title: "Default",
          sku: "SUPPLEMENT-GUARANA",
          options: { Standard: "Default" },
          prices: [
            { amount: 16, currency_code: "eur" },
            { amount: 18, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
    },

    // --- ORNAMENTS ---
    {
      title: "Huayruro Seeds Bracelet",
      category_ids: [getCatId("Ornaments and decoration")],
      thumbnail: "/images/blog/kuripe-turquoise.8dd3da8f6a694f81fc9dbf97da26ac8e.webp",
      images: [{ url: "/images/blog/kuripe-turquoise.8dd3da8f6a694f81fc9dbf97da26ac8e.webp" }],
      description: "Traditional Peruvian bracelet made with red and black Huayruro seeds, worn by shamans for protection and luck.",
      handle: "huayruro-seeds-bracelet",
      weight: 20,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {},
      options: [{ id: standardOption.id }],
      variants: [
        {
          title: "Default",
          sku: "ORNAMENT-BRACELET",
          options: { Standard: "Default" },
          prices: [
            { amount: 18, currency_code: "eur" },
            { amount: 20, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
    },
    {
      title: "Shamanic Altar Cloth",
      category_ids: [getCatId("Ornaments and decoration")],
      thumbnail: "/images/blog/kuripe-amethyst.bf428b0cb6a60dd91197a844a573cd85.webp",
      images: [{ url: "/images/blog/kuripe-amethyst.bf428b0cb6a60dd91197a844a573cd85.webp" }],
      description: "Beautiful hand-woven ceremonial carpet featuring traditional Amazonian geometric patterns.",
      handle: "shamanic-altar-cloth",
      weight: 200,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {},
      options: [{ id: standardOption.id }],
      variants: [
        {
          title: "Default",
          sku: "ORNAMENT-CLOTH",
          options: { Standard: "Default" },
          prices: [
            { amount: 45, currency_code: "eur" },
            { amount: 50, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
    },
  ];

  await createProductsWorkflow(container).run({
    input: {
      products: productsToCreate,
    },
  });

  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels...");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        location_id: stockLocation.id,
        stocked_quantity: 1000000,
        inventory_item_id: item.id,
      })),
    },
  });
  logger.info("Finished seeding inventory levels data.");
}
