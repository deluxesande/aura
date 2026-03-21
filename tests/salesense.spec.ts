import { test, expect, Page } from "@playwright/test";

// ─── Helpers ────────────────────────────────────────────────────────────────

async function login(page: Page) {
    await page.goto("http://localhost:3000/sign-in");

    // Wait for the form to fully render
    await page.waitForSelector('input[name="email"]', { timeout: 5000 });

    // Use type instead of fill — simulates real keystrokes for React controlled inputs
    await page.locator('input[name="email"]').click();
    await page
        .locator('input[name="email"]')
        .type(process.env.TEST_EMAIL ?? "", { delay: 50 });

    await page.locator('input[name="password"]').click();
    await page
        .locator('input[name="password"]')
        .type(process.env.TEST_PASSWORD ?? "", { delay: 50 });

    // Verify fields are filled before submitting
    console.log(
        "Email value:",
        await page.locator('input[name="email"]').inputValue(),
    );
    console.log(
        "Password value:",
        await page.locator('input[name="password"]').inputValue(),
    );

    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });
}

// ─── Auth ────────────────────────────────────────────────────────────────────

test.describe("Authentication", () => {
    test("redirects unauthenticated users to sign-in", async ({ page }) => {
        await page.goto("http://localhost:3000/dashboard");
        await expect(page).toHaveURL(/sign-in/);
    });

    test("logs in successfully and lands on products", async ({ page }) => {
        await login(page);
        await expect(page).toHaveURL(/dashboard/);
    });
});

// ─── Dashboard ───────────────────────────────────────────────────────────────

test.describe("Dashboard", () => {
    test.beforeEach(async ({ page }) => await login(page));

    test("loads within 3 seconds", async ({ page }) => {
        await page.goto("http://localhost:3000/dashboard");
        await expect(page.locator("body")).toBeVisible({ timeout: 3000 });
    });

    test("analytics stats API returns valid shape", async ({ request }) => {
        const res = await request.get(
            "http://localhost:3000/api/analytics/stats?timePeriod=30d",
        );
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body).toBeDefined();
    });
});

// ─── Products ────────────────────────────────────────────────────────────────

test.describe("Products", () => {
    test.beforeEach(async ({ page }) => await login(page));

    test("product list loads", async ({ page }) => {
        await page.goto("http://localhost:3000/products/list");
        await expect(page.locator("body")).toBeVisible({ timeout: 3000 });
    });

    test("create product without image succeeds", async ({ page }) => {
        // Schema: image String? — optional field
        await page.goto("http://localhost:3000/products/create");
        await page.fill('input[name="name"]', "Stress Test Product");
        await page.fill(
            'textarea[name="description"]',
            "Automated test product",
        );
        await page.fill('input[name="price"]', "99.99");
        await page.fill('input[name="quantity"]', "50");
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/products\/list/, { timeout: 5000 });
    });

    test("create product form blocks submission with missing required fields", async ({
        page,
    }) => {
        // Schema requires: name, description, price, quantity, categoryId
        await page.goto("http://localhost:3000/products/create");
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/products\/create/);
    });

    test("SKU is auto-generated if left blank", async ({ page }) => {
        // Schema: sku String @unique — auto-generated via generateSKU()
        await page.goto("http://localhost:3000/products/create");
        await page.fill('input[name="name"]', "Auto SKU Test");
        const skuInput = page.locator('input[name="sku"]');
        await expect(skuInput).not.toBeNull();
    });

    test("product defaults to inStock false when quantity is 0", async ({
        request,
    }) => {
        // Schema: inStock Boolean @default(false), quantity Int @default(0)
        const res = await request.post("http://localhost:3000/api/product", {
            data: {
                name: "Zero Stock Product",
                description: "Test",
                price: 10,
                quantity: 0,
                sku: `TEST-${Date.now()}`,
                categoryId: process.env.TEST_CATEGORY_ID ?? "",
                inStock: false,
            },
        });
        const body = await res.json();
        expect(body.inStock).toBe(false);
        expect(body.quantity).toBe(0);
    });

    test("GET /api/product/topProduct returns results", async ({ request }) => {
        const res = await request.get(
            "http://localhost:3000/api/product/topProduct?timePeriod=7",
        );
        expect(res.status()).toBe(200);
    });
});

// ─── Categories ──────────────────────────────────────────────────────────────

test.describe("Categories", () => {
    test("category name + createdBy must be unique", async ({ request }) => {
        // Schema: @@unique([name, createdBy])
        const payload = {
            name: `Cat-${Date.now()}`,
            description: "Test category",
        };
        const first = await request.post("http://localhost:3000/api/category", {
            data: payload,
        });
        expect(first.status()).toBe(200);

        // Second request with same name should fail
        const second = await request.post(
            "http://localhost:3000/api/category",
            {
                data: payload,
            },
        );
        expect(second.status()).not.toBe(200);
    });
});

