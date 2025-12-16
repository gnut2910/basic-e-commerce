/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import React, { useEffect, useMemo, useState } from "react";
import { Tabs, Table, Tag, Button, Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import {
  fetchMyOrders,
  type IOrder,
} from "../../redux/features/order/orderSlice";
import {
  fetchOrderItemsByOrderId,
  type IOrderItem,
} from "../../redux/features/order_item/order_itemSlice";
import {
  actFetchProducts,
  type IProduct,
} from "../../redux/features/product/productSlice";
import { updateOrder } from "../../redux/features/order/orderSlice";
import PageBreadcrumb from "../../components/PageBreadCrumb";

interface IOrderItemDetailed extends IOrderItem {
  product?: IProduct;
}

const statusColor: Record<string, string> = {
  pending: "gold",
  processing: "orange",
  shipping: "blue",
  completed: "green",
  cancelled: "red",
};

const statusLabel: Record<string, string> = {
  pending: "Chờ thanh toán", // Chỉ dùng cho đơn ZaloPay chưa thanh toán
  processing: "Chờ đóng gói", // Đơn đã thanh toán ZaloPay hoặc đơn COD vừa tạo
  shipping: "Đang vận chuyển",
  completed: "Đã hoàn thành",
  cancelled: "Đã hủy",
};

const formatCurrency = (n?: number) => {
  if (typeof n !== "number") return "0₫";
  return n.toLocaleString("vi-VN") + "₫";
};

const formatDateTime = (iso?: string) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("vi-VN");
  } catch {
    return iso;
  }
};

const API_BASE: string | undefined = import.meta.env.VITE_API_URL;
const buildImageUrl = (img?: string | null) => {
  if (!img) return "/placeholder.png";
  if (img.startsWith("http")) return img;
  const normalized = img.includes("/") ? img : `product/${img}`;
  return `${API_BASE}/public/${normalized}`;
};

