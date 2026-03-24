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
    };
    topProducts: { name: string; sku: string; qty: number; revenue: number }[];
    ledger: {
        date: string;
        invoiceId: string;
        customer: string;
        method: string;
        amount: number;
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
        padding: 30,
        color: "#333",
        flexDirection: "column",
        backgroundColor: "#ffffff",
    },
    header: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        paddingBottom: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#22c55e",
        textTransform: "uppercase",
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#22c55e",
        textTransform: "uppercase",
        marginTop: 25,
        marginBottom: 10,
    },
    metaGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 10,
        gap: 15,
    },
    col: {
        width: "48%",
        marginBottom: 10,
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
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 4,
        color: "#111827",
    },
    table: {
        width: "100%",
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#f9fafb",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        borderTopWidth: 1,
        borderTopColor: "#eee",
        padding: 8,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        padding: 8,
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

export const FinancialReportPDF: React.FC<FinancialReportPDFProps> = ({
    data,
    periodLabel,
    businessName = "Business",
}) => {
    const formatMoney = (amount: number) => {
        if (isNaN(amount)) return "Ksh 0.00";
        return `Ksh ${amount.toLocaleString(undefined, {
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
                        <Text style={styles.title}>Financial Report</Text>
                        <Text style={styles.value}>{businessName}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.label}>Reporting Period</Text>
                        <Text style={styles.boldValue}>{periodLabel}</Text>
                        <Text style={styles.label}>Generated On</Text>
                        <Text style={styles.value}>
                            {new Date().toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                {/* --- 1. EXECUTIVE SUMMARY --- */}
                <Text style={styles.sectionTitle}>1. Executive Summary</Text>
                <View style={styles.metaGrid}>
                    <View style={styles.col}>
                        <Text style={styles.label}>Gross Revenue</Text>
                        <Text style={styles.boldValue}>
                            {formatMoney(data.summary.totalRevenue)}
                        </Text>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.label}>Total Transactions</Text>
                        <Text style={styles.boldValue}>
                            {data.summary.totalInvoices}
                        </Text>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.label}>M-Pesa Settlements</Text>
                        <Text style={styles.boldValue}>
                            {formatMoney(data.summary.mpesaTotal)}
                        </Text>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.label}>
                            Cash / Other Collections
                        </Text>
                        <Text style={styles.boldValue}>
                            {formatMoney(data.summary.cashTotal)}
                        </Text>
                    </View>
                </View>

                {/* --- 2. TOP PRODUCTS --- */}
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
                                    { color: "#888", ...styles.colPSku },
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
                                    { fontSize: 10, ...styles.colPRev },
                                ]}
                            >
                                {formatMoney(item.revenue)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* --- 3. TRANSACTION LEDGER --- */}
                <Text style={styles.sectionTitle}>3. Transaction Ledger</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.label, styles.colLDate]}>
                            Date
                        </Text>
                        <Text style={[styles.label, styles.colLId]}>
                            Receipt ID
                        </Text>
                        <Text style={[styles.label, styles.colLCust]}>
                            Customer
                        </Text>
                        <Text style={[styles.label, styles.colLMethod]}>
                            Method
                        </Text>
                        <Text style={[styles.label, styles.colLAmt]}>
                            Amount
                        </Text>
                    </View>
                    {data.ledger.map((tx, index) => (
                        <View key={index} style={styles.tableRow} wrap={false}>
                            <Text style={[styles.value, styles.colLDate]}>
                                {new Date(tx.date).toLocaleDateString()}
                            </Text>
                            <Text
                                style={[
                                    styles.value,
                                    { color: "#888", ...styles.colLId },
                                ]}
                            >
                                {tx.invoiceId.split("-")[0].toUpperCase()}
                            </Text>
                            <Text style={[styles.value, styles.colLCust]}>
                                {tx.customer}
                            </Text>
                            <Text style={[styles.value, styles.colLMethod]}>
                                {tx.method}
                            </Text>
                            <Text
                                style={[
                                    styles.boldValue,
                                    { fontSize: 10, ...styles.colLAmt },
                                ]}
                            >
                                {formatMoney(tx.amount)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* --- FOOTER --- */}
                <View style={styles.footer} fixed>
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
