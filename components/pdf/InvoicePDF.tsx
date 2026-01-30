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
        }, // Regular
        {
            src: "https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlfBBc9.ttf",
            fontWeight: 700,
        }, // Bold
    ],
});

const styles = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        fontSize: 10,
        padding: 30,
        color: "#333",
        flexDirection: "column",
        backgroundColor: "#ffffff",
    },
    backgroundContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: "100%",
        width: "100%",
        zIndex: -1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        paddingBottom: 10,
    },
    logo: {
        width: 60,
        height: 60,
        objectFit: "contain",
    },
    businessDetails: {
        textAlign: "right",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#22c55e",
        textTransform: "uppercase",
        marginBottom: 5,
    },
    invoiceMeta: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        marginBottom: 20,
    },
    col: {
        width: "48%",
    },
    label: {
        fontSize: 8,
        color: "#888",
        marginBottom: 2,
        textTransform: "uppercase",
    },
    value: {
        fontSize: 10,
        marginBottom: 4,
    },
    boldValue: {
        fontSize: 10,
        fontWeight: "bold",
        marginBottom: 4,
    },
    table: {
        width: "100%",
        marginTop: 10,
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#f9fafb",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        padding: 8,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        padding: 8,
    },
    colDesc: { width: "50%" },
    colQty: { width: "15%", textAlign: "center" },
    colPrice: { width: "15%", textAlign: "right" },
    colTotal: { width: "20%", textAlign: "right" },
    totalsSection: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 10,
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: 200,
        marginBottom: 5,
    },
    grandTotal: {
        fontSize: 14,
        fontWeight: "bold",
        borderTopWidth: 1,
        borderTopColor: "#333",
        paddingTop: 5,
        marginTop: 5,
    },
    footer: {
        position: "absolute",
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: "center",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    footerText: {
        fontSize: 8,
        color: "#9ca3af",
        marginBottom: 4,
    },
    footerLogo: {
        width: 100,
        objectFit: "contain",
        opacity: 1,
    },
});

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
    business?: Business | null;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, business }) => {
    const formatMoney = (amount: any) => {
        const num = Number(amount);
        if (isNaN(num)) return "Ksh 0.00";
        return `Ksh ${num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const getCustomerName = () => {
        if (!invoice.Customer) return "Walk-in Customer";
        const first = invoice.Customer.firstName || "";
        const last = invoice.Customer.lastName || "";
        return `${first} ${last}`.trim() || "Unknown Customer";
    };

    const businessLogo = business?.logo || null;
    const footerLogo = "/logos/salesense-horizontal.png";

    const isPremium = business?.plan === "PREMIUM";

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* --- Header --- */}
                <View style={styles.header}>
                    <View>
                        {businessLogo ? (
                            <Image src={businessLogo} style={styles.logo} />
                        ) : (
                            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                                {business?.name || "Business Name"}
                            </Text>
                        )}
                    </View>

                    <View style={styles.businessDetails}>
                        <Text style={styles.title}>Receipt</Text>
                        <Text style={styles.value}>#{invoice.invoiceName}</Text>
                        <Text style={styles.value}>
                            {new Date(invoice.createdAt).toDateString()}
                        </Text>
                    </View>
                </View>

                {/* --- Info Section --- */}
                <View style={styles.invoiceMeta}>
                    <View style={styles.col}>
                        <Text style={styles.label}>From:</Text>
                        {business ? (
                            <>
                                <Text style={styles.boldValue}>
                                    {business.name}
                                </Text>
                                {business.email && (
                                    <Text style={styles.value}>
                                        {business.email}
                                    </Text>
                                )}
                                {business.phoneNumber && (
                                    <Text style={styles.value}>
                                        {business.phoneNumber}
                                    </Text>
                                )}
                                {business.address && (
                                    <Text style={styles.value}>
                                        {business.address}
                                    </Text>
                                )}
                            </>
                        ) : (
                            <Text style={styles.value}>--</Text>
                        )}
                    </View>

                    <View style={styles.col}>
                        <Text style={styles.label}>Bill To:</Text>
                        <Text style={styles.boldValue}>
                            {getCustomerName()}
                        </Text>
                        {invoice.Customer && (
                            <>
                                <Text style={styles.value}>
                                    {invoice.Customer.phoneNumber}
                                </Text>
                                {invoice.Customer.email && (
                                    <Text style={styles.value}>
                                        {invoice.Customer.email}
                                    </Text>
                                )}
                            </>
                        )}
                    </View>
                </View>

                {/* --- Table --- */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.label, styles.colDesc]}>Item</Text>
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

                        return (
                            <View key={index} style={styles.tableRow}>
                                <Text style={[styles.value, styles.colDesc]}>
                                    {item.Product?.name || "Item"}
                                </Text>
                                <Text style={[styles.value, styles.colQty]}>
                                    {qty}
                                </Text>
                                <Text style={[styles.value, styles.colPrice]}>
                                    {formatMoney(unitPrice)}
                                </Text>
                                <Text style={[styles.value, styles.colTotal]}>
                                    {formatMoney(lineTotal)}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                {/* --- Totals --- */}
                <View style={styles.totalsSection}>
                    <View>
                        <View style={styles.totalRow}>
                            <Text style={styles.value}>Subtotal:</Text>
                            <Text style={styles.value}>
                                {formatMoney(invoice.totalAmount)}
                            </Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.value}>Payment Method:</Text>
                            <Text style={styles.value}>
                                {invoice.paymentType}
                            </Text>
                        </View>
                        <View style={[styles.totalRow, styles.grandTotal]}>
                            <Text>Total:</Text>
                            <Text>{formatMoney(invoice.totalAmount)}</Text>
                        </View>
                    </View>
                </View>

                {/* --- Footer (Hidden for Premium) --- */}
                {!isPremium && (
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Powered by</Text>
                        <Image
                            src={`${
                                typeof window !== "undefined"
                                    ? window.location.origin
                                    : ""
                            }${footerLogo}`}
                            style={styles.footerLogo}
                        />
                    </View>
                )}
            </Page>
        </Document>
    );
};

export default InvoicePDF;
