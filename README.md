# Salesense

Salesense is a high-performance, multi-tenant e-commerce and retail management platform designed for businesses with multiple branches and complex inventory needs. Built with **Next.js 15**, **TypeScript**, and **Prisma**, Salesense provides a unified solution for tracking sales, managing stock across branches, and automating regulatory compliance.

## 🚀 Key Features

-   **Multi-Store Architecture**: Manage multiple branches/stores under a single business umbrella.
-   **Advanced Product Management**:
    -   **Simple Products**: Standard items with fixed price and stock.
    -   **Product Templates**: Shared definitions for items with variations (e.g., a "NAP Card" available in different styles).
    -   **Variants**: Specific versions of a template (e.g., Blue, Large) with individual SKU and stock tracking.
-   **Intelligent Inventory**: Store-specific stock levels with automatic low-stock alerts and "self-healing" inventory sync.
-   **Sales & Invoicing**: Batch invoice creation, customer management, and support for multiple payment types including **M-Pesa** and Cash.
-   **Analytics & Reporting**: Real-time dashboards, top-product performance, and branch-specific financial reports.
-   **Regulatory Compliance**: Integrated **KRA PIN** validation and automated **TOT (Turnover Tax)** return filing.
-   **Notifications**: Powered by **Novu** for real-time sales alerts, low-stock warnings, and payment confirmations.

---

## 🛠 Tech Stack

-   **Framework**: Next.js 15 (App & Pages Router)
-   **Database**: PostgreSQL with Prisma ORM
-   **Auth**: Clerk (Role-based access: Admin, Manager, User)
-   **State Management**: Redux Toolkit & Persist
-   **Styles**: Tailwind CSS & DaisyUI
-   **Integrations**: 
    -   **M-Pesa Daraja API**: For seamless mobile payments.
    -   **Novu**: Unified notification engine.
    -   **UploadThing**: Optimized cloud file storage for product images.
    -   **XLSX**: Bulk import/export of product data.

---

## 📦 Multi-Store Product & Inventory Logic

One of Salesense's core strengths is how it handles products across different branches.

### 1. Product Types
-   **TEMPLATE**: These are "blueprint" products. They are visible in **all stores** within a business. They don't have their own stock but act as a folder for variants.
-   **SIMPLE/VARIANT**: These are physical items. They are linked to specific stores via the `StoreInventory` model.

### 2. Global Visibility vs. Local Inventory
-   **Shared Access**: Product Templates are global to the business. This ensures that when an Admin creates a product line, it's instantly available for Managers to stock in their respective branches.
-   **Isolated Stock**: Stock levels (`quantity`) are tracked per-store. A "Blue Pen" can have 50 units in the "Downtown" branch and 0 in "Uptown".
-   **Transaction Safety**: When a sale occurs via `/api/invoice/create-batch`, the system automatically:
    1. Identifies the active store.
    2. Decrements stock from that specific store's inventory.
    3. Bypasses stock checks for `TEMPLATE` products (as they represent the line, not the unit).

### 3. Self-Healing Inventory
The system includes a background sync mechanism that automatically restores stock to the correct store if an invoice is **CANCELLED** or **FAILED**, and re-deducts it if a pending invoice is successfully **PAID**.

---

## 🚦 Getting Started

### Prerequisites
-   Node.js 20+
-   PostgreSQL instance
-   Clerk Account (for Auth)
-   Novu Account (for Notifications)

### Installation

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/deluxesande/aura.git
    npm install
    ```

2.  **Environment Setup**:
    Create an `env.local` file:
    ```env
    DATABASE_URL="postgresql://..."
    NEXT_PUBLIC_CLERK_PUBLISHED_KEY="..."
    CLERK_SECRET_KEY="..."
    NOVU_SECRET_KEY="..."
    UPLOADTHING_SECRET="..."
    # M-Pesa Credentials
    MPESA_CONSUMER_KEY="..."
    MPESA_CONSUMER_SECRET="..."
    ```

3.  **Database Sync**:
    ```bash
    npx prisma generate
    npx prisma migrate dev
    ```

4.  **Launch**:
    ```bash
    npm run dev
    ```

---

## 📂 Project Architecture

```text
salesense/
├── app/                 # Next.js 15 App Router (UI & Layouts)
├── pages/api/           # Backend API Endpoints (Prisma logic)
├── components/          # Modular UI Library (Radix/Tailwind)
├── prisma/              # Database Schema & Migrations
├── store/               # Redux Slices (Auth, Cart, UI state)
├── utils/               # Helpers (M-Pesa, KRA, Canvas, MinIO)
└── middleware.ts        # Auth & Role-based route protection
```

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Maintained by [Deluxe Sande](https://github.com/deluxesande)*
