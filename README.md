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
    git clone https://github.com/deluxesande/aura.git
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
aura/
├── .next/               # Next.js build output
├── .vscode/             # VS Code configuration
├── app/                 # App Router components and routes
├── assets/              # Static assets
├── components/          # Reusable UI components
├── node_modules/        # Dependencies
├── pages/               # Pages Router components and routes
│   ├── api/             # API routes
│   └── ...
├── prisma/              # Prisma schema and migrations
├── public/              # Public static files
├── store/               # Redux store configuration
├── utils/               # Utility functions
├── .env                 # Environment variables
├── .eslintrc.json       # ESLint configuration
├── .gitignore           # Git ignore file
├── middleware.ts        # Next.js middleware
├── next.config.mjs      # Next.js configuration
├── package.json         # Project dependencies and scripts
├── postcss.config.mjs   # PostCSS configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Available Scripts

-   **dev**: Starts the development server

    ```bash
    npm run dev
    ```

-   **build**: Builds the application for production

    ```bash
    npm run build
    ```

-   **start**: Starts the production server

    ```bash
    npm run start
    ```

-   **lint**: Lints the codebase

    ```bash
    npm run lint
    ```

-   **list-routes**: Lists all available routes in the application
    ```bash
    npm run list-routes
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

## Authentication

Authentication is handled by Clerk, which provides:

-   User sign-up and login
-   Social authentication
-   Session management
-   User profile management

Implementation details:

-   Clerk is integrated with Next.js via the `@clerk/nextjs` package
-   Protected routes are handled by middleware
-   User data can be accessed through Clerk hooks and components

## Database

The project uses Prisma ORM to interact with the database:

-   **Schema**: Defined in `prisma/schema.prisma`
-   **Migrations**: Managed by Prisma Migrate
-   **Client**: Generated TypeScript client for type-safe database querie

## State Management

Redux Toolkit is used for global state management:

-   **Store**: Configured in the `store/` directory
-   **Slices**: Feature-based state slices with reducers and actions
-   **Persistence**: Redux Persist for storing state in localStorage
-   **Next.js Integration**: Using next-redux-wrapper for server-side rendering

Example usage:

```typescript
// Accessing state in a component
import { useSelector, useDispatch } from "react-redux";
import { increment } from "../store/counterSlice";

function Counter() {
    const count = useSelector((state) => state.counter.value);
    const dispatch = useDispatch();

    return (
        <div>
            <button onClick={() => dispatch(increment())}>Increment</button>
            <span>{count}</span>
        </div>
    );
}
```

## Deployment

The easiest way to deploy this Next.js app is via [Vercel](https://vercel.com/). Follow the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Learn More

-   [Next.js Documentation](https://nextjs.org/docs)
-   [Prisma Documentation](https://www.prisma.io/docs)
-   [Clerk Documentation](https://clerk.dev/docs)
-   [MinIO Documentation](https://min.io/docs)

## License

This project is licensed under the MIT License.
