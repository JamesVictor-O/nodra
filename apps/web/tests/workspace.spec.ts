import { test, expect } from "@playwright/test";

test("evidence filters, empty recovery, details and export", async ({
  page,
}) => {
  await page.goto("/app/evidence");
  await page.getByRole("button", { name: "Rejected 1", exact: true }).click();
  await expect(
    page.getByRole("cell", {
      name: "Unrecognized payment source",
      exact: false,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Inspect ND-EV-004" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Emitter is not a recognized revenue source",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("textbox", { name: "Search evidence" })
    .fill("does-not-exist");
  await expect(page.getByText("No matching evidence")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(
    page.getByRole("button", { name: "Inspect ND-EV-008" }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export records" }).click();
  expect((await download).suggestedFilename()).toBe("nodra-demo-evidence.json");
});

test("loan validation, review, persistence and repayment", async ({ page }) => {
  await page.goto("/app/financing");
  await page
    .getByRole("button", { name: "Activate demo account", exact: true })
    .click();
  await page.getByLabel("How much do you need?").fill("12001");
  await page.getByRole("button", { name: "Review demo request" }).click();
  await expect(page.locator("p[role=alert]")).toContainText(
    "between 100 and 12,000",
  );
  await page.getByLabel("How much do you need?").fill("8000");
  await page.getByRole("button", { name: "Review demo request" }).click();
  await expect(page.getByRole("dialog")).toContainText("$8,240");
  await page.getByRole("button", { name: "Create demo loan" }).click();
  await expect(page.getByText("Your active demo loan")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Your active demo loan")).toBeVisible();
  await page.getByRole("button", { name: "Simulate full repayment" }).click();
  await page.getByRole("button", { name: "Confirm demo repayment" }).click();
  await expect(page.getByText("Repaid", { exact: true })).toBeVisible();
});

test("lender allocations respect available target and persist", async ({
  page,
}) => {
  await page.goto("/app/market");
  await page.getByRole("button", { name: "Compute", exact: true }).click();
  await page.getByRole("button", { name: "Inspect opportunity" }).click();
  await page.getByRole("button", { name: "Activate demo account" }).click();
  await page.getByLabel("Your allocation (TEST USD)").fill("13000");
  await page.getByRole("button", { name: "Simulate allocation" }).click();
  await expect(page.locator("p[role=alert]")).toBeVisible();
  await page.getByLabel("Your allocation (TEST USD)").fill("1000");
  await page.getByRole("button", { name: "Simulate allocation" }).click();
  await expect(page.getByRole("status")).toContainText("Demo allocation saved");
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(page.locator(".market-balance:visible")).toContainText("$1,000");
  await expect(page.locator(".market-balance:visible")).toContainText("$24,000");
});

test("profile edits and confirmed workspace reset", async ({ page }) => {
  await page.goto("/app/settings");
  await page.getByLabel("Operator name").fill("Atlas Compute");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByRole("status")).toContainText("profile saved");
  await page.reload();
  await expect(page.getByLabel("Operator name")).toHaveValue("Atlas Compute");
  await page.getByRole("button", { name: "Reset demo workspace" }).click();
  await page.getByRole("button", { name: "Reset local demo" }).click();
  await expect(page.getByLabel("Operator name")).toHaveValue(
    "Meridian Compute",
  );
});

for (const width of [375, 768, 1280]) {
  test(`routes fit ${width}px and reduced motion`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const route of [
      "/",
      "/protocol",
      "/app",
      "/app/evidence",
      "/app/financing",
      "/app/market",
      "/app/settings",
    ]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
        route,
      ).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

test("mobile menu and dialog keyboard behavior", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "For lenders", exact: true }).click();
  await page.getByRole("button", { name: "Connect demo", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Connect demo", exact: true }),
  ).toBeFocused();
});
