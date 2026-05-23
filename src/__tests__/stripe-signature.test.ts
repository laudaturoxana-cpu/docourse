import { describe, it, expect } from "vitest";
import crypto from "crypto";

// Extracted from route.ts for testing
function verifyStripeSignature(body: string, signature: string, secret: string): boolean {
  const parts: Record<string, string> = {};
  for (const part of signature.split(",")) {
    const [k, v] = part.split("=");
    parts[k] = v;
  }
  if (!parts.t || !parts.v1) return false;
  const signed = `${parts.t}.${body}`;
  const expected = crypto.createHmac("sha256", secret).update(signed, "utf8").digest("hex");
  return crypto.timingSafeEqual(Buffer.from(parts.v1), Buffer.from(expected));
}

function buildSignature(body: string, secret: string, timestamp = "1700000000"): string {
  const signed = `${timestamp}.${body}`;
  const hash = crypto.createHmac("sha256", secret).update(signed, "utf8").digest("hex");
  return `t=${timestamp},v1=${hash}`;
}

describe("verifyStripeSignature", () => {
  const SECRET = "whsec_test_secret_key";
  const BODY = JSON.stringify({ id: "evt_test", type: "checkout.session.completed" });

  it("returns true for a valid signature", () => {
    const sig = buildSignature(BODY, SECRET);
    expect(verifyStripeSignature(BODY, sig, SECRET)).toBe(true);
  });

  it("returns false when body is tampered", () => {
    const sig = buildSignature(BODY, SECRET);
    expect(verifyStripeSignature(BODY + "tampered", sig, SECRET)).toBe(false);
  });

  it("returns false when secret is wrong", () => {
    const sig = buildSignature(BODY, SECRET);
    expect(verifyStripeSignature(BODY, sig, "wrong_secret")).toBe(false);
  });

  it("returns false when signature header is missing t=", () => {
    expect(verifyStripeSignature(BODY, "v1=abc123", SECRET)).toBe(false);
  });

  it("returns false when signature header is missing v1=", () => {
    expect(verifyStripeSignature(BODY, "t=1700000000", SECRET)).toBe(false);
  });

  it("returns false for empty signature", () => {
    expect(verifyStripeSignature(BODY, "", SECRET)).toBe(false);
  });
});
