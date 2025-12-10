'use client';

import type { Order } from '@/utils/ordersApi';
import Image from 'next/image';
import {
  MdClose,
  MdDeliveryDining,
  MdImage,
  MdPerson,
  MdReceiptLong,
  MdRestaurant,
  MdStorefront,
} from 'react-icons/md';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onViewProof: (url: string) => void;
}

// --- Detail Modal Component ---
export default function OrderDetailModal({
  isOpen,
  onClose,
  order,
  onViewProof,
}: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  const STATUS_CONFIG = {
    waiting_confirmation: {
      label: 'Menunggu Konfirmasi',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    },
    processing: {
      label: 'Sedang Diproses',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    ready: {
      label: 'Siap Diambil/Antar',
      color: 'bg-purple-100 text-purple-700 border-purple-200',
    },
    completed: {
      label: 'Selesai',
      color: 'bg-green-100 text-green-700 border-green-200',
    },
    cancelled: {
      label: 'Dibatalkan',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
    },
    rejected: {
      label: 'Ditolak',
      color: 'bg-red-100 text-red-700 border-red-200',
    },
    pending_payment: {
      label: 'Menunggu Pembayaran',
      color: 'bg-orange-100 text-orange-700 border-orange-200',
    },
  };

  const statusInfo = STATUS_CONFIG[order.status] || {
    label: order.status,
    color: 'bg-gray-100',
  };

  const formatIDR = (val: number | string) =>
    `Rp ${Number(val).toLocaleString('id-ID')}`;
  const formatDate = (date: string) =>
    new Date(date).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-end sm:justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content - Wider & Centered */}
      <div className="relative w-full sm:max-w-3xl h-full sm:h-auto sm:max-h-[90vh] bg-white sm:rounded-2xl shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out font-sans">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Detail Pesanan</h2>
            <p className="text-sm text-gray-500 font-mono mt-1">
              Order ID: {order.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-8 space-y-8 flex-1">
          {/* Status & Date */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide border ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(order.createdAt)}
              </span>
            </div>
            {order.rejectionReason && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-sm text-red-800">
                <span className="font-bold block mb-1">Alasan Penolakan:</span>
                {order.rejectionReason}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Customer & Items */}
            <div className="space-y-8">
              {/* Customer Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                  <MdPerson className="text-gray-400" /> Info Pelanggan
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div>
                    <span className="block text-gray-500 text-xs uppercase tracking-wide mb-1">
                      Nama Pengguna
                    </span>
                    <span className="font-mono text-sm font-medium text-gray-900 block break-all">
                      {order.username}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs uppercase tracking-wide mb-1">
                      Metode Pengiriman
                    </span>
                    <div className="flex items-center gap-2 font-bold text-gray-900 capitalize">
                      {order.deliveryMethod === 'delivery' ? (
                        <MdDeliveryDining className="text-orange-500" />
                      ) : (
                        <MdStorefront className="text-teal-500" />
                      )}
                      {order.deliveryMethod}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List - Simplified */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                  <MdRestaurant className="text-gray-400" /> Menu Pesanan
                </h3>
                <ul className="space-y-0 divide-y divide-gray-100">
                  {order.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      {item.imageUrl && (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg shrink-0 overflow-hidden relative">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} x {formatIDR(item.price)}
                        </p>
                      </div>
                      <div className="font-bold text-gray-900">
                        {formatIDR(item.subtotal)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Payment & Proof */}
            <div className="space-y-8">
              {/* Payment Summary */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                  <MdReceiptLong className="text-gray-400" /> Rincian Biaya
                </h3>
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 text-sm shadow-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal Menu</span>
                    <span>{formatIDR(order.itemsTotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Biaya Aplikasi</span>
                    <span>{formatIDR(order.appFee)}</span>
                  </div>
                  {order.deliveryMethod === 'delivery' && (
                    <div className="flex justify-between text-gray-600">
                      <span>Ongkos Kirim</span>
                      <span>{formatIDR(order.deliveryFee)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-gray-900">
                    <span>Total Bayar</span>
                    <span>{formatIDR(order.totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Proof */}
              {order.paymentProofUrl && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 pb-1">
                    Bukti Transfer
                  </h3>
                  <div
                    className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => onViewProof(order.paymentProofUrl!)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={order.paymentProofUrl}
                      alt="Bukti Transfer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                      <div className="bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-lg">
                        <MdImage className="inline mr-1 text-lg" /> Lihat Full
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 sm:rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-all shadow-lg shadow-gray-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
