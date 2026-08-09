# Security Remediation Plan — Access Control, AuthN/AuthZ, API Surface

**Status**: proposed, not implemented
**Author**: security review, 2026-08-08
**Base branch**: `security/authz-and-webhook-hardening`
**Suggested branch**: `security/authz-round-2`

This plan fixes the findings from the access-control / authentication / API-security
review. It is written so an agent (or a human) can execute it phase by phase without
re-deriving context. Every change is anchored to a real `file:line`.

---

## 0. Ground rules for whoever implements this

1. **One phase per commit.** Phases 1–3 are independently shippable and must not
   wait on each other. Do not bundle them.
2. **Fix at the shared choke point, not per caller.** Phases 4 and 6 introduce
   helpers in `utils/server/auth.ts` precisely so the same bug cannot reappear in
   the next route someone writes.
3. **Fail closed.** Every new guard denies by default. No `if (env === "dev") allow`
   branches — follow the pattern already established in
   `utils/server/safaricomIp.ts:69-74` (explicit opt-in env var, never inferred
   from `NODE_ENV`).
4. **404 over 403 for object lookups**, matching `requireBusinessAccess`
   (`utils/server/auth.ts:31-47`). 403 is fine for *capability* denials
   (wrong role), 404 for *entitlement* denials (not your object).
5. **Do not refactor unrelated code.** Several routes have pre-existing style
   problems (duplicated user lookups, `console.log` of errors). Leave them.
6. **Run `npx tsc --noEmit` after each phase.** Note: this repo currently exits
   non-zero from `tsc` even with no reported errors — judge by the error list,
   not the exit code.

### Key architectural facts you need

- **`middleware.ts` does not protect the API.** `isPrivateRoute`
  (`middleware.ts:5-13`) lists only page paths. The matcher at `middleware.ts:29-36`
  *runs* Clerk middleware on `/api/*`, but `auth.protect()` is never called for
  those paths. **Every API route authenticates itself or it is public.**
- **Two Prisma clients.** `masterPrisma` (identity, business, subscriptions,
  invitations) and `getTenantPrisma(businessId)` (products, invoices, stores,
  expenses). See `utils/lib/prisma.ts:11-20` and `:59-110`.
- **SHARED tenant mode puts every business in one physical database**
  (`utils/lib/prisma.ts:86-89`). A missing `businessId` filter or an unvalidated
  `storeId` is therefore a genuine cross-tenant issue, not a theoretical one.
- **Roles are free-form strings**, not an enum: `role String @default("user")`
  in `prisma/schema.master.prisma`. Known values: `admin`, `manager`, `user`.
- **`status` is a free-form string**, default `"active"`. Only
  `pages/api/subscription/downgrade.ts:88` ever writes `"inactive"`, and only
  `pages/api/users/[id]/reactivate.ts:89` writes it back to `"active"`.

---

## Phase 1 — CRITICAL: authenticate the account-deletion endpoint

**File**: `pages/api/auth/delete/[userId].ts`
**Finding**: the handler has no `getAuth` call. `DELETE /api/auth/delete/<clerkId>`
from an unauthenticated attacker deletes that user; if the target is `role: admin`
and the sole member of a business, lines 82-122 and 151-168 purge the entire
tenant (invoices, products, customers, stores, expenses, KRA records, audit logs)
plus the `Business` row and the Clerk account.

### 1.1 Establish the intended authorization rule

Two legitimate callers exist:

| Caller | Line | Passes | Meaning |
|---|---|---|---|
| `components/DeleteUserForm/index.tsx:27` | `/auth/delete/${user.id}` | Clerk ID from `useUser()` | **self-delete** |
| `components/UserManagement/index.tsx:311` | `/auth/delete/${userToDelete.clerkUserId}` | target's Clerk ID | **admin removes a team member** |

So the rule is: **caller is the target, OR caller is an `admin` in the same
business as the target.** Nothing else.

### 1.2 Add the guard

Insert immediately after the `userId` validation at `pages/api/auth/delete/[userId].ts:19`,
i.e. before the `try` block at line 21:

```ts
import { getAuth } from "@clerk/nextjs/server";   // add to imports at line 1-3

// ...

const { userId: requestorClerkId } = getAuth(req);
if (!requestorClerkId) {
    return res.status(401).json({ error: "Unauthorized" });
}
```

