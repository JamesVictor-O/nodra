import { test, expect } from "@playwright/test";
const snapshot = { block: 5448880, account: "0x2e5d8b56f9b4770a88794a47c32c177542d2f6ea", limit: "50000000", cash: "1000400000", balance: "998999600000", debt: "0", activeId: "0", lender: "0x2e5d8b56f9b4770a88794a47c32c177542d2f6ea", defaulted: false, accepted: false, evidence: [], dueAt: "0", historyFromBlock: 5448779, events: [] };
for (const width of [375, 768, 1280]) {
  test(`all contract pages load without overflow at ${width}px`, async ({ page }) => {
    await page.addInitScript(() => { (window as unknown as { ethereum: unknown }).ethereum = { request: async () => ["0x2e5d8b56f9b4770a88794a47c32c177542d2f6ea"] }; });
    await page.setViewportSize({ width, height: 900 });
    await page.route("**/api/protocol?*", route => route.fulfill({ json: snapshot }));
    for (const route of ["/operator", "/operator/evidence", "/operator/financing", "/lender/funding", "/operator/settings"]) {
      await page.goto(route);
      await expect(page.getByText("998,999.6", { exact: true })).toBeVisible();
      await expect(page.locator("main")).not.toContainText(/demo/i);
      await expect(page.getByRole("heading", { name: "Your borrowing history starts here" })).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}
test("funding controls are unavailable to a different wallet", async ({ page }) => {
  await page.route("**/api/protocol?*", route => route.fulfill({ json: snapshot }));
  await page.addInitScript(() => {
    (window as unknown as { ethereum: unknown }).ethereum = { request: async () => ["0x0000000000000000000000000000000000000123"] };
  });
  await page.goto("/lender/funding");
  await expect(page.getByText(/Only the designated lender can fund/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Fund vault" })).toHaveCount(0);
});
test("operator and lender workspaces expose different navigation and metrics", async ({ page }) => {
  await page.addInitScript(() => { (window as unknown as { ethereum: unknown }).ethereum = { request: async () => ["0x2e5d8b56f9b4770a88794a47c32c177542d2f6ea"] }; });
  await page.route("**/api/protocol?*", route => route.fulfill({ json: { ...snapshot, totalOutstanding: "40400000", portfolio: [] } }));
  await page.goto("/operator");
  await expect(page.getByText("Current policy limit", { exact: true })).toBeVisible();
  await expect(page.getByText("Vault cash", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("navigation").getByRole("link", { name: "Funding", exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Switch to lender workspace" }).click();
  await expect(page).toHaveURL(/\/lender$/);
  await expect(page.getByText("Vault cash", { exact: true })).toBeVisible();
  await expect(page.getByText("40.4", { exact: true })).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Evidence", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Evidence provenance" })).toHaveCount(0);
});
test("legacy lender route redirects into lender workspace", async ({ page }) => {
  await page.goto("/app/market");
  await expect(page).toHaveURL(/\/lender\/funding$/);
  await expect(page.getByRole("heading", { name: "Start as a lender" })).toBeVisible();
});
