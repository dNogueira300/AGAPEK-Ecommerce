"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const PALETA = ["#e65d99", "#c14d87", "#7e6f7e", "#57bc8a", "#f5b14b", "#6d7fd8", "#e07a5f", "#9b6dd8"];

export function EstadoDoughnut({
  labels,
  data,
}: {
  labels: string[];
  data: number[];
}) {
  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom", labels: { color: "#6d7277", boxWidth: 12 } } },
  };
  return (
    <div className="h-64">
      <Doughnut
        options={options}
        data={{
          labels,
          datasets: [{ data, backgroundColor: PALETA, borderWidth: 0 }],
        }}
      />
    </div>
  );
}

export function TopProductosBar({
  labels,
  data,
}: {
  labels: string[];
  data: number[];
}) {
  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, grid: { color: "#ecf3f8" }, ticks: { color: "#6d7277", precision: 0 } },
      y: { grid: { display: false }, ticks: { color: "#6d7277" } },
    },
  };
  return (
    <div className="h-72">
      <Bar
        options={options}
        data={{
          labels,
          datasets: [{ label: "Unidades", data, backgroundColor: "#e65d99", borderRadius: 6, maxBarThickness: 22 }],
        }}
      />
    </div>
  );
}

export function VentasMesBar({
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
      tooltip: { callbacks: { label: (c) => ` S/ ${Number(c.parsed.y).toFixed(2)}` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#6d7277" } },
      y: { beginAtZero: true, grid: { color: "#ecf3f8" }, ticks: { color: "#6d7277", callback: (v) => `S/ ${v}` } },
    },
  };
  return (
    <div className="h-64">
      <Bar
        options={options}
        data={{
          labels,
          datasets: [{ label: "Ventas", data, backgroundColor: "#c14d87", borderRadius: 8, maxBarThickness: 44 }],
        }}
      />
    </div>
  );
}
