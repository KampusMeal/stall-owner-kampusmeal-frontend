'use client';

import DeleteConfirmationModal from '@/components/features/menu/DeleteConfirmationModal';
import MenuFormModal, {
  type MenuFormData,
} from '@/components/features/menu/MenuFormModal';
import { useState } from 'react';
import {
  MdAdd,
  MdChevronLeft,
  MdChevronRight,
  MdDelete,
  MdEdit,
  MdRestaurant,
  MdSearch,
} from 'react-icons/md';

// Mock Data
const INITIAL_MENU = [
  {
    id: 1,
    name: 'Nasi Goreng Spesial',
    price: 15000,
    category: 'Makanan',
    description: 'Nasi goreng dengan topping ayam suwir dan telur mata sapi.',
    available: true,
  },
  {
    id: 2,
    name: 'Ayam Geprek',
    price: 18000,
    category: 'Makanan',
    description: 'Ayam goreng tepung digeprek dengan sambal bawang pedas.',
    available: true,
  },
  {
    id: 3,
    name: 'Es Teh Manis',
    price: 5000,
    category: 'Minuman',
    description: 'Teh manis dingin segar.',
    available: false,
  },
  {
    id: 4,
    name: 'Mie Goreng Jawa',
    price: 12000,
    category: 'Makanan',
    description: 'Mie goreng khas Jawa dengan bumbu kecap dan sayuran.',
    available: true,
  },
  {
    id: 5,
    name: 'Kopi Hitam',
    price: 4000,
    category: 'Minuman',
    description: 'Kopi hitam panas tanpa gula.',
    available: true,
  },
  {
    id: 6,
    name: 'Sate Ayam',
    price: 20000,
    category: 'Makanan',
    description: 'Sate ayam dengan bumbu kacang.',
    available: true,
  },
  {
    id: 7,
    name: 'Es Jeruk',
    price: 7000,
    category: 'Minuman',
    description: 'Minuman jeruk segar dingin.',
    available: true,
  },
  {
    id: 8,
    name: 'Bakso Kuah',
    price: 15000,
    category: 'Makanan',
    description: 'Bakso sapi dengan kuah gurih.',
    available: false,
  },
  {
    id: 9,
    name: 'Teh Panas',
    price: 3000,
    category: 'Minuman',
    description: 'Teh tawar panas.',
    available: true,
  },
  {
    id: 10,
    name: 'Nasi Ayam Bakar',
    price: 20000,
    category: 'Makanan',
    description: 'Nasi dengan ayam bakar bumbu kecap.',
    available: true,
  },
  {
    id: 11,
    name: 'Es Kopi Susu',
    price: 10000,
    category: 'Minuman',
    description: 'Kopi susu gula aren dengan es.',
    available: true,
  },
  {
    id: 12,
    name: 'Soto Ayam',
    price: 14000,
    category: 'Makanan',
    description: 'Soto ayam dengan kuah bening.',
    available: true,
  },
  {
    id: 13,
    name: 'Nasi Uduk',
    price: 12000,
    category: 'Makanan',
    description: 'Nasi uduk dengan telur dan sambal kacang.',
    available: false,
  },
  {
    id: 14,
    name: 'Jus Alpukat',
    price: 12000,
    category: 'Minuman',
    description: 'Jus alpukat kental dengan topping cokelat.',
    available: true,
  },
  {
    id: 15,
    name: 'Ayam Penyet',
    price: 17000,
    category: 'Makanan',
    description: 'Ayam penyet sambal terasi.',
    available: true,
  },
];

const ITEMS_PER_PAGE = 8;

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  available: boolean;
  image?: string; // Optional since image might be missing
}

export default function MenuPage() {
  const [menuItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selection State
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

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

  const handleFormSubmit = (formData: MenuFormData) => {
    if (selectedItem) {
      console.log('Updating menu:', formData);
      // Update logic here
    } else {
      console.log('Creating new menu:', formData);
      // Create logic here
    }
  };

  const handleConfirmDelete = () => {
    console.log('Deleting menu id:', selectedItem?.id);
    setIsDeleteOpen(false);
    // Delete logic here
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
              {/* Image Placeholder */}
              <div className="relative h-48 bg-gray-50 flex items-center justify-center shrink-0 border-b border-gray-100">
                <div className="flex flex-col items-center justify-center text-gray-300">
                  <MdRestaurant size={48} className="mb-2" />
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Foto Menu
                  </span>
                </div>

                {/* Availability Badge */}
                <div
                  className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border ${item.available ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}
                >
                  {item.available ? 'Tersedia' : 'Habis'}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <span className="bg-orange-50 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                  <p className="font-bold text-text-dark whitespace-nowrap">
                    Rp {item.price.toLocaleString('id-ID')}
                  </p>
                </div>

                <h3
                  className="font-bold text-lg text-text-dark mb-2 transition-colors line-clamp-1"
                  title={item.name}
                >
                  {item.name}
                </h3>

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
            <MdSearch size={32} />
          </div>
          <p className="text-text-dark font-medium">Menu tidak ditemukan</p>
          <p className="text-sm text-gray-500">
            Coba kata kunci lain atau tambah menu baru
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
