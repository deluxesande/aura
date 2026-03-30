/* eslint-disable jsx-a11y/alt-text */
import {
    Document,
    Font,
    Image,
    Page,
    StyleSheet,
    Text,
    View,
} from "@react-pdf/renderer";
import React from "react";

Font.register({
    family: "Helvetica",
    fonts: [
        {
            src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxP.ttf",
        },
        {
            src: "https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlfBBc9.ttf",
            fontWeight: 700,
        },
    ],
});

interface Business {
    name: string;
    email?: string | null;
    address?: string | null;
    logo?: string | null;
    phoneNumber?: string | null;
}

interface Product {
    name: string;
    sku: string;
}

interface StockReceipt {
    quantity: number;
    unitCost: number;
    totalCost: number;
    Product: Product;
}

interface Supplier {
    name: string;
    email?: string | null;
    phoneNumber?: string | null;
}

interface PurchaseOrder {
    reference: string;
}

interface Delivery {
    reference?: string | null;
    createdAt: string | Date;
    totalCost: number;
    status: string;
    Supplier?: Supplier | null;
    Store?: { name: string } | null;
    PurchaseOrder?: PurchaseOrder | null;
    receipts: StockReceipt[];
    creator?: {
        firstName: string;
        lastName: string;
    } | null;
}

interface DeliveryPDFProps {
    delivery: Delivery;
    business?: Business | null;
}

