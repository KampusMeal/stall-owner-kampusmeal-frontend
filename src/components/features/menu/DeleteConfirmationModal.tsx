'use client';

import { MdWarning } from 'react-icons/md';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <MdWarning size={32} />
        </div>

        <h3 className="text-lg font-bold text-text-dark mb-2">Hapus Menu?</h3>
        <p className="text-sm text-gray-500 mb-6">
          Apakah Anda yakin ingin menghapus{' '}
          <span className="font-semibold text-text-dark">
            &quot;{itemName}&quot;
          </span>
          ? Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-md shadow-red-200 transition-colors"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
