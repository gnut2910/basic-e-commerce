import * as productService from "../services/product.service.js";

// Lấy tất cả sản phẩm
export const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).send(products);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
// Lấy sản phẩm theo cửa hàng
export const getProductsByStoreId = async (req, res) => {
  try {
    const { storeId } = req.params;
    const products = await productService.getProductsByStoreId(storeId);
    res.status(200).send(products);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
// Lấy sản phẩm theo ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    if (!product)
      return res.status(400).send({ message: "Không tìm thấy sản phẩm" });
    res.status(200).send(product);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

//create by admin
export const createProductAdmin = async (req, res) => {
  try {
    const productData = req.body;
    const imageFile = req.file;
    if (productData.discount_price === "")
      return (productData.discount_price = null);
    if (productData.discount_expiry === "")
      return (productData.discount_expiry = null);
    const newProduct = await productService.createProduct(
      productData,
      imageFile
    );
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//update by admin
export const updateProductByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    const imageFile = req.file;
    const updatedProduct = await productService.updateProduct(
      id,
      productData,
      imageFile
    );
    if (!updatedProduct)
      return res.status(400).send({ message: "Không tìm thấy sản phẩm" });
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xoá sản phẩm
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await productService.deleteProduct(id);
    if (!deletedProduct)
      return res.status(400).send({ message: "Không tìm thấy sản phẩm" });
    res.status(200).send({ message: "Xóa sản phẩm thành công" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
// Lấy sản phẩm liên quan theo danh mục
export const getRelatedProducts = async (req, res) => {
  try {
    const { category_id, product_id } = req.params;
    const related = await productService.getRelatedProducts(
      category_id,
      product_id
    );
    return res.status(200).json(related);
  } catch (err) {
    res.status(500).json({ message: "Không tìm thấy sản phẩm liên quan" });
  }
};
// Tìm kiếm sản phẩm với bộ lọc và phân trang (bao gồm: từ khóa, danh mục, khoảng giá, sắp xếp, trang, giới hạn)
export const searchProducts = async (req, res) => {
  try {
    const { q, category, min, max, sort, page, limit } = req.query;
    const result = await productService.searchProducts({
      q,
      category,
      min,
      max,
      sort,
      page,
      limit,
    });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Search failed" });
  }
};
