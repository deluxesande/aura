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

        const ITEM_HEIGHT = 20;
        const HEADER_HEIGHT = 140;
        const META_HEIGHT = 100;
        const TABLE_HEADER_HEIGHT = 30;
        const TOTALS_HEIGHT = 100;
        const FOOTER_HEIGHT = isPremium ? 0 : 80;

        const totalHeight =
            HEADER_HEIGHT +
            META_HEIGHT +
            TABLE_HEADER_HEIGHT +
            invoice.invoiceItems.length * ITEM_HEIGHT +
            TOTALS_HEIGHT +
            FOOTER_HEIGHT;

        return { size: [226, totalHeight] as [number, number] };
    };

    const pageProps = calculatePageHeight();

    const styles = StyleSheet.create({
        page: {
            fontFamily: "Helvetica",
            fontSize: isSmall ? 9 : 10,
            padding: isSmall ? 10 : 30,
            color: "#333",
            flexDirection: "column",
            backgroundColor: "#ffffff",
        },
        header: {
            flexDirection: isSmall ? "column" : "row",
            alignItems: isSmall ? "flex-start" : "center",
            justifyContent: isSmall ? "flex-start" : "space-between",
            marginBottom: isSmall ? 10 : 20,
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
            paddingBottom: 10,
            gap: isSmall ? 5 : 0,
        },
        logo: {
            width: isSmall ? 40 : 60,
            height: isSmall ? 40 : 60,
            objectFit: "contain",
            marginBottom: isSmall ? 5 : 0,
        },
        businessDetails: {
            textAlign: isSmall ? "left" : "right",
            width: isSmall ? "100%" : "auto",
        },
        title: {
            fontSize: isSmall ? 14 : 20,
            fontWeight: "bold",
            color: "#22c55e",
            textTransform: "uppercase",
            marginBottom: 5,
        },
        invoiceMeta: {
            flexDirection: isSmall ? "column" : "row",
            justifyContent: "space-between",
            marginTop: isSmall ? 10 : 20,
            marginBottom: isSmall ? 10 : 20,
            gap: isSmall ? 10 : 0,
        },
        col: {
            width: isSmall ? "100%" : "48%",
        },
        label: {
            fontSize: 8,
            color: "#888",
            marginBottom: 2,
            textTransform: "uppercase",
        },
        value: {
            fontSize: isSmall ? 9 : 10,
            marginBottom: 4,
        },
        boldValue: {
            fontSize: isSmall ? 9 : 10,
            fontWeight: "bold",
            marginBottom: 4,
        },
        table: {
            width: "100%",
            marginTop: 10,
            marginBottom: isSmall ? 10 : 20,
        },
        tableHeader: {
            flexDirection: "row",
            backgroundColor: "#f9fafb",
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
            padding: isSmall ? 4 : 8,
        },
        tableRow: {
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
            padding: isSmall ? 4 : 8,
            alignItems: "center",
        },
        colDesc: { width: isSmall ? "40%" : "50%" },
        colQty: { width: isSmall ? "10%" : "15%", textAlign: "center" },
        colPrice: { width: isSmall ? "25%" : "15%", textAlign: "right" },
        colTotal: { width: isSmall ? "25%" : "20%", textAlign: "right" },

        totalsSection: {
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: 10,
        },
        totalRowWrapper: {
            width: isSmall ? "100%" : "auto",
            minWidth: isSmall ? 0 : 200,
        },
        totalRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 5,
        },
        grandTotal: {
            fontSize: isSmall ? 12 : 14,
            fontWeight: "bold",
            borderTopWidth: 1,
            borderTopColor: "#333",
            paddingTop: 5,
            marginTop: 5,
        },
        footer: {
            marginTop: isSmall ? 20 : "auto",
            position: isSmall ? "relative" : "absolute",
            bottom: isSmall ? "auto" : 30,
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
            width: isSmall ? 60 : 100,
            objectFit: "contain",
            opacity: 1,
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

    return (
        <Document>
            <Page {...(pageProps as any)} style={styles.page}>
                {/* --- Header --- */}
                <View style={styles.header}>
                    <View>
                        {businessLogo ? (
                            <Image src={businessLogo} style={styles.logo} />
                        ) : (
                            <Text
                                style={{
                                    fontSize: isSmall ? 14 : 18,
                                    fontWeight: "bold",
                                }}
                            >
                                {business?.name || "Business Name"}
                            </Text>
                        )}
                    </View>

                    <View style={styles.businessDetails}>
                        <Text style={styles.title}>Receipt</Text>
                        <Text style={styles.value}>{invoice.invoiceName}</Text>
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
                            <View
                                key={index}
                                style={styles.tableRow}
                                wrap={false}
                            >
                                <Text style={[styles.value, styles.colDesc]}>
                                    {item.Product?.name || "Item"}
                                </Text>

                                <Text style={[styles.value, styles.colQty]}>
                                    {qty}
                                </Text>

                                <Text style={[styles.value, styles.colPrice]}>
                                    {formatNumber(unitPrice)}
                                </Text>

                                <Text style={[styles.value, styles.colTotal]}>
                                    {formatNumber(lineTotal)}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                {/* --- Totals --- */}
                <View style={styles.totalsSection} wrap={false}>
                    <View style={styles.totalRowWrapper}>
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
                            <Text style={styles.title}>Total:</Text>
                            <Text style={styles.title}>
                                {formatMoney(invoice.totalAmount)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* --- Footer --- */}
                {!isPremium && (
                    <View style={styles.footer} wrap={false}>
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
