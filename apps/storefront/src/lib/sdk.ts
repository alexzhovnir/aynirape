import Medusa from "@medusajs/js-sdk";

export const getBackendUrl = () => {
  const envUrl = import.meta.env.PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9009";
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return envUrl.replace("localhost", host).replace("127.0.0.1", host);
    }
  }
  return envUrl;
};

const MEDUSA_BACKEND_URL = getBackendUrl();
const MEDUSA_PUBLISHABLE_KEY = import.meta.env.PUBLIC_MEDUSA_PUBLISHABLE_KEY;
const isDevEnvironment = import.meta.env.DEV;

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  publishableKey: MEDUSA_PUBLISHABLE_KEY,
  debug: isDevEnvironment,
});
