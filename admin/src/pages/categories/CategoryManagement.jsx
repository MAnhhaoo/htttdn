import { useState } from 'react';
import { Search, Edit, Trash2, Plus, Loader2, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { categoriesApi } from '../../api';
import { formatDate } from '../../utils/formatHelpers';
import { Button } from '../../components/ui';
import { usePaginatedCacheList } from '../../hooks/usePaginatedCacheList';
import CategoryFormModal from './CategoryFormModal';

export default function CategoryManagement() {
  const {
    list: categories,
    search,
    setSearch,
    loading,
    page,
    setPage,
    totalPages,
    totalItems,
    reusedFromCache,
    fetchList: fetchCategories,
    handleResetAndReuseList,
  } = usePaginatedCacheList({
    fetcher: categoriesApi.getCategories,
    itemsPerPage: 10,
    realtimeEvent: 'miva:categories',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const handleAddClick = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (category) => {
    setCategoryToEdit(category);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (categoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await categoriesApi.deleteCategory(categoryId);
        fetchCategories(true);
      } catch (err) {
        alert(err.response?.data?.message || 'Xóa danh mục thất bại');
      }
    }
  };

  const handleSave = async (savedData) => {
    try {
      if (categoryToEdit) {
        await categoriesApi.updateCategory(categoryToEdit.id, savedData);
      } else {
        await categoriesApi.createCategory(savedData);
      }
      setIsModalOpen(false);
      fetchCategories(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Lưu danh mục thất bại');
    }
  };

  const isFiltered = Boolean(search.trim() || page !== 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Category Management</h1>
            {reusedFromCache && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800">
                ⚡ Tái sử dụng DS gốc (Cache)
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400">{totalItems} categories</p>
        </div>
        <div className="flex items-center gap-2">
          {isFiltered && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResetAndReuseList()}
              className="flex items-center gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Bỏ tìm kiếm / Tái sử dụng DS gốc
            </Button>
          )}
          <Button icon={Plus} onClick={handleAddClick}>
            Add Category
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 max-w-md">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input type="text" placeholder="Tìm kiếm danh mục..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full dark:text-slate-200" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-slate-500">Đang tải...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20 text-slate-500 dark:text-slate-400">
              Không tìm thấy danh mục nào.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Slug</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Created</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">{cat.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{cat.slug}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{formatDate(cat.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" icon={Edit} className="text-slate-400 hover:text-amber-600" onClick={() => handleEditClick(cat)} />
                        <Button variant="ghost" size="sm" icon={Trash2} className="text-slate-400 hover:text-red-600" onClick={() => handleDeleteClick(cat.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Trang {page} / {totalPages} ({totalItems} danh mục)
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                icon={ChevronLeft} 
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              />
              <Button 
                variant="outline" 
                size="sm" 
                icon={ChevronRight}
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              />
            </div>
          </div>
        )}
      </div>

      <CategoryFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryToEdit={categoryToEdit}
        onSave={handleSave}
      />
    </div>
  );
}
