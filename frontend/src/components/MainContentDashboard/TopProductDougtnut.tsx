/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { fetchOverview } from "../../apis/dashboardApis";
import { Modal } from "antd";

type ProductItem = {
  name: string;
  value: number;
  color: string;
};

const TopProductDoughnut = () => {
  const [data, setData] = useState<ProductItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchOverview().then((res: any) => {
      const colors = ["#FF8517", "#FF9F45", "#FFBD73", "#FFD8A9", "#C97B2C"];
      const formatted = res.topProducts.map((p: any, i: number) => ({
        name: p.Product.name,
        value: Number(p.sold),
        color: colors[i % colors.length],
      }));

      setData(formatted);
    });
  }, []);

  const total = data.reduce((sum, i) => sum + i.value, 0);

  return (
    <div className="bg-gray-100 p-6 rounded-xl shadow-sm w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Sản phẩm hàng đầu</h2>
        <button
          onClick={() => setOpen(true)}
          className="text-sm text-gray-500 hover:text-black cursor-pointer"
        >
          Xem tất cả
        </button>
      </div>

      {/* Chart */}
      <div className="w-full h-60 flex items-center justify-center relative">
        <ResponsiveContainer width="80%" height="100%">
          <PieChart>
            <Pie
              data={data.slice(0, 4)}
              dataKey="value"
              innerRadius={75}
              outerRadius={100}
              stroke="none"
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              cornerRadius={3}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Text Center */}
        <div className="absolute text-center">
          <p className="text-sm text-gray-400">Tổng đã bán</p>
          <p className="text-2xl font-medium">{total.toLocaleString()}</p>
        </div>
      </div>

      {/* LIST BELOW */}
      <div className="mt-6 space-y-3">
        {data.slice(0, 4).map((item, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700">{item.name}</span>
            </div>
            <span className="font-medium">
              {item.value.toLocaleString()}
              <span className="text-gray-500"> đã bán</span>
            </span>
          </div>
        ))}
      </div>

      {/* ---- modal xem tất cả ---- */}
      <Modal
        title="Top Products"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        centered
        className="custom-modal"
      >
        {/* CONTENT */}
        <div className="space-y-4 py-3">
          {data.map((item, i) => (
            <div
              key={i}
              className="flex justify-between items-center border rounded-lg p-3 hover:shadow-md transition-all duration-150"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-sm shadow"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-gray-800">{item.name}</span>
              </div>

              <span className="text-gray-700 font-semibold">
                {item.value.toLocaleString()}
                <span className="text-gray-400"> đã bán</span>
              </span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default TopProductDoughnut;
