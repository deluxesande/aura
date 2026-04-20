/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import {
    Document,
    Font,
    Image,
    Page,
    StyleSheet,
    Text,
    View,
} from "@react-pdf/renderer";

// Register fonts to match your existing PDF styling
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

interface ReportData {
    summary: {
        totalRevenue: number;
        totalInvoices: number;
        mpesaTotal: number;
        cashTotal: number;
        totalStockValue?: number;
        totalDeliveries?: number;
        totalExpenses?: number;
    };
    topProducts: { name: string; sku: string; qty: number; revenue: number }[];
    ledger: {
        date: string;
        invoiceId: string;
        customer: string;
        method: string;
        amount: number;
    }[];
    deliveries?: {
        date: string;
        reference: string;
        supplier: string;
        store: string;
        cost: number;
    }[];
}

interface FinancialReportPDFProps {
    data: ReportData;
    periodLabel: string;
    businessName?: string;
}

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
        alignItems: "center",
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
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#22c55e",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#22c55e",
        textTransform: "uppercase",
        marginTop: 25,
        marginBottom: 12,
        backgroundColor: "#f0fdf4",
        padding: "6 10",
        borderRadius: 4,
        borderLeftWidth: 3,
        borderLeftColor: "#22c55e",
    },
    metaGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    col: {
        width: "31%",
        marginBottom: 15,
        backgroundColor: "#f9fafb",
        padding: 12,
        borderRadius: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    label: {
        fontSize: 7,
        color: "#888",
        marginBottom: 4,
        textTransform: "uppercase",
        fontWeight: "bold",
    },
    value: {
        fontSize: 9,
        color: "#374151",
    },
    boldValue: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#111827",
    },
    table: {
        width: "100%",
        marginTop: 5,
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

    // Top Products Columns
    colPName: { width: "45%" },
    colPSku: { width: "25%" },
    colPQty: { width: "10%", textAlign: "center" },
    colPRev: { width: "20%", textAlign: "right" },

    // Ledger Columns
    colLDate: { width: "15%" },
    colLId: { width: "20%" },
    colLCust: { width: "30%" },
    colLMethod: { width: "15%" },
    colLAmt: { width: "20%", textAlign: "right" },

    // Delivery Columns
    colDDate: { width: "15%" },
    colDRef: { width: "20%" },
    colDSupp: { width: "25%" },
    colDStore: { width: "20%" },
    colDCost: { width: "20%", textAlign: "right" },

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

export const FinancialReportPDF: React.FC<FinancialReportPDFProps> = ({
    data,
    periodLabel,
    businessName = "Business",
}) => {
    const formatMoney = (amount: any) => {
        const num = Number(amount);
        if (isNaN(num)) return "Ksh 0.00";
        return `Ksh ${num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const footerLogo = "/logos/salesense-horizontal.png";
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* --- HEADER --- */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>
                            Performance Report
                        </Text>
                        <Text
                            style={[
                                styles.boldValue,
                                { fontSize: 13, color: "#4b5563", marginTop: 4 },
                            ]}
                        >
                            {businessName}
                        </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.label}>Reporting Period</Text>
                        <Text style={styles.boldValue}>{periodLabel}</Text>
                        <Text style={[styles.label, { marginTop: 6 }]}>
                            Report Generated
                        </Text>
                        <Text style={styles.value}>
                            {new Date().toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </Text>
                    </View>
                </View>

                {/* --- 1. EXECUTIVE SUMMARY --- */}
                <Text style={styles.sectionTitle}>1. Executive Summary</Text>
                <View style={styles.metaGrid}>
                    <View style={styles.col}>
                        <Text style={styles.label}>Total Revenue</Text>
                        <Text style={[styles.boldValue, { color: "#166534" }]}>
                            {formatMoney(data.summary.totalRevenue)}
                        </Text>
                        <Text style={styles.value}>
                            {data.summary.totalInvoices} Sales
                        </Text>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.label}>M-Pesa Collections</Text>
                        <Text style={styles.boldValue}>
                            {formatMoney(data.summary.mpesaTotal)}
                        </Text>
                        <Text style={styles.value}>Digital Settlement</Text>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.label}>Cash Collections</Text>
                        <Text style={styles.boldValue}>
                            {formatMoney(data.summary.cashTotal)}
                        </Text>
                        <Text style={styles.value}>Direct Payment</Text>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.label}>Stock Procurement</Text>
                        <Text style={[styles.boldValue, { color: "#991b1b" }]}>
                            {formatMoney(data.summary.totalStockValue || 0)}
                        </Text>
                        <Text style={styles.value}>
                            {data.summary.totalDeliveries || 0} Deliveries
                        </Text>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.label}>Total Expenses</Text>
                        <Text style={[styles.boldValue, { color: "#991b1b" }]}>
                            {formatMoney(data.summary.totalExpenses || 0)}
                        </Text>
                        <Text style={styles.value}>Operational Costs</Text>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.label}>Net Cash Flow</Text>
                        <Text style={[styles.boldValue, { fontSize: 12 }]}>
                            {formatMoney(
                                data.summary.totalRevenue -
                                    (data.summary.totalStockValue || 0) -
                                    (data.summary.totalExpenses || 0),
                            )}
                        </Text>
                        <Text style={styles.value}>Approx. Margin</Text>
                    </View>
                </View>

                {/* --- 2. PRODUCT PERFORMANCE --- */}
                <Text style={styles.sectionTitle}>
                    2. Product Performance (Top 10)
                </Text>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.label, styles.colPName]}>
                            Item Name
                        </Text>
                        <Text style={[styles.label, styles.colPSku]}>
                            SKU / Barcode
                        </Text>
                        <Text style={[styles.label, styles.colPQty]}>Qty</Text>
                        <Text style={[styles.label, styles.colPRev]}>
                            Gross Rev.
                        </Text>
                    </View>
                    {data.topProducts.slice(0, 10).map((item, index) => (
                        <View key={index} style={styles.tableRow} wrap={false}>
                            <Text style={[styles.value, styles.colPName]}>
                                {item.name}
                            </Text>
                            <Text
                                style={[
                                    styles.value,
                                    { color: "#6b7280" },
                                    styles.colPSku,
                                ]}
                            >
                                {item.sku}
                            </Text>
                            <Text style={[styles.value, styles.colPQty]}>
                                {item.qty}
                            </Text>
                            <Text
                                style={[
                                    styles.boldValue,
                                    { fontSize: 9 },
                                    styles.colPRev,
                                ]}
                            >
                                {formatMoney(item.revenue)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* --- 3. SUPPLY CHAIN ACTIVITY --- */}
                {data.deliveries && data.deliveries.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>
                            3. Recent Supply Chain Activity
                        </Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.label, styles.colDDate]}>
                                    Date
                                </Text>
                                <Text style={[styles.label, styles.colDRef]}>
                                    Reference
                                </Text>
                                <Text style={[styles.label, styles.colDSupp]}>
                                    Supplier
                                </Text>
                                <Text style={[styles.label, styles.colDStore]}>
                                    Branch
                                </Text>
                                <Text style={[styles.label, styles.colDCost]}>
                                    Cost
                                </Text>
                            </View>
                            {data.deliveries.slice(0, 15).map((d, index) => (
                                <View
                                    key={index}
                                    style={styles.tableRow}
                                    wrap={false}
                                >
                                    <Text
                                        style={[styles.value, styles.colDDate]}
                                    >
                                        {new Date(d.date).toLocaleDateString()}
                                    </Text>
                                    <Text
                                        style={[styles.value, styles.colDRef]}
                                    >
                                        {d.reference}
                                    </Text>
                                    <Text
                                        style={[styles.value, styles.colDSupp]}
                                    >
                                        {d.supplier}
                                    </Text>
                                    <Text
                                        style={[styles.value, styles.colDStore]}
                                    >
                                        {d.store}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.boldValue,
                                            { fontSize: 9 },
                                            styles.colDCost,
                                        ]}
                                    >
                                        {formatMoney(d.cost)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* --- FOOTER --- */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>
                        Professional Business Reporting & Analytics
                    </Text>
                    <Text style={styles.footerText}>Powered by</Text>
                    <Image
                        src={`${origin}${footerLogo}`}
                        style={styles.footerLogo}
                    />
                </View>
            </Page>
        </Document>
    );
};
