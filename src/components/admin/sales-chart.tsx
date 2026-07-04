"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function SalesChart({
  labels,
  data,
}: {
  labels: string[];
  data: number[];
}) {
  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` S/ ${Number(ctx.parsed.y).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#6d7277" } },
      y: {
        beginAtZero: true,
        grid: { color: "#ecf3f8" },
        ticks: { color: "#6d7277", callback: (v) => `S/ ${v}` },
      },
    },
  };

  return (
    <div className="h-64">
      <Bar
        options={options}
        data={{
          labels,
          datasets: [
            {
              label: "Ventas",
              data,
              backgroundColor: "#e65d99",
              borderRadius: 8,
              maxBarThickness: 44,
            },
          ],
        }}
      />
    </div>
  );
}
