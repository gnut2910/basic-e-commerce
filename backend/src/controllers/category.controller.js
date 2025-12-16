import * as categoryService from "../services/category.service.js";

// Lấy tất cả danh mục
export const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.status(200).send(categories);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
// Lấy danh mục theo ID
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryService.getCategoryById(id);
        if (!category)
            return res.status(404).send({ message: "Không tìm thấy danh mục" });
        res.status(200).send(category);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
// Tạo danh mục mới
export const createCategory = async (req, res) => {
    try {
        const categoryData = req.body;
        const newCategory = await categoryService.createCategory(categoryData);
        res.status(201).send(newCategory);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
// Cập nhật danh mục
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const categoryData = req.body;
        const updatedCategory = await categoryService.updateCategory(id, categoryData);
        if (!updatedCategory)
            return res.status(404).send({ message: "Không tìm thấy danh mục" });
        res.status(200).send(updatedCategory);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
// Xoá danh mục
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCategory = await categoryService.deleteCategory(id);
        if (!deletedCategory)
            return res.status(404).send({ message: "Không tìm thấy danh mục" });
        res.status(200).send({ message: "Xoá danh mục thành công" });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