const TrackOrderPage: React.FC = () => {
  const [tab, setTab] = useState("all");
  const dispatch = useDispatch<AppDispatch>();
  const { list: orders, loading } = useSelector(
    (state: RootState) => state.order
  );
  const orderItemsByOrder = useSelector(
    (state: RootState) => state.orderItems.byOrder
  );
  const { products } = useSelector((state: RootState) => state.product);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  useEffect(() => {
    dispatch(fetchMyOrders());
    if (products.length === 0) {
      dispatch(actFetchProducts());
    }
  }, [dispatch, products.length]);

  useEffect(() => {
    orders.forEach((order) => {
      if (!orderItemsByOrder[order.order_id]) {
        dispatch(fetchOrderItemsByOrderId(order.order_id));
      }
    });
  }, [orders, dispatch, orderItemsByOrder]);

  const getOrderTotal = (orderId: number) => {
    const items = orderItemsByOrder[orderId] || [];
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const filterOrders = useMemo(() => {
    let sortedOrders = [...orders].sort(
      (a, b) =>
        new Date(b.created_at || "").getTime() -
        new Date(a.created_at || "").getTime()
    );
    if (tab === "all") return sortedOrders;
    // Nếu tab là 'pending', chỉ show đơn ZaloPay chưa thanh toán
    if (tab === "pending")
      return sortedOrders.filter(
        (o) => o.status === "pending" && o.payment_method === "zalopay"
      );
    // Nếu tab là 'processing', show đơn đã thanh toán ZaloPay và đơn COD vừa tạo (status processing)
    if (tab === "processing")
      return sortedOrders.filter((o) => o.status === "processing");
    return sortedOrders.filter((o) => o.status === tab);
  }, [orders, tab]);

  const handleViewDetails = (order: IOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const detailedItems = useMemo((): IOrderItemDetailed[] => {
    if (!selectedOrder || !orderItemsByOrder[selectedOrder.order_id]) {
      return [];
    }
    const items = orderItemsByOrder[selectedOrder.order_id];
    return items.map((item) => {
      const product = products.find((p) => p.product_id === item.product_id);
      return {
        ...item,
        product: product,
      };
    });
  }, [selectedOrder, orderItemsByOrder, products]);

  const modalTotal = useMemo(() => {
    if (!selectedOrder) return 0;
    return getOrderTotal(selectedOrder.order_id);
  }, [selectedOrder, orderItemsByOrder]);

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "order_code",
      key: "order_code",
      render: (order_code: string) => (
        <span className="font-semibold">{order_code}</span>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (v: string) => formatDateTime(v),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s: string) => (
        <Tag color={statusColor[s] || "default"}>{statusLabel[s] || s}</Tag>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (_: any, record: IOrder) => (
        <span className="font-bold text-[#8b2e0f]">
          {formatCurrency(getOrderTotal(record.order_id))}
        </span>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_method",
      key: "payment_method",
      render: (v: string) =>
        v === "zalopay" ? "ZaloPay" : "Thanh toán khi nhận hàng",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "",
      key: "action",
      render: (_: any, record: IOrder) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Button
            type="primary"
            style={{
              backgroundColor: "#8b2e0f",
              borderColor: "#8b2e0f",
              borderRadius: 0,
            }}
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            Xem chi tiết
          </Button>
          {/* Thêm nút Xóa cho đơn COD ở trạng thái processing */}
          {record.payment_method === "cash" &&
            record.status === "processing" && (
              <Button
                danger
                size="small"
                style={{ borderRadius: 0 }}
                onClick={() => handleDeleteOrder(record)}
              >
                Hủy đơn
              </Button>
            )}
        </div>
      ),
    },
  ];
  // Mở modal hủy đơn
  const handleDeleteOrder = (order: IOrder) => {
    setSelectedOrder(order);
    setIsCancelModalOpen(true);
  };
  // Khi xác nhận hủy đơn, gọi API updateOrder để sửa status thành 'cancelled'
  const handleConfirmCancelOrder = async () => {
    if (selectedOrder) {
      try {
        await dispatch(
          updateOrder({
            id: selectedOrder.order_id,
            data: { status: "cancelled" },
          })
        );
        setIsCancelModalOpen(false);
        setSelectedOrder(null);
        dispatch(fetchMyOrders());
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Đơn hàng" />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs activeKey={tab} onChange={setTab} className="mb-4">
          <Tabs.TabPane tab="Tất cả" key="all" />
          <Tabs.TabPane tab="Chờ thanh toán" key="pending" />
          <Tabs.TabPane tab="Đang đóng gói" key="processing" />
          <Tabs.TabPane tab="Đang vận chuyển" key="shipping" />
          <Tabs.TabPane tab="Đã hoàn thành" key="completed" />
          <Tabs.TabPane tab="Đã hủy" key="cancelled" />
        </Tabs>
        <Table
          dataSource={filterOrders}
          columns={columns}
          rowKey="order_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
          }}
        />
        <Modal
          title={
            <span className="font-semibold text-lg">
              Chi tiết đơn hàng: {selectedOrder?.order_code}
            </span>
          }
          open={isModalOpen}
          onCancel={handleCloseModal}
          footer={
            <Button
              key="close"
              onClick={handleCloseModal}
              style={{ borderRadius: 0 }}
            >
              Đóng
            </Button>
          }
          width={800}
          centered
        >
          {selectedOrder && (
            <div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6">
                <div>
                  <strong>Ngày đặt:</strong>{" "}
                  {formatDateTime(selectedOrder.created_at)}
                </div>
                <div>
                  <strong>Trạng thái:</strong>{" "}
                  <Tag color={statusColor[selectedOrder.status] || "default"}>
                    {statusLabel[selectedOrder.status] || selectedOrder.status}
                  </Tag>
                </div>
                <div className="col-span-2">
                  <strong>Địa chỉ giao hàng:</strong> {selectedOrder.address}
                </div>
                <div>
                  <strong>Thanh toán:</strong>{" "}
                  {selectedOrder.payment_method === "zalopay"
                    ? "ZaloPay"
                    : "Tiền mặt (COD)"}
                </div>
              </div>
              <h3 className="text-md font-semibold mb-3 border-t pt-4">
                Danh sách sản phẩm
              </h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {detailedItems.map((item) => (
                  <div
                    key={item.order_item_id}
                    className="flex items-center gap-4"
                  >
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-100 border rounded-md flex items-center justify-center">
                      <img
                        src={buildImageUrl(item.product?.image)}
                        alt={item.product?.name || "Sản phẩm"}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold line-clamp-2">
                        {item.product?.name || "Sản phẩm không tìm thấy"}
                      </div>
                      <div className="text-sm text-gray-600">
                        Số lượng: {item.quantity}
                      </div>
                    </div>
                    <div className="font-semibold text-gray-800 text-right ml-4">
                      <div>{formatCurrency(item.price * item.quantity)}</div>
                      <div className="text-sm font-normal text-gray-500">
                        (
                        {formatCurrency(
                          item.quantity > 0
                            ? (item.price * item.quantity) / item.quantity
                            : 0
                        )}
                        /sp)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-right mt-6 border-t pt-4">
                <h3 className="text-xl font-bold text-[#8b2e0f]">
                  Tổng cộng: {formatCurrency(modalTotal)}
                </h3>
              </div>
            </div>
          )}
        </Modal>
        <Modal
          title={
            <span className="font-semibold text-lg">Xác nhận hủy đơn hàng</span>
          }
          open={isCancelModalOpen}
          onCancel={() => setIsCancelModalOpen(false)}
          footer={[
            <Button
              key="cancel"
              onClick={() => setIsCancelModalOpen(false)}
              style={{ borderRadius: 0 }}
            >
              Hủy
            </Button>,
            <Button
              key="ok"
              danger
              style={{ borderRadius: 0 }}
              onClick={handleConfirmCancelOrder}
            >
              Xác nhận
            </Button>,
          ]}
          width={400}
          centered
          className="rounded-none"
          styles={{ content: { borderRadius: 0 } }}
        >
          <p>Bạn có chắc chắn muốn hủy đơn hàng này không?</p>
        </Modal>
      </main>
    </>
  );
};

export default TrackOrderPage;
