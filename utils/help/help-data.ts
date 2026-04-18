import {
    BookOpen,
    CreditCard,
    ShieldCheck,
    Settings,
    Smartphone,
    Search,
    List,
    Truck,
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
            "Managing products, variants, stocktaking, and barcodes.",
    },
    {
        slug: "sales-and-invoicing",
        title: "Sales & Invoicing",
        icon: Smartphone,
        description:
            "Creating invoices, M-Pesa payments, and KRA tax compliance.",
    },
    {
        slug: "supply-chain",
        title: "Supply Chain",
        icon: Truck,
        description:
            "Managing suppliers, purchase orders, and receiving stock.",
    },
    {
        slug: "audit-and-security",
        title: "Audit & Security",
        icon: ShieldCheck,
        description:
            "User roles, audit logs, and system accountability.",
    },
    {
        slug: "account-settings",
        title: "Account Settings",
        icon: Settings,
        description:
            "Branch management, subscription plans, and profile preferences.",
    },
];

export const HELP_ARTICLES = [
    // --- GETTING STARTED ---
    {
        slug: "setting-up-shop-profile",
        categorySlug: "getting-started",
        title: "Setting Up Your Business Profile",
        updatedAt: "Updated today",
        content: [
            {
                type: "paragraph",
                text: "Your business profile is the identity of your shop on SaleSense. The information provided here is used to generate professional invoices and receipts.",
            },
            {
                type: "step",
                text: "Navigate to **Settings** from the sidebar.",
            },
            {
                type: "step",
                text: "In the **Business Settings** section, enter your legal business name, contact information, and address.",
            },
            {
                type: "step",
                text: "Upload your business logo. This will appear on all digital and PDF invoices sent to your customers.",
            },
            {
                type: "alert",
                text: "Professionalism Tip: Ensure your address and phone number are accurate, as these are critical for KRA compliance and customer trust.",
            },
        ],
    },

    // --- INVENTORY & PRODUCTS ---
    {
        slug: "managing-products-variants",
        categorySlug: "inventory-and-products",
        title: "Managing Products and Variants",
        updatedAt: "Updated today",
        content: [
            {
                type: "paragraph",
                text: "SaleSense supports complex inventory needs, including products that come in different sizes, colors, or materials.",
            },
            {
                type: "step",
                text: "To add a new product, go to **Inventory > Products** and click 'Add Product'.",
            },
            {
                type: "step",
                text: "If a product has variations, toggle the 'This product has variants' switch. You can then define attributes like 'Size' (S, M, L) or 'Color' (Red, Blue).",
            },
            {
                type: "step",
                text: "Each variant can have its own SKU, price, and initial stock level.",
            },
            {
                type: "paragraph",
                text: "Using SKUs (Stock Keeping Units) is highly recommended. You can let the system auto-generate them or input your own barcode numbers for easy scanning during sales.",
            },
        ],
    },
    {
        slug: "inventory-reconciliation",
        categorySlug: "inventory-and-products",
        title: "Performing a Stocktake (Reconciliation)",
        updatedAt: "New Feature",
        content: [
            {
                type: "paragraph",
                text: "Stocktaking is the process of physically counting your stock and comparing it to the system's records. This helps identify theft, damage, or data entry errors.",
            },
            {
                type: "step",
                text: "Navigate to **Inventory > Stocktaking**.",
            },
            {
                type: "step",
                text: "Select the branch you are currently counting.",
            },
            {
                type: "step",
                text: "Search for products and enter the **Physical Quantity** you have on hand.",
            },
            {
                type: "step",
                text: "The system will show a **Discrepancy** (e.g., -2 if you have two fewer items than the system expected).",
            },
            {
                type: "step",
                text: "Click **Complete Stocktake** to adjust the system's records to match your physical count.",
            },
            {
                type: "alert",
                text: "Security Note: Every stocktake is recorded in the Audit Logs, including who performed it and what the discrepancies were.",
            },
        ],
    },

    // --- SALES & INVOICING ---
    {
        slug: "mpesa-payments-pos",
        categorySlug: "sales-and-invoicing",
        title: "Processing M-Pesa Payments",
        updatedAt: "Updated today",
        content: [
            {
                type: "paragraph",
                text: "Our direct M-Pesa integration allows you to receive payments and automatically mark invoices as paid.",
            },
            {
                type: "step",
                text: "On the Checkout screen, select **M-Pesa** as the payment method.",
            },
            {
                type: "step",
                text: "Enter the customer's phone number and click 'Initiate STK Push'.",
            },
            {
                type: "step",
                text: "The customer will receive a popup on their phone to enter their PIN.",
            },
            {
                type: "step",
                text: "Once confirmed, SaleSense receives a notification and automatically generates the receipt.",
            },
            {
                type: "alert",
                text: "Configuration Required: You must enter your Daraja API credentials in Settings > Integrations for this feature to work.",
            },
        ],
    },
    {
        slug: "kra-tax-compliance",
        categorySlug: "sales-and-invoicing",
        title: "Understanding KRA & Tax Settings",
        updatedAt: "Important",
        content: [
            {
                type: "paragraph",
                text: "Stay audit-ready with our built-in tax tracking. SaleSense helps you maintain the records required by the Kenya Revenue Authority.",
            },
            {
                type: "step",
                text: "In **Settings > KRA Settings**, configure your VAT rate (standard is 16%).",
            },
            {
                type: "step",
                text: "When creating an invoice, the system automatically calculates the tax amount.",
            },
            {
                type: "step",
                text: "Use the **Invoices** page to export monthly sales reports, which include a breakdown of taxable and non-taxable revenue.",
            },
            {
                type: "paragraph",
                text: "By keeping your inventory and sales data in one place, you can generate reports that make filing your monthly VAT returns on iTax significantly faster.",
            },
        ],
    },

    // --- SUPPLY CHAIN ---
    {
        slug: "managing-suppliers-pos",
        categorySlug: "supply-chain",
        title: "Managing Suppliers and Procurement",
        updatedAt: "New Feature",
        content: [
            {
                type: "paragraph",
                text: "Efficiently manage your relationships with wholesalers and track your spending on new stock.",
            },
            {
                type: "step",
                text: "Add your suppliers in the **Suppliers** section, including their contact person and M-Pesa payment details.",
            },
            {
                type: "step",
                text: "Create a **Purchase Order (PO)** when you need to restock. Add the items and quantities you want to buy.",
            },
            {
                type: "step",
                text: "When the supplier delivers the goods, go to **Delivery History** and click 'Receive Stock'.",
            },
            {
                type: "step",
                text: "Link the delivery to your Purchase Order. The system will automatically update your inventory levels across the selected branches.",
            },
            {
                type: "alert",
                text: "Rule: Once a Purchase Order is marked as 'Delivered', it becomes a permanent record and can no longer be edited or deleted.",
            },
        ],
    },

    // --- AUDIT & SECURITY ---
    {
        slug: "using-audit-logs",
        categorySlug: "audit-and-security",
        title: "Accountability with Audit Logs",
        updatedAt: "Security Feature",
        content: [
            {
                type: "paragraph",
                text: "Audit logs provide a transparent history of every sensitive action taken within your business account.",
            },
            {
                type: "step",
                text: "Admins can access these logs via **Settings > Audit Logs**.",
            },
            {
                type: "paragraph",
                text: "The logs track actions such as: Deleting an Invoice, Changing a Product Price, Adjusting Stock Levels, and Updating Team Roles.",
            },
            {
                type: "step",
                text: "Each log entry includes the **User** who performed the action, the **Timestamp**, and the specific **Details** of the change.",
            },
            {
                type: "alert",
                text: "Use this feature to investigate discrepancies or ensure that staff are following standard operating procedures.",
            },
        ],
    },

    // --- ACCOUNT SETTINGS ---
    {
        slug: "branch-management",
        categorySlug: "account-settings",
        title: "Multi-Branch & Team Management",
        updatedAt: "Updated today",
        content: [
            {
                type: "paragraph",
                text: "Grow your business by managing multiple physical locations from a single SaleSense account.",
            },
            {
                type: "step",
                text: "Create new branches in **Settings > Branch Management**.",
            },
            {
                type: "step",
                text: "Invite staff members and assign them a specific **Role** (Admin, Manager, or User).",
            },
            {
                type: "step",
                text: "Assign staff to a specific **Store**. This restricts their access to only see sales and stock for that location.",
            },
            {
                type: "paragraph",
                text: "Admins have 'God Mode' and can see data for all branches, while Managers can oversee their assigned store's operations and perform sensitive tasks like stocktaking.",
            },
        ],
    },
];
