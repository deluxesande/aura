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
        slug: "why-compliance-matters",
        title: "Why KRA Compliance is Crucial for Kenyan SMEs",
        excerpt:
            "Understanding the risks of non-compliance and how SaleSense automated tools can save you from hefty fines and business closures.",
        category: "Compliance",
        readTime: "4 min read",
        date: "March 20, 2026",
        image: "/images/kra-seeklogo.png",
        content: [
            {
                type: "paragraph",
                text: "For many small business owners in Kenya, tax compliance feels like a burden. Between managing stock, employees, and customers, filing returns often takes a backseat. However, ignoring KRA compliance is a risk that can sink an otherwise profitable business.",
            },
            {
                type: "heading",
                text: "The Cost of Non-Compliance",
            },
            {
                type: "paragraph",
                text: "The Kenya Revenue Authority (KRA) has digitized its systems via iTax and is actively using data to identify non-compliant businesses. The penalties are steep:",
            },
            {
                type: "list",
                items: [
                    "Failure to file returns: KSh 2,000 or 5% of tax due (whichever is higher) for monthly returns.",
                    "Late payment interest: 1% per month on the unpaid tax.",
                    "Loss of TCC: Without a Tax Compliance Certificate, you cannot apply for government tenders or bank loans.",
                ],
            },
            {
                type: "heading",
                text: "It’s About Growth, Not Just Taxes",
            },
            {
                type: "paragraph",
                text: "Compliance isn't just about avoiding fines; it's about positioning your business for growth. Corporate clients and suppliers often require proof of compliance before doing business. If you want to scale, your books need to be clean.",
            },
            {
                type: "alert",
                text: "Did you know? SaleSense automatically tracks your sales and calculates potential tax liabilities, ensuring you are always audit-ready.",
            },
            {
                type: "paragraph",
                text: "By automating your sales tracking, you remove the guesswork. You know exactly what you sold, what is taxable, and what isn't, ensuring you never overpay or underpay your taxes.",
            },
        ],
    },
    {
        slug: "inventory-management-tips",
        title: "5 Tips to Optimize Your Inventory with SaleSense",
        excerpt:
            "Stop losing money to dead stock. Learn how to track your best sellers and manage reorder levels effectively.",
        category: "Growth",
        readTime: "6 min read",
        date: "March 15, 2026",
        image: "/images/default-product.png",
        content: [
            {
                type: "paragraph",
                text: "Inventory is simply cash sitting on your shelves. If it moves too slowly, your cash flow dies. If you run out of it, you lose customers to competitors. Balancing this is the art of inventory management.",
            },
            {
                type: "heading",
                text: "1. The First-In-First-Out (FIFO) Rule",
            },
            {
                type: "paragraph",
                text: "This is crucial for perishable goods (like cafes) but applies to hardware too. Ensure older stock is sold before newer shipments. This prevents expiration and obsolescence.",
            },
            {
                type: "heading",
                text: "2. Identify Your Best Sellers (The 80/20 Rule)",
            },
            {
                type: "paragraph",
                text: "Typically, 80% of your revenue comes from 20% of your products. Do you know which ones they are? Focus your capital on keeping these items in stock.",
            },
            {
                type: "step",
                text: "Check your SaleSense 'Top Products' chart on the dashboard to instantly see what is moving fast this month.",
            },
            {
                type: "heading",
                text: "3. Set Reorder Points",
            },
            {
                type: "paragraph",
                text: "Don't wait until the shelf is empty to order more. Determine a minimum quantity for each item. When stock hits that level, place an order immediately.",
            },
            {
                type: "heading",
                text: "4. Regular Audits",
            },
            {
                type: "paragraph",
                text: "Even with software, physical counts are necessary to catch theft or damage. Schedule a 'stock-take' at the end of every week or month to reconcile your physical stock with your system numbers.",
            },
            {
                type: "alert",
                text: "Pro Tip: Use the SaleSense Inventory list to export your current stock levels, making physical stock-taking much faster.",
            },
        ],
    },
];
