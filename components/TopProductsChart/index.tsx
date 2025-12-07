import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
    ChartData,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface TopProduct {
    id: string;
    name: string;
    soldQuantity?: number;
    totalRevenue?: number;
    quantity?: number;
    price: number;
    period?: string;
    products?: TopProduct[];
}

interface TopProductsProps {
    products: TopProduct[];
    loading?: boolean;
    timePeriod?: number;
}

export default function TopProducts({
    products,
    timePeriod = 7,
}: TopProductsProps) {
    // Check if there's no data
    const hasNoData = !products || products.length === 0;

    // Generate period labels for display
    const generatePeriodLabel = (
        period: string,
        timePeriod: number
    ): string => {
        const date = new Date(period);

        if (timePeriod === 7) {
            // Group by day for 7 days
            const dayLabels: string[] = [];

            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                dayLabels.push(
                    date.toLocaleDateString("en-US", {
                        weekday: "short",
                    })
                );
            }
            return dayLabels[date.getDay()];
        } else if (timePeriod === 30) {
            // Group by week for 30 days
            const weekLabels: string[] = [];

            // Generate actual date ranges for each week
            for (let i = 3; i >= 0; i--) {
                const weekEnd = new Date();
                weekEnd.setDate(weekEnd.getDate() - i * 7);
                const weekStart = new Date(weekEnd);
                weekStart.setDate(weekStart.getDate() - 6);

                weekLabels.push(
                    `${weekStart.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    })} - ${weekEnd.toLocaleDateString("en-US", {
                        day: "numeric",
                    })}`
                );
            }
            return weekLabels[Math.floor((date.getDate() - 1) / 7)];
        } else if (timePeriod === 90 || timePeriod === 365) {
            // Sep, Oct, Nov - month only
            return date.toLocaleDateString("en-US", {
                month: "short",
            });
        }
        return period;
    };

    // Generate week range label (e.g., "Nov 24 - 30")
    const generateWeekRangeLabel = (startDate: string): string => {
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 6); // Add 6 days to get end of week

        const startMonth = start.toLocaleDateString("en-US", {
            month: "short",
        });
        const endMonth = end.toLocaleDateString("en-US", { month: "short" });
        const startDay = start.getDate();
        const endDay = end.getDate();

        // If same month
        if (startMonth === endMonth) {
            return `${startMonth} ${startDay} - ${endDay}`;
        }
        // If different months
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
    };

    // Process data
    const processedData = useMemo(() => {
        if (!products || products.length === 0) {
            return {
                labels: [] as string[],
                product1Data: [] as number[],
                product2Data: [] as number[],
                product1Name: "Product 1",
                product2Name: "Product 2",
                periodData: [] as any[],
                hasData: false,
            };
        }

        // Check if data has period property (API format)
        const isPeriodFormat = products[0].period !== undefined;

        if (isPeriodFormat) {
            let chartLabels: string[] = [];

            // For 30-day period, group into weeks
            if (timePeriod === 30) {
                const weeks: { [weekStart: string]: any[] } = {};
                const weekStarts: string[] = [];

                // Group products by week
                products.forEach((p: any) => {
                    const date = new Date(p.period);
                    const dayOfWeek = date.getDay();
                    const diff = date.getDate() - dayOfWeek;
                    const weekStart = new Date(date.setDate(diff));
                    const weekStartStr = weekStart.toISOString().split("T")[0];

                    if (!weeks[weekStartStr]) {
                        weeks[weekStartStr] = [];
                        weekStarts.push(weekStartStr);
                    }
                    weeks[weekStartStr].push(p);
                });

                // Generate labels and aggregate data by week
                const product1Data: number[] = [];
                const product2Data: number[] = [];
                const product1Revenues: number[] = [];
                const product2Revenues: number[] = [];
                let product1Name = "Product 1";
                let product2Name = "Product 2";

                weekStarts.forEach((weekStart) => {
                    chartLabels.push(generateWeekRangeLabel(weekStart));

                    const weekProducts = weeks[weekStart];
                    const allProductsInWeek: {
                        [productId: string]: any;
                    } = {};

                    // Aggregate all products across the week
                    weekProducts.forEach((dayData: any) => {
                        if (
                            dayData.products &&
                            Array.isArray(dayData.products)
                        ) {
                            dayData.products.forEach((prod: any) => {
                                if (!allProductsInWeek[prod.id]) {
                                    allProductsInWeek[prod.id] = {
                                        ...prod,
                                        soldQuantity: 0,
                                        totalRevenue: 0,
                                    };
                                }
                                allProductsInWeek[prod.id].soldQuantity +=
                                    prod.soldQuantity || 0;
                                allProductsInWeek[prod.id].totalRevenue +=
                                    prod.totalRevenue || 0;
                            });
                        }
                    });

                    // Sort and get top 2
                    const sortedProducts = Object.values(
                        allProductsInWeek
                    ).sort(
                        (a, b) => (b.soldQuantity || 0) - (a.soldQuantity || 0)
                    );

                    // First product
                    if (sortedProducts[0]) {
                        const prod1 = sortedProducts[0];
                        product1Data.push(prod1.soldQuantity || 0);
                        product1Revenues.push(prod1.totalRevenue || 0);
                        if (product1Name === "Product 1") {
                            product1Name = prod1.name || "Product 1";
                        }
                    } else {
                        product1Data.push(0);
                        product1Revenues.push(0);
                    }

                    // Second product
                    if (sortedProducts[1]) {
                        const prod2 = sortedProducts[1];
                        product2Data.push(prod2.soldQuantity || 0);
                        product2Revenues.push(prod2.totalRevenue || 0);
                        if (product2Name === "Product 2") {
                            product2Name = prod2.name || "Product 2";
                        }
                    } else {
                        product2Data.push(0);
                        product2Revenues.push(0);
                    }
                });

                return {
                    labels: chartLabels,
                    product1Data,
                    product2Data,
                    product1Name,
                    product2Name,
                    product1Revenues,
                    product2Revenues,
                    periodData: products,
                    isPeriodFormat: true,
                    hasData: true,
                };
            } else if (timePeriod === 365) {
                // For 365-day period, create month map
                const monthMap: { [monthKey: string]: any[] } = {};

                // Group products by month
                products.forEach((p: any) => {
                    const date = new Date(p.period);
                    const monthKey = `${date.getFullYear()}-${String(
                        date.getMonth() + 1
                    ).padStart(2, "0")}`;

                    if (!monthMap[monthKey]) {
                        monthMap[monthKey] = [];
                    }
                    monthMap[monthKey].push(p);
                });

                // Generate all 12 months starting from January of the year
                const monthLabels: string[] = [];
                const monthKeys: string[] = [];

                if (Object.keys(monthMap).length > 0) {
                    // Get the first month's year
                    const firstMonthKey = Object.keys(monthMap).sort()[0];
                    const year = parseInt(firstMonthKey.split("-")[0]);

                    // Generate all months for that year starting from January
                    for (let month = 1; month <= 12; month++) {
                        const monthKey = `${year}-${String(month).padStart(
                            2,
                            "0"
                        )}`;
                        monthKeys.push(monthKey);

                        const date = new Date(year, month - 1, 1);
                        const monthLabel = date.toLocaleDateString("en-US", {
                            month: "short",
                        });
                        monthLabels.push(monthLabel);
                    }
                }

                const product1Data: number[] = [];
                const product2Data: number[] = [];
                const product1Revenues: number[] = [];
                const product2Revenues: number[] = [];
                let product1Name = "Product 1";
                let product2Name = "Product 2";

                monthKeys.forEach((monthKey) => {
                    const monthProducts = monthMap[monthKey] || [];
                    const allProductsInMonth: {
                        [productId: string]: any;
                    } = {};

                    // Aggregate all products across the month
                    monthProducts.forEach((dayData: any) => {
                        if (
                            dayData.products &&
                            Array.isArray(dayData.products)
                        ) {
                            dayData.products.forEach((prod: any) => {
                                if (!allProductsInMonth[prod.id]) {
                                    allProductsInMonth[prod.id] = {
                                        ...prod,
                                        soldQuantity: 0,
                                        totalRevenue: 0,
                                    };
                                }
                                allProductsInMonth[prod.id].soldQuantity +=
                                    prod.soldQuantity || 0;
                                allProductsInMonth[prod.id].totalRevenue +=
                                    prod.totalRevenue || 0;
                            });
                        }
                    });

                    // Sort and get top 2
                    const sortedProducts = Object.values(
                        allProductsInMonth
                    ).sort(
                        (a, b) => (b.soldQuantity || 0) - (a.soldQuantity || 0)
                    );

                    // First product
                    if (sortedProducts[0]) {
                        const prod1 = sortedProducts[0];
                        product1Data.push(prod1.soldQuantity || 0);
                        product1Revenues.push(prod1.totalRevenue || 0);
                        if (product1Name === "Product 1") {
                            product1Name = prod1.name || "Product 1";
                        }
                    } else {
                        product1Data.push(0);
                        product1Revenues.push(0);
                    }

                    // Second product
                    if (sortedProducts[1]) {
                        const prod2 = sortedProducts[1];
                        product2Data.push(prod2.soldQuantity || 0);
                        product2Revenues.push(prod2.totalRevenue || 0);
                        if (product2Name === "Product 2") {
                            product2Name = prod2.name || "Product 2";
                        }
                    } else {
                        product2Data.push(0);
                        product2Revenues.push(0);
                    }
                });

                return {
                    labels: monthLabels,
                    product1Data,
                    product2Data,
                    product1Name,
                    product2Name,
                    product1Revenues,
                    product2Revenues,
                    periodData: products,
                    isPeriodFormat: true,
                    hasData: true,
                };
            } else {
                // For 7 and 90 day periods
                chartLabels = products.map((p: any) =>
                    generatePeriodLabel(p.period, timePeriod)
                );

                const product1Data: number[] = [];
                const product2Data: number[] = [];
                const product1Revenues: number[] = [];
                const product2Revenues: number[] = [];
                let product1Name = "Product 1";
                let product2Name = "Product 2";

                products.forEach((periodData: any) => {
                    if (
                        periodData.products &&
                        Array.isArray(periodData.products)
                    ) {
                        // Get first product
                        if (periodData.products[0]) {
                            const prod1 = periodData.products[0];
                            product1Data.push(prod1.soldQuantity || 0);
                            product1Revenues.push(prod1.totalRevenue || 0);
                            if (product1Name === "Product 1") {
                                product1Name = prod1.name || "Product 1";
                            }
                        } else {
                            product1Data.push(0);
                            product1Revenues.push(0);
                        }

                        // Get second product
                        if (periodData.products[1]) {
                            const prod2 = periodData.products[1];
                            product2Data.push(prod2.soldQuantity || 0);
                            product2Revenues.push(prod2.totalRevenue || 0);
                            if (product2Name === "Product 2") {
                                product2Name = prod2.name || "Product 2";
                            }
                        } else {
                            product2Data.push(0);
                            product2Revenues.push(0);
                        }
                    } else {
                        product1Data.push(0);
                        product2Data.push(0);
                        product1Revenues.push(0);
                        product2Revenues.push(0);
                    }
                });

                return {
                    labels: chartLabels,
                    product1Data,
                    product2Data,
                    product1Name,
                    product2Name,
                    product1Revenues,
                    product2Revenues,
                    periodData: products,
                    isPeriodFormat: true,
                    hasData: true,
                };
            }
        }

        return {
            labels: ["Current Period"] as string[],
            product1Data: [products[0]?.soldQuantity || 0] as number[],
            product2Data: [products[1]?.soldQuantity || 0] as number[],
            product1Name: products[0]?.name || "Product 1",
            product2Name: products[1]?.name || "Product 2",
            product1Revenues: [products[0]?.totalRevenue || 0] as number[],
            product2Revenues: [products[1]?.totalRevenue || 0] as number[],
            periodData: [],
            isPeriodFormat: false,
            hasData: true,
        };
    }, [products, timePeriod]);

    const data: ChartData<"bar"> = {
        labels: processedData.labels,
        datasets: [
            {
                label: processedData.product1Name,
                data: processedData.product1Data,
                backgroundColor: "rgba(34, 197, 94, 0.8)",
                borderColor: "transparent",
                borderWidth: 0,
                borderRadius: 2,
                barPercentage: 0.8,
                categoryPercentage: 0.7,
            },
            {
                label: processedData.product2Name,
                data: processedData.product2Data,
                backgroundColor: "rgba(34, 197, 94, 0.5)",
                borderColor: "transparent",
                borderWidth: 0,
                borderRadius: 2,
                barPercentage: 0.8,
                categoryPercentage: 0.7,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: processedData.hasData,
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "#fff",
                bodyColor: "#fff",
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: function (context: any) {
                        const productIndex = context.datasetIndex;
                        const dataIndex = context.dataIndex;
                        const revenue =
                            productIndex === 0
                                ? processedData.product1Revenues?.[dataIndex] ||
                                  0
                                : processedData.product2Revenues?.[dataIndex] ||
                                  0;

                        return [
                            `${context.dataset.label}`,
                            `Quantity: ${context.parsed.y}`,
                            `Revenue: $${revenue.toFixed(2)}`,
                        ];
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                border: {
                    display: false,
                },
                ticks: {
                    color: "#94a3b8",
                    font: {
                        size: 11,
                        weight: 500,
                    },
                    padding: 10,
                },
            },
            y: {
                display: false,
                beginAtZero: true,
                grid: {
                    display: false,
                    drawBorder: false,
                },
                border: {
                    display: false,
                },
            },
        },
    };

    return (
        <div style={{ height: "300px", width: "100%", position: "relative" }}>
            <Bar data={data} options={options} />
            {hasNoData && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none",
                    }}
                >
                    <p className="text-red-400 text-sm">Not enough data</p>
                </div>
            )}
        </div>
    );
}
