/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../redux/store";
import {
  fetchStores,
  sendMailToSeller,
} from "../../redux/features/store/storeSlice";
import { Badge, Dropdown, Modal, Table, Tabs, Tag, Tooltip } from "antd";
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  MoreOutlined,
} from "@ant-design/icons";

const statusColor: Record<string, string> = {
  processing: "yellow",
  approved: "green",
  rejected: "red",
};

const statusLabel: Record<string, string> = {
  processing: "Chờ xử lí",
  approved: "Đã chấp thuận",
  rejected: "Đã từ chối",
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

const ContentStores: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [tab, setTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const { stores, loading } = useSelector((state: RootState) => state.store);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [openRejectedModal, setOpenRejectedModal] = useState(false);
  useEffect(() => {
    //chạy lần đầu
    dispatch(fetchStores());
    //
    const intervalId = setInterval(() => {
      dispatch(fetchStores());
    }, 4000);
    // cleanup khi unmount
    return () => clearInterval(intervalId);
  }, [dispatch]);

  const filterStores = useMemo(() => {
    const sortedStores = [...stores].sort(
      (a, b) =>
        new Date(b.created_at || "").getTime() -
        new Date(a.created_at || "").getTime()
    );
    if (tab === "all") return sortedStores;
    if (tab === "processing")
      return sortedStores.filter((s) => s.status === "processing");
    if (tab === "approved")
      return sortedStores.filter((s) => s.status === "approved");
    if (tab === "rejected")
      return sortedStores.filter((s) => s.status === "rejected");
    return sortedStores.filter((s) => s.status === tab);
  }, [tab, stores]);
  const columns = [
    {
      title: "Cửa hàng",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Tên người bán",
      dataIndex: "seller",
      key: "seller",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      // render: (text: string) => (
      //   <Tooltip title={text}>
      //     {text.length > 12 ? text.slice(0, 12) + "..." : text}
      //   </Tooltip>
      // ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s: string) => <Tag color={statusColor[s]}>{statusLabel[s]}</Tag>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (d: string) => (
        <Tooltip title={formatDateTime(d)}>
          {formatDateTime(d).slice(9, 19)}
        </Tooltip>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 10,
      render: (record: any) => {
        //tạo mảng rỗng để xử lí
        const menuItems = [];

        // nếu mà là processing thì hiện 2 nút approved & rejected
        if (record.status === "processing") {
          menuItems.push(
            {
              key: "approve",
              label: "Chấp thuận",
              icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
              onClick: () => openApprove(record),
            },
            {
              key: "reject",
              label: (
                <div className="flex items-center text-red-500">
                  <CloseCircleTwoTone twoToneColor="#FF0000" className="mr-2" />
                  Từ chối
                </div>
              ),
              onClick: () => openRejected(record),
            }
          );
        }

        //nếu status = approved thì hiện nút rejected
        if (record.status === "approved") {
          menuItems.push({
            key: "reject",
            label: (
              <div className="flex items-center text-red-500">
                <CloseCircleTwoTone twoToneColor="#FF0000" className="mr-2" />
                Từ chối
              </div>
            ),
            onClick: () => openRejected(record),
          });
        }

        //nếu status = rejected thì hiện nút approved
        if (record.status === "rejected") {
          menuItems.push({
            key: "approve",
            label: "Chấp thuận",
            icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
            onClick: () => openApprove(record),
          });
        }

        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <MoreOutlined className="cursor-pointer text-lg" />
          </Dropdown>
        );
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

  const filteredData = filterStores
    .map((store) => ({
      ...store,
      seller: store?.User?.username || "Không có seller",
    }))
    .filter((store) => {
      const name = removeVietnameseTones(store.name.toLowerCase());
      const seller = removeVietnameseTones(store.seller.toLowerCase());
      const search = removeVietnameseTones(searchText.toLowerCase().trim());

      return name.includes(search) || seller.includes(search);
    });
  //đếm số store chờ xử lí
  const processingCount = stores.filter(
    (s) => s.status === "processing"
  ).length;
  //đếm số store đã duyệt
  const approvedCount = stores.filter((s) => s.status === "approved").length;
  //đếm số store đã từ chối
  const rejectedCount = stores.filter((s) => s.status === "rejected").length;

  //đếm tất cả store
  const allStatusCount = stores.filter((s) => s.status).length;

  const handleRejected = async (store: any) => {
    setOpenRejectedModal(false);
    await dispatch(
      sendMailToSeller({ id: store.store_id, status: "rejected" })
    );

    await dispatch(fetchStores());
  };

  const handleApproved = async (store: any) => {
    setOpenApproveModal(false);
    await dispatch(
      sendMailToSeller({ id: store.store_id, status: "approved" })
    );

    await dispatch(fetchStores());
  };

  const openApprove = (record: any) => {
    setSelectedStore(record);
    setOpenApproveModal(true);
  };
  const openRejected = (record: any) => {
    setSelectedStore(record);
    setOpenRejectedModal(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold ">Stores</h1>
      <div className="bg-white shadow p-5 border border-gray-100 flex items-center justify-between">
        <div className="flex items-center max-w-md w-full px-4 py-3 border border-gray-300 rounded-xl space-x-3">
          <i className="ri-search-line text-xl text-gray-500"></i>
          <input
            type="text"
            placeholder="Tìm cửa hàng, tên người bán..."
            className="w-full outline-none text-gray-700"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>
      <Tabs activeKey={tab} onChange={setTab}>
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
        <Tabs.TabPane
          tab={
            <span>
              Đã chấp thuận
              {approvedCount > 0 && (
                <Badge
                  count={approvedCount}
                  style={{ backgroundColor: "green", marginLeft: 6 }}
                />
              )}
            </span>
          }
          key="approved"
        />
        <Tabs.TabPane
          tab={
            <span>
              Đã từ chối
              {rejectedCount > 0 && (
                <Badge
                  count={rejectedCount}
                  style={{ backgroundColor: "red", marginLeft: 6 }}
                />
              )}
            </span>
          }
          key="rejected"
        />
      </Tabs>
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="store_id"
        className="border-gray-200 border rounded-md"
      />
      <Modal
        open={openApproveModal}
        title="Xét duyệt cửa hàng"
        okText="Duyệt"
        cancelText="Hủy"
        onCancel={() => setOpenApproveModal(false)}
        onOk={() => handleApproved(selectedStore)}
        okButtonProps={{ style: { background: "#FF9F45", color: "#fff" } }}
        cancelButtonProps={{ style: { color: "red", borderColor: "red" } }}
        confirmLoading={loading}
      >
        <div className="space-y-4 mt-4 ">
          <p>
            <span className="font-medium mr-2">Tên cửa hàng:</span>
            {selectedStore?.name}
          </p>
          <p>
            <span className="font-medium mr-2">Mô tả:</span>
            {selectedStore?.description}
          </p>
          <p>
            <span className="font-medium mr-2">Người bán:</span>
            {selectedStore?.User?.username}
          </p>
          <p className="text-gray-300 mt-2">Bạn có chắc muốn phê duyệt?</p>
        </div>
      </Modal>
      <Modal
        open={openRejectedModal}
        title="Xét duyệt cửa hàng"
        okText="Từ chối"
        cancelText="Hủy"
        onCancel={() => setOpenRejectedModal(false)}
        onOk={() => handleRejected(selectedStore)}
        okButtonProps={{ style: { background: "#FF9F45", color: "#fff" } }}
        cancelButtonProps={{ style: { color: "red", borderColor: "red" } }}
        confirmLoading={loading}
      >
        <div className="space-y-4 mt-4 ">
          <p>
            <span className="font-medium mr-2">Tên cửa hàng:</span>
            {selectedStore?.name}
          </p>
          <p>
            <span className="font-medium mr-2">Mô tả:</span>
            {selectedStore?.description}
          </p>
          <p>
            <span className="font-medium mr-2">Người bán:</span>
            {selectedStore?.User?.username}
          </p>
          <p className="text-gray-300 mt-2">Bạn có chắc muốn từ chối?</p>
        </div>
      </Modal>
    </div>
  );
};
export default ContentStores;
