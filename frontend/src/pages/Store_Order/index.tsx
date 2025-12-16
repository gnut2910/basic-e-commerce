/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { Tabs, Table, Tag, Button, Modal, Badge } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../redux/store";
import {
  fetchAllStoreOrders,
  fetchAllStoreOrderItems,
} from "../../redux/features/store_order/store_orderSlice";
import { actFetchProducts } from "../../redux/features/product/productSlice";
import { OrderItemApi } from "../../apis/order_itemApis";
import { StoreOrderApi } from "../../apis/store_orderApis";
import { fetchStoreById } from "../../redux/features/store/storeSlice";

const statusColor: Record<string, string> = {
  processing: "orange",
  shipping: "blue",
  approved: "green",
  cancelled: "red",
};
const statusLabel: Record<string, string> = {
  processing: "Chờ xử lý",
  shipping: "Đang giao hàng",
  approved: "Hoàn thành",
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

const StoreOrderPage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const store = useSelector((state: RootState) => state.store.current);
  const [tab, setTab] = useState("all");
  const { orders, loading, orderItems } = useSelector(
    (state: RootState) => state.storeOrder
  );
  const { products } = useSelector((state: RootState) => state.product);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [detailedItems, setDetailedItems] = useState<any[]>([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmingOrder, setConfirmingOrder] = useState<any | null>(null);

  // Lấy thông tin store khi vào trang
  useEffect(() => {
    if (storeId) {
      dispatch(fetchStoreById(Number(storeId)) as any);
    }
  }, [dispatch, storeId]);

  // Kiểm tra quyền seller
  useEffect(() => {
    if (store && user && store.seller_id !== (user as any).id) {
      navigate("/no-access", { replace: true });
    }
  }, [store, user, navigate]);
  useEffect(() => {
    if (storeId) {
      dispatch(fetchAllStoreOrders(Number(storeId)));
    }
    if (products.length === 0) {
      dispatch(actFetchProducts());
    }
    dispatch(fetchAllStoreOrderItems());
  }, [dispatch, storeId, products.length]);

  const filterOrders = useMemo(() => {
    let sortedOrders = [...(orders || [])].sort(
      (a, b) =>
        new Date(b.created_at || "").getTime() -
        new Date(a.created_at || "").getTime()
    );
    if (tab === "all") return sortedOrders;
    return sortedOrders.filter((o) => o.status === tab);
  }, [orders, tab]);

  const handleViewDetails = async (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    // Lấy danh sách order_item_id từ mapping orderItems
    const items = orderItems.filter(
      (item: any) => item.store_order_id === order.store_order_id
    );
    // Gọi API lấy chi tiết từng order_item
    const token = localStorage.getItem("accessToken") || "";
    const promises = items.map((item: any) =>
      OrderItemApi.getById(item.order_item_id, token)
    );
    const results = await Promise.all(promises);
    // Map sang sản phẩm
    const detailed = results.map((item: any) => {
      const product = products.find(
        (p: any) => p.product_id === item.product_id
      );
      return { ...item, product };
    });
    setDetailedItems(detailed);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setDetailedItems([]);
  };
  const handleOpenConfirmModal = (order: any) => {
    setConfirmingOrder(order);
    setConfirmModalOpen(true);
  };
  const handleCloseConfirmModal = () => {
    setConfirmModalOpen(false);
    setConfirmingOrder(null);
  };
  const handleConfirmShipping = async () => {
    if (!confirmingOrder) return;
    try {
      await StoreOrderApi.updateStoreOrderStatus(
        confirmingOrder.store_order_id,
        "shipping"
      );
      setConfirmModalOpen(false);
      setConfirmingOrder(null);
      // Reload lại danh sách đơn hàng
      if (storeId) dispatch(fetchAllStoreOrders(Number(storeId)));
    } catch (err) {
      alert("Cập nhật trạng thái thất bại!");
    }
  };
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
      render: (_: any, record: any) => (
        <Tag color={statusColor[record.status] || "default"}>
          {statusLabel[record.status] || record.status}
        </Tag>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "subtotal",
      key: "subtotal",
      render: (_: any, record: any) => (
        <span className="font-bold text-[#8b2e0f]">
          {formatCurrency(Number(record.subtotal))}
        </span>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_method",
      key: "payment_method",
      render: (v: string) =>
        v === "zalopay" ? "Đã thanh toán" : "Thanh toán khi nhận hàng",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "",
      key: "action",
      render: (_: any, record: any) => (
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
          {record.status === "processing" && (
            <Button
              type="default"
              style={{
                borderRadius: 0,
                borderColor: "#8b2e0f",
                color: "#8b2e0f",
              }}
              size="small"
              onClick={() => handleOpenConfirmModal(record)}
            >
              Xác nhận
            </Button>
          )}
        </div>
      ),
    },
  ];
  //đếm số store chờ xử lí
  const processingCount = orders.filter(
    (s) => s.status === "processing"
  ).length;
  //đếm tất cả store
  const allStatusCount = orders.filter((s) => s.status).length;
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <Tabs activeKey={tab} onChange={setTab} className="mb-4">
        <Tabs.TabPane
          tab={
            <span>
              Tất cả
              {allStatusCount > 0 && (
                <Badge
                  count={allStatusCount}
                  style={{ backgroundColor: "gray", marginLeft: 6 }}
                />
              )}
            </span>
          }
          key="all"
        />
        <Tabs.TabPane
          tab={
            <span>
              Chờ xử lí
              {processingCount > 0 && (
                <Badge
                  count={processingCount}
                  style={{ backgroundColor: "gold", marginLeft: 6 }}
                />
              )}
            </span>
          }
          key="processing"
        />
        <Tabs.TabPane tab="Đang giao hàng" key="shipping" />
        <Tabs.TabPane tab="Hoàn thành" key="approved" />
        <Tabs.TabPane tab="Đã hủy" key="cancelled" />
      </Tabs>
      <Table
        dataSource={filterOrders}
        columns={columns}
        rowKey="store_order_id"
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
              <div>
                <strong>Phương thức thanh toán:</strong>{" "}
                {selectedOrder.payment_method === "zalopay"
                  ? "Zalopay"
                  : "Tiền mặt (COD)"}
              </div>
              <div className="col-span-2">
                <strong>Địa chỉ giao hàng:</strong> {selectedOrder.address}
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
                Tổng cộng:{" "}
                {formatCurrency(
                  detailedItems.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                  )
                )}
              </h3>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        open={confirmModalOpen}
        onCancel={handleCloseConfirmModal}
        styles={{ content: { borderRadius: 0 } }}
        footer={null}
        centered
        title={
          <span className="font-semibold text-lg">Xác nhận giao hàng</span>
        }
      >
        <div className="mb-4">
          Bạn xác nhận đơn hàng{" "}
          <span className="font-semibold">{confirmingOrder?.order_code}</span>{" "}
          đã sẵn sàng giao cho đơn vị vận chuyển?
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={handleCloseConfirmModal} style={{ borderRadius: 0 }}>
            Huỷ
          </Button>
          <Button
            type="primary"
            style={{
              backgroundColor: "#8b2e0f",
              borderColor: "#8b2e0f",
              borderRadius: 0,
            }}
            onClick={handleConfirmShipping}
          >
            Xác nhận
          </Button>
        </div>
      </Modal>
    </main>
  );
};

export default StoreOrderPage;
