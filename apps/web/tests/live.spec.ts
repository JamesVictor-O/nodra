import { test, expect } from "@playwright/test";
const account = "0x0000000000000000000000000000000000000123";
const snapshot = { block: 5448880, account, limit: "0", cash: "1000400000", balance: "0", debt: "0", activeId: "0", lender: "0x2e5d8b56f9b4770a88794a47c32c177542d2f6ea", defaulted: false, accepted: false, evidence: [], dueAt: "0", historyFromBlock: 5448779, events: [] };
test("new visitors see onboarding without loading another wallet", async ({ page }) => {
  let reads = 0;
  await page.route("**/api/protocol?*", route => { reads++; return route.fulfill({ json: snapshot }); });
  await page.goto("/operator");
  await expect(page.getByRole("heading", { name: "Build credit from your work." })).toBeVisible();
  await expect(page.getByText("1,000.4", { exact: true })).toHaveCount(0);
  expect(reads).toBe(0);
  await expect(page.locator("main")).not.toContainText("Meridian");
});
test("a connected new wallet gets its own empty state", async ({ page }) => {
  await page.addInitScript(({ account }) => { (window as unknown as { ethereum: unknown }).ethereum = { request: async ({ method }: {method: string}) => method === "eth_accounts" ? [] : [account] }; }, { account });
  await page.route("**/api/protocol?*", route => { expect(new URL(route.request().url()).searchParams.get("account")).toBe(account); return route.fulfill({ json: snapshot }); });
  await page.goto("/operator");
  await page.getByRole("button", { name: "Connect wallet to get started" }).click();
  await expect(page.getByRole("heading", { name: "Your borrowing history starts here" })).toHaveCount(0);
  await expect(page.getByText(/No accepted payment evidence/)).toBeVisible();
});
test("proof errors never request a signature", async ({ page }) => {
  await page.addInitScript(({ account }) => { (window as unknown as { ethereum: unknown }).ethereum = { request: async ({method}: {method:string}) => { if (method === "eth_accounts") return [account]; if (method === "eth_chainId") return "0x18e8f"; throw new Error("Unexpected wallet action"); } }; }, { account });
  await page.route("**/api/protocol?*", route => route.fulfill({ json: snapshot }));
  await page.route("**/api/evidence", route => route.fulfill({ status: 422, json: { error: "Payment is awaiting attestation." } }));
  await page.goto("/operator/evidence");
  await page.getByLabel("Sepolia payment transaction hash").fill("0x" + "1".repeat(64));
  await page.getByRole("button", { name: "Verify and submit payment" }).click();
  await expect(page.getByRole("status")).toContainText("awaiting attestation");
});
test("RPC errors remove account actions", async ({ page }) => {
  await page.addInitScript(({ account }) => { (window as unknown as { ethereum: unknown }).ethereum = { request: async () => [account] }; }, { account });
  await page.route("**/api/protocol?*", route => route.fulfill({ status: 503, json: { error: "Creditcoin reads are unavailable." } }));
  await page.goto("/operator/financing");
  await expect(page.getByRole("alert").filter({ hasText: "Creditcoin reads" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Borrow", exact: true })).toHaveCount(0);
});
test("payment request opens for the intended operator and rejects malformed amounts", async ({ page }) => {
  await page.goto("/pay?operator=0x0000000000000000000000000000000000000123");
  await expect(page.getByLabel("Operator wallet")).toHaveValue(account);
  await page.getByLabel("Amount in TEST USD").fill("-5");
  await page.getByRole("button", { name: "Review and pay" }).click();
  await expect(page.getByRole("status")).toContainText("positive amount");
});
test("connecting survives account events and navigation to evidence", async ({ page }) => {
  await page.addInitScript(({ account }) => {
    const listeners: Record<string, (...args: unknown[]) => void> = {};
    (window as unknown as { ethereum: unknown }).ethereum = {
      request: async ({ method }: { method: string }) => {
        if (method === "eth_accounts") return [];
        if (method === "eth_requestAccounts") { setTimeout(() => listeners.accountsChanged?.([account]), 20); return [account]; }
        return "0x18e8f";
      }, on: (event: string, fn: (...args: unknown[]) => void) => { listeners[event] = fn; }, removeListener: (event: string) => { delete listeners[event]; },
    };
  }, { account });
  await page.route("**/api/protocol?*", route => route.fulfill({ json: snapshot }));
  await page.goto("/operator");
  await page.getByRole("button", { name: "Connect wallet to get started" }).click();
  await page.getByRole("link", { name: "Evidence", exact: true }).click();
  await page.getByRole("link", { name: "Add payment evidence", exact: true }).click();
  await expect(page).toHaveURL(/\/operator\/evidence#submit-payment/);
  await expect(page.getByLabel("Sepolia payment transaction hash")).toBeVisible();
  await expect(page.getByRole("button", { name: "Connect wallet to get started" })).toHaveCount(0);
});
test("evidence form remains available when history reads fail", async ({ page }) => {
  await page.addInitScript(({ account }) => { (window as unknown as { ethereum: unknown }).ethereum = { request: async () => [account] }; }, { account });
  await page.route("**/api/protocol?*", route => route.fulfill({ status: 503, json: { error: "Creditcoin reads are unavailable." } }));
  await page.goto("/operator/evidence");
  await expect(page.getByLabel("Sepolia payment transaction hash")).toBeVisible();
});