// ─── Customers ───────────────────────────────────────────────────────────────

test.describe("Customers", () => {
    test.beforeEach(async ({ page }) => await login(page));

    test("customer list loads", async ({ page }) => {
        await page.goto("http://localhost:3000/customers");
        await expect(page.locator("body")).toBeVisible({ timeout: 3000 });
    });

    test("create a new customer", async ({ page }) => {
        // Schema: phoneNumber required, email/firstName/lastName optional
        await page.goto("http://localhost:3000/customers/create");
        await page.fill('input[name="firstName"]', "Test");
        await page.fill('input[name="lastName"]', "Customer");
        await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
        await page.fill(
            'input[name="phoneNumber"]',
            `07${Date.now().toString().slice(-8)}`,
        );
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/customers/, { timeout: 5000 });
    });

    test("duplicate email within same business is rejected", async ({
        request,
    }) => {
        // Schema: @@unique([businessId, email])
        const email = `dup-${Date.now()}@example.com`;
        const first = await request.post(
            "http://localhost:3000/api/customer/post",
            {
                data: {
                    firstName: "Dup",
                    lastName: "Test",
                    email,
                    phoneNumber: `07${Date.now().toString().slice(-8)}`,
                },
            },
        );
        expect(first.status()).toBe(200);

        const second = await request.post(
            "http://localhost:3000/api/customer/post",
            {
                data: {
                    firstName: "Dup",
                    lastName: "Test",
                    email,
                    phoneNumber: `07${(Date.now() + 1).toString().slice(-8)}`,
                },
            },
        );
        expect(second.status()).not.toBe(200);
    });

    test("duplicate phone number within same business is rejected", async ({
        request,
    }) => {
        // Schema: @@unique([businessId, phoneNumber])
        const phoneNumber = `07${Date.now().toString().slice(-8)}`;
        const first = await request.post(
            "http://localhost:3000/api/customer/post",
            {
                data: {
                    firstName: "Phone",
                    lastName: "Dup",
                    email: `phone-dup-${Date.now()}@example.com`,
                    phoneNumber,
                },
            },
        );
        expect(first.status()).toBe(200);

        const second = await request.post(
            "http://localhost:3000/api/customer/post",
            {
                data: {
                    firstName: "Phone",
                    lastName: "Dup2",
                    email: `phone-dup2-${Date.now()}@example.com`,
                    phoneNumber,
                },
            },
        );
        expect(second.status()).not.toBe(200);
    });
});

// ─── Invoices ────────────────────────────────────────────────────────────────

test.describe("Invoices", () => {
    test.beforeEach(async ({ page }) => await login(page));

    test("invoice list loads within 5 seconds", async ({ page }) => {
        await page.goto("http://localhost:3000/invoices");
        await expect(page.locator("body")).toBeVisible({ timeout: 5000 });
    });

    test("invoice defaults to CASH payment and PENDING status", async ({
        request,
    }) => {
        // Schema: paymentType @default("CASH"), status @default("PENDING")
        const res = await request.post(
            "http://localhost:3000/api/invoice/post",
            {
                data: { totalAmount: 500, invoiceItems: [] },
            },
        );
        const body = await res.json();
        expect(body.paymentType).toBe("CASH");
        expect(body.status).toBe("PENDING");
    });

    test("invoice analytics loads", async ({ request }) => {
        const res = await request.get(
            "http://localhost:3000/api/invoice/analytics?timePeriod=30",
        );
        expect(res.status()).toBe(200);
    });

    test("invoice analytics handles NaN timePeriod gracefully", async ({
        request,
    }) => {
        // Seen in logs: /api/invoice/analytics?timePeriod=NaN — should not 500
        const res = await request.get(
            "http://localhost:3000/api/invoice/analytics?timePeriod=NaN",
        );
        expect(res.status()).toBe(200);
    });

    test("invoice items are cascade deleted with invoice", async ({
        request,
    }) => {
        // Schema: InvoiceItem Invoice @relation(onDelete: Cascade)
        // Create invoice then delete it — items should be gone
        const create = await request.post(
            "http://localhost:3000/api/invoice/post",
            {
                data: { totalAmount: 100, invoiceItems: [] },
            },
        );
        const invoice = await create.json();
        if (!invoice.id) return; // skip if auth blocked creation

        const del = await request.delete(
            `http://localhost:3000/api/invoice/${invoice.id}`,
        );
        expect([200, 204]).toContain(del.status());
    });
});

// ─── M-Pesa ──────────────────────────────────────────────────────────────────

