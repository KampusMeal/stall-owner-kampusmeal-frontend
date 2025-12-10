'use client';

import type { MenuItem } from '@/utils/menuApi';
import { validateImage } from '@/utils/menuApi';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { MdClose, MdCloudUpload } from 'react-icons/md';

export interface MenuFormData {
  name: string;
  price: number;
  description: string;
  category: string[]; // Array of categories
  isAvailable: boolean;
  image?: File;
}

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MenuFormData) => Promise<void>;
  initialData?: MenuItem | null; // If present, it's Edit mode
}

export default function MenuFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: MenuFormModalProps) {
  const isEditMode = !!initialData;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<MenuFormData>({
    name: '',
    price: 0,
    description: '',
    category: [],
    isAvailable: true,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');
  const [categoryInput, setCategoryInput] = useState<string>(''); // For adding new category

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          price: initialData.price,
          description: initialData.description,
          category: initialData.category || [],
          isAvailable: initialData.isAvailable,
        });
        setPreviewImage(initialData.imageUrl);
      } else {
        setFormData({
          name: '',
          price: 0,
          description: '',
          category: [],
          isAvailable: true,
        });
        setPreviewImage(null);
      }
      setError('');
      setImageError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate image
      const validationError = validateImage(file);
      if (validationError) {
        setImageError(validationError);
        return;
      }

      setImageError('');
      // Create local preview URL
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setImageError('');

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Nama menu wajib diisi');
      return;
    }

    if (formData.price < 100) {
      setError('Harga minimal Rp 100');
      return;
    }

    if (!formData.description.trim()) {
      setError('Deskripsi wajib diisi');
      return;
    }

    if (formData.category.length === 0) {
      setError('Minimal 1 kategori harus dipilih');
      return;
    }

    // For create mode, image is required
    if (!isEditMode && !formData.image) {
      setImageError('Foto menu wajib diupload');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category handlers
  const handleAddCategory = () => {
    const trimmed = categoryInput.trim();
    if (trimmed && !formData.category.includes(trimmed)) {
      setFormData({ ...formData, category: [...formData.category, trimmed] });
      setCategoryInput('');
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setFormData({
      ...formData,
      category: formData.category.filter((cat) => cat !== categoryToRemove),
    });
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCategory();
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-text-dark">
            {isEditMode ? 'Edit Menu' : 'Tambah Menu Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form id="menu-form" onSubmit={handleSubmit}>
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-dark">
                Foto Menu{' '}
                {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <div
                className={`border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden
                  ${previewImage ? 'border-primary' : imageError ? 'border-red-300' : 'border-gray-300 hover:border-primary bg-gray-50 hover:bg-orange-50'}
                `}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewImage ? (
                  <>
                    <Image
                      src={previewImage}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white font-medium flex items-center gap-2">
                        <MdCloudUpload size={20} /> Ganti Foto
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-2 text-primary">
                      <MdCloudUpload size={24} />
                    </div>
                    <p className="text-sm font-medium text-text-dark">
                      Klik untuk upload foto
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, WebP max 5MB
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                />
              </div>
              {imageError && (
                <p className="text-xs text-red-600 mt-1">{imageError}</p>
              )}
            </div>

            {/* Nama Menu */}
            <div className="space-y-2 mt-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-text-dark"
              >
                Nama Menu
              </label>
              <input
                type="text"
                id="name"
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 text-text-dark text-sm"
                placeholder="Contoh: Nasi Goreng Spesial"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Category */}
            <div className="space-y-2 mt-4">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-text-dark"
              >
                Kategori <span className="text-red-500">*</span>
              </label>

              {/* Category Tags Display */}
              {formData.category.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.category.map((cat, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-primary rounded-full text-sm font-medium border border-orange-100"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(cat)}
                        className="hover:bg-orange-100 rounded-full p-0.5 transition-colors"
                        title="Hapus kategori"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Category Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  id="category"
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 text-text-dark text-sm"
                  placeholder="Contoh: Nasi, Ayam, Pedas"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyDown={handleCategoryKeyDown}
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2.5 bg-primary hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Tambah
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Tekan Enter atau klik Tambah untuk menambahkan kategori
              </p>
            </div>

            {/* Harga */}
            <div className="space-y-2 mt-4">
              <label
                htmlFor="price"
                className="block text-sm font-medium text-text-dark"
              >
                Harga (Rp)
              </label>
              <input
                type="number"
                id="price"
                required
                min="100"
                step="1"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 text-text-dark text-sm"
                placeholder="Minimal Rp 100"
                value={formData.price || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            {/* Deskripsi */}
            <div className="space-y-2 mt-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-text-dark"
              >
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                required
                minLength={10}
                maxLength={500}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 text-text-dark text-sm resize-none h-24"
                placeholder="Jelaskan detail menu (minimal 10 karakter)..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <p className="text-xs text-gray-500">
                {formData.description.length}/500 karakter
              </p>
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 mt-4">
              <div>
                <span className="block text-sm font-medium text-text-dark">
                  Status Tersedia
                </span>
                <span className="text-xs text-gray-500">
                  Tampilkan menu ini di aplikasi pembeli
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.isAvailable}
                  onChange={(e) =>
                    setFormData({ ...formData, isAvailable: e.target.checked })
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            type="submit"
            form="menu-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-orange-600 rounded-xl shadow-md shadow-orange-200 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {isEditMode ? 'Menyimpan...' : 'Menambahkan...'}
              </span>
            ) : (
              <span>{isEditMode ? 'Simpan Perubahan' : 'Tambah Menu'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
