import { Op, where } from "sequelize";
import { Product } from "../models/product.model.js";
import fs from "fs";
import path from "path";
import { Category } from "../models/category.model.js";

// lấy tất cả sản phẩm
export const getAllProducts = async () => {
  const products = await Product.findAll({
    include: { model: Category, attributes: ["name"] },
  });
  return products;
};

// lấy sản phẩm theo cửa hàng
export const getProductsByStoreId = async (storeId) => {
  const products = await Product.findAll({
    where: {
      store_id: storeId,
    },
  });
  return products;
};

// lấy sản phẩm theo ID
export const getProductById = async (id) => {
  const product = await Product.findByPk(id);
  return product;
};
// tạo sản phẩm mới
export const createProduct = async (data, file) => {
  const {
    name,
    category_id,
    description,
    price,
    stock,
    status,
    store_id,
    discount_price,
    discount_expiry,
  } = data;

  // Lấy file nếu có
  const imageFileName = file ? file.filename : null;

  const newProduct = await Product.create({
    name,
    category_id,
    description,
    price,
    stock,
    status,
    store_id,
    image: imageFileName,
    discount_price,
    discount_expiry,
  });
  return newProduct;
};

// sửa thông tin sản phẩm
export const updateProduct = async (id, productData) => {
  const product = await Product.findByPk(id);
  if (!product) return null;
  // Nếu có ảnh mới và đã có ảnh cũ thì xóa ảnh cũ
  if (
    productData.image &&
    product.image &&
    productData.image !== product.image
  ) {
    const oldPath = path.join(
      process.cwd(),
      "src/public/product",
      product.image
    );
    if (fs.existsSync(oldPath)) {
      try {
        fs.unlinkSync(oldPath);
      } catch (err) {
        console.error("Lỗi xóa ảnh cũ:", err);
      }
    }
  }
  await product.update(productData);
  return product;
};

//edit product by admin
export const updateProductByAdmin = async (id, data, file) => {
  if (!data) return null;

  const { name, category_id, description, price, stock, status, store_id } =
    data;
  const product = await Product.findByPk(id);
  if (!product) return null;
  // Chỉ update image nếu có file mới, nếu không giữ nguyên ảnh cũ
  const updatedData = {
    name,
    category_id,
    description,
    price,
    stock,
    status,
    store_id,
  };

  if (file) updatedData.image = file.filename;

  const updatedProduct = await product.update(updatedData);
  return updatedProduct;
};

// xoá sản phẩm
export const deleteProduct = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) return null;
  // Xóa ảnh khi xóa sản phẩm
  if (product.image) {
    const imgPath = path.join(
      process.cwd(),
      "src/public/product",
      product.image
    );
    if (fs.existsSync(imgPath)) {
      try {
        fs.unlinkSync(imgPath);
      } catch {}
    }
  }
  await product.destroy();
  return product;
};
// lấy sản phẩm liên quan theo danh mục
export const getRelatedProducts = async (category_id, product_id) => {
  const products = await Product.findAll({
    where: {
      category_id: category_id,
      product_id: { [Op.ne]: product_id }, // loại bỏ sản phẩm hiện tại
    },
    limit: 4,
  });
  return products;
};
// tìm kiếm sản phẩm với bộ lọc và phân trang (bao gồm: từ khóa, danh mục, khoảng giá, sắp xếp, trang, giới hạn)
export const searchProducts = async ({
  q,
  category,
  min,
  max,
  sort,
  page = 1,
  limit = 12,
}) => {
  const where = {};

  // Keyword search on name/description
  if (q && String(q).trim().length > 0) {
    const kw = `%${String(q).trim()}%`;
    where[Op.or] = [
      { name: { [Op.like]: kw } },
      { description: { [Op.like]: kw } },
    ];
  }

  // Category filter (numeric id)
  if (category && !isNaN(Number(category))) {
    where.category_id = Number(category);
  }

  // Price range
  if (min !== undefined && min !== null && min !== "" && !isNaN(Number(min))) {
    where.price = { ...(where.price || {}), [Op.gte]: Number(min) };
  }
  if (max !== undefined && max !== null && max !== "" && !isNaN(Number(max))) {
    where.price = { ...(where.price || {}), [Op.lte]: Number(max) };
  }

  // Sorting
  let order = [];
  switch (sort) {
    case "price-asc":
      order = [["price", "ASC"]];
      break;
    case "price-desc":
      order = [["price", "DESC"]];
      break;
    case "newest":
      order = [["created_at", "DESC"]];
      break;
    case "bestseller":
      // No sold column available; fallback to newest
      order = [["created_at", "ASC"]];
      break;
    default:
      // relevance/default
      order = [["created_at", "DESC"]];
      break;
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(limit) || 12));
  const offset = (pageNum - 1) * pageSize;

  const { rows, count } = await Product.findAndCountAll({
    where,
    order,
    limit: pageSize,
    offset,
  });

  const totalPages = Math.ceil(count / pageSize) || 1;
  const hasMore = offset + rows.length < count;

  return {
    items: rows,
    total: count,
    page: pageNum,
    pageSize,
    totalPages,
    hasMore,
  };
};
