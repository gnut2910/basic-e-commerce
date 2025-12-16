/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteOutlined, EditOutlined, MoreOutlined } from "@ant-design/icons";
import { Dropdown, Popconfirm, Table, Tag, type TableProps } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../redux/store";
import dayjs from "dayjs";
import {
  actFetchProducts,
  deleteProduct,
  type IProduct,
} from "../../redux/features/product/productSlice";
import CreateModalProduct from "./CreateModalProduct";
import { ToastContainer } from "react-toastify";
import EditProductModal from "./EditModalProduct";

export interface IProductRecord {
  key: number;
  name: string;
  category: string;
  image: string;
  description: string;
  price: number;
  stock: number;
  createdAt: string;
  status: string;
  category_id: number;
  store_id: number;
  raw: IProduct;
}
const API_IMG = import.meta.env.VITE_API_URL;
const ContentProducts = () => {
  const { products } = useSelector((state: RootState) => state.product);
  const dispatch = useDispatch<AppDispatch>();
  const [tableData, setTableData] = useState<IProductRecord[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [editingProduct, setEditingProduct] = useState<IProductRecord | null>(
    null
  );

  // const categoryName = [
  //   {
  //     id: 1,
  //     name: "Điện thoại",
  //   },
  //   {
  //     id: 2,
  //     name: "Laptop",
  //   },
  //   {
  //     id: 3,
  //     name: "Tai nghe",
  //   },
  //   {
  //     id: 4,
  //     name: "Phụ kiện",
  //   },
  //   {
  //     id: 5,
  //     name: "Tivi",
  //   },
  //   {
  //     id: 6,
  //     name: "Máy ảnh",
  //   },
  //   {
  //     id: 7,
  //     name: "Đồng hồ",
  //   },
  //   {
  //     id: 8,
  //     name: "Đồ gia dụng",
  //   },
  //   {
  //     id: 9,
  //     name: "Thiết bị thông minh",
  //   },
  //   {
  //     id: 10,
  //     name: "Máy lọc không khí",
  //   },
  // ];

  useEffect(() => {
    if (!Array.isArray(products)) return; // tránh lỗi map
    const formatted = products.map((p) => ({
      // const cate = categoryName.find((c) => c.id === p.category_id);
      key: p.product_id,
      name: p.name,
      category: p.Category?.name ? p.Category?.name : "Không có danh mục ",
      image: p.image || "No img",
      description: p.description || "-",
      price: p.price,
      stock: p.stock,
      status: p.status ?? "Không có trạng thái",
      category_id: Number(p.category_id),
      store_id: Number(p.store_id),
      createdAt: dayjs(p.created_at).format("DD/MM/YYYY"),
      raw: p,
    }));

    setTableData(formatted);
  }, [products]);

  const handleDelete = async (record: IProductRecord) => {
    await dispatch(deleteProduct(record.key)).unwrap();
    await dispatch(actFetchProducts());
  };
  const handleEdit = (record: IProductRecord) => {
    setEditingProduct(record);

    setEditModalVisible(true);
  };

  const columns: TableProps<IProductRecord>["columns"] = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <img
            src={`${API_IMG}/public/product/${record.image}`}
            alt={record.name}
            className="w-10 h-10 rounded-lg object-cover "
          />
          <span>{record.name}</span>
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (_, record) => (
        <div className="flex items-center ">
          <span>{record.category}</span>
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (_, record) => (
        <span>{Number(record.price).toLocaleString("vi-VN")} ₫</span>
      ),
    },
    {
      title: "Kho hàng",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 10,
      render: (status: string) => {
        let color = "";
        if (status.toLowerCase() === "approved") color = "green";
        else if (status.toLowerCase() === "rejected") color = "red";
        else if (status.toLowerCase() === "pending") color = "yellow";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "actions",
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
  //
  // const handleEdit = (record: IProductRecord) => {
  // setEditingProduct(record);
  // setEditModalVisible(true);
  // };
  //
  // xóa dấu
  const removeVietnameseTones = (str: any) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };
  const filteredData = tableData.filter((product) => {
    const name = removeVietnameseTones(product.name.toLowerCase());
    const category = removeVietnameseTones(product.category.toLowerCase());
    const search = removeVietnameseTones(searchText.toLowerCase().trim());

    return name.includes(search) || category.includes(search);
  });

  // Fetch products
  useEffect(() => {
    dispatch(actFetchProducts());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold ">Products</h1>
      <div className="bg-white shadow p-5 border border-gray-100 flex items-center justify-between">
        <div className="flex items-center max-w-md w-full px-4 py-3 border border-gray-300 rounded-xl space-x-3">
          <i className="ri-search-line text-xl text-gray-500"></i>
          <input
            type="text"
            placeholder="Tìm tên sản phẩm, danh mục..."
            className="w-full outline-none text-gray-700"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <button
          onClick={() => setCreateModalVisible(true)}
          className="px-4 py-3 bg-[#FF9F45] hover:bg-[#2b2b2b] text-white rounded-xl  cursor-pointer"
        >
          New Product
        </button>
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{
          pageSize: 5, // số item mỗi trang
        }}
        className="border-gray-200 border rounded-md"
      />
      <CreateModalProduct
        onClose={() => setCreateModalVisible(false)}
        visible={createModalVisible}
      />

      <EditProductModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        product={editingProduct}
      />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
};
export default ContentProducts;
