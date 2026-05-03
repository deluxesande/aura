// utils/kra/auto-filer.ts
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { subMonths, format } from "date-fns";
import axios from "axios";

// Re-use your shared KRA constants
const API_DOMAIN = "https://sbx.kra.go.ke";

export async function checkAndAutoFile(businessId: string) {
    // 1. Get Business Details & Sub from Master
    const business = await masterPrisma.business.findUnique({
        where: { id: businessId },
        include: {
            subscriptions: {
                where: { status: "ACTIVE" },
                orderBy: { createdAt: "desc" },
                take: 1,
            },
            users: { select: { clerkId: true } },
        },
    });

    if (!business) return;

    const tenantPrisma = await getTenantPrisma(businessId);

    // Fetch KRA details from Tenant DB
    const kraDetails = await tenantPrisma.kraDetails.findUnique({
        where: { businessId: businessId }
    });

    // 2. Validation Checks
    if (!kraDetails || !kraDetails.kraPin) return; // No PIN, can't file

    const activeSub = business.subscriptions[0];
    const plan = activeSub?.plan || "STARTER"; // Default to STARTER if null

    // --- NEW LOGIC: Starter OR Opt-in ---
    const isStarter = plan === "STARTER";
    const hasOptedIn = kraDetails.isAutoFilingEnabled === true;

    // Skip ONLY IF it's a paid plan AND they haven't opted in
    if (!isStarter && !hasOptedIn) {
        console.log(
            `Skipping auto-file for ${businessId}: Paid plan & Opt-out`,
        );
        return;
    }
    // ------------------------------------

    // 3. Determine "Last Month" (The filing period)
    const lastMonthDate = subMonths(new Date(), 1);
    const period = format(lastMonthDate, "yyyy-MM"); // e.g., "2026-01"

    // 4. Check if ALREADY filed for this period (in Tenant DB)
    const existingReturn = await tenantPrisma.kraTotReturn.findFirst({
        where: {
            businessId: business.id,
            period: period,
        },
    });

    if (existingReturn) {
        // Silent return so we don't spam logs
        return;
    }

    console.log(`Starting Auto-File for ${businessId} (${period})`);

    try {
        // A. Calculate Gross Sales
        const [year, month] = period.split("-");
        // Start of last month
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        // End of last month
        const endDate = new Date(
            parseInt(year),
            parseInt(month),
            0,
            23,
            59,
            59,
        );

        const clerkIds = business.users.map((u) => u.clerkId);

        const aggregations = await tenantPrisma.invoice.aggregate({
            _sum: { totalAmount: true },
            where: {
                OR: [
                    { businessId: business.id },
                    { createdBy: { in: clerkIds } },
                ],
                status: "PAID",
                createdAt: { gte: startDate, lte: endDate },
            },
        });

        const grossTurnover = aggregations._sum.totalAmount || 0;

        // B. KRA Auth
        const authUrl = `${API_DOMAIN}/v1/token/generate?grant_type=client_credentials`;
        const credentials = Buffer.from(
            `${process.env.KRA_TOT_CONSUMER_KEY}:${process.env.KRA_TOT_CONSUMER_SECRET}`,
        ).toString("base64");

        const tokenResponse = await axios.get(authUrl, {
            headers: { Authorization: `Basic ${credentials}` },
        });

        // C. KRA Filing
        const filingUrl = `${API_DOMAIN}/filing/v1/tot/paymentregistration`;
        const totPayload = {
            TAXPAYERDETAILS: {
                TaxpayerPIN: kraDetails.kraPin,
                Month: month,
                Year: year,
                GrossTurnover: grossTurnover,
            },
        };

        const filingResponse = await axios.post(filingUrl, totPayload, {
            headers: {
                Authorization: `Bearer ${tokenResponse.data.access_token}`,
                "Content-Type": "application/json",
            },
        });

        const kraData = filingResponse.data;

        // D. Save to Tenant Database
        if (kraData.Status === "OK" || kraData.ResponseCode === "87000") {
            await tenantPrisma.kraTotReturn.create({
                data: {
                    ackNumber: kraData.AckNumber,
                    paymentSlip: kraData.PRN,
                    computedTax: parseFloat(kraData.ComputedTax),
                    taxPayable: parseFloat(kraData.TaxPayable),
                    period: period,
                    businessId: business.id,
                },
            });
            console.log(`✅ Auto-filed successfully: ${kraData.AckNumber}`);
        } else {
            console.error(`❌ KRA Rejected: ${kraData.Message}`);
        }
    } catch (error: any) {
        console.error("Auto-filing failed:", error.message);
        // We do NOT throw here because we don't want to crash the Login/Profile endpoint
    }
}
