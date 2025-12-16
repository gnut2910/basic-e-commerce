/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import CardMetric from "../MainContentDashboard/CardMetric.tsx";
// import RevenueChart from "../MainContentDashboard/RevenueChart.tsx";

import { fetchOverview } from "../../apis/dashboardApis.ts";
// import TopProductChart from "./TopProductChart.tsx";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";

import OrdersTable from "./RecentOrder.tsx";
import TopProductDoughnut from "./TopProductDougtnut.tsx";
import MonthlyTarget from "./MonthlyTarget.tsx";
import VerticalBarChart from "./RevenueChart.tsx";
import { ConfigProvider } from "antd";
import viVN from "antd/es/locale/vi_VN";

interface ChartData {
  date: string;
  orders: number;
  revenue: number;
}
const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  useEffect(() => {
    fetchOverview().then((data: any) => {
      // có thể map lại nếu cần
      setOverview(data);

      // Merge orders và revenue cho chart
      const { ordersCountByDate = [], revenueByDate = [] } = data;
      const dataMap: Record<string, ChartData> = {};

      ordersCountByDate.forEach((item: any) => {
        dataMap[item.date] = {
          date: item.date,
          orders: Number(item.order_count),
          revenue: 0,
        };
      });

      revenueByDate.forEach((item: any) => {
        if (dataMap[item.date]) dataMap[item.date].revenue = Number(item.total);
        else
          dataMap[item.date] = {
            date: item.date,
            orders: 0,
            revenue: Number(item.total),
          };
      });

      setChartData(
        Object.values(dataMap).sort((a, b) => a.date.localeCompare(b.date))
      );
    });
  }, []);

  if (!overview) return <div>Loading...</div>;

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <CardMetric
          title="Tổng doanh thu"
          value={`${
            overview?.revenueThisMonth
              ? overview.revenueThisMonth.toLocaleString("vi-VN")
              : "0"
          } đ`}
          icon={<DollarOutlined />}
          bgIcon="bg-[#FF9F45]"
          className="bg-orange-50"
          percent={`${overview.revenueChangeWeek}`}
        />
        <CardMetric
          title="Tổng đơn hàng"
          value={overview.orders}
          bgIcon="bg-white"
          icon={<ShoppingCartOutlined />}
          className="bg-gray-100"
          percent={`${overview.orderChange}`}
        />
        <CardMetric
          title="Tổng người dùng"
          value={overview.users}
          bgIcon="bg-white"
          className="bg-gray-100"
          icon={<UserOutlined />}
          percent={`${overview.newUsersChange}`}
        />
        {/* <CardMetric
          title="Sản phẩm tồn kho thấp"
          value={overview.lowStock.length}
        /> */}
      </div>
      <div className="mb-8 grid grid-cols-1">
        <VerticalBarChart data={chartData} />
      </div>
      <div className="grid grid-cols-2 mb-8 gap-5">
        <TopProductDoughnut />
        <MonthlyTarget growth={overview.growthMonth} target={2000000000} />
      </div>
      <ConfigProvider locale={viVN}>
        <OrdersTable />
      </ConfigProvider>
    </>
  );
};

export default Dashboard;
