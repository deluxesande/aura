import {
    BookOpen,
    CreditCard,
    ShieldCheck,
    Settings,
    Smartphone,
    Search,
    List,
} from "lucide-react";

export const HELP_CATEGORIES = [
    {
        slug: "getting-started",
        title: "Getting Started",
        icon: BookOpen,
        description:
            "Account setup, first login, and configuring your business profile.",
    },
    {
        slug: "inventory-and-products",
        title: "Inventory & Products",
        icon: List,
        description:
            "Managing products, categories, variants, and stock levels.",
    },
    {
        slug: "billing-and-mpesa",
        title: "Billing & M-Pesa",
        icon: CreditCard,
        description:
            "Connecting Paybills, transaction tracking, and subscription plans.",
    },
    {
        slug: "finding-products",
        title: "Finding Products",
        icon: Search,
        description:
            "Using search and filters to quickly find products in your inventory.",
    },
    {
        slug: "kra-compliance",
        title: "KRA Compliance",
        icon: ShieldCheck,
        description:
            "Understanding tax tracking and maintaining accurate records for iTax.",
    },
    {
        slug: "account-settings",
        title: "Account Settings",
        icon: Settings,
        description:
            "Password reset, user roles, and profile preferences.",
    },
];

export const HELP_ARTICLES = [
    // --- GETTING STARTED ---
    {
        slug: "setting-up-shop-profile",
        categorySlug: "getting-started",
        title: "Setting Up Your Business Profile",
        updatedAt: "1 day ago",
        content: [
            {
                type: "paragraph",
                text: "Your business profile contains the basic information about your shop that appears on invoices.",
            },
            {
                type: "step",
                text: "Navigate to **Settings** in the sidebar menu.",
            },
            {
                type: "step",
                text: "Under **Profile Info**, ensure your Name and Role are correct.",
            },
            {
                type: "step",
                text: "Check **Business Settings** to ensure your business name is correctly displayed.",
            },
            {
                type: "alert",
                text: "Note: Your business name is what your staff and customers will see. If you need to change it, visit the Business Settings tab.",
            },
        ],
    },

    // --- INVENTORY & PRODUCTS ---
    {
        slug: "adding-first-product",
        categorySlug: "inventory-and-products",
        title: "Adding Products and Variants",
        updatedAt: "March 24, 2026",
        content: [
            {
                type: "paragraph",
                text: "SaleSense allows you to add both simple products and products with multiple variants (like sizes or colors).",
            },
            {
                type: "step",
                text: "Go to **Inventory > Create Product**.",
            },
            {
                type: "step",
                text: "For a simple product, fill in the Name, Price, and Quantity.",
            },
            {
                type: "step",
                text: "For variants, select the **Variant** type. You can add multiple attributes and values at once.",
            },
            {
                type: "alert",
                text: "NEW: Our batch creation logic now processes multiple variants instantly in one go!",
            },
        ],
    },

    // --- BILLING & M-PESA ---
    {
        slug: "how-to-connect-paybill",
        categorySlug: "billing-and-mpesa",
        title: "Configuring M-Pesa Integration",
        updatedAt: "March 24, 2026",
        content: [
            {
                type: "paragraph",
                text: "Configuring your M-Pesa credentials allows the system to process payments more effectively.",
            },
            {
                type: "step",
                text: "Navigate to **Settings > Integrations**.",
            },
            {
                type: "step",
                text: "Enter your M-Pesa Short Code, Consumer Key, and Consumer Secret.",
            },
            {
                type: "alert",
                text: "Ensure you use your Daraja API credentials. Check the Blog for a full step-by-step guide.",
            },
        ],
    },

    // --- FINDING PRODUCTS ---
    {
        slug: "using-search-and-filters",
        categorySlug: "finding-products",
        title: "How to Use Search and Filters",
        updatedAt: "March 24, 2026",
        content: [
            {
                type: "paragraph",
                text: "We've added advanced search and filtering to help you find products quickly, even in large inventories.",
            },
            {
                type: "step",
                text: "Use the **Search Bar** at the top of the Products or Inventory page to search by name, SKU, or description.",
            },
            {
                type: "step",
                text: "Click the **Filter Icon** (sliders) next to the search bar to open advanced filters.",
            },
            {
                type: "step",
                text: "Filter by **Price Range**, **Category**, or use the **'In Stock Only'** toggle.",
            },
        ],
    },

    // --- KRA COMPLIANCE ---
    {
        slug: "generating-tax-reports",
        categorySlug: "kra-compliance",
        title: "Tracking Sales for KRA Compliance",
        updatedAt: "1 week ago",
        content: [
            {
                type: "paragraph",
                text: "SaleSense automatically tracks your sales data, making it easier to prepare for tax returns.",
            },
            {
                type: "step",
                text: "Process sales normally through the POS screen.",
            },
            {
                type: "step",
                text: "All transactions are recorded in the **Invoices** section.",
            },
            {
                type: "paragraph",
                text: "The system provides clear visibility into your total revenue and transaction counts, helping you stay within your plan's limits and prepare for filing.",
            },
        ],
    },

    // --- ACCOUNT SETTINGS ---
    {
        slug: "resetting-password",
        categorySlug: "account-settings",
        title: "Managing Your Account",
        updatedAt: "1 month ago",
        content: [
            {
                type: "paragraph",
                text: "You can manage your personal details and security settings from the Profile and Settings pages.",
            },
            {
                type: "step",
                text: "Go to **Profile** to update your name or view your current role.",
            },
            {
                type: "step",
                text: "Use the **Update Password** form in Settings to keep your account secure.",
            },
            {
                type: "step",
                text: "Admins can manage other users under the **User Management** tab.",
            },
        ],
    },
];
