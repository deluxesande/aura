# Salesense

Salesense is a modern e-commerce platform built with [Next.js](https://nextjs.org/), leveraging powerful tools like Prisma, Clerk for authentication, and MinIO for file storage. It provides a seamless experience for managing customers, products, invoices, and orders.

## Features

-   **Customer Management**: Add, update, and manage customer details.
-   **Product Management**: Upload products with images, generate SKUs, and manage inventory.
-   **Invoice Management**: Create and manage invoices with linked invoice items.
-   **Authentication**: Secure routes using Clerk for user authentication.
-   **File Storage**: MinIO integration for storing and retrieving product images.
-   **Responsive Design**: Built with Tailwind CSS for a modern and responsive UI.

## Getting Started

### Prerequisites

Ensure you have the following installed:

-   Node.js (v16 or later)
-   npm, yarn, pnpm, or bun (for package management)
-   A running MinIO instance for file storage
-   A PostgreSQL database for Prisma

### Installation

1. Clone the repository:

    ```bash
    git clone <repository-url>
    cd salesense
    ```

2. Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3. Set up environment variables:

    Create a [`.env`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2Fdelse%2FDesktop%2Faura%2F.env%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%227bcceb3d-88e5-4e2b-ab6f-6b2b4cce6879%22%5D "c:\\Users\delse\Desktop\aura.env") file in the root directory and configure the following variables:

    ```env
    DATABASE_URL=your_database_url
    MINIO_PUBLIC_IP=your_minio_ip
    MINIO_ROOT_USER=your_minio_access_key
    MINIO_ROOT_PASSWORD=your_minio_secret_key
    ```

4. Run database migrations:

    ```bash
    npx prisma migrate dev
    ```

### Running the Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## Project Structure

```
.
├── app/                # Next.js app directory
│   ├── customer/       # Customer-related pages
│   ├── products/       # Product-related pages
│   ├── invoices/       # Invoice-related pages
│   ├── layout.tsx      # Global layout
│   └── page.tsx        # Landing page
├── components/         # Reusable UI components
├── pages/              # API routes
│   ├── api/customer/   # Customer API endpoints
│   ├── api/product/    # Product API endpoints
│   ├── api/invoice/    # Invoice API endpoints
├── prisma/             # Prisma schema and migrations
├── public/             # Static assets
├── store/              # Redux store configuration
├── utils/              # Utility functions
├── tailwind.config.ts  # Tailwind CSS configuration
└── README.md           # Project documentation
```

## API Endpoints

### Customer API

-   **POST** `/api/customer/post`: Add a new customer.

### Product API

-   **POST** `/api/product/post`: Add or update a product with image upload.

### Invoice API

-   **POST** `/api/invoice/post`: Create a new invoice.

### Invoice Item API

-   **POST** `/api/invoiceItem/post`: Add an item to an invoice.

## Deployment

The easiest way to deploy this Next.js app is via [Vercel](https://vercel.com/). Follow the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Learn More

-   [Next.js Documentation](https://nextjs.org/docs)
-   [Prisma Documentation](https://www.prisma.io/docs)
-   [Clerk Documentation](https://clerk.dev/docs)
-   [MinIO Documentation](https://min.io/docs)

## License

This project is licensed under the MIT License.
