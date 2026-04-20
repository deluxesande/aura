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
            "A step-by-step guide to creating an app on the Safaricom Daraja Portal and generating your Consumer Key and Secret.",
        category: "Guides",
        readTime: "5 min read",
        date: "March 24, 2026",
        image: "/images/M-PESA-logo-2.png",
        content: [
            {
                type: "paragraph",
                text: "To integrate M-Pesa payments into SaleSense, you need two critical pieces of information: the **Consumer Key** and the **Consumer Secret**. These are generated on Safaricom's developer portal, known as Daraja.",
            },
            {
                type: "heading",
                text: "Step 1: Sign up on Daraja",
            },
            {
                type: "paragraph",
                text: "Navigate to the Safaricom Developer Portal (developer.safaricom.co.ke). If you don't have an account, sign up as an individual or company. If you already have one, simply log in.",
            },
            {
                type: "heading",
                text: "Step 2: Create a New App",
            },
            {
                type: "paragraph",
                text: "Once logged in, click on the **'My Apps'** tab in the top navigation bar. Then click the **'Create New App'** button.",
            },
            {
                type: "step",
                text: "Name your app (e.g., 'SaleSense Integration').",
            },
            {
                type: "step",
                text: "Ensure you check the box for **Lipa na M-Pesa Sandbox** (for testing) or the specific production products you need.",
            },
            {
                type: "alert",
                text: "Important: You must check at least one product option (like Lipa na M-Pesa) or the app creation will fail.",
            },
            {
                type: "heading",
                text: "Step 3: Copy Your Credentials",
            },
            {
                type: "paragraph",
                text: "After creating the app, click on it from your list. You will see two tabs: 'Keys' and 'Products'. Under the **Keys** tab, you will find:",
            },
            {
                type: "list",
                items: [
                    "Consumer Key: (A long string of random characters)",
                    "Consumer Secret: (Another long string)",
                ],
            },
            {
                type: "paragraph",
                text: "Copy these keys and paste them into your SaleSense settings page under the Integrations tab to enable automatic payment tracking.",
            },
        ],
    },
    {
        slug: "mastering-inventory-reconciliation",
        title: "Why Stocktaking is the Secret to Higher Profits",
        excerpt:
            "Learn how regular inventory reconciliation catches hidden losses and ensures your business is running at peak efficiency.",
        category: "Inventory",
        readTime: "7 min read",
        date: "April 18, 2026",
        image: "/public/ProductsPage.jpg",
        content: [
            {
                type: "paragraph",
                text: "Inventory leakage - whether through theft, damage, or simple counting errors - is one of the leading causes of business failure in retail. If your system says you have 10 items but your shelf only has 8, you are losing money without even knowing it.",
            },
            {
                type: "heading",
                text: "The Goal of Reconciliation",
            },
            {
                type: "paragraph",
                text: "Reconciliation is the process of aligning your 'digital' stock with your 'physical' stock. By using the new Stocktaking feature in SaleSense, you can perform these checks in minutes instead of hours.",
            },
            {
                type: "heading",
                text: "How to Run a Perfect Stocktake",
            },
            {
                type: "list",
                items: [
                    "Schedule regular counts: Don't wait for the end of the year. Count high-value items weekly.",
                    "Use a Barcode Scanner: Scanning is faster and removes human error compared to manual entry.",
                    "Investigate Discrepancies: If the system shows a large negative discrepancy, check your audit logs to see if a sale was deleted or a delivery was missed.",
                ],
            },
            {
                type: "alert",
                text: "Pro Tip: Perform your stocktakes during off-peak hours or when the shop is closed to ensure that active sales don't interfere with your counts.",
            },
            {
                type: "paragraph",
                text: "A reconciled inventory means you never disappoint a customer by promising stock you don't actually have, and you can spot internal issues before they become major crises.",
            },
        ],
    },
    {
        slug: "procurement-lifecycle-guide",
        title: "The Strategic Power of Purchase Orders",
        excerpt:
            "Stop ordering stock over the phone. Professionalize your procurement and track your spending with Purchase Orders.",
        category: "Supply Chain",
        readTime: "5 min read",
        date: "April 18, 2026",
        image: "/images/default-product.png",
        content: [
            {
                type: "paragraph",
                text: "Many SMEs manage their suppliers informally-a quick phone call or a WhatsApp message. While fast, this method lacks a paper trail and makes it impossible to track partial deliveries or price fluctuations over time.",
            },
            {
                type: "heading",
                text: "Why use Purchase Orders (POs)?",
            },
            {
                type: "paragraph",
                text: "A Purchase Order is a formal agreement between you and your supplier. It states exactly what you are buying, in what quantity, and at what price.",
            },
            {
                type: "list",
                items: [
                    "Financial Control: You know exactly how much money you have committed to future stock.",
                    "Delivery Accuracy: When the truck arrives, your staff can check the delivery against the PO to ensure nothing is missing.",
                    "Automated Inventory: In SaleSense, receiving a PO automatically updates your stock levels across all branches-no manual entry required.",
                ],
            },
            {
                type: "heading",
                text: "The Procurement Workflow",
            },
            {
                type: "paragraph",
                text: "Start by creating a PO in the 'Suppliers' section. Once the goods are in transit, mark the status. When they arrive, use the 'Receive Stock' tool in your Delivery History to link the arrival to the PO. This closes the loop and ensures your records are 100% accurate.",
            },
            {
                type: "alert",
                text: "New Restriction: To maintain integrity, once a PO is marked as DELIVERED, it cannot be changed. This ensures your financial history remains untampered.",
            },
        ],
    },
    {
        slug: "audit-logs-accountability",
        title: "Maintaining Integrity with Audit Logs",
        excerpt:
            "Transparency is the key to trust. Learn how to use Audit Logs to oversee your staff and protect your business data.",
        category: "Security",
        readTime: "4 min read",
        date: "April 18, 2026",
        image: "/images/kra-seeklogo.png",
        content: [
            {
                type: "paragraph",
                text: "As your business grows and you hire more staff, you cannot be everywhere at once. You need a system that watches the business for you. That is the role of the Audit Log.",
            },
            {
                type: "heading",
                text: "The Digital Paper Trail",
            },
            {
                type: "paragraph",
                text: "Every sensitive action-deleting an invoice, adjusting stock, or changing a product's price-is now recorded in SaleSense. This isn't about 'spying' on employees; it's about creating a culture of accountability.",
            },
            {
                type: "list",
                items: [
                    "Spot Suspicious Patterns: See if invoices are being deleted unusually often during certain shifts.",
                    "Track Pricing Changes: Ensure that unauthorized discounts aren't being given to friends or family.",
                    "Verify Stock Adjustments: If stock was adjusted outside of a formal stocktake, you'll know exactly who did it and when.",
                ],
            },
            {
                type: "paragraph",
                text: "Access your logs via **Settings > Audit Logs**. You can filter by action or user to quickly find the information you need. In an audit-ready business, every number has a story, and the Audit Log is the book that tells it.",
            },
        ],
    },
    {
        slug: "data-security-and-trust",
        title: "Your Business Data is Your Business: Our Commitment to Security and Privacy",
        excerpt:
            "In an era where data is the new oil, trust is paramount. Learn why SaleSense is built on a foundation of absolute privacy, ensuring your sales, customer, and inventory data remains exclusively yours.",
        category: "Security",
        readTime: "6 min read",
        date: "April 20, 2026",
        image: "/images/security-lock.png",
        content: [
            {
                type: "paragraph",
                text: "When you adopt a cloud-based ERP like SaleSense, you are entrusting us with the lifeblood of your business: your sales figures, your customer lists, your supplier details, and your profit margins. A common and completely justified fear among business owners is: 'What happens to my data? Is the developer selling my insights to my competitors?'",
            },
            {
                type: "paragraph",
                text: "The short answer is an unequivocal no. SaleSense was built specifically to empower Kenyan businesses, not to exploit them. We understand that our entire business model relies on your absolute trust. If that trust is broken, our platform fails.",
            },
            {
                type: "heading",
                text: "Why Choose SaleSense? The Power of Ownership",
            },
            {
                type: "paragraph",
                text: "SaleSense is designed to give you complete control and visibility over your operations, without sacrificing privacy. Unlike 'free' platforms that monetize your usage patterns, SaleSense is a premium tool where you are the customer, not the product.",
            },
            {
                type: "list",
                items: [
                    "Direct M-Pesa Integration: We facilitate the connection between your system and Safaricom, but the funds flow directly to your Paybill or Till. We never touch your money.",
                    "Automated KRA Compliance: We calculate and prepare your returns based solely on the data you input, ensuring accurate and private tax compliance without third-party interference.",
                    "Actionable Internal Insights: Your analytics are generated on-the-fly for your eyes only. We do not aggregate your sales data into 'industry benchmarks' or sell market trends to larger competitors.",
                ],
            },
            {
                type: "heading",
                text: "How We Guarantee Your Data is Safe",
            },
            {
                type: "paragraph",
                text: "We don't just ask for your trust; we engineer it into the architecture of the platform. Here is how we ensure your data is secure from external threats and internal compromise:",
            },
            {
                type: "list",
                items: [
                    "Enterprise-Grade Encryption: All data transmitted between your device and our servers is secured using TLS 1.3 encryption. At rest, your data is encrypted using AES-256, the same standard used by global financial institutions.",
                    "Isolated Database Architecture: Your business data is logically isolated. A flaw in one account cannot 'leak' into another. Your inventory and customer data are entirely cordoned off from every other business on the platform.",
                    "World-Class Authentication: We utilize Clerk for authentication, meaning we don't even store your passwords. Clerk handles identity verification with SOC2, HIPAA, and ISO 27001 compliance, ensuring that only authorized users can access your account.",
                    "Immutable Audit Logs: Every significant action taken within your account is recorded. You have full visibility into who accessed what, and when. This protects you against internal staff issues and provides a clear record of system integrity.",
                ],
            },
            {
                type: "heading",
                text: "The 'Compromised Developer' Question",
            },
            {
                type: "paragraph",
                text: "What prevents the developers themselves from looking at your data? We have implemented strict internal access controls.",
            },
            {
                type: "paragraph",
                text: "Our engineering team operates on a principle of 'Zero Standing Privileges.' This means no developer has permanent, unrestricted access to the production database. In the rare event that database access is required to fix a critical bug, it requires temporary, logged, and multi-party approved access. Furthermore, our business model relies on subscription revenue, not data brokering. Selling your data would not only be a violation of our strict privacy policy and Kenyan data protection laws (DPA 2019), but it would destroy the foundation of our company.",
            },
            {
                type: "alert",
                text: "Our Promise: Your data is your property. We will never sell, rent, or share your individual business metrics, customer lists, or supplier pricing with any third party, including your competitors.",
            },
            {
                type: "paragraph",
                text: "By choosing SaleSense, you are investing in a tool that respects your privacy as much as it accelerates your growth. Build your business with confidence, knowing your data is locked down, secure, and entirely yours.",
            },
        ],
    },
];
