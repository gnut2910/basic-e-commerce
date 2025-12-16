import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface ChartData {
  date: string;
  orders: number;
  revenue: number;
}

const formatShort = (v: number) =>
  Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v);

const VerticalBarChart: React.FC<{ data: ChartData[] }> = ({ data }) => (
  <div className="rounded-xl bg-gray-100 p-5 shadow-md border border-gray-200">
    <h2 className="text-lg font-semibold mb-4">Phân tích doanh thu</h2>

    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        barGap={12}
        barCategoryGap="20%"
        margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

        {/* Trục X (ngày) */}
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => {
            const d = new Date(value);
            return `${String(d.getDate()).padStart(2, "0")}/${String(
              d.getMonth() + 1
            ).padStart(2, "0")}`;
          }}
          tick={{ fill: "#6B7280", fontSize: 12 }}
        />

        {/* Trục Y cho orders (trục trái) */}
        <YAxis
          yAxisId="left"
          tickFormatter={(value) => formatShort(value)}
          tick={{ fill: "#6B7280", fontSize: 12 }}
        />

        {/* Trục Y cho revenue (trục phải) */}
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => formatShort(value)}
          tick={{ fill: "#6B7280", fontSize: 12 }}
        />

        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === "revenue") {
              return [`${value.toLocaleString("vi-VN")} đ`, "Doanh thu"];
            }
            return [value, "Số đơn"];
          }}
          labelFormatter={(label) => `Ngày: ${label}`}
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #eee",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          // cursor={{ fill: "transparent" }}
        />

        <Legend
          wrapperStyle={{ fontSize: 12 }}
          formatter={(value) => {
            switch (value) {
              case "orders":
                return "số đơn";
              case "revenue":
                return "doanh thu";
              default:
                return value;
            }
          }}
        />
        <Bar
          yAxisId="left"
          dataKey="orders"
          fill="#FFD8A9"
          radius={[6, 6, 0, 0]}
        >
          <LabelList
            dataKey="orders"
            position="top" // label trên đỉnh cột
            formatter={(value) =>
              value !== undefined ? Number(value).toLocaleString("vi-VN") : ""
            }
            fill="#333"
            fontSize={12}
          />
        </Bar>

        <Bar
          yAxisId="right"
          dataKey="revenue"
          fill="#FF9F45"
          radius={[6, 6, 0, 0]}
        >
          <LabelList
            dataKey="revenue"
            position="top"
            formatter={(value) =>
              value !== undefined
                ? `${Number(value).toLocaleString("vi-VN")}đ`
                : ""
            }
            fill="#333"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default VerticalBarChart;
