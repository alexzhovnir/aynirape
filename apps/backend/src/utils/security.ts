import { MedusaRequest } from "@medusajs/framework/http";

const ipRequestMap = new Map<string, number[]>();

/**
 * Checks if a given IP address exceeds rate limits.
 * @param ip Client IP address
 * @param limit Maximum requests allowed in window
 * @param windowMs Window duration in milliseconds (default: 10 minutes)
 */
export function isRateLimited(
  ip: string,
  limit: number = 5,
  windowMs: number = 10 * 60 * 1000
): boolean {
  const now = Date.now();
  const timestamps = ipRequestMap.get(ip) || [];

  // Filter timestamps within the current window
  const validTimestamps = timestamps.filter((ts) => now - ts < windowMs);

  if (validTimestamps.length >= limit) {
    return true;
  }

  validTimestamps.push(now);
  ipRequestMap.set(ip, validTimestamps);
  return false;
}

/**
 * Gets the client IP address from request headers or socket.
 */
export function getClientIp(req: MedusaRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0].trim();
  }
  return req.ip || "127.0.0.1";
}

/**
 * Validates email format strictly.
 */
export function isValidEmail(email: any): boolean {
  if (typeof email !== "string") return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return email.length <= 254 && emailRegex.test(email.trim());
}

/**
 * Sanitizes input text string by trimming and capping length.
 */
export function sanitizeText(text: any, maxLength: number = 1000): string {
  if (typeof text !== "string") return "";
  return text.trim().slice(0, maxLength);
}
