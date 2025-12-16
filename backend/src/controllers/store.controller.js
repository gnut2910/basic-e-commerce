import * as storeService from "../services/store.service.js";

// Lấy tất cả cửa hàng
export const getStores = async (req, res) => {
  try {
    const stores = await storeService.getAllStores();
    return res.status(200).json({ stores });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

// Lấy cửa hàng theo ID
export const getStore = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid store id" });
    }
    const store = await storeService.getStoreById(id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    return res.status(200).json({ store });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

// Tạo cửa hàng mới
export const createStoreController = async (req, res) => {
  try {
    const { seller_id, name, description, image } = req.body;
    if (!seller_id || !name) {
      return res.status(400).json({ message: "seller_id và name là bắt buộc" });
    }
    // Kiểm tra seller đã có store chưa (1-1)
    const existedStore = await storeService.getStoreBySellerId(seller_id);
    if (existedStore) {
      // Chuyển sang gọi updateStoreController cho đồng bộ RESTful
      req.params.id = existedStore.store_id;
      return await updateStoreController(req, res);
    }
    const newStore = await storeService.createStore({
      seller_id,
      name,
      description,
      image,
    });
    return res.status(201).json({ store: newStore });
  } catch (error) {
    console.error("POST /stores ERROR:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

// Cập nhật cửa hàng
export const updateStoreController = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid store id" });
    }
    const updatedStore = await storeService.updateStore(id, req.body);
    return res.status(200).json({ store: updatedStore });
  } catch (error) {
    if (error.message === "Store not found") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message || "Server error" });
  }
};
// Cập nhật status cửa hàng và send mail
export const sendMailToSeller = async (req, res) => {
  try {
    const { status } = req.body;
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid store id" });
    }
    const updatedStore = await storeService.sendMailToSeller(id, status);
    return res.status(200).json({ store: updatedStore });
  } catch (error) {
    if (error.message === "Store not found") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

// Xoá cửa hàng
export const deleteStoreController = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid store id" });
    }
    await storeService.deleteStore(id);
    // 204 No Content là chuẩn khi xoá thành công
    return res.status(204).send();
  } catch (error) {
    if (error.message === "Store not found") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

// Upload ảnh store (placeholder tránh crash)
export const uploadStoreImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    // Lấy seller_id từ body hoặc query
    const seller_id = req.body.seller_id || req.query.seller_id;
    let imageName = req.file.filename;
    if (seller_id) {
      // Gọi service để xử lý xóa ảnh cũ và cập nhật tên file mới
      await storeService.updateStoreImage(Number(seller_id), imageName);
    }
    // Trả về tên file mới để frontend lưu vào DB
    return res.status(200).json({ image: imageName });
  } catch (err) {
    console.error("Lỗi upload ảnh store:", err);
    return res.status(500).json({ message: "Lỗi khi upload ảnh store" });
  }
};

// Lấy cửa hàng theo seller_id
export const getStoreBySellerId = async (req, res) => {
  try {
    const seller_id = Number(req.params.seller_id);
    if (Number.isNaN(seller_id)) {
      return res.status(400).json({ message: "Invalid seller id" });
    }
    const store = await storeService.getStoreBySellerId(seller_id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    return res.status(200).json({ store });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
};
