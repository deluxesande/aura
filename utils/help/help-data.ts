import {
    BookOpen,
    CreditCard,
    ShieldCheck,
    Settings,
    Smartphone,
    MessageCircle,
} from "lucide-react";

export const HELP_CATEGORIES = [
    {
        slug: "getting-started",
        title: "Getting Started",
        icon: BookOpen,
        description:
            "Account setup, first login, and configuring your shop profile.",
    },
    {
        slug: "billing-and-mpesa",
        title: "Billing & M-Pesa",
        icon: CreditCard,
        description:
            "Connecting Paybills, transaction fees, and subscription plans.",
    },
    {
        slug: "kra-compliance",
        title: "KRA Compliance",
        icon: ShieldCheck,
        description:
            "How to generate tax reports, file returns, and manage E-TIMS.",
    },
    {
        slug: "account-settings",
        title: "Account Settings",
        icon: Settings,
        description:
            "Password reset, user permissions, and notification preferences.",
    },
    {
        slug: "mobile-app",
        title: "Mobile App",
        icon: Smartphone,
        description:
            "Using SaleSense on Android/iOS and troubleshooting sync issues.",
    },
    {
        slug: "troubleshooting",
        title: "Troubleshooting",
        icon: MessageCircle,
        description:
            "Common error messages and how to fix connection problems.",
    },
];

