export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    readTime: string;
    date: string;
    image: string;
    content: Array<{
        type: "paragraph" | "heading" | "list" | "alert" | "step";
        text?: string;
        items?: string[];
    }>;
}

export const BLOG_POSTS: BlogPost[] = [
    {
        slug: "how-to-get-mpesa-credentials",
        title: "How to Get Your M-Pesa Daraja API Credentials",
        excerpt:
            "A step-by-step guide to creating an app on the Safaricom Daraja Portal and generating your Consumer Key and Secret for use with Salesense.",
        category: "Guides",
        readTime: "5 min read",
        date: "March 24, 2026",
        image: "/images/M-PESA-logo-2.png",
        content: [
            {
                type: "paragraph",
                text: "To accept M-Pesa payments through Salesense, you need two credentials from Safaricom's developer portal: a **Consumer Key** and a **Consumer Secret**. This guide walks you through generating them on the Daraja portal.",
            },
            { type: "heading", text: "Step 1: Sign up on Daraja" },
            {
                type: "paragraph",
                text: "Go to developer.safaricom.co.ke and sign in with your business account. If you do not have an account yet, register — the process takes a few minutes and requires a valid business email.",
            },
            { type: "heading", text: "Step 2: Create a new app" },
            {
                type: "paragraph",
                text: "Click **'My Apps'** in the top navigation, then **'Create New App'**. Give it a recognisable name such as 'Salesense Integration'.",
            },
            {
                type: "step",
                text: "Name your app something descriptive — you may create multiple apps, so clarity helps later.",
            },
            {
                type: "step",
                text: "Check the box for **Lipa na M-Pesa Sandbox** if you are still testing, or select the relevant production products for a live setup.",
            },
            {
                type: "alert",
                text: "You must select at least one product before saving. If no product is checked, the portal will not allow the app to be created.",
            },
            { type: "heading", text: "Step 3: Copy your credentials" },
            {
                type: "paragraph",
                text: "Open the app from your list and select the **Keys** tab. You will see:",
            },
            {
                type: "list",
                items: [
                    "Consumer Key — a long alphanumeric string that identifies your app.",
                    "Consumer Secret — a second string used alongside the key to authenticate requests.",
                ],
            },
            {
                type: "paragraph",
                text: "Copy both values and paste them into Salesense under **Settings → Integrations → M-Pesa**. Once saved, Salesense will begin reconciling incoming M-Pesa payments automatically.",
            },
        ],
    },
    {
        slug: "mastering-inventory-reconciliation",
        title: "Why Regular Stocktaking is the Cheapest Way to Protect Your Margins",
        excerpt:
            "Inventory leakage is silent and cumulative. Here is how to use Salesense's stocktaking tools to catch discrepancies before they compound into losses.",
        category: "Inventory",
        readTime: "7 min read",
        date: "April 18, 2026",
        image: "/images/default-product.png",
        content: [
            {
                type: "paragraph",
                text: "Your system says you have 10 units in stock. Your shelf has 8. That two-unit gap does not sound serious — until you multiply it across 200 product lines and realise you have been absorbing the loss quietly for months. Inventory leakage through theft, damage, or counting errors is one of the most common causes of margin erosion in retail, and it is almost always invisible until it is serious.",
            },
            { type: "heading", text: "What reconciliation actually does" },
            {
                type: "paragraph",
                text: "Reconciliation is the process of aligning your digital stock records with your physical stock. Salesense's Stocktake feature lets you perform a full count and flag every discrepancy in one session — what used to take a full day can be done in under an hour.",
            },
            { type: "heading", text: "How to run an effective stocktake" },
            {
                type: "list",
                items: [
                    "Count regularly, not just at year-end: High-value or fast-moving items should be counted weekly. Catching a discrepancy early limits the damage.",
                    "Use a barcode scanner where possible: Scanning eliminates the transcription errors that make manual counts unreliable.",
                    "Investigate every significant gap: If Salesense shows a large negative discrepancy, open the Audit Log to check whether a sale was deleted, a delivery was not received, or a manual adjustment was made outside of a formal stocktake.",
                ],
            },
            {
                type: "alert",
                text: "Run stocktakes during off-peak hours or after closing. Active sales during a count will cause your numbers to shift mid-session and produce false discrepancies.",
            },
            {
                type: "paragraph",
                text: "A reconciled inventory means your reorder decisions are based on real numbers, your customers are never promised stock you do not have, and internal issues are visible before they grow into serious losses.",
            },
        ],
    },
    {
        slug: "procurement-lifecycle-guide",
        title: "The Case for Purchase Orders: From WhatsApp Orders to a Proper Paper Trail",
        excerpt:
            "Most Kenyan SMEs still manage supplier orders over the phone or WhatsApp. Here is why formalising procurement saves money and catches delivery errors before they hit your accounts.",
        category: "Supply Chain",
        readTime: "5 min read",
        date: "April 18, 2026",
        image: "/images/default-product.png",
        content: [
            {
                type: "paragraph",
                text: "Ordering stock over WhatsApp is fast and familiar — but it leaves no structured record of what was agreed, what was delivered, and at what price. When a supplier delivers 90 units instead of 100, or invoices you for a price you did not agree to, there is nothing to refer back to. A Purchase Order (PO) closes that gap.",
            },
            { type: "heading", text: "What a purchase order gives you" },
            {
                type: "paragraph",
                text: "A PO is a formal record of what you are buying, in what quantity, and at what agreed price. It creates accountability on both sides of the transaction.",
            },
            {
                type: "list",
                items: [
                    "Financial visibility: You know exactly how much capital is committed to stock that has not yet arrived.",
                    "Delivery accuracy: When goods arrive, your staff can check the physical delivery against the PO line by line and flag shortfalls immediately.",
                    "Automatic stock updates: In Salesense, receiving a PO updates your inventory across all branches — no manual entry required.",
                ],
            },
            { type: "heading", text: "The procurement workflow in Salesense" },
            {
                type: "paragraph",
                text: "Create a PO under **Procurement → Purchase Orders**. As goods ship, update the status to reflect transit. When the delivery arrives, use **Receive Stock** in your Delivery History to match the physical goods against the PO. This closes the loop and keeps your records accurate without any double entry.",
            },
            {
                type: "alert",
                text: "Once a PO is marked as Delivered, it cannot be edited. This is intentional — your financial history needs to be a reliable record, not a document that can be adjusted after the fact.",
            },
        ],
    },
    {
        slug: "byodb-your-own-database",
        title: "Your Data, Your Database: How Salesense's BYODB Option Works",
        excerpt:
            "For enterprise clients who need physical data isolation, Salesense supports connecting your own dedicated PostgreSQL database. Here is what that means, how onboarding works, and who it is designed for.",
        category: "Enterprise",
        readTime: "6 min read",
        date: "May 4, 2026",
        image: "/images/default-product.png",
        content: [
            {
                type: "paragraph",
                text: "By default, Salesense stores your business data on a high-performance shared database — logically isolated from every other business on the platform, and suitable for the vast majority of users. But for enterprise clients with strict data residency requirements or compliance obligations, logical isolation is not enough. They need physical isolation: their own dedicated database, under their own control.",
            },
            { type: "heading", text: "What BYODB means" },
            {
                type: "paragraph",
                text: "BYODB (Bring Your Own Database) lets you connect a PostgreSQL database that you host and own. Salesense will use it exclusively for your business data — your invoices, customers, products, and inventory never touch the shared infrastructure.",
            },
            { type: "heading", text: "How onboarding works" },
            {
                type: "list",
                items: [
                    "You provide your PostgreSQL connection string during business setup.",
                    "Salesense validates that the database is reachable, then encrypts and stores your connection string — no one on the Salesense team can read it in plaintext.",
                    "Salesense pushes the tenant schema to your database, creating all the necessary tables. This happens once, automatically.",
                    "From that point on, all your data is written to and read from your database only.",
                ],
            },
            { type: "heading", text: "What Salesense can and cannot see" },
            {
                type: "paragraph",
                text: "Salesense's application connects to your database using the credentials you provide to serve you the product. It does not have administrative access to your database server, cannot create or drop databases, and does not transmit your data to any third party. The connection is used solely to run the queries that power your Salesense account.",
            },
            {
                type: "alert",
                text: "BYODB is available on the Premium plan. If you are evaluating Salesense for an enterprise rollout or have specific compliance requirements, contact the team to discuss your setup before signing up.",
            },
            { type: "heading", text: "Is BYODB right for you?" },
            {
                type: "list",
                items: [
                    "You are subject to data residency regulations that require your data to remain in a specific jurisdiction.",
                    "Your organisation's security policy requires that business data be stored on infrastructure you control.",
                    "You are running Salesense across multiple branches or entities and want complete database-level separation between them.",
                ],
            },
            {
                type: "paragraph",
                text: "If none of those apply, the standard shared plan gives you the same product experience with no infrastructure to manage. BYODB adds control, not features — choose it when control is what your compliance or security requirements demand.",
            },
        ],
    },
];
