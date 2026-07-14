import { test, expect, type Page } from "@playwright/test";

const TEST_EMAIL = `e2e-${Date.now()}@aria.test`;
const TEST_PASS = "e2epassword123";
const TEST_NAME = "E2E User";

async function register(page: Page) {
  await page.goto("/register");
  await page.fill('input[placeholder="Your name"]', TEST_NAME);
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASS);
  await page.click('button:has-text("Create account")');
  await page.waitForURL("**/chat");
}

test.describe("Auth", () => {
  test("registers and lands on chat", async ({ page }) => {
    await register(page);
    await expect(page).toHaveURL(/\/chat/);
  });

  test("login with correct credentials", async ({ page }) => {
    await register(page);
    // Logout via localStorage clear
    await page.evaluate(() => localStorage.clear());
    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASS);
    await page.click('button:has-text("Sign in")');
    await page.waitForURL("**/chat");
    await expect(page).toHaveURL(/\/chat/);
  });

  test("shows error on wrong password", async ({ page }) => {
    await register(page);
    await page.evaluate(() => localStorage.clear());
    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button:has-text("Sign in")');
    await expect(page.locator("text=Invalid email or password")).toBeVisible();
  });
});

test.describe("Chat", () => {
  test.beforeEach(async ({ page }) => {
    await register(page);
  });

  test("sends a message and receives streaming reply", async ({ page }) => {
    await expect(page.locator("text=What's on your mind?")).toBeVisible();
    await page.fill("textarea", "Hello Aria, just testing");
    await page.click('button[aria-label="Send message"]');
    // User message appears
    await expect(page.locator("text=Hello Aria, just testing")).toBeVisible();
    // Wait for streaming to complete (aria label disappears or response appears)
    await expect(page.locator(".border-l-2.border-accent")).toBeVisible({ timeout: 30_000 });
  });
});

test.describe("Tasks", () => {
  test.beforeEach(async ({ page }) => {
    await register(page);
    await page.goto("/tasks");
  });

  test("creates a task", async ({ page }) => {
    await page.click('button:has-text("+ New task")');
    await page.fill('input[placeholder="Task title…"]', "Buy oat milk");
    await page.click('button:has-text("Add")');
    await expect(page.locator("text=Buy oat milk")).toBeVisible();
  });

  test("marks task as done", async ({ page }) => {
    await page.click('button:has-text("+ New task")');
    await page.fill('input[placeholder="Task title…"]', "Task to complete");
    await page.click('button:has-text("Add")');
    await page.click('button[aria-label="Mark done"]');
    // Switch to done tab and verify
    await page.click('button:has-text("done")');
    await expect(page.locator("text=Task to complete")).toBeVisible();
  });
});

test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    await register(page);
    await page.goto("/settings");
  });

  test("switches to Dawn theme", async ({ page }) => {
    await page.click('button:has-text("Dawn")');
    // CSS var should have changed
    const bg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--bg").trim()
    );
    expect(bg).toBe("#F5F0E8");
  });

  test("saves assistant name", async ({ page }) => {
    await page.fill('input[id="assistant-name"]', "Nova");
    await page.click('button:has-text("Save changes")');
    await expect(page.locator("text=Saved.")).toBeVisible();
  });
});