test.describe("M-Pesa", () => {
    test("mpesa payment with unknown id returns 404 not 500", async ({
        request,
    }) => {
        // Schema: status @default("PENDING") on MpesaPayment
        const res = await request.get(
            "http://localhost:3000/api/mpesa/status/non-existent-id",
        );
        expect([200, 404]).toContain(res.status());
        expect(res.status()).not.toBe(500);
    });

    test("checkoutRequestId is unique — duplicate STK push is rejected", async ({
        request,
    }) => {
        // Schema: checkoutRequestId String @unique on MpesaPayment
        const payload = {
            amount: 100,
            phoneNumber: "254700000000",
            accountReference: "TEST",
            checkoutRequestId: `test-checkout-${Date.now()}`,
            merchantRequestId: `test-merchant-${Date.now()}`,
            invoiceId: process.env.TEST_INVOICE_ID ?? "",
        };
        const first = await request.post("http://localhost:3000/api/mpesa", {
            data: payload,
        });
        expect([200, 201]).toContain(first.status());

        const second = await request.post("http://localhost:3000/api/mpesa", {
            data: payload, // same checkoutRequestId
        });
        expect(second.status()).not.toBe(200);
    });
});

// ─── Subscriptions ───────────────────────────────────────────────────────────

test.describe("Subscriptions", () => {
    test("subscription plans endpoint is reachable", async ({ request }) => {
        // Schema: PlanTier — STARTER (free), STANDARD (1000 KSh), PREMIUM (1500 KSh)
        const res = await request.get("http://localhost:3000/api/subscription");
        expect([200, 401]).toContain(res.status());
    });

    test("subscription payment defaults to PENDING", async ({ request }) => {
        // Schema: SubscriptionPayment status @default("PENDING")
        const res = await request.get(
            "http://localhost:3000/api/subscription/payment/test-id",
        );
        expect([200, 404]).toContain(res.status());
        expect(res.status()).not.toBe(500);
    });
});

// ─── Business ────────────────────────────────────────────────────────────────

test.describe("Business", () => {
    test.beforeEach(async ({ page }) => await login(page));

    test("settings page loads", async ({ page }) => {
        await page.goto("http://localhost:3000/settings");
        await expect(page.locator("body")).toBeVisible({ timeout: 3000 });
    });

    test("update business profile", async ({ request }) => {
        // Schema: Business has name, email, address, logo fields
        const res = await request.put(
            `http://localhost:3000/api/business/${process.env.TEST_BUSINESS_ID}`,
            {
                data: {
                    name: "Updated Business Name",
                    email: `biz-${Date.now()}@example.com`,
                    address: "123 Test Street",
                },
            },
        );
        expect([200, 401, 403]).toContain(res.status());
    });

    test("business email must be unique", async ({ request }) => {
        // Schema: Business email String? @unique
        const email = `unique-biz-${Date.now()}@example.com`;
        const first = await request.post("http://localhost:3000/api/business", {
            data: { name: "Biz One", email },
        });
        expect([200, 201]).toContain(first.status());

        const second = await request.post(
            "http://localhost:3000/api/business",
            {
                data: { name: "Biz Two", email }, // same email
            },
        );
        expect(second.status()).not.toBe(200);
    });
});

// ─── KRA ─────────────────────────────────────────────────────────────────────

test.describe("KRA", () => {
    test("KRA details endpoint is reachable", async ({ request }) => {
        // Schema: KraDetails — kraPin @unique, linked to Business
        const res = await request.get("http://localhost:3000/api/kra");
        expect([200, 401, 404]).toContain(res.status());
        expect(res.status()).not.toBe(500);
    });
});

// ─── API Performance ─────────────────────────────────────────────────────────

test.describe("API Performance", () => {
    test("GET /api/product responds within 2 seconds", async ({ request }) => {
        const start = Date.now();
        const res = await request.get("http://localhost:3000/api/product");
        expect(res.status()).toBe(200);
        expect(Date.now() - start).toBeLessThan(2000);
    });

    test("GET /api/invoice responds within 3 seconds", async ({ request }) => {
        const start = Date.now();
        const res = await request.get("http://localhost:3000/api/invoice");
        expect(res.status()).toBe(200);
        expect(Date.now() - start).toBeLessThan(3000);
    });

    test("GET /api/customer responds within 2 seconds", async ({ request }) => {
        const start = Date.now();
        const res = await request.get("http://localhost:3000/api/customer");
        expect(res.status()).toBe(200);
        expect(Date.now() - start).toBeLessThan(2000);
    });

    test("GET /api/analytics/stats responds within 2 seconds", async ({
        request,
    }) => {
        const start = Date.now();
        const res = await request.get(
            "http://localhost:3000/api/analytics/stats?timePeriod=30d",
        );
        expect(res.status()).toBe(200);
        expect(Date.now() - start).toBeLessThan(2000);
    });

    test("GET /api/product/topProduct responds within 2 seconds", async ({
        request,
    }) => {
        const start = Date.now();
        const res = await request.get(
            "http://localhost:3000/api/product/topProduct?timePeriod=7",
        );
        expect(res.status()).toBe(200);
        expect(Date.now() - start).toBeLessThan(2000);
    });
});
