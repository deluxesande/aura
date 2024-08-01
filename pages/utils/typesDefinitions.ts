export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    sku: string;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
    categoryId: number;
    Category: Category;
    invoiceItems: InvoiceItem[];
}

export interface Category {
    id: number;
    name: string;
    description?: string;
    products: Product[];
}

export interface Invoice {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    customerId: number;
    Customer: Customer;
    invoiceItems: InvoiceItem[];
    totalAmount: number;
}

export interface InvoiceItem {
    id: number;
    quantity: number;
    price: number;
    productId: number;
    Product: Product;
    invoiceId?: number;
    Invoice?: Invoice;
}

export interface Customer {
    id: number;
    name?: string;
    email?: string;
    phoneNumber: string;
    invoices: Invoice[];
}
