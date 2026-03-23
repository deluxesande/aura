export interface Creator {
    firstName: string;
    lastName: string;
    role: string;
    imageUrl?: string;
}

export type ProductType = "SIMPLE" | "TEMPLATE" | "VARIANT";

export interface Attribute {
    id: string;
    name: string;
}

export interface AttributeOption {
    id: string;
    value: string;
    attribute: Attribute;
}

export interface ProductAttributeValue {
    id: string;
    attributeOption: AttributeOption;
}

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
    creator?: Creator;
    inStock: boolean;
    type?: ProductType;
    parentId?: string;
    variants?: Product[];
    variantsCount?: number;
    attributeValues?: ProductAttributeValue[];
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    products: Product[];
}

export interface InvoiceCreator {
    firstName: string | null;
    lastName: string | null;
    role: string;
    imageUrl: string | null;
}

export interface Invoice {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    customerId?: string;
    Customer?: Customer;
    invoiceItems: InvoiceItem[];
    totalAmount: number;
    paymentType: string;
    status: string;
    invoiceName: string;
    creator?: InvoiceCreator | null;
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
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber: string;
    invoices: Invoice[];
}
