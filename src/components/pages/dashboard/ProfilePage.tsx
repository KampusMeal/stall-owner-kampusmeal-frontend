'use client';

import {
  deleteMyStall,
  getMyStall,
  Stall,
  StallCategory,
  updateMyStall,
  UpdateStallDto,
  validateImage,
} from '@/utils/profileApi';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  MdAdd,
  MdCameraAlt,
  MdClose,
  MdDeleteForever,
  MdEdit,
  MdFastfood,
  MdInfo,
  MdLocationOn,
  MdQrCode,
  MdSave,
  MdStar,
  MdStore,
  MdWarning,
} from 'react-icons/md';

// --- Sub-Components ---

const ImagePreview = ({
  src,
  alt,
  label,
  onEdit,
}: {
  src?: string | null;
  alt: string;
  label: string;
  onEdit?: () => void;
}) => {
  return (
    <div className="relative group rounded-xl overflow-hidden bg-gray-100 border border-gray-200 aspect-video w-full shadow-sm">
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <MdStore size={48} className="mb-2 opacity-50" />
          <span className="text-xs font-medium uppercase tracking-wider">
            {label} Kosong
          </span>
        </div>
      )}
      {onEdit && (
        <div
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          onClick={onEdit}
        >
          <button className="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 shadow-lg hover:bg-white transition-transform hover:scale-105">
            <MdCameraAlt size={18} /> Ganti Foto
          </button>
        </div>
      )}
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
};

// --- Main Page Component ---