Then, **inside** the `try` block, after the target `user` is loaded
(`pages/api/auth/delete/[userId].ts:22-24`) and before the "user not found in DB,
clean up Clerk" branch at line 26, add:

```ts
const isSelf = requestorClerkId === userId;

if (!isSelf) {
    // Only an admin of the SAME business may delete someone else.
    const requestor = await masterPrisma.user.findUnique({
        where: { clerkId: requestorClerkId },
        select: { role: true, businessId: true },
    });

    const sameBusiness =
        !!requestor?.businessId && requestor.businessId === user?.businessId;

    if (!requestor || requestor.role !== "admin" || !sameBusiness) {
        // 404, not 403 — do not confirm the Clerk ID exists.
        return res.status(404).json({ error: "User not found" });
    }
}
```

### 1.3 Handle the orphan-cleanup branch carefully

Lines 26-30 currently delete an arbitrary Clerk user when no DB record exists.
That branch must be reachable **only for self-delete**, otherwise it is still an
unauthenticated-adjacent Clerk-account-deletion primitive for any authenticated
user. Replace lines 26-30 with:

```ts
if (!user) {
    if (!isSelf) {
        return res.status(404).json({ error: "User not found" });
    }
    const client = await clerkClient();
    await client.users.deleteUser(userId).catch(() => {});
    return res.status(200).json({ message: "User not found in DB, cleaned up Clerk." });
}
```

Note the ordering constraint: the `!isSelf` block in §1.2 dereferences
`user?.businessId`, so it must come **after** the `findUnique` at line 22 but the
`!user` early-return must come after the authorization check. Concretely, the
final order inside `try` is:

1. `masterPrisma.user.findUnique` (existing line 22)
2. authorization check from §1.2
3. `if (!user)` orphan branch from §1.3
4. everything existing from line 32 onward, unchanged

### 1.4 Add an audit log

The business purge is the single most destructive action in the product and
currently leaves no trace. After the guard passes and before the purge begins
(around line 77), add:

```ts
import { logAction } from "@/utils/server/audit";

await logAction({
    action: isAdmin ? "PURGE_BUSINESS" : "DELETE_STAFF",
    entityType: "USER",
    entityId: user.id,
    details: { targetEmail: user.email, selfService: isSelf },
    userId: user.id,
    businessId,
    ipAddress: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress,
    userAgent: req.headers["user-agent"],
});
```

Caveat: for the admin-purge path the audit log row lives in the tenant DB and is
deleted at line 117 moments later. That is acceptable — the value is the
`DELETE_STAFF` case. If durable purge records are wanted, that is a separate
piece of work (a master-DB audit table); do not scope-creep it here.

### 1.5 Verify

```bash
# 401 without a session
curl -i -X DELETE http://localhost:3000/api/auth/delete/user_abc123
# expect: 401

# 404 when authenticated as an unrelated user (paste a real __session cookie)
curl -i -X DELETE http://localhost:3000/api/auth/delete/<other-users-clerk-id> \
  -H "Cookie: __session=<session-of-unrelated-user>"
# expect: 404, and the target must still exist afterwards
```

Then in the UI: self-delete from Settings still works, and an admin removing a
staff member from `components/UserManagement` still works.

---

## Phase 2 — CRITICAL: authenticate the subscription M-Pesa callback

**File**: `pages/api/subscription/callback.ts`
**Finding**: no source verification. `pages/api/safaricom/*` were hardened in the
previous pass but this handler was missed. Exploit: call `stk-push` normally,
decline the prompt on the phone, then POST your own success callback —
lines 104-136 create an `ACTIVE` 30-day subscription on whatever plan you asked
for. Separately, `Amount` at line 73 is attacker-controlled and is written
straight into the payment record with no comparison against the plan price.

### 2.1 Gate the source IP

Add to imports:

```ts
import { verifySafaricomSource } from "@/utils/server/safaricomIp";
```

Immediately after the method check at `pages/api/subscription/callback.ts:25-27`:

```ts
if (!verifySafaricomSource(req, res)) return;
```

`verifySafaricomSource` (`utils/server/safaricomIp.ts:52-78`) already writes the
403 and returns `false`, so the bare `return` is correct — this matches the call
site at `pages/api/safaricom/confirmation.ts:29`.

### 2.2 Validate the amount against the plan price

The plan price table currently lives inline in
`pages/api/subscription/stk-push.ts:19-22`. Two consumers now need it, so lift it
into a module both can import. Create `utils/subscription/plans.ts`:

