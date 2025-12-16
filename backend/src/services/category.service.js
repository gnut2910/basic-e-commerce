import { Category } from "../models/category.model.js";

// lấy tất cả danh mục
export const getAllCategories = async () => {
  const categories = await Category.findAll();
  return categories;
};
// lấy danh mục theo ID
export const getCategoryById = async (id) => {
  const category = await Category.findByPk(id);
  return category;
};
// tạo danh mục mới
export const createCategory = async (categoryData) => {
  const newCategory = await Category.create(categoryData);
  return newCategory;
};
// cập nhật danh mục
export const updateCategory = async (id, categoryData) => {
  const category = await Category.findByPk(id);
  if (!category) return null;
  await category.update(categoryData);
  return category;
};
// xoá danh mục
export const deleteCategory = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) return null;
  await category.destroy();
  return category;
};
