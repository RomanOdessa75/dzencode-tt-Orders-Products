import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Product {
  type?: string;
}

interface Props {
  products: Product[];
  typeStats?: Record<string, number>;
}

const ProductTypeChart: React.FC<Props> = ({ products, typeStats }) => {
  const data = typeStats
    ? Object.entries(typeStats).map(([type, count]) => ({ type, count }))
    : Object.entries(
        products.reduce((acc: Record<string, number>, p) => {
          if (p.type) acc[p.type] = (acc[p.type] || 0) + 1;
          return acc;
        }, {})
      ).map(([type, count]) => ({ type, count }));

  if (data.length === 0) return <div>Нет данных для графика</div>;

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 16, right: 16, left: 16, bottom: 16 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#198754" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductTypeChart;