export const HELP_ARTICLES = [
    // --- GETTING STARTED ---
    {
        slug: "setting-up-shop-profile",
        categorySlug: "getting-started",
        title: "Setting Up Your Shop Profile",
        updatedAt: "1 month ago",
        content: [
            {
                type: "paragraph",
                text: "Your shop profile is what appears on your receipts and invoices. It is crucial to set this up correctly before making your first sale.",
            },
            {
                type: "step",
                text: "Navigate to **Settings > General** in the sidebar menu.",
            },
            {
                type: "step",
                text: "Upload your business logo. This will appear at the top of your printed receipts.",
            },
            {
                type: "step",
                text: "Enter your official Business Name, KRA PIN (if applicable), and physical address.",
            },
            {
                type: "alert",
                text: "Note: The KRA PIN entered here will be used for all E-TIMS tax generation. Ensure it matches your registration certificate.",
            },
        ],
    },
    {
        slug: "adding-first-product",
        categorySlug: "getting-started",
        title: "Adding Your First Product",
        updatedAt: "3 weeks ago",
        content: [
            {
                type: "paragraph",
                text: "SaleSense allows you to track inventory levels, buying prices, and selling prices. Here is how to add stock.",
            },
            {
                type: "step",
                text: "Go to the **Inventory** tab and click 'New Product'.",
            },
            {
                type: "step",
                text: "Enter the product name (e.g., 'Blue T-Shirt') and the SKU/Barcode number.",
            },
            {
                type: "step",
                text: "Set your 'Buying Price' (cost) and 'Selling Price'. The system will automatically calculate your profit margin.",
            },
            {
                type: "step",
                text: "Input the current 'Quantity on Hand' to start tracking stock levels.",
            },
        ],
    },
    {
        slug: "inviting-staff-members",
        categorySlug: "getting-started",
        title: "Inviting Staff & Setting Permissions",
        updatedAt: "2 weeks ago",
        content: [
            {
                type: "paragraph",
                text: "You can add cashiers, managers, and accountants to your SaleSense account with different levels of access.",
            },
            {
                type: "step",
                text: "Go to **Settings > Users & Permissions**.",
            },
            {
                type: "step",
                text: "Click 'Invite User' and enter their email address.",
            },
            {
                type: "step",
                text: "Select a Role: 'Cashier' (Sales only), 'Manager' (Inventory & Reports), or 'Admin' (Full Access).",
            },
            {
                type: "paragraph",
                text: "The user will receive an email with a link to set their password.",
            },
        ],
    },

    // --- BILLING & M-PESA ---
    {
        slug: "how-to-connect-paybill",
        categorySlug: "billing-and-mpesa",
        title: "How to Connect Your M-Pesa Paybill",
        updatedAt: "2 days ago",
        content: [
            {
                type: "paragraph",
                text: "Connecting your M-Pesa Paybill or Till Number allows SaleSense to automatically detect incoming payments and reconcile them with your invoices.",
            },
            {
                type: "step",
                text: "Log in to your SaleSense Dashboard and navigate to **Settings > Payments**.",
            },
            {
                type: "step",
                text: "Click on the **'Add Payment Method'** button and select 'M-Pesa'.",
            },
            {
                type: "step",
                text: "Enter your Paybill/Till Number, Consumer Key, and Consumer Secret.",
            },
            {
                type: "alert",
                text: "Ensure you have your Daraja API credentials ready. If you don't have them, check our guide on the Blog.",
            },
        ],
    },
    {
        slug: "understanding-transaction-fees",
        categorySlug: "billing-and-mpesa",
        title: "Understanding Transaction Fees",
        updatedAt: "1 month ago",
        content: [
            {
                type: "paragraph",
                text: "SaleSense operates on a subscription model, meaning we do not charge a percentage of your sales.",
            },
            {
                type: "paragraph",
                text: "Standard M-Pesa transaction charges (from Safaricom) still apply to your customers when they pay you.",
            },
            {
                type: "alert",
                text: "We charge 0% commission on your revenue. You keep 100% of what you make, minus the standard Safaricom processing fees.",
            },
        ],
    },

    // --- KRA COMPLIANCE ---
    {
        slug: "generating-tax-reports",
        categorySlug: "kra-compliance",
        title: "Generating Monthly Tax Reports",
        updatedAt: "1 week ago",
        content: [
            {
                type: "paragraph",
                text: "SaleSense automatically calculates VAT and Turnover Tax based on your sales data. Here is how to export them for iTax.",
            },
            {
                type: "step",
                text: "Go to the **'Tax Returns'** tab in the sidebar.",
            },
            {
                type: "step",
                text: "Select the month you wish to file for (e.g., January 2026).",
            },
            {
                type: "step",
                text: "Click 'Export CSV'. This file is formatted specifically for the iTax excel sheet uploader.",
            },
        ],
    },
    {
        slug: "etims-integration-guide",
        categorySlug: "kra-compliance",
        title: "How E-TIMS Integration Works",
        updatedAt: "3 weeks ago",
        content: [
            {
                type: "paragraph",
                text: "SaleSense creates a virtual E-TIMS device for your shop. Every time you complete a sale, we send a request to KRA servers to sign the receipt.",
            },
            {
                type: "step",
                text: "Ensure your internet connection is active.",
            },
            {
                type: "step",
                text: "Process a sale as normal. You will see a 'KRA Signature' appear at the bottom of the printed receipt.",
            },
            {
                type: "alert",
                text: "If the internet is down, the system will queue the receipt and sign it automatically once connection is restored.",
            },
        ],
    },

    // --- ACCOUNT SETTINGS ---
    {
        slug: "resetting-password",
        categorySlug: "account-settings",
        title: "Resetting Your Password",
        updatedAt: "4 months ago",
        content: [
            {
                type: "paragraph",
                text: "If you have forgotten your password or suspect unauthorized access, reset it immediately.",
            },
            {
                type: "step",
                text: "On the login screen, click 'Forgot Password?'.",
            },
            {
                type: "step",
                text: "Enter your registered email address. We will send you a secure reset link.",
            },
            {
                type: "step",
                text: "Click the link in your email and create a new, strong password.",
            },
        ],
    },
    {
        slug: "managing-notifications",
        categorySlug: "account-settings",
        title: "Managing Email & SMS Notifications",
        updatedAt: "2 months ago",
        content: [
            {
                type: "paragraph",
                text: "You can control which alerts you receive, such as daily sales summaries or low stock warnings.",
            },
            {
                type: "step",
                text: "Go to **Settings > Notifications**.",
            },
            {
                type: "step",
                text: "Toggle the switches for 'Daily Sales Report', 'Low Stock Alert', and 'New Device Login'.",
            },
        ],
    },

    // --- MOBILE APP ---
    {
        slug: "using-offline-mode",
        categorySlug: "mobile-app",
        title: "How Offline Mode Works",
        updatedAt: "1 month ago",
        content: [
            {
                type: "paragraph",
                text: "SaleSense Mobile allows you to continue selling even when your internet connection drops.",
            },
            {
                type: "paragraph",
                text: "When offline, a yellow 'Offline' banner will appear at the top of the app. All sales are saved locally on your device.",
            },
            {
                type: "step",
                text: "Do not clear the app data or uninstall the app while offline, or you may lose unsynced data.",
            },
            {
                type: "step",
                text: "Once internet is restored, the app will automatically upload pending transactions to the cloud.",
            },
        ],
    },
    {
        slug: "connecting-bluetooth-printer",
        categorySlug: "mobile-app",
        title: "Connecting a Bluetooth Thermal Printer",
        updatedAt: "3 weeks ago",
        content: [
            {
                type: "paragraph",
                text: "You can print receipts directly from your phone using a generic 58mm or 80mm Bluetooth thermal printer.",
            },
            {
                type: "step",
                text: "Turn on your printer and ensure Bluetooth is enabled on your phone.",
            },
            {
                type: "step",
                text: "Open the SaleSense App and go to **Settings > Hardware**.",
            },
            {
                type: "step",
                text: "Tap 'Scan for Printers' and select your printer from the list.",
            },
            {
                type: "step",
                text: "Tap 'Test Print' to confirm the connection.",
            },
        ],
    },

    // --- TROUBLESHOOTING ---
    {
        slug: "payment-not-reflecting",
        categorySlug: "troubleshooting",
        title: "M-Pesa Payment Not Reflecting",
        updatedAt: "1 week ago",
        content: [
            {
                type: "paragraph",
                text: "Sometimes M-Pesa messages get delayed by Safaricom. If a customer has paid but SaleSense hasn't updated:",
            },
            {
                type: "step",
                text: "Wait 2-3 minutes. Most delays resolve quickly.",
            },
            {
                type: "step",
                text: "Click the **'Refresh Transactions'** button on the POS screen.",
            },
            {
                type: "step",
                text: "If it still doesn't appear, you can manually record the payment by selecting 'Cash' and adding the M-Pesa code in the notes for reconciliation later.",
            },
        ],
    },
    {
        slug: "login-issues",
        categorySlug: "troubleshooting",
        title: "Unable to Login",
        updatedAt: "5 months ago",
        content: [
            {
                type: "paragraph",
                text: "If you cannot access your account, check the following:",
            },
            {
                type: "step",
                text: "Ensure your internet connection is stable.",
            },
            {
                type: "step",
                text: "Check if your subscription has expired. Expired accounts are set to 'Read Only' mode.",
            },
            {
                type: "alert",
                text: "If you see a 'Account Suspended' message, please contact support@salesense.co.ke immediately.",
            },
        ],
    },
];