```ts
// Prices in KSh. Must stay in sync with the PlanTier enum in schema.master.prisma.
export const PLAN_PRICES: Record<string, number> = {
    STANDARD: 1000,
    PREMIUM: 1500,
};
```

Update `pages/api/subscription/stk-push.ts` to import it and delete the inline
literal at lines 19-22. Do not change any other behaviour in that file in this
phase.

Then in `callback.ts`, replace the success-path metadata extraction at lines
69-75 with a validated version:

```ts
const metaItems = CallbackMetadata?.Item || [];
const getMetaValue = (name: string) =>
    metaItems.find((i) => i.Name === name)?.Value;

const amount = Number(getMetaValue("Amount"));
const receiptNumber = String(getMetaValue("MpesaReceiptNumber"));
const phoneNumber = String(getMetaValue("PhoneNumber"));

const expectedAmount = PLAN_PRICES[pendingPayment.planId];
if (!expectedAmount || !Number.isFinite(amount) || amount < expectedAmount) {
    console.error("Subscription callback amount mismatch", {
        checkoutRequestId: CheckoutRequestID,
        planId: pendingPayment.planId,
        reported: amount,
        expected: expectedAmount,
    });
    await prisma.subscriptionPayment.update({
        where: { id: pendingPayment.id },
        data: { status: "FAILED" },
    });
    // 200 so Daraja stops retrying; the payment is not honoured.
    return res.status(200).json({ result: "amount_mismatch" });
}
```

Use `<` rather than `!==` so an overpayment is not rejected. `pendingPayment.planId`
is the server-recorded plan from `stk-push.ts:160`, so it is trustworthy.

### 2.3 Make the callback idempotent

`SubscriptionPayment.checkoutRequestId` is `@unique`, but nothing stops the same
success callback being replayed — each replay creates another 30-day
subscription. After the `pendingPayment` lookup (around line 52), add:

```ts
if (pendingPayment.status === "COMPLETED") {
    return res.status(200).json({ result: "already_processed" });
}
```

### 2.4 Configure the environment

`verifySafaricomSource` denies anything not in the allowlist. For local
development set `SAFARICOM_ALLOW_INSECURE_LOCAL=true` in `env.local` **only** —
never in a deployed environment. Confirm the deployed callback URL
(`SUBSCRIPTION_CALLBACK_URL`) sits behind exactly one proxy hop, because
`getClientIp` (`utils/server/safaricomIp.ts:30-42`) reads the right-most
`x-forwarded-for` entry and assumes a single trusted proxy (documented at
`utils/server/safaricomIp.ts:26-29`). On Vercel this holds. If a second proxy or
WAF is added in front, the hop count must be made configurable *before* deploying
that change or all real callbacks will 403.

### 2.5 Verify

```bash
# forged callback is rejected
curl -i -X POST http://localhost:3000/api/subscription/callback \
  -H 'Content-Type: application/json' \
  -d '{"Body":{"stkCallback":{"MerchantRequestID":"x","CheckoutRequestID":"ws_CO_test","ResultCode":0,"ResultDesc":"ok"}}}'
# expect: 403 (with SAFARICOM_ALLOW_INSECURE_LOCAL unset)
```

With the local bypass enabled, replay a real `CheckoutRequestID` twice and
confirm the second call returns `already_processed` and creates no second
`Subscription` row. Then replay with a tampered `Amount` and confirm
`amount_mismatch` and a `FAILED` payment.

---

## Phase 3 — HIGH: close the invite privilege-escalation path

**File**: `pages/api/auth/invite/post.ts`
**Finding**: `role` is read from the body at line 15 and written to the DB at
line 111 with no validation. The permission gate at lines 29-36 admits `manager`,
so a manager can invite a new **admin** at an address they control. Arbitrary
strings also persist, silently defeating every `role !== "admin"` check elsewhere.

The sibling endpoint `pages/api/auth/invite/update.ts:6-11` already does this
correctly with a Zod enum. Mirror that.

### 3.1 Validate the payload shape

Add at the top of `pages/api/auth/invite/post.ts`:

```ts
import { z } from "zod";

const inviteSchema = z.object({
    email: z.string().email(),
    role: z.enum(["admin", "manager", "user"]),
    storeId: z.string().uuid().optional().nullable(),
});
```

Replace line 15 (`const { email, role, storeId } = req.body;`) with:

