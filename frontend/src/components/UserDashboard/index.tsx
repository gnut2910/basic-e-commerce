/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../redux/store";
import { deleteUser, getAllUsers } from "../../redux/features/auth/authSlice";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Dropdown, Popconfirm, Table, Tag, Tooltip } from "antd";
import type { TableProps } from "antd";

import { ToastContainer } from "react-toastify";
import CreateUserModal from "./CreateModalUser";
import EditUserModal from "./EditModalUser";

// ===================== TYPES =====================
interface IUserRecord {
  key: number;
  username: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  status: string;
  birthday: string;
  avatar: string | null;
  raw?: any;
}
const API_IMG = import.meta.env.VITE_API_URL;

// ===================== COMPONENT =====================
const ContentUsers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users } = useSelector((state: RootState) => state.auth);
  const [tableData, setTableData] = useState<IUserRecord[]>([]);
  const [editingUser, setEditingUser] = useState<IUserRecord | null>(null);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const formatted = users.map((u) => ({
      key: u.user_id,
      username: u.username,
      email: u.email,
      address: u.Profile?.address || "",
      role: u.role,
      phone: u.Profile?.phone || "",
      birthday: u.Profile?.birthday
        ? dayjs(u.Profile.birthday).format("DD-MM-YYYY")
        : "",
      status: u.status,
      avatar: u.Profile?.avatar || null,
      raw: u,
    }));
    setTableData(formatted);
  }, [users]);

  // ===================== ACTION HANDLERS =====================
  const handleEdit = (record: IUserRecord) => {
    setEditingUser(record);

    setEditModalVisible(true);
  };

  const filteredData = tableData.filter(
    (user) =>
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  // delete action
  const handleDelete = async (record: IUserRecord) => {
    await dispatch(deleteUser(record.key)).unwrap();
    await dispatch(getAllUsers());
  };

  // ===================== TABLE COLUMNS =====================

  const columns: TableProps<IUserRecord>["columns"] = [
    {
      title: "Tên",
      dataIndex: "username",
      key: "username",
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          {record.avatar ? (
            <img
              src={`${API_IMG}/public/avatar/${record.avatar}`}
              alt={record.username}
              className="w-10 h-10 rounded-full object-cover "
            />
          ) : (
            <div className="w-10 h-10 rounded-full overflow-hidden border bg-gray-200 flex items-center justify-center text-gray-500">
              <UserOutlined className="text-2xl" />
            </div>
          )}
          <span>{record.username}</span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render: (text: string) => {
        if (!text) return "-"; // nếu rỗng thì hiển thị "-"
        return (
          <Tooltip title={text}>
            {text.length > 20 ? text.slice(0, 20) + "..." : text}
          </Tooltip>
        );
      },
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (text: string) => text || "-",
    },
    {
      title: "Ngày sinh",
      dataIndex: "birthday",
      key: "birthday",
      render: (text: string) => text || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 10,
      render: (status: string) => {
        let color = "";
        if (status.toLowerCase() === "active") color = "green";
        else if (status.toLowerCase() === "banned") color = "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "",
      key: "actions",
      width: 10,
      render: (_, record) => (
        <div className="text-right">
          <Dropdown
            menu={{
              items: [
                {
                  key: "edit",
                  label: "Chỉnh sửa",
                  icon: <EditOutlined />,
                  onClick: () => handleEdit(record),
                },
                {
                  key: "delete",
                  label: (
                    <Popconfirm
                      title="Bạn có chắc muốn xoá user này không?"
                      okText="Yes"
                      cancelText="No"
                      onConfirm={() => handleDelete(record)}
                    >
                      <span className="flex items-center text-red-500">
                        <DeleteOutlined className="mr-1" /> Xoá
                      </span>
                    </Popconfirm>
                  ),
                },
              ],
            }}
            trigger={["click"]}
          >
            <MoreOutlined className="cursor-pointer text-lg" />
          </Dropdown>
        </div>
      ),
    },
  ];

  // ===================== FETCH =====================
  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  // ===================== RENDER =====================
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold ">Users</h1>
      <div className="bg-white shadow p-5 border border-gray-100 flex items-center justify-between">
        <div className="flex items-center max-w-md w-full px-4 py-3 border border-gray-300 rounded-xl space-x-3">
          <i className="ri-search-line text-xl text-gray-500"></i>
          <input
            type="text"
            placeholder="Tìm người dùng, email..."
            className="w-full outline-none text-gray-700"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <button
          onClick={() => setCreateModalVisible(true)}
          className="px-4 py-3 bg-[#FF9F45] hover:bg-[#2b2b2b] text-white rounded-xl cursor-pointer"
        >
          New user
        </button>
      </div>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="key"
        className="border-gray-200 border rounded-md"
        pagination={{ pageSize: 5 }}
      />
      <CreateUserModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
      />
      <EditUserModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        user={editingUser}
      />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
};

export default ContentUsers;
