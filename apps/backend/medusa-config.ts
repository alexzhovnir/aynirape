import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
    {
      resolve: "./src/modules/contact",
    },
    {
      resolve: "@medusajs/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/paypal",
            id: "paypal",
            options: {
              clientId: process.env.PAYPAL_CLIENT_ID || "test",
              clientSecret: process.env.PAYPAL_CLIENT_SECRET || "test",
              sandbox: process.env.NODE_ENV !== "production",
            },
          },
          {
            resolve: "./src/modules/bank-transfer",
            id: "bank-transfer",
            options: {
              bankName: process.env.BANK_NAME || "Revolut Business",
              iban: process.env.BANK_IBAN || "",
              swift: process.env.BANK_SWIFT || "",
              accountHolder: process.env.BANK_ACCOUNT_HOLDER || "Ayni Rapé",
            },
          },
        ],
      },
    },
  ]
})

