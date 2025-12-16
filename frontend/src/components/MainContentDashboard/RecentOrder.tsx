/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Table, Tag, Input, Tooltip } from "antd";
import { fetchOverview } from "../../apis/dashboardApis";
import type { ColumnsType } from "antd/es/table";

export interface Order {
  id: number;
  order_id: string;
  customer: string;
  product: string;
  quantity: number;
  total: number;
  status: string;
  image: string;
}

const statusLabel: Record<string, string> = {
  Shipping: "Đang giao",
  Completed: "Hoàn tất",
  Pending: "Chờ xử lý",
  Processing: "Đang xử lý",
  Cancelled: "Đã hủy",
};
const API_IMG = import.meta.env.VITE_API_URL;
const OrdersTable: React.FC = () => {
  const [tableData, setTableData] = useState<Order[]>([]);
  const [searchText, setSearchText] = useState<string>("");

  useEffect(() => {
    fetchOverview().then((res) => {
      const mapped = res.recentOrders.map((item: any, index: number) => {
        const firstItem = item.OrderItems[0];

        return {
          id: index + 1,
          order_id: item.order_code,
          customer: item.User?.name || "Unknown",
          product: firstItem?.Product?.name || "N/A",
          quantity: firstItem?.quantity || 0,
          total: Number(item.total_amount),
          status: item.status.charAt(0).toUpperCase() + item.status.slice(1), // format status
          image: firstItem?.Product?.image || "/no-image.png",
        };
      });

      setTableData(mapped);
    });
  }, []);

  const columns: ColumnsType<Order> = [
    {
      title: "ID",
      dataIndex: "id",
      sorter: (a, b) => a.id - b.id,
      width: 70,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "order_id",
      sorter: (a, b) => a.order_id.localeCompare(b.order_id),
      render: (text: string) => (
        <Tooltip title={text}>
          {text.length > 12 ? text.slice(0, 12) + "..." : text}
        </Tooltip>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      sorter: (a, b) => a.customer.localeCompare(b.customer),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "product",
      sorter: (a, b) => a.product.localeCompare(b.product),
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <img
            src={`${API_IMG}/public/product/${record.image}`}
            alt={record.product}
            className="w-8 h-8 rounded-lg object-cover "
          />
          <span>{record.product}</span>
        </div>
      ),
    },
    {
      title: "SL",
      dataIndex: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      sorter: (a, b) => a.total - b.total,
      render: (value) => `${value.toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Status",
      dataIndex: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status: string) => {
        let color: string = "";

        switch (status) {
          case "Shipping":
            color = "blue";
            break;
          case "Completed":
            color = "green";
            break;
          case "Pending":
            color = "yellow";
            break;
          case "Processing":
            color = "orange";
            break;
          case "Cancelled":
            color = "red";
            break;
          default:
            color = "default";
        }

        return <Tag color={color}>{statusLabel[status]}</Tag>;
      },
    },
  ];

  // xóa dấu
  const removeVietnameseTones = (str: any) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  const filteredData = tableData.filter((item) => {
    const name = removeVietnameseTones(item.customer.toLowerCase());
    const category = removeVietnameseTones(item.product.toLowerCase());
    const search = removeVietnameseTones(searchText.toLowerCase().trim());

    return name.includes(search) || category.includes(search);
  });

  return (
    <div className="bg-gray-100 rounded-xl p-4">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">Đơn hàng gần đây</h2>
        <Input.Search
          placeholder="Search product, customer, etc..."
          style={{ width: 300, marginBottom: 20 }}
          onChange={(e) => setSearchText(e.target.value)}
          size="large"
        />
      </div>

      <Table
        columns={columns}
        rowKey="order_id"
        dataSource={filteredData}
        bordered
        pagination={false}
      />
    </div>
  );
};

export default OrdersTable;
