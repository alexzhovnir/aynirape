import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const defaultOrigins = [
  "http://localhost:8100",
  "http://localhost:8101",
  "http://127.0.0.1:8100",
  "http://127.0.0.1:8101",
  "http://192.168.1.161:8100",
  "http://192.168.1.161:8101",
].join(",");

const defaultAdminOrigins = [
  "http://localhost:9009",
  "http://127.0.0.1:9009",
  "http://192.168.1.161:9009",
].join(",");

const defaultAuthOrigins = [
  "http://localhost:8100",
  "http://localhost:8101",
  "http://localhost:9009",
  "http://127.0.0.1:8100",
  "http://127.0.0.1:8101",
  "http://192.168.1.161:8100",
  "http://192.168.1.161:8101",
  "http://192.168.1.161:9009",
].join(",");

const storeCors = process.env.STORE_CORS
  ? Array.from(new Set([...process.env.STORE_CORS.split(","), "http://192.168.1.161:8100", "http://192.168.1.161:8101"])).join(",")
  : defaultOrigins;

const adminCors = process.env.ADMIN_CORS
  ? Array.from(new Set([...process.env.ADMIN_CORS.split(","), "http://192.168.1.161:9009"])).join(",")
  : defaultAdminOrigins;

const authCors = process.env.AUTH_CORS
  ? Array.from(new Set([...process.env.AUTH_CORS.split(","), "http://192.168.1.161:8100", "http://192.168.1.161:8101", "http://192.168.1.161:9009"])).join(",")
  : defaultAuthOrigins;

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors,
      adminCors,
      authCors,
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

