export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    sku: string;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
    categoryId: string;
    Category: Category;
    invoiceItems: InvoiceItem[];
    image: string;
    inStock: boolean;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    products: Product[];
}

export interface Invoice {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    customerId?: string;
    Customer?: Customer;
    invoiceItems: InvoiceItem[];
    totalAmount: number;
}

export interface InvoiceItem {
    id: string;
    quantity: number;
    price: number;
    productId: string;
    Product: Product;
    invoiceId?: string;
    Invoice?: Invoice;
}

export interface Customer {
    id: string;
    name?: string;
    email?: string;
    phoneNumber: string;
    invoices: Invoice[];
}