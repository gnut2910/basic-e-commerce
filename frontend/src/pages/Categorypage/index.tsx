import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  actFetchCategories,
  type ICategory,
} from "../../redux/features/category/categorySlice";
import type { AppDispatch, RootState } from "../../redux/store";
import "./style.css";
import PageBreadcrumb from "../../components/PageBreadCrumb";

const Categorypage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { categories, loading, error } = useSelector(
    (s: RootState) => s.category
  );

  const API_BASE: string | undefined = import.meta.env.VITE_API_URL;
  const buildImageUrl = (img?: string | null) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    const normalized = img.includes("/") ? img : `category/${img}`;
    return `${API_BASE}/public/${normalized}`;
  };

  useEffect(() => {
    if (!categories.length) dispatch(actFetchCategories());
  }, [categories.length, dispatch]);

  const onOpenCategory = (c: ICategory) => {
    navigate(`/search?category=${c.category_id}`);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Danh mục" />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-semibold">
              Danh mục sản phẩm
            </h1>
            <span className="text-sm text-gray-500">
              {categories.length} danh mục
            </span>
          </div>

          {loading && (
            <div className="text-center py-8">Đang tải danh mục...</div>
          )}
          {error && (
            <div className="text-red-600 border border-red-300 p-3 mb-4">
              {error}
            </div>
          )}

          <div className="grid [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))] gap-6">
            {categories.map((c: ICategory) => {
              const imgUrl = buildImageUrl(c.image || undefined);
              return (
                <button
                  key={c.category_id}
                  type="button"
                  onClick={() => onOpenCategory(c)}
                  className="group text-left border border-gray-200 bg-white rounded-none overflow-hidden transition-all duration-300 transform-gpu hover:-translate-y-1 hover:shadow-2xl hover:border-gray-300 focus:outline-none"
                >
                  <div className="relative bg-white h-48 flex items-center justify-center overflow-hidden">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={c.name}
                        className="max-h-[80%] max-w-[80%] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                      />
                    ) : (
                      <div className="text-5xl text-gray-400">📁</div>
                    )}
                  </div>
                  <div className="px-4 py-4 text-center">
                    <h3 className="font-medium text-gray-800 group-hover:text-gray-900 line-clamp-2 min-h-[3em]">
                      {c.name}
                    </h3>
                    <div className="mt-2 text-sm text-[#8b2e0f] opacity-0 group-hover:opacity-100 transition-opacity">
                      Xem sản phẩm →
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
};

export default Categorypage;
