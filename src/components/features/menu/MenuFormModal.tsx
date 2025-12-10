'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { MdClose, MdCloudUpload } from 'react-icons/md';

export interface MenuFormData {
  id?: number;
  name: string;
  price: string | number;
  description: string;
  available: boolean;
  image: File | string | null;
}

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MenuFormData) => void;
  initialData?: Partial<MenuFormData> | null; // If present, it's Edit mode
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
  const [formData, setFormData] = useState<MenuFormData>(
    (initialData as MenuFormData) || {
      name: '',
      price: '',
      description: '',
      available: true,
      image: null,
    },
  );

  const [previewImage, setPreviewImage] = useState<string | null>(
    typeof initialData?.image === 'string' ? initialData.image : null,
  );

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create local preview URL
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
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
          <form id="menu-form" onSubmit={handleSubmit}>
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-dark">
                Foto Menu
              </label>
              <div
                className={`border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden
                  ${previewImage ? 'border-primary' : 'border-gray-300 hover:border-primary bg-gray-50 hover:bg-orange-50'}
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
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
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
                min="0"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 text-text-dark text-sm"
                placeholder="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>

            {/* Deskripsi */}
            <div className="space-y-2 mt-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-text-dark"
              >
                Deskripsi (Opsional)
              </label>
              <textarea
                id="description"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 text-text-dark text-sm resize-none h-24"
                placeholder="Jelaskan detail menu..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
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
                  checked={formData.available}
                  onChange={(e) =>
                    setFormData({ ...formData, available: e.target.checked })
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
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="menu-form"
            className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-orange-600 rounded-xl shadow-md shadow-orange-200 transition-all hover:shadow-lg"
          >
            {isEditMode ? 'Simpan Perubahan' : 'Tambah Menu'}
          </button>
        </div>
      </div>
    </div>
  );
}
