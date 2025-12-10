'use client';

import DeleteConfirmationModal from '@/components/features/menu/DeleteConfirmationModal';
import MenuFormModal, {
  type MenuFormData,
} from '@/components/features/menu/MenuFormModal';
import type { MenuItem } from '@/utils/menuApi';
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItems,
  updateMenuItem,
} from '@/utils/menuApi';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  MdAdd,
  MdChevronLeft,
  MdChevronRight,
  MdDelete,
  MdEdit,
  MdRestaurant,
  MdSearch,
} from 'react-icons/md';

const ITEMS_PER_PAGE = 8;

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selection State
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Fetch menu items on mount
  useEffect(() => {
    fetchMenuItems();
  }, []);

  async function fetchMenuItems() {
    setIsLoading(true);
    setError('');

    try {
      const items = await getMenuItems();
      setMenuItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat menu');
    } finally {
      setIsLoading(false);
    }
  }

  // --- Logic ---
  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // --- Handlers ---

  const handleAddNew = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: MenuItem) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (formData: MenuFormData) => {
    try {
      if (selectedItem) {
        // Update existing menu item
        const updated = await updateMenuItem(selectedItem.id, formData);
        setMenuItems((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
      } else {
        // Create new menu item
        const newItem = await createMenuItem(formData);
        setMenuItems((prev) => [newItem, ...prev]);
      }
    } catch (err) {
      // Error will be handled by the modal
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;

    try {
      await deleteMenuItem(selectedItem.id);
      setMenuItems((prev) =>
        prev.filter((item) => item.id !== selectedItem.id),
      );
      setIsDeleteOpen(false);
      setSelectedItem(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus menu');
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Quick toggle availability
  const handleToggleAvailability = async (item: MenuItem) => {
    // Optimistic update
    setMenuItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i,
      ),
    );

    try {
      await updateMenuItem(item.id, { isAvailable: !item.isAvailable });
    } catch (err) {
      // Revert on error
      setMenuItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, isAvailable: item.isAvailable } : i,
        ),
      );
      alert(err instanceof Error ? err.message : 'Gagal mengubah status');
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-gray-500">Memuat menu...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-red-600 font-medium mb-2">Terjadi Kesalahan</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={fetchMenuItems}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Menu Saya</h1>
          <p className="text-gray-500 text-sm">
            Kelola daftar menu makanan dan minuman warung Anda
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-orange-200"
        >
          <MdAdd size={20} />
          <span>Tambah Menu</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 w-full">
          <MdSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari menu (e.g. Nasi Goreng)..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to page 1 on search
            }}
          />
        </div>
      </div>

      {/* Menu Grid */}
      {currentItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-50 flex items-center justify-center shrink-0 border-b border-gray-100">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-300">
                    <MdRestaurant size={48} className="mb-2" />
                    <span className="text-xs font-medium uppercase tracking-wider">
                      Foto Menu
                    </span>
                  </div>
                )}

                {/* Availability Badge */}
                <button
                  onClick={() => handleToggleAvailability(item)}
                  className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border cursor-pointer transition-all hover:scale-105 ${
                    item.isAvailable
                      ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'
                      : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                  }`}
                  title="Klik untuk ubah status"
                >
                  {item.isAvailable ? 'Tersedia' : 'Habis'}
                </button>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3
                    className="font-bold text-lg text-text-dark line-clamp-1 flex-1"
                    title={item.name}
                  >
                    {item.name}
                  </h3>
                  <p className="font-bold text-text-dark whitespace-nowrap">
                    Rp {item.price.toLocaleString('id-ID')}
                  </p>
                </div>

                {/* Categories */}
                {item.category && item.category.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.category.map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-orange-50 text-primary rounded text-[10px] font-bold uppercase tracking-wider border border-orange-100"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description Truncated */}
                <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
                  {item.description}
                </p>

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-4 border-t border-gray-50">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-text-dark py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <MdEdit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="flex items-center justify-center px-3 bg-white hover:bg-red-50 border border-red-100 text-red-500 rounded-lg transition-colors"
                    title="Hapus Menu"
                  >
                    <MdDelete size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
            {searchTerm ? <MdSearch size={32} /> : <MdRestaurant size={32} />}
          </div>
          <p className="text-text-dark font-medium">
            {searchTerm ? 'Menu tidak ditemukan' : 'Belum ada menu'}
          </p>
          <p className="text-sm text-gray-500">
            {searchTerm
              ? 'Coba kata kunci lain atau tambah menu baru'
              : 'Klik "Tambah Menu" untuk menambahkan menu pertama Anda'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {filteredItems.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-6 gap-4">
          <p className="text-sm text-gray-500">
            Menampilkan{' '}
            <span className="font-medium text-text-dark">{startIndex + 1}</span>{' '}
            -{' '}
            <span className="font-medium text-text-dark">
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)}
            </span>{' '}
            dari{' '}
            <span className="font-medium text-text-dark">
              {filteredItems.length}
            </span>{' '}
            menu
          </p>

          <div className="flex items-center gap-1">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border transition-all ${
                currentPage === 1
                  ? 'border-transparent text-gray-300 cursor-not-allowed'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary active:scale-95'
              }`}
            >
              <MdChevronLeft size={20} />
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`min-w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                      currentPage === page
                        ? 'bg-primary text-white shadow-sm shadow-orange-200'
                        : 'text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border transition-all ${
                currentPage === totalPages
                  ? 'border-transparent text-gray-300 cursor-not-allowed'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary active:scale-95'
              }`}
            >
              <MdChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      <MenuFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedItem}
        key={selectedItem ? selectedItem.id : 'new'}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selectedItem?.name || 'Menu Item'}
      />
    </div>
  );
}
