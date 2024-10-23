import React from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip
);

const LineChart = () => {
    const data = {
        labels: [
            "",
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
        ],
        datasets: [
            {
                label: "Dataset 1",
                data: [29, 15, 29, 15, 11, 29, 15, 20],
                fill: true,
                backgroundColor: "rgba(75,192,192,0.2)",
                borderColor: "rgba(75,192,192,1)",
                tension: 0.4,
                pointRadius: 0, // Remove markers from the line chart
            },
            {
                label: "Dataset 2",
                data: [10, 20, 15, 25, 30, 20, 10, 30],
                fill: true,
                backgroundColor: "rgba(192,75,75,0.2)",
                borderColor: "rgba(192,75,75,1)",
                tension: 0.4,
                pointRadius: 0, // Remove markers from the line chart
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true, // Show legend to differentiate datasets
            },
            title: {
                display: false,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false, // Hide grid lines on the x-axis
                },
                border: {
                    display: false, // Show x-axis line
                },
                ticks: {
                    display: true, // Show x-axis ticks
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    display: false, // Hide grid lines on the y-axis
                },
                ticks: {
                    stepSize: 10,
                },
                border: {
                    display: false, // Hide y-axis line
                },
            },
        },
    };

    return <Line data={data} options={options} />;
};

export default LineChart;
