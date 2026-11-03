import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Upload,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { Modal, Button, Input, Select, Badge } from "../../components/ui";
import { productService } from "../../services/productService";
import { useAuth } from "../../contexts/AuthContext";

export default function ProductFormModal({
  isOpen,
  onClose,
  productToEdit,
  onSave,
  categories = [],
}) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingColorId, setUploadingColorId] = useState(null);

  // --- Form State ---
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    description: "",
    status: "active",
    colors: [],
  });

  const [expandedColorId, setExpandedColorId] = useState(null);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || "",
        categoryId: productToEdit.categoryId || "",
        description: productToEdit.description || "",
        status: productToEdit.status || "active",
        colors: productToEdit.colors
          ? productToEdit.colors.map((c) => ({
              id: c.id,
              color: c.color || "",
              imageUrls: Array.isArray(c.imageUrls) ? [...c.imageUrls] : [],
              inputUrl: "",
              variants: (c.variants || []).map((v) => ({
                id: v.id,
                size: v.size || "",
                price: Number(v.price) || 0,
                stock: Number(v.stock) || 0,
              })),
            }))
          : [],
      });
    } else {
      setFormData({
        name: "",
        categoryId: "",
        description: "",
        status: "active",
        colors: [],
      });
    }
  }, [productToEdit, isOpen]);

  // --- Handlers ---
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddColor = () => {
    const newColor = {
      id: `temp-color-${Date.now()}`,
      color: "",
      imageUrls: [],
      inputUrl: "",
      variants: [],
    };
    setFormData((prev) => ({ ...prev, colors: [...prev.colors, newColor] }));
    setExpandedColorId(newColor.id);
  };

  const handleUpdateColor = (colorId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.map((c) =>
        c.id === colorId ? { ...c, [field]: value } : c,
      ),
    }));
  };

  const handleRemoveColor = (colorId) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c.id !== colorId),
    }));
  };

  const handleFileUpload = async (colorId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingColorId(colorId);
      const res = await productService.uploadImage(file);
      const uploadedUrl = res.url || (res.urls && res.urls[0]);
      if (uploadedUrl) {
        setFormData((prev) => ({
          ...prev,
          colors: prev.colors.map((c) => {
            if (c.id === colorId) {
              const currentUrls = (c.imageUrls || []).filter(Boolean);
              return {
                ...c,
                imageUrls: [...currentUrls, uploadedUrl],
              };
            }
            return c;
          }),
        }));
      }
    } catch (err) {
      console.error("Lỗi tải ảnh:", err);
      alert(
        "Không thể tải ảnh lên: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setUploadingColorId(null);
      e.target.value = "";
    }
  };

  const handleAddUrlImage = (colorId) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.map((c) => {
        if (c.id === colorId) {
          const trimmed = (c.inputUrl || "").trim();
          if (!trimmed) return c;
          const currentUrls = (c.imageUrls || []).filter(Boolean);
          return {
            ...c,
            imageUrls: [...currentUrls, trimmed],
            inputUrl: "",
          };
        }
        return c;
      }),
    }));
  };

  const handleRemoveImage = (colorId, imgIndex) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.map((c) => {
        if (c.id === colorId) {
          return {
            ...c,
            imageUrls: (c.imageUrls || []).filter((_, idx) => idx !== imgIndex),
          };
        }
        return c;
      }),
    }));
  };

  const handleAddVariant = (colorId) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.map((c) => {
        if (c.id === colorId) {
          return {
            ...c,
            variants: [
              ...c.variants,
              { id: `temp-var-${Date.now()}`, size: "", price: 0, stock: 0 },
            ],
          };
        }
        return c;
      }),
    }));
  };

  const handleUpdateVariant = (colorId, variantId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.map((c) => {
        if (c.id === colorId) {
          return {
            ...c,
            variants: c.variants.map((v) =>
              v.id === variantId ? { ...v, [field]: value } : v,
            ),
          };
        }
        return c;
      }),
    }));
  };

  const handleRemoveVariant = (colorId, variantId) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.map((c) => {
        if (c.id === colorId) {
          return {
            ...c,
            variants: c.variants.filter((v) => v.id !== variantId),
          };
        }
        return c;
      }),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name?.trim() || !formData.categoryId) {
      alert(
        "Vui lòng điền đầy đủ các thông tin bắt buộc (Tên sản phẩm, Danh mục)",
      );
      return;
    }

    // Kiểm tra tên màu nếu có thêm màu
    for (let i = 0; i < formData.colors.length; i++) {
      if (!formData.colors[i].color?.trim()) {
        alert(`Vui lòng nhập tên cho phân loại màu #${i + 1}`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        status: formData.status || "active",
        categoryId: formData.categoryId,
        category: { connect: { id: formData.categoryId } },
        colors: formData.colors.map((c) => ({
          ...(c.id && !c.id.startsWith("temp-") ? { id: c.id } : {}),
          color: c.color.trim(),
          imageUrls: (c.imageUrls || []).filter(Boolean),
          variants: (c.variants || []).map((v) => ({
            ...(v.id && !v.id.startsWith("temp-") ? { id: v.id } : {}),
            size: String(v.size || "").trim() || "Tiêu chuẩn",
            price: Number(v.price) || 0,
            stock: Number(v.stock) || 0,
          })),
        })),
      };

      if (productToEdit) {
        await productService.updateProduct(productToEdit.id, payload);
      } else {
        await productService.createProduct(payload);
      }
      onSave(payload);
    } catch (error) {
      console.error("Error saving product:", error);
      alert(
        "Không thể lưu sản phẩm. " +
          (error.response?.data?.message || error.message || ""),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? "Edit Product" : "Add New Product"}
      maxWidth="max-w-4xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 flex gap-2 items-center"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Product
          </Button>
        </>
      }
    >
      <div className="space-y-8">
        {/* LEVEL 1: PRODUCT INFO */}
        <section>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 border-b pb-2">
            1. Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Product Name *"
              placeholder="e.g. Vintage T-Shirt"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <Select
              label="Category *"
              options={[
                { value: "", label: "Select Category" },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
              value={formData.categoryId}
              onChange={(e) => handleChange("categoryId", e.target.value)}
            />
            <Select
              label="Status"
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:text-white rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                rows={3}
                placeholder="Product description..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* LEVEL 2 & 3: COLORS AND VARIANTS */}
        <section>
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              2. Colors & Variants
            </h3>
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={handleAddColor}
              className="hover:border-indigo-500 hover:text-indigo-600"
            >
              Add Color
            </Button>
          </div>

          {formData.colors.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-300 rounded-xl">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                No colors added yet. Add a color to define variants.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.colors.map((color, index) => (
                <div
                  key={color.id}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 transition-colors overflow-hidden shadow-sm"
                >
                  {/* Color Header */}
                  <div
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 cursor-pointer select-none"
                    onClick={() =>
                      setExpandedColorId(
                        expandedColorId === color.id ? null : color.id,
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      {expandedColorId === color.id ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        {color.color || `Color #${index + 1}`}
                      </span>
                      <Badge
                        variant="info"
                        className="bg-indigo-100 text-indigo-700"
                      >
                        {color.variants.length} variants
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveColor(color.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Color Content */}
                  {expandedColorId === color.id && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                      <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Color Name *"
                            placeholder="e.g. Red, Black, White..."
                            value={color.color}
                            onChange={(e) =>
                              handleUpdateColor(
                                color.id,
                                "color",
                                e.target.value,
                              )
                            }
                          />
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Product Images
                            </label>
                            <label
                              className={`flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-indigo-400 dark:border-indigo-600 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer transition-colors ${uploadingColorId === color.id ? "opacity-50 pointer-events-none" : ""}`}
                            >
                              {uploadingColorId === color.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                              <span>
                                {uploadingColorId === color.id
                                  ? "Đang tải ảnh..."
                                  : "Thêm ảnh từ máy"}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(color.id, e)}
                                disabled={uploadingColorId === color.id}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Image URL Input Alternative */}
                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            <Input
                              placeholder="Hoặc dán URL ảnh trực tiếp (https://...)"
                              value={color.inputUrl || ""}
                              onChange={(e) =>
                                handleUpdateColor(
                                  color.id,
                                  "inputUrl",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-[38px] text-xs shrink-0"
                            onClick={() => handleAddUrlImage(color.id)}
                          >
                            Thêm URL
                          </Button>
                        </div>

                        {/* Image Preview Gallery */}
                        {color.imageUrls &&
                          color.imageUrls.filter(Boolean).length > 0 && (
                            <div>
                              <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                                Ảnh đã chọn (
                                {color.imageUrls.filter(Boolean).length}):
                              </span>
                              <div className="flex flex-wrap gap-2.5">
                                {color.imageUrls
                                  .filter(Boolean)
                                  .map((imgUrl, imgIdx) => (
                                    <div
                                      key={imgIdx}
                                      className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm"
                                    >
                                      <img
                                        src={imgUrl}
                                        alt="Color preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.onerror = null;
                                          e.currentTarget.src =
                                            "https://placehold.co/80x80?text=Error";
                                        }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveImage(color.id, imgIdx)
                                        }
                                        className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full shadow transition-opacity opacity-80 group-hover:opacity-100"
                                        title="Xóa ảnh"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                      </div>

                      {/* LEVEL 3: VARIANTS */}
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                            Sizes & Inventory (Variants)
                          </h4>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Plus}
                            onClick={() => handleAddVariant(color.id)}
                          >
                            Add Size
                          </Button>
                        </div>

                        {color.variants.length === 0 ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
                            No variants added for this color.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {color.variants.map((variant) => (
                              <div
                                key={variant.id}
                                className="flex flex-wrap md:flex-nowrap items-end gap-2 bg-white dark:bg-slate-900 transition-colors p-2 rounded border border-slate-200 dark:border-slate-800"
                              >
                                <div className="flex-1 min-w-[100px]">
                                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                    Size
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full px-2 py-1.5 text-sm border border-slate-200 dark:border-slate-800 dark:text-white rounded outline-none focus:border-indigo-500"
                                    placeholder="e.g. L"
                                    value={variant.size}
                                    onChange={(e) =>
                                      handleUpdateVariant(
                                        color.id,
                                        variant.id,
                                        "size",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                                <div className="flex-1 min-w-[120px]">
                                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                    Price (VND)
                                  </label>
                                  <input
                                    type="number"
                                    className="w-full px-2 py-1.5 text-sm border border-slate-200 dark:border-slate-800 dark:text-white  rounded outline-none focus:border-indigo-500"
                                    placeholder="0"
                                    value={variant.price}
                                    onChange={(e) =>
                                      handleUpdateVariant(
                                        color.id,
                                        variant.id,
                                        "price",
                                        Number(e.target.value),
                                      )
                                    }
                                  />
                                </div>
                                <div className="flex-1 min-w-[100px]">
                                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                    Stock
                                  </label>
                                  <input
                                    type="number"
                                    className="w-full px-2 py-1.5 text-sm border border-slate-200 dark:border-slate-800 dark:text-white  rounded outline-none focus:border-indigo-500"
                                    placeholder="0"
                                    value={variant.stock}
                                    onChange={(e) =>
                                      handleUpdateVariant(
                                        color.id,
                                        variant.id,
                                        "stock",
                                        Number(e.target.value),
                                      )
                                    }
                                  />
                                </div>
                                <button
                                  onClick={() =>
                                    handleRemoveVariant(color.id, variant.id)
                                  }
                                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