export default function ProfilePage() {
  const [stall, setStall] = useState<Stall | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'edit'>('overview');

  // Form State
  const [formData, setFormData] = useState<Partial<UpdateStallDto>>({});
  const [foodTypesInput, setFoodTypesInput] = useState<string>('');
  const [tempFoodTypes, setTempFoodTypes] = useState<string[]>([]);

  // Image Upload State
  const [stallImageFile, setStallImageFile] = useState<File | null>(null);
  const [stallImagePreview, setStallImagePreview] = useState<string | null>(
    null,
  );

  const [qrisImageFile, setQrisImageFile] = useState<File | null>(null);
  const [qrisImagePreview, setQrisImagePreview] = useState<string | null>(null);

  const stallInputRef = useRef<HTMLInputElement>(null);
  const qrisInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchStallData();
  }, []);

  async function fetchStallData() {
    setIsLoading(true);
    setError('');
    try {
      const data = await getMyStall();
      setStall(data);
      // Initialize form data
      setTempFoodTypes(data.foodTypes || []);
      setFormData({
        name: data.name,
        description: data.description,
        category: data.category,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (
        message.includes('belum memiliki warung') ||
        message.includes('404')
      ) {
        setError(
          'Anda belum memiliki warung. Silakan hubungi admin atau registrasi warung.',
        );
      } else {
        setError(message || 'Gagal memuat profil warung');
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Input Changes
  const handleInputChange = (field: keyof UpdateStallDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle Food Types Tag Logic
  const addFoodType = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter')
      return;
    e.preventDefault();

    const val = foodTypesInput.trim();
    if (val && !tempFoodTypes.includes(val) && tempFoodTypes.length < 10) {
      setTempFoodTypes([...tempFoodTypes, val]);
      setFoodTypesInput('');
    }
  };

  const removeFoodType = (tag: string) => {
    setTempFoodTypes(tempFoodTypes.filter((t) => t !== tag));
  };

  // Handle Image Selection
  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'stall' | 'qris',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImage(file);
    if (error) {
      alert(error);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (type === 'stall') {
      setStallImageFile(file);
      setStallImagePreview(previewUrl);
    } else {
      setQrisImageFile(file);
      setQrisImagePreview(previewUrl);
    }
  };

  // Handle Save
  const handleSave = async () => {
    if (!stall) return;
    setIsSaving(true);
    try {
      const payload: UpdateStallDto = {
        ...formData,
        foodTypes: tempFoodTypes,
        image: stallImageFile || undefined,
        qrisImage: qrisImageFile || undefined,
      };

      const updated = await updateMyStall(payload);
      setStall(updated);
      setActiveTab('overview');
      // Reset upload states
      setStallImageFile(null);
      setStallImagePreview(null);
      setQrisImageFile(null);
      setQrisImagePreview(null);
      alert('Profil warung berhasil diperbarui!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menyimpan perubahan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStall = async () => {
    if (
      !confirm(
        'PERINGATAN: Apakah Anda yakin ingin menghapus warung ini secara permanen? Data pesanan dan menu akan hilang aksesnya.',
      )
    )
      return;

    // Double confirm
    const confirmName = prompt(
      `Ketik "${stall?.name}" untuk konfirmasi penghapusan:`,
    );
    if (confirmName !== stall?.name) {
      alert('Nama warung tidak cocok. Penghapusan dibatalkan.');
      return;
    }

    try {
      await deleteMyStall();
      alert('Warung berhasil dihapus.');
      // Force logout or redirect
      window.location.href = '/dashboard';
    } catch (err) {
      alert(
        'Gagal menghapus warung: ' +
          (err instanceof Error ? err.message : 'Unknown error'),
      );
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-gray-500">Memuat profil warung...</p>
      </div>
    );
  }

  // Error State
  if (error || !stall) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
          <MdWarning size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Tidak Ditemukan
        </h3>
        <p className="text-gray-500 mb-6">
          {error || 'Data warung tidak tersedia.'}
        </p>
        <button
          onClick={fetchStallData}
          className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-orange-600 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Profil Warung</h1>
          <p className="text-gray-500 text-sm">
            Kelola informasi dan pengaturan toko Anda
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <MdStore size={18} />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'edit'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <MdEdit size={18} />
            Edit Profil
          </button>
        </div>
      </div>

      {/* --- OVERVIEW TAB --- */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left Column: Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Banner & Header Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Banner Image */}
              <div className="relative h-48 sm:h-64 bg-gray-100">
                {stall.stallImageUrl ? (
                  <Image
                    src={stall.stallImageUrl}
                    alt={stall.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 gap-2">
                    <MdStore size={32} />
                    <span>Tidak ada foto banner</span>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className="bg-white/90 backdrop-blur text-gray-900 px-3 py-1 rounded-full text-xs font-bold border border-white/50 shadow-sm uppercase tracking-wider">
                    {stall.category}
                  </span>
                </div>
              </div>

              {/* Stall Header Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-text-dark mb-1">
                      {stall.name}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MdLocationOn className="text-gray-400" />
                      <span>
                        Bergabung sejak{' '}
                        {new Date(stall.createdAt).toLocaleDateString('id-ID', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100">
                      <MdStar className="text-yellow-500" size={20} />
                      <span className="text-xl font-bold text-gray-900">
                        {stall.rating}
                      </span>
                      <span className="text-xs text-gray-400 font-medium ml-1">
                        / 5.0
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 mt-1">
                      {stall.totalReviews} Ulasan
                    </span>
                  </div>
                </div>

                <div className="prose prose-sm text-gray-600 max-w-none">
                  <p className="leading-relaxed whitespace-pre-line">
                    {stall.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Food Types */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
                <MdFastfood className="text-primary" />
                Menu Spesialis
              </h3>
              {stall.foodTypes && stall.foodTypes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stall.foodTypes.map((type, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-100 uppercase tracking-wide"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic">
                  Belum ada jenis makanan yang ditambahkan.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: QRIS & Details */}
          <div className="space-y-6">
            {/* QRIS Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center">
              <h3 className="text-lg font-bold text-text-dark mb-4 flex items-center gap-2 w-full">
                <MdQrCode className="text-gray-700" />
                QRIS Pembayaran
              </h3>
              <div className="w-full aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                {stall.qrisImageUrl ? (
                  <Image
                    src={stall.qrisImageUrl}
                    alt="QRIS Code"
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="text-center text-gray-400 p-4">
                    <MdQrCode size={48} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs">QRIS belum diupload</p>
                  </div>
                )}
              </div>
              <p className="text-center text-xs text-gray-400 mt-4">
                Digunakan pelanggan untuk pembayaran digital.
              </p>
            </div>

            {/* System Info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MdInfo className="text-gray-400" />
                Info Sistem
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Stall ID</span>
                  <span className="font-mono text-gray-900">
                    {stall.id.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Owner ID</span>
                  <span className="font-mono text-gray-900">
                    {stall.ownerId.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Terakhir Update</span>
                  <span className="text-gray-900">
                    {new Date(stall.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT TAB --- */}
      {activeTab === 'edit' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-bold text-text-dark">
              Edit Informasi Warung
            </h2>
            <button
              onClick={() => handleDeleteStall()}
              className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              <MdDeleteForever size={16} /> Hapus Warung
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* 1. Images Section */}
            <section>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-l-4 border-primary pl-3">
                Media & Identitas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ImagePreview
                    src={stallImagePreview || stall.stallImageUrl}
                    alt="Stall Banner"
                    label="Foto Utama Warung"
                    onEdit={() => stallInputRef.current?.click()}
                  />
                  <input
                    type="file"
                    ref={stallInputRef}
                    onChange={(e) => handleImageSelect(e, 'stall')}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Disarankan rasio 16:9, max 5MB.
                  </p>
                </div>
                <div>
                  <ImagePreview
                    src={qrisImagePreview || stall.qrisImageUrl}
                    alt="QRIS"
                    label="QR Code QRIS"
                    onEdit={() => qrisInputRef.current?.click()}
                  />
                  <input
                    type="file"
                    ref={qrisInputRef}
                    onChange={(e) => handleImageSelect(e, 'qris')}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Pastikan QR Code terlihat jelas dan tidak terpotong.
                  </p>
                </div>
              </div>
            </section>

            <hr className="border-gray-100" />

            {/* 2. Basic Info Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-l-4 border-primary pl-3">
                  Informasi Utama
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Warung
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Contoh: Warung Bu Siti"
                    minLength={3}
                    maxLength={100}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <div className="relative">
                    <select
                      value={formData.category || ''}
                      onChange={(e) =>
                        handleInputChange('category', e.target.value)
                      }
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                    >
                      {Object.values(StallCategory).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <MdKeyboardArrowDown size={20} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) =>
                      handleInputChange('description', e.target.value)
                    }
                    rows={4}
                    minLength={10}
                    maxLength={500}
                    placeholder="Ceritakan tentang warung Anda..."
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                  <p className="text-xs text-gray-400 text-right mt-1">
                    {(formData.description || '').length}/500
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-l-4 border-primary pl-3">
                  Menu Spesialis
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Makanan (Tags)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={foodTypesInput}
                      onChange={(e) => setFoodTypesInput(e.target.value)}
                      onKeyDown={addFoodType}
                      placeholder="ketik lalu tekan enter..."
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                      disabled={tempFoodTypes.length >= 10}
                    />
                    <button
                      type="button"
                      onClick={addFoodType}
                      disabled={
                        !foodTypesInput.trim() || tempFoodTypes.length >= 10
                      }
                      className="bg-primary text-white px-3 md:px-4 py-2 rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors"
                    >
                      <MdAdd size={20} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3 min-h-[40px] p-4 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                    {tempFoodTypes.length > 0 ? (
                      tempFoodTypes.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-sm border border-gray-200 flex items-center gap-2"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeFoodType(tag)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <MdClose size={14} />
                          </button>
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm italic w-full text-center">
                        Belum ada tags (Max 10)
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Maksimal 10 jenis makanan.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3 sticky bottom-0 z-10">
            <button
              onClick={() => setActiveTab('overview')}
              className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors sm:w-auto w-full"
              disabled={isSaving}
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-2.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:w-auto w-full"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <MdSave size={18} /> Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Helper Icon Component for Select Arrow
  function MdKeyboardArrowDown({ size }: { size?: number }) {
    return (
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 24 24"
        height={size}
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fill="none" d="M0 0h24v24H0V0z"></path>
        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path>
      </svg>
    );
  }
}
