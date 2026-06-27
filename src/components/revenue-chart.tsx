"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

type RevenueChartProps = {
  points: Array<{ month: string; revenue: number }>;
};

export function RevenueChart({ points }: RevenueChartProps) {
  const labels = points.map((p) => p.month);
  const values = points.map((p) => p.revenue);

  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: "Revenue",
            data: values,
            borderColor: "rgb(99, 102, 241)",
            backgroundColor: "rgba(99, 102, 241, 0.15)",
            tension: 0.4,
            fill: true,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: "rgba(148,163,184,0.2)" } },
        },
      }}
    />
  );
}