```ts
const parsed = inviteSchema.safeParse(req.body);
if (!parsed.success) {
    return res.status(400).json({ error: "Invalid invitation payload" });
}
const { email, role, storeId } = parsed.data;
```

This also fixes an unrelated latent bug: `email` was previously passed unchecked
into `tx.user.findUnique({ where: { email } })` at line 92, which throws on
`undefined` and surfaces as a generic 400.

### 3.2 Constrain who may grant which role

Inside the transaction, immediately after the requestor gate at lines 29-36:

```ts
// Only an admin may mint another admin. Managers can invite manager/user only.
if (role === "admin" && requestor.role !== "admin") {
    throw new Error("Forbidden: only an admin can invite another admin.");
}
```

Consider whether a second `admin` should be possible at all: the role-update path
already forbids it outright (`pages/api/users/[id]/index.ts:190-194`, "There can
be only one Admin per business"), and `auth/delete/[userId].ts:46-60` assumes an
admin is normally the sole owner. If the product rule is one admin per business,
make this stricter and reject `role === "admin"` unconditionally here. **Confirm
the intended rule with the product owner before choosing.** Default to the
stricter reading if no answer: it can be relaxed later, whereas an over-permissive
invite endpoint is the whole finding.

### 3.3 Verify

Sign in as a `manager`, POST `/api/auth/invite` with `{"role":"admin", ...}` →
expect 400/403 and no `UserInvitation` row. Repeat with `{"role":"superadmin"}` →
expect 400. Confirm a manager inviting a `user` still succeeds end to end,
including the Clerk invitation at lines 131-142.

---

## Phase 4 — HIGH: validate `x-store-id` on every route that consumes it

**Finding**: `utils/apiClient.ts:10-18` attaches `x-store-id` from
`localStorage` to every request. It is fully attacker-controlled. Four routes
consume it without calling `verifyStoreAccess`:

| File | Line | Severity |
|---|---|---|
| `pages/api/product/post.ts` | `:26`, `:46`, `:255-270` | **write into another business's store** |
| `pages/api/expenses/index.ts` | `:36` | read/write, `businessId`-filtered |
| `pages/api/invoice/analytics.ts` | `:27` | read, `businessId`-filtered |
| `pages/api/product/topProduct.ts` | `:17` | read, `businessId`-filtered |

Only `product/post.ts` is a true cross-tenant write — the `storeInventory.upsert`
at lines 255-271 sets `storeId: targetStoreId` with only `businessId: bId` on the
`create`, so in SHARED mode an admin of business A can create inventory rows
pointed at business B's store. The other three already constrain by `businessId`
in their `where` clauses, so the impact there is empty result sets rather than
leakage — but they must be fixed anyway so the pattern is uniform and the next
route copied from them inherits the guard.

### 4.1 Add a helper that fails closed

`verifyStoreAccess` (`utils/server/auth.ts:56-68`) returns `null` both for
"invalid store" and for the legitimate "all stores" case, which is exactly why
callers keep forgetting to check it. Add a second, unambiguous helper beside it
in `utils/server/auth.ts`:

```ts
type StoreScope =
    | { ok: true; storeId: string | null }   // null === explicit "all stores"
    | { ok: false; status: number; error: string };

/**
 * Resolves the store a request should operate on.
 *
 * Admins may pass any store belonging to their business via `x-store-id`;
 * everyone else is pinned to their assigned store regardless of the header.
 * "all"/"All"/absent yields `storeId: null` and is only permitted for admins.
 */
export async function resolveStoreScope(
    req: NextApiRequest,
    businessId: string,
    role: string,
    assignedStoreId: string | null,
): Promise<StoreScope> {
    const header = req.headers["x-store-id"];
    const requested = Array.isArray(header) ? header[0] : header;

    if (role !== "admin") {
        // Staff never get to choose; the header is ignored entirely.
        return assignedStoreId
            ? { ok: true, storeId: assignedStoreId }
            : { ok: false, status: 400, error: "No branch assigned to this account" };
    }

    if (!requested || requested === "all" || requested === "All") {
        return { ok: true, storeId: null };
    }

    const validated = await verifyStoreAccess(businessId, requested);
    if (!validated) {
        return { ok: false, status: 404, error: "Store not found" };
    }
    return { ok: true, storeId: validated };
}
```

Keep `verifyStoreAccess` as-is; the routes already using it correctly
(`invoice/post.ts`, `customer/post.ts`, `product/update.ts`, `analytics/*`,
`invoiceItem/post.ts`) do not need to change in this phase.

### 4.2 `pages/api/product/post.ts` — the actual vulnerability

The user lookup at lines 35-38 already selects `role` and `storeId`. Replace the
store-resolution block at lines 45-63 with:

```ts
const scope = await resolveStoreScope(req, bId, currentUser.role, currentUser.storeId);
if (!scope.ok) return res.status(scope.status).json({ error: scope.error });
if (!scope.storeId) {
    return res.status(400).json({ error: "No active store selected. Please select a branch first." });
}
const targetStoreId = scope.storeId;
```

Note this *removes* the tenant-DB `tenantUser` fallback at lines 52-58. That
fallback exists for staff whose `storeId` was never mirrored to the master DB. If
`syncUserToTenant` guarantees the mirror (see `utils/lib/syncUser.ts`), drop the
fallback. If it does not, pass the resolved fallback into `resolveStoreScope` as
`assignedStoreId` rather than reintroducing it inside the helper — the helper must
stay free of tenant lookups. **Check `syncUser.ts` before deleting.**

### 4.3 `pages/api/expenses/index.ts`

The user lookup at lines 17-27 already selects `role` and `storeId`, and lines
41-53 already resolve `userStoreId` with the tenant fallback. Replace the ad-hoc
resolution at lines 58-67 (GET) and 167-179 (POST) with a single
`resolveStoreScope` call made once after line 53, then:

- GET: `scope.storeId === null` → admin, all stores (keep the existing
  `businessId`-only filter). Otherwise filter on `scope.storeId`.
- POST: `targetStoreId = scope.storeId`. **Delete the `payloadStoreId` branch at
  line 172** — a body-supplied `storeId` is a second unvalidated channel into the
  same field, and it is currently trusted with no check at all.

### 4.4 `pages/api/invoice/analytics.ts` and `pages/api/product/topProduct.ts`

Both build `targetStoreId` from the header for admins (lines `:43` and `:39`
respectively) and both fall back to "first active store" when absent
(`analytics.ts:46-52`, `topProduct.ts:49-55`). Replace the header read with
`resolveStoreScope`; keep the first-active-store fallback but drive it from
`scope.storeId === null` rather than from a falsy header.

### 4.5 Verify

As a business-A admin with a known business-B store UUID:

```bash
curl -X POST http://localhost:3000/api/product \
  -H "Cookie: __session=<business-A-admin>" \
  -H "x-store-id: <business-B-store-uuid>" \
  -H 'Content-Type: application/json' \
  -d '{"name":"probe","price":1,"quantity":1,"categoryId":"<A-category>"}'
# expect: 404 "Store not found"; no StoreInventory row created for B's store
```

Then confirm as a non-admin that spoofing `x-store-id` to a *sibling store in
their own business* no longer changes which store is written — staff are pinned.

---

## Phase 5 — HIGH: enforce roles server-side, not just in `RoleGuard`

**Finding**: `components/auth/RoleGuard.tsx:34-44` restricts `/expenses` and
`/suppliers` to `admin`/`manager`. The corresponding APIs do not check role at
all, so any authenticated `user` can read every expense and supplier in the
business and create new ones. This is authorization implemented in the browser.

`pages/api/audit-logs.ts:18` and `pages/api/users/get.ts:31-38` already gate
server-side and are the reference pattern.

### 5.1 Add a role helper

In `utils/server/auth.ts`:

```ts
export function hasRole(role: string | undefined, allowed: string[]): boolean {
    return !!role && allowed.includes(role.toLowerCase());
}
```

Lower-casing matters: `auth/delete/[userId].ts:32` and
`users/[id]/index.ts:202` both normalise case, so `"Admin"` exists in the wild.

### 5.2 Apply it

| File | Insert after | Allowed roles |
|---|---|---|
| `pages/api/expenses/index.ts` | line 33 (`user`/`businessId` guard) | `admin`, `manager` |
| `pages/api/expenses/[id].ts` | its equivalent user guard | `admin`, `manager` |
| `pages/api/suppliers/index.ts` | line 16 | `admin`, `manager` |
| `pages/api/suppliers/[id].ts` | its equivalent user guard | `admin`, `manager` |
| `pages/api/suppliers/failed-deliveries.ts` | its equivalent user guard | `admin`, `manager` |

```ts
if (!hasRole(user.role, ["admin", "manager"])) {
    return res.status(403).json({ error: "Forbidden" });
}
```

### 5.3 Reconcile the two lists

`ROLE_PERMISSIONS` in `RoleGuard.tsx:34-44` is now a duplicated policy. Do **not**
try to share it — the client list is per-page and the server list is per-endpoint,
and forcing them into one table creates a false equivalence. Instead add a comment
above `ROLE_PERMISSIONS`:

```ts
// UI affordance only. Authorization is enforced per-endpoint in pages/api/*.
// Changing this does NOT change what the API permits.
```

### 5.4 Audit the remaining routes

`RoleGuard` also gates `/dashboard` and `/settings` to admin/manager. Walk
`pages/api/analytics/*` and `pages/api/business/*` and confirm each either has a
role gate or is genuinely intended for all roles. Record the decision per route
in the commit message. Do not blanket-apply admin-only — `products`, `invoices`,
and `customers` are legitimately available to the `user` role per
`RoleGuard.tsx:38-41`.

---

## Phase 6 — HIGH: make deactivation actually revoke access

**Finding**: `user.status === "inactive"` is enforced only in
`RoleGuard.tsx:77-79`. A suspended employee's Clerk session keeps working against
every API route. The only writer of `"inactive"` is
`pages/api/subscription/downgrade.ts:88` (auto-suspending excess staff on a plan
downgrade); `pages/api/users/[id]/reactivate.ts:89` reverses it.

There are two layers here and both are worth having. Layer A alone closes the
hole; layer B catches records that drift out of sync.

### 6.1 Layer A — revoke the Clerk sessions at the moment of suspension

This is the small change that covers **every route at once**, including any route
added later, because a revoked session means `getAuth(req)` returns no `userId`.

In `pages/api/subscription/downgrade.ts`, immediately after the
`status: "inactive"` update at line 88:

```ts
import { clerkClient } from "@clerk/nextjs/server";

const clerk = await clerkClient();
const sessions = await clerk.sessions.getSessionList({ userId: <target clerk id> });
await Promise.allSettled(
    sessions.data.map((s) => clerk.sessions.revokeSession(s.id)),
);
```

Read the surrounding loop first — line 88 sits inside a bulk update, so you need
the affected users' `clerkId` values. If the current code uses `updateMany`,
change it to select the target rows first, then update, then revoke per user.
Wrap the revocation in `Promise.allSettled` and never let a Clerk failure roll
back the DB change: a suspended-in-DB user is still caught by layer B.

### 6.2 Layer B — check `status` at the API choke point

Add to `utils/server/auth.ts`:

```ts
type ApiUser = {
    clerkId: string;
    id: string;
    role: string;
    businessId: string;
    storeId: string | null;
};

type ApiUserResult =
    | { ok: true; user: ApiUser }
    | { ok: false; status: number; error: string };

/**
 * The standard entry gate for an authenticated, business-scoped API route:
 * verifies the session, loads the master-DB user, and rejects suspended
 * accounts. Optionally enforces a role allowlist.
 */
export async function requireApiUser(
    req: NextApiRequest,
    opts?: { roles?: string[] },
): Promise<ApiUserResult> {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return { ok: false, status: 401, error: "Unauthorized" };

    try {
        const user = await masterPrisma.user.findUnique({
            where: { clerkId },
            select: { id: true, role: true, status: true, businessId: true, storeId: true },
        });

        if (!user || !user.businessId) {
            return { ok: false, status: 403, error: "No business profile" };
        }
        if (user.status !== "active") {
            return { ok: false, status: 403, error: "Account suspended" };
        }
        if (opts?.roles && !hasRole(user.role, opts.roles)) {
            return { ok: false, status: 403, error: "Forbidden" };
        }

        return {
            ok: true,
            user: {
                clerkId,
                id: user.id,
                role: user.role,
                businessId: user.businessId,
                storeId: user.storeId,
            },
        };
    } catch (error) {
        console.error("requireApiUser DB error:", (error as Error)?.message);
        return { ok: false, status: 500, error: "Internal server error" };
    }
}
```

The `catch` mirrors `requireBusinessAccess` (`utils/server/auth.ts:50-53`): a DB
outage must produce 500, never an accidental allow.

### 6.3 Migrate routes to `requireApiUser` — incrementally, not all at once

Roughly 60 routes open with the same eight lines: `getAuth` → `masterPrisma.user.findUnique`
→ `if (!user || !user.businessId)`. Replacing all of them in one commit is a large
untestable diff.

**In this phase, migrate only the routes Phases 4 and 5 already touch** —
`expenses/index.ts`, `expenses/[id].ts`, `suppliers/*`, `product/post.ts`,
`product/topProduct.ts`, `invoice/analytics.ts`. They are being edited anyway and
the migration removes code rather than adding it.

Leave a `ponytail:` marker at the top of `utils/server/auth.ts`:

```ts
// ponytail: requireApiUser is the intended gate for all business-scoped API
// routes, but only the Phase 4/5 routes are migrated. Remaining routes still
// hand-roll getAuth + user lookup and therefore skip the suspended-account
// check; layer A (Clerk session revocation) covers them. Migrate opportunistically.
```

This marker is harvestable by `/ponytail-debt` so the remaining migration does not
get silently forgotten.

---

## Phase 7 — MEDIUM cluster

Independent, small, batchable into one commit.

### 7.1 `pages/api/auth/user/image.ts` — unauthenticated PII lookup

No `getAuth`. Takes an invitation ID, resolves it to a user, returns their Clerk
profile image (lines 27-45). Enumerable oracle for "this invitation ID belongs to
a real account".

Decide which of two things this endpoint is for:

- **If it serves the invitation-acceptance page** (unauthenticated by necessity):
  keep it public but require the invitation **token**, not the ID — the token is
  32 random bytes (`auth/invite/post.ts:18`) and is already the capability for
  that flow. Change the lookup at line 27-29 to `where: { token }`, and also
  require `status === "pending"` and a non-expired `expiresAt`, matching
  `auth/invite/validate.ts:29-37`.
- **If it serves an authenticated screen**: add `requireApiUser` and check the
  invitation's `businessId` matches the caller's.

Grep for the call site before choosing:
`grep -rn "auth/user/image" app components hooks store`.

### 7.2 `pages/api/auth/invite/accept.ts` — plaintext password in the response

Lines 142-148 return a generated password in the JSON body. It lands in proxy
logs, error trackers, and browser memory. Line 79 also sets
`skipPasswordChecks: true`, disabling Clerk's breach/strength validation on
user-supplied passwords.

- Set `skipPasswordChecks: false` at line 79. Handle the resulting Clerk
  validation error in the existing `catch` at lines 150-157 and surface it as a
  400 with Clerk's message, so the user sees "password found in a breach" rather
  than a generic 500.
- Remove the `credentials` block from the response (lines 142-148). When no
  password was supplied, drive the user through Clerk's password-reset/magic-link
  flow instead of minting one server-side. If that is too large a change right
  now, the interim step is to keep generating the password but deliver it only
  via the existing Novu notification channel — never in the HTTP response.

### 7.3 `business/test-connection.ts` + `business/test-url.ts` — DNS-blind SSRF filter

`isSafeUrl` (`test-connection.ts:17-63`, duplicated at `test-url.ts:9-38`) blocks
literal private IPs but never resolves hostnames, so `db.attacker.com → 10.0.0.5`
passes. Postgres-protocol-only limits this to a connect-oracle/port-scan rather
than metadata theft, but the distinct error responses at `test-url.ts:65-70` make
it a usable one.

- Extract the duplicated `isSafeUrl` into `utils/server/dbUrl.ts` and import it in
  both routes. The two copies have already drifted in comments; they will drift in
  logic next.
- Add DNS resolution before the allow decision:

```ts
import { promises as dns } from "dns";

const { address } = await dns.lookup(url.hostname);
if (isPrivateAddress(address)) return false;
```

  Reuse the existing literal-IP predicates for `isPrivateAddress`. This is
  TOCTOU-imperfect (a rebinding attack can flip the record between the check and
  Prisma's own connect) but raises the bar substantially. Note the limitation in a
  `ponytail:` comment rather than building a full pinned-resolver.
- `test-connection.ts:128-134` persists `tenantDatabaseUrl` **before** the
  connection is proven. Move that update to after the successful `$connect()` at
  line 147 so a failed attempt does not leave a bad encrypted URL on the business
  record.

### 7.4 `pages/api/subscription/stk-push.ts` — unowned `businessId`

`businessId` from the body (line 56) is never checked against the caller. It only
feeds the renewal-window guard at lines 78-108, so passing a foreign ID or
omitting it skips the guard. Fix: ignore the body value entirely and derive it:

```ts
const gate = await requireApiUser(req);
if (!gate.ok) return res.status(gate.status).json({ error: gate.error });
const businessId = gate.user.businessId;
```

Delete `businessId` from the destructuring at line 56.

---

## Phase 8 — LOW: headers and build hygiene

**File**: `next.config.mjs`

There are no security headers on any response. Add:

```js
async headers() {
    return [{
        source: "/:path*",
        headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "X-Frame-Options", value: "DENY" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
    }];
},
```

CSP is deliberately **not** in that list. Clerk, Novu, UploadThing, Supabase, and
ImageKit all inject scripts and open connections; a CSP written blind will break
sign-in. Add it as a separate piece of work: ship
`Content-Security-Policy-Report-Only` first, collect violations for a week, then
enforce. Do not attempt it inside this remediation.

Also in `next.config.mjs`:

- Line 5: `productionBrowserSourceMaps: true` publishes full client source in
  production. Set to `false` unless an error tracker consumes the maps, in which
  case upload them to the tracker rather than serving them.
- Line 7: `dangerouslyAllowSVG: true` combined with the user-writable Supabase
  public bucket in `remotePatterns` (line 38-41). Next 15 defaults
  `contentDispositionType: "attachment"`, which mitigates stored SVG XSS — set it
  explicitly rather than depending on the default:

```js
images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // ...
}
```

---

## Phase 9 — the one runnable check

Non-trivial authorization logic needs a check that fails when the logic breaks.
One file, no framework, no fixtures. Create `utils/server/auth.test.ts` (or
`.check.ts` if the project has no test runner wired — it runs under
`npx tsx utils/server/auth.check.ts`):

```ts
import assert from "node:assert/strict";
import { hasRole } from "./auth";

// hasRole is case-insensitive — "Admin" exists in the wild (see auth/delete/[userId].ts:32)
assert.equal(hasRole("Admin", ["admin"]), true);
assert.equal(hasRole("admin", ["admin", "manager"]), true);
assert.equal(hasRole("user", ["admin", "manager"]), false);
assert.equal(hasRole(undefined, ["admin"]), false);
assert.equal(hasRole("", ["admin"]), false);
// Fails closed on an unknown role string
assert.equal(hasRole("superadmin", ["admin", "manager", "user"]), false);

console.log("auth checks passed");
```

`resolveStoreScope` and `requireApiUser` both hit the database, so they are not
covered here; their behaviour is verified by the curl steps in §4.5 and by the
manual suspension test in Phase 6. If a DB-backed test harness is added later,
those two are the first candidates.

---

## Execution order and dependencies

```
Phase 1  (delete endpoint)      — independent, ship first
Phase 2  (subscription callback)— independent, ship first
Phase 3  (invite role)          — independent
        ↓
Phase 4  (store scope helper)   — adds resolveStoreScope to utils/server/auth.ts
Phase 5  (server-side roles)    — adds hasRole to the same file
        ↓
Phase 6  (suspension)           — adds requireApiUser, which uses hasRole (Phase 5)
        ↓
Phase 7  (medium cluster)       — 7.4 uses requireApiUser (Phase 6)
Phase 8  (headers)              — independent, can ship any time
Phase 9  (check)                — after Phase 5
```

Phases 1, 2, and 3 are the ones that matter. If time runs out, ship those three
and nothing else — they are the unauthenticated-destruction, the payment bypass,
and the privilege escalation. Everything below Phase 5 is hardening.

---

## Explicitly out of scope

Recorded so the next reviewer does not re-flag them as oversights:

- **CSRF tokens.** Clerk's session cookie is `SameSite=Lax`, which blocks the
  cross-site POST case. Adding a token layer is defensible defence-in-depth but is
  not a live vulnerability here and would touch every mutating route.
- **Migrating all ~60 routes to `requireApiUser`.** Tracked by the `ponytail:`
  marker from §6.3.
- **`pages/api/safaricom/confirmation.ts:10-25`** writes payer PII to a plaintext
  JSON file in the app tree. Already flagged with a `ponytail:` comment in the
  previous pass; it is a data-handling problem, not an access-control one.
- **A full CSP.** See Phase 8.
- **Sequential vs UUID identifiers.** Already UUIDs throughout
  (`@default(uuid())` in both schemas).
- **The 47 known-vulnerable transitive dependencies** and the Prisma major-version
  upgrade found in an earlier audit. Separate work stream.
