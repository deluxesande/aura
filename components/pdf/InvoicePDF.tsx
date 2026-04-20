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

// --- INTERFACES ---
interface Business {
    name: string;
    email?: string | null;
    address?: string | null;
    logo?: string | null;
    phoneNumber?: string | null;
    plan?: string;
}

interface Product {
    name: string;
    price: number;
    type?: string;
    attributeValues?: any[];
}

interface InvoiceItem {
    quantity: number;
    Product: Product;
}

interface Customer {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phoneNumber: string;
}

interface Invoice {
    invoiceName: string;
    createdAt: string | Date;
    totalAmount: number;
    paymentType: string;
    Customer?: Customer | null;
    invoiceItems: InvoiceItem[];
}

interface InvoicePDFProps {
    invoice: Invoice;
    pageSize?: "A4" | "A7";
    business?: Business | null;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({
    invoice,
    business,
    pageSize = "A4",
}) => {
    const isSmall = pageSize === "A7";
    const isPremium = business?.plan === "PREMIUM";

    const calculatePageHeight = () => {
        if (!isSmall) return { size: "A4" as any };

        const ITEM_HEIGHT = 30; // Increased to accommodate variant info
        const HEADER_HEIGHT = 140;
        const META_HEIGHT = 100;
        const TABLE_HEADER_HEIGHT = 30;
        const TOTALS_HEIGHT = 100;
        // Moved powered by to top for thermal, so we add height there
        const POWERED_BY_HEIGHT = isPremium ? 0 : 50; 

        const totalHeight =
            POWERED_BY_HEIGHT +
            HEADER_HEIGHT +
            META_HEIGHT +
            TABLE_HEADER_HEIGHT +
            invoice.invoiceItems.length * ITEM_HEIGHT +
            TOTALS_HEIGHT;

        return { size: [226, totalHeight] as [number, number] };
    };

    const pageProps = calculatePageHeight();

    const styles = StyleSheet.create({
        page: {
            fontFamily: "Helvetica",
            fontSize: isSmall ? 9 : 10,
            padding: isSmall ? 10 : 40,
            color: "#333",
            flexDirection: "column",
            backgroundColor: "#ffffff",
        },
        poweredByTop: {
            alignItems: "center",
            marginBottom: 15,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
        },
        header: {
            flexDirection: isSmall ? "column" : "row",
            justifyContent: "space-between",
            marginBottom: isSmall ? 10 : 30,
            borderBottomWidth: isSmall ? 1 : 2,
            borderBottomColor: "#22c55e",
            paddingBottom: isSmall ? 10 : 20,
        },
        logo: {
            width: isSmall ? 40 : 80,
            height: isSmall ? 40 : 80,
            objectFit: "contain",
        },
        businessDetails: {
            textAlign: isSmall ? "left" : "right",
        },
        title: {
            fontSize: isSmall ? 14 : 24,
            fontWeight: "bold",
            color: "#22c55e",
            textTransform: "uppercase",
            marginBottom: 5,
        },
        metaSection: {
            flexDirection: isSmall ? "column" : "row",
            justifyContent: "space-between",
            marginBottom: isSmall ? 10 : 30,
            gap: isSmall ? 10 : 20,
        },
        col: {
            width: isSmall ? "100%" : "33%",
        },
        label: {
            fontSize: 8,
            color: "#888",
            marginBottom: 4,
            textTransform: "uppercase",
            fontWeight: "bold",
        },
        value: {
            fontSize: isSmall ? 9 : 10,
            marginBottom: 2,
            color: "#374151",
        },
        boldValue: {
            fontSize: isSmall ? 9 : 11,
            fontWeight: "bold",
            marginBottom: 4,
            color: "#111827",
        },
        table: {
            width: "100%",
            marginTop: 10,
            marginBottom: isSmall ? 10 : 30,
        },
        tableHeader: {
            flexDirection: "row",
            backgroundColor: "#f9fafb",
            borderBottomWidth: 1,
            borderBottomColor: "#e5e7eb",
            padding: isSmall ? 6 : 10,
        },
        tableRow: {
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: "#f3f4f6",
            padding: isSmall ? 6 : 10,
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
            width: isSmall ? "100%" : 220,
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

    const formatNumber = (amount: any) => {
        const num = Number(amount);
        if (isNaN(num)) return "0.00";
        return num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const getCustomerName = () => {
        if (!invoice.Customer) return "Walk-in Customer";
        const first = invoice.Customer.firstName || "";
        const last = invoice.Customer.lastName || "";
        return `${first} ${last}`.trim() || "Unknown Customer";
    };

    const businessLogo = business?.logo || null;
    const footerLogo = "/logos/salesense-horizontal.png";
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    return (
        <Document>
            <Page {...(pageProps as any)} style={styles.page}>
                {/* --- Powered By (Top for Thermal) --- */}
                {isSmall && !isPremium && (
                    <View style={styles.poweredByTop}>
                        <Text style={styles.footerText}>Powered by</Text>
                        <Image
                            src={`${origin}${footerLogo}`}
                            style={{ width: 60, objectFit: "contain" }}
                        />
                    </View>
                )}

                {/* --- Header --- */}
                <View style={styles.header}>
                    <View>
                        {businessLogo ? (
                            <Image src={businessLogo} style={styles.logo} />
                        ) : (
                            <Text
                                style={{
                                    fontSize: isSmall ? 14 : 20,
                                    fontWeight: "bold",
                                    color: "#22c55e",
                                }}
                            >
                                {business?.name || "Business Name"}
                            </Text>
                        )}
                    </View>

                    <View style={styles.businessDetails}>
                        <Text style={styles.title}>Tax Invoice</Text>
                        <Text style={styles.boldValue}>
                            {invoice.invoiceName || "N/A"}
                        </Text>
                        <Text style={styles.value}>
                            {new Date(invoice.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                },
                            )}
                        </Text>
                    </View>
                </View>

                {/* --- Info Section --- */}
                <View style={styles.metaSection}>
                    <View style={styles.col}>
                        <Text style={styles.label}>From:</Text>
                        <Text style={styles.boldValue}>
                            {business?.name || "Business"}
                        </Text>
                        {business?.address && (
                            <Text style={styles.value}>{business.address}</Text>
                        )}
                        {business?.email && (
                            <Text style={styles.value}>{business.email}</Text>
                        )}
                        {business?.phoneNumber && (
                            <Text style={styles.value}>
                                {business.phoneNumber}
                            </Text>
                        )}
                    </View>

                    <View style={styles.col}>
                        <Text style={styles.label}>Bill To:</Text>
                        <Text style={styles.boldValue}>{getCustomerName()}</Text>
                        {invoice.Customer?.phoneNumber && (
                            <Text style={styles.value}>
                                {invoice.Customer.phoneNumber}
                            </Text>
                        )}
                        {invoice.Customer?.email && (
                            <Text style={styles.value}>
                                {invoice.Customer.email}
                            </Text>
                        )}
                    </View>

                    {!isSmall && (
                        <View style={styles.col}>
                            <Text style={styles.label}>Payment Info</Text>
                            <View style={{ marginBottom: 5 }}>
                                <Text style={styles.label}>Method</Text>
                                <Text style={styles.value}>
                                    {invoice.paymentType}
                                </Text>
                            </View>
                            <Text style={styles.label}>Status</Text>
                            <Text
                                style={{
                                    fontSize: 9,
                                    fontWeight: "bold",
                                    color: "#166534",
                                }}
                            >
                                COMPLETED
                            </Text>
                        </View>
                    )}
                </View>

                {/* --- Table --- */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.label, styles.colDesc]}>
                            Description
                        </Text>
                        <Text style={[styles.label, styles.colQty]}>Qty</Text>
                        <Text style={[styles.label, styles.colPrice]}>
                            Price
                        </Text>
                        <Text style={[styles.label, styles.colTotal]}>
                            Total
                        </Text>
                    </View>

                    {invoice.invoiceItems?.map((item, index) => {
                        const qty = Number(item.quantity) || 0;
                        const lineTotal = Number(item.Product.price) * qty;
                        const unitPrice = item.Product.price;

                        const isVariant = item.Product.type === "VARIANT";
                        const attributes =
                            isVariant && item.Product.attributeValues
                                ? item.Product.attributeValues
                                      .map((av: any) => av.attributeOption.value)
                                      .join(" / ")
                                : null;

                        return (
                            <View key={index} style={styles.tableRow} wrap={false}>
                                <View style={styles.colDesc}>
                                    <Text style={styles.boldValue}>
                                        {item.Product?.name || "Item"}
                                    </Text>
                                    {attributes && (
                                        <Text
                                            style={{
                                                fontSize: isSmall ? 7 : 8,
                                                color: "#22c55e",
                                                marginTop: -2,
                                                marginBottom: 2,
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            {attributes}
                                        </Text>
                                    )}
                                </View>

                                <Text style={[styles.value, styles.colQty]}>
                                    {qty}
                                </Text>

                                <Text style={[styles.value, styles.colPrice]}>
                                    {formatNumber(unitPrice)}
                                </Text>

                                <Text
                                    style={[
                                        styles.boldValue,
                                        styles.colTotal,
                                        { fontSize: 10 },
                                    ]}
                                >
                                    {formatNumber(lineTotal)}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                {/* --- Totals --- */}
                <View style={styles.summarySection} wrap={false}>
                    <View style={styles.summaryBox}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.value}>Subtotal:</Text>
                            <Text style={styles.boldValue}>
                                {formatMoney(invoice.totalAmount)}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.value}>Payment Method:</Text>
                            <Text style={styles.value}>{invoice.paymentType}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.grandTotal]}>
                            <Text
                                style={[
                                    styles.label,
                                    { color: "#111827", marginTop: 4 },
                                ]}
                            >
                                Total Amount:
                            </Text>
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: "bold",
                                    color: "#22c55e",
                                }}
                            >
                                {formatMoney(invoice.totalAmount)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* --- Footer --- */}
                {!isPremium && !isSmall && (
                    <View style={styles.footer} fixed>
                        <Text style={styles.footerText}>
                            Thank you for your business!
                        </Text>
                        <Text style={styles.footerText}>Powered by</Text>
                        <Image
                            src={`${origin}${footerLogo}`}
                            style={styles.footerLogo}
                        />
                    </View>
                )}
            </Page>
        </Document>
    );
};

export default InvoicePDF;
