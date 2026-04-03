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
    createdAt?: Date | string;
}

export interface Supplier {
    id: string;
    name: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    isDeleted: boolean;
    createdById?: string;
    CreatedBy?: Creator;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface PurchaseOrder {
    id: string;
    reference: string;
    totalAmount: number;
    status: string;
    isDeleted: boolean;
    supplierId: string;
    Supplier?: Supplier;
    createdById?: string;
    CreatedBy?: Creator;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface StockReceipt {
    id?: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    productId: string;
    Product: Product;
    deliveryId?: string;
    Delivery?: Delivery;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface Delivery {
    id: string;
    reference?: string;
    totalCost: number;
    status: string;
    supplierId?: string;
    Supplier?: Supplier;
    storeId: string;
    Store?: Store;
    purchaseOrderId?: string;
    PurchaseOrder?: PurchaseOrder;
    receipts: StockReceipt[];
    createdById?: string;
    creator?: Creator;
    createdAt: Date | string;
}

export interface Expense {
    id: string;
    title: string;
    category: string;
    amount: number;
    date: Date | string;
    notes?: string;
    status: string;
    storeId?: string;
    Store?: Store;
    createdById?: string;
    CreatedBy?: Creator;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface Store {
    id: string;
    name: string;
    address?: string;
    isActive: boolean;
    businessId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}