const DeliveryPDF: React.FC<DeliveryPDFProps> = ({ delivery, business }) => {
    const styles = StyleSheet.create({
        page: {
            fontFamily: "Helvetica",
            fontSize: 10,
            padding: 40,
            color: "#333",
            flexDirection: "column",
            backgroundColor: "#ffffff",
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 30,
            borderBottomWidth: 2,
            borderBottomColor: "#22c55e",
            paddingBottom: 20,
        },
        logo: {
            width: 80,
            height: 80,
            objectFit: "contain",
        },
        businessDetails: {
            textAlign: "right",
        },
        title: {
            fontSize: 24,
            fontWeight: "bold",
            color: "#22c55e",
            textTransform: "uppercase",
            marginBottom: 5,
        },
        metaSection: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 30,
            gap: 20,
        },
        col: {
            width: "33%",
        },
        label: {
            fontSize: 8,
            color: "#888",
            marginBottom: 4,
            textTransform: "uppercase",
            fontWeight: "bold",
        },
        value: {
            fontSize: 10,
            marginBottom: 2,
            color: "#374151",
        },
        boldValue: {
            fontSize: 11,
            fontWeight: "bold",
            marginBottom: 4,
            color: "#111827",
        },
        table: {
            width: "100%",
            marginTop: 10,
            marginBottom: 30,
        },
        tableHeader: {
            flexDirection: "row",
            backgroundColor: "#f9fafb",
            borderBottomWidth: 1,
            borderBottomColor: "#e5e7eb",
            padding: 10,
        },
        tableRow: {
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: "#f3f4f6",
            padding: 10,
            alignItems: "center",
        },
        colDesc: { width: "45%" },
        colQty: { width: "15%", textAlign: "center" },
        colPrice: { width: "20%", textAlign: "right" },
        colTotal: { width: "20%", textAlign: "right" },

        summarySection: {
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: 10,
        },
        summaryBox: {
            width: 200,
            padding: 15,
            backgroundColor: "#f9fafb",
            borderRadius: 5,
        },
        summaryRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
        },
        grandTotal: {
            fontSize: 14,
            fontWeight: "bold",
            color: "#111827",
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
            paddingTop: 10,
            marginTop: 5,
        },
        statusBadge: {
            marginTop: 10,
            padding: "4 8",
            backgroundColor: "#dcfce7",
            color: "#166534",
            borderRadius: 4,
            fontSize: 8,
            fontWeight: "bold",
            textAlign: "center",
            alignSelf: "flex-start",
            textTransform: "uppercase",
        },
        footer: {
            marginTop: "auto",
            borderTopWidth: 1,
            borderTopColor: "#eee",
            paddingTop: 20,
            textAlign: "center",
        },
        footerText: {
            fontSize: 8,
            color: "#9ca3af",
            marginBottom: 5,
        },
        footerLogo: {
            width: 100,
            height: 30,
            objectFit: "contain",
            alignSelf: "center",
        },
    });

    const formatMoney = (amount: any) => {
        const num = Number(amount);
        if (isNaN(num)) return "Ksh 0.00";
        return `Ksh ${num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const footerLogo = "/logos/salesense-horizontal.png";

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        {business?.logo ? (
                            <Image src={business.logo} style={styles.logo} />
                        ) : (
                            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#22c55e" }}>
                                {business?.name || "STOCK RECEIPT"}
                            </Text>
                        )}
                    </View>
                    <View style={styles.businessDetails}>
                        <Text style={styles.title}>Delivery Receipt</Text>
                        <Text style={styles.boldValue}>{delivery.reference || "N/A"}</Text>
                        <Text style={styles.value}>
                            {new Date(delivery.createdAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </Text>
                        <View style={styles.statusBadge}>
                            <Text>{delivery.status}</Text>
                        </View>
                    </View>
                </View>

                {/* Info Grid */}
                <View style={styles.metaSection}>
                    <View style={styles.col}>
                        <Text style={styles.label}>Supplier Details</Text>
                        <Text style={styles.boldValue}>{delivery.Supplier?.name || "Direct / Cash"}</Text>
                        {delivery.Supplier?.email && <Text style={styles.value}>{delivery.Supplier.email}</Text>}
                        {delivery.Supplier?.phoneNumber && <Text style={styles.value}>{delivery.Supplier.phoneNumber}</Text>}
                    </View>

                    <View style={styles.col}>
                        <Text style={styles.label}>Destination Branch</Text>
                        <Text style={styles.boldValue}>{delivery.Store?.name || "Main Warehouse"}</Text>
                        {business?.address && <Text style={styles.value}>{business.address}</Text>}
                    </View>

                    <View style={styles.col}>
                        <Text style={styles.label}>Logistics Info</Text>
                        {delivery.PurchaseOrder && (
                            <View style={{ marginBottom: 5 }}>
                                <Text style={styles.label}>Linked PO</Text>
                                <Text style={styles.value}>{delivery.PurchaseOrder.reference}</Text>
                            </View>
                        )}
                        <Text style={styles.label}>Received By</Text>
                        <Text style={styles.value}>
                            {delivery.creator ? `${delivery.creator.firstName} ${delivery.creator.lastName}` : "System Admin"}
                        </Text>
                    </View>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.label, styles.colDesc]}>Product Description</Text>
                        <Text style={[styles.label, styles.colQty]}>Quantity</Text>
                        <Text style={[styles.label, styles.colPrice]}>Unit Cost</Text>
                        <Text style={[styles.label, styles.colTotal]}>Total Cost</Text>
                    </View>

                    {delivery.receipts?.map((item, index) => (
                        <View key={index} style={styles.tableRow} wrap={false}>
                            <View style={styles.colDesc}>
                                <Text style={styles.boldValue}>{item.Product?.name}</Text>
                                <Text style={{ fontSize: 8, color: "#6b7280" }}>SKU: {item.Product?.sku}</Text>
                            </View>
                            <Text style={[styles.value, styles.colQty]}>{item.quantity}</Text>
                            <Text style={[styles.value, styles.colPrice]}>{formatMoney(item.unitCost)}</Text>
                            <Text style={[styles.boldValue, styles.colTotal, { fontSize: 10 }]}>
                                {formatMoney(item.totalCost)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Totals Summary */}
                <View style={styles.summarySection} wrap={false}>
                    <View style={styles.summaryBox}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.value}>Total Items:</Text>
                            <Text style={styles.boldValue}>
                                {delivery.receipts?.reduce((acc, r) => acc + r.quantity, 0)}
                            </Text>
                        </View>
                        <View style={[styles.summaryRow, styles.grandTotal]}>
                            <Text style={[styles.label, { color: "#111827", marginTop: 4 }]}>Grand Total:</Text>
                            <Text style={{ fontSize: 14, fontWeight: "bold", color: "#22c55e" }}>
                                {formatMoney(delivery.totalCost)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>This is a computer-generated delivery receipt for stock entry validation.</Text>
                    <Text style={styles.footerText}>Powered by</Text>
                    <Image src={`${origin}${footerLogo}`} style={styles.footerLogo} />
                </View>
            </Page>
        </Document>
    );
};

export default DeliveryPDF;
