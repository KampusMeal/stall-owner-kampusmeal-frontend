'use client';

import OrderDetailModal from '@/components/features/orders/OrderDetailModal';
import type { Order, OrderStatus } from '@/utils/ordersApi';
import {
  completeOrder as apiCompleteOrder,
  confirmPayment as apiConfirmPayment,
  markOrderReady as apiMarkOrderReady,
  rejectPayment as apiRejectPayment,
  getStallOrders,
} from '@/utils/ordersApi';
import { useEffect, useState } from 'react';
import {
  MdAccessTime,
  MdCancel,
  MdCheckCircle,
  MdClose,
  MdDeliveryDining,
  MdDoneAll,
  MdFilterList,
  MdHistory,
  MdImage,
  MdRestaurant,
  MdStorefront,
} from 'react-icons/md';

// --- Types ---
type DeliveryMethod = 'pickup' | 'delivery';

// --- Components ---

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  switch (status) {
    case 'waiting_confirmation':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200 flex items-center gap-1.5">
          <MdAccessTime size={14} /> Menunggu Konfirmasi
        </span>
      );
    case 'processing':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
          <MdRestaurant size={14} /> Sedang Diproses
        </span>
      );
    case 'ready':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5">
          <MdDeliveryDining size={14} /> Siap Diambil/Antar
        </span>
      );
    case 'completed':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1.5">
          <MdCheckCircle size={14} /> Selesai
        </span>
      );
    case 'rejected':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1.5">
          <MdClose size={14} /> Ditolak
        </span>
      );
    case 'pending_payment':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200 flex items-center gap-1.5">
          <MdAccessTime size={14} /> Menunggu Pembayaran
        </span>
      );
    default:
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-500 border border-gray-200">
          {status}
        </span>
      );
  }
};

const DeliveryBadge = ({ method }: { method: DeliveryMethod }) => {
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${method === 'delivery' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-teal-50 text-teal-600 border-teal-100'}`}
    >
      {method === 'delivery' ? (
        <>
          <MdDeliveryDining size={12} /> Delivery
        </>
      ) : (
        <>
          <MdStorefront size={12} /> Pickup
        </>
      )}
    </span>
  );
};

// --- Modals ---

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const RejectModal = ({ isOpen, onClose, onConfirm }: RejectModalProps) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-text-dark">Tolak Pesanan</h3>
        <p className="text-sm text-gray-500">
          Berikan alasan mengapa Anda menolak pesanan ini. Alasan akan
          dikirimkan ke pembeli.
        </p>

        <textarea
          className="w-full h-32 p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary text-sm resize-none"
          placeholder="Contoh: Bukti transfer tidak terbaca / Stok habis / Warung tutup"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex gap-2 justify-end mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            disabled={reason.length < 10}
            onClick={() => onConfirm(reason)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Tolak Pesanan
          </button>
        </div>
      </div>
    </div>
  );
};

const ImageModal = ({
  url,
  onClose,
}: {
  url: string | null;
  onClose: () => void;
}) => {
  if (!url) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Proof"
        className="relative max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
      />
      <button className="absolute top-6 right-6 text-white text-sm font-medium opacity-70 hover:opacity-100">
        Tutup (ESC)
      </button>
    </div>
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedOrderIdToReject, setSelectedOrderIdToReject] = useState<
    string | null
  >(null);

  // Fetch orders on mount and when filter changes
  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  async function fetchOrders() {
    setIsLoading(true);
    setError('');

    try {
      const response = await getStallOrders(
        statusFilter as OrderStatus | 'all',
        1,
        100, // Get all orders for now
      );
      setOrders(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat pesanan');
    } finally {
      setIsLoading(false);
    }
  }

  // Filter Logic
  const filteredOrders = orders.filter((order) => {
    // Tab Filtering
    if (activeTab === 'HISTORY') {
      return ['completed', 'rejected'].includes(order.status);
    }

    // Active Tab
    if (activeTab === 'ACTIVE') {
      if (statusFilter !== 'all') {
        return order.status === statusFilter;
      }
      // Show all active orders (not completed or rejected)
      return !['completed', 'rejected'].includes(order.status);
    }

    return true;
  });

  // Sort by date (newest first)
  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // --- Actions ---

  const handleConfirmOrder = async (orderId: string) => {
    try {
      const updated = await apiConfirmPayment(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal konfirmasi pembayaran');
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      const updated = await apiMarkOrderReady(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal tandai pesanan siap');
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const updated = await apiCompleteOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal selesaikan pesanan');
    }
  };

  const openRejectModal = (orderId: string) => {
    setSelectedOrderIdToReject(orderId);
    setRejectModalOpen(true);
  };

  const handleRejectOrder = async (reason: string) => {
    if (!selectedOrderIdToReject) return;

    try {
      const updated = await apiRejectPayment(selectedOrderIdToReject, reason);
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrderIdToReject ? updated : o)),
      );
      setRejectModalOpen(false);
      setSelectedOrderIdToReject(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menolak pembayaran');
    }
  };

  // Helper
  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'string' ? parseInt(val) : val;
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-gray-500">Memuat pesanan...</p>
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
            onClick={fetchOrders}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Daftar Pesanan</h1>
          <p className="text-gray-500 text-sm">
            Kelola status pesanan dari pelanggan
          </p>
        </div>
        {/* Simple Date Filter Placeholder */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm text-sm text-gray-600">
          <MdFilterList /> Filter Tanggal: Hari Ini
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="border-b border-gray-200 flex gap-6">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`pb-3 text-sm font-medium transition-all relative ${activeTab === 'ACTIVE' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Semua Pesanan
          {/* Counter Badge */}
          <span
            className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'ACTIVE' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}
          >
            {
              orders.filter(
                (o) => !['completed', 'rejected'].includes(o.status),
              ).length
            }
          </span>
          {activeTab === 'ACTIVE' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-3 text-sm font-medium transition-all relative ${activeTab === 'HISTORY' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Riwayat (Arsip)
          {activeTab === 'HISTORY' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      </div>

      {/* Sub-Filters for Active Tab */}
      {activeTab === 'ACTIVE' && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'waiting_confirmation', label: 'Menunggu Konfirmasi' },
            { id: 'processing', label: 'Diproses' },
            { id: 'ready', label: 'Siap Diambil' },
          ].map((status) => (
            <button
              key={status.id}
              onClick={() => setStatusFilter(status.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${statusFilter === status.id ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
            >
              {status.label}
            </button>
          ))}
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {sortedOrders.length > 0 ? (
          sortedOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Top Row: ID, Time, Delivery Method, Status */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 border-b border-gray-50 pb-4">
                <div className="flex items-center gap-3">
                  {/* Customer Avatar Placeholder */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-50 text-orange-600 flex items-center justify-center border border-white shadow-sm">
                    <span className="font-bold text-sm">
                      #{order.id.slice(0, 4)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-text-dark text-sm">
                        Order{' '}
                        <span className="font-mono text-gray-400">
                          #{order.id.slice(0, 8)}
                        </span>
                      </h3>
                      <DeliveryBadge method={order.deliveryMethod} />
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      {formatDate(order.createdAt)} •{' '}
                      {order.items.reduce(
                        (acc, item) => acc + item.quantity,
                        0,
                      )}{' '}
                      Items
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-primary hover:text-orange-700 font-medium ml-2 hover:underline decoration-1 underline-offset-2 transition-all"
                      >
                        Lihat Detail
                      </button>
                    </p>
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {/* Middle: Items List */}
              <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-2">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start text-sm"
                  >
                    <div className="flex gap-2">
                      <div className="w-5 h-5 flex items-center justify-center bg-white rounded border border-gray-200 text-xs font-bold text-gray-600 shrink-0 mt-0.5">
                        {item.quantity}x
                      </div>
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-medium text-text-dark">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom: Totals & Actions */}
              <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="text-right md:text-left w-full md:w-auto">
                  <p className="text-xs text-gray-500">Total Pembayaran</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(order.totalPrice)}
                  </p>
                  {order.deliveryMethod === 'delivery' && (
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      + Ongkir {formatCurrency(order.deliveryFee)}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 w-full md:w-auto">
                  {/* Actions for Waiting Confirmation */}
                  {order.status === 'waiting_confirmation' && (
                    <>
                      <button
                        onClick={() => setSelectedProof(order.paymentProofUrl)}
                        className="flex-1 md:flex-none py-2 px-4 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <MdImage size={16} /> Bukti
                      </button>
                      <button
                        onClick={() => openRejectModal(order.id)}
                        className="flex-1 md:flex-none py-2 px-4 text-sm font-medium border border-red-100 bg-red-50 rounded-xl hover:bg-red-100 text-red-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <MdClose size={16} /> Tolak
                      </button>
                      <button
                        onClick={() => handleConfirmOrder(order.id)}
                        className="flex-1 md:flex-none py-2 px-6 text-sm font-medium bg-primary text-white rounded-xl shadow-sm shadow-orange-200 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                      >
                        <MdCheckCircle size={16} /> Konfirmasi
                      </button>
                    </>
                  )}

                  {/* Actions for Processing */}
                  {order.status === 'processing' && (
                    <button
                      onClick={() => handleMarkReady(order.id)}
                      className="w-full md:w-auto py-2.5 px-6 text-sm font-bold bg-purple-600 text-white rounded-xl shadow-sm shadow-purple-200 hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                    >
                      <MdDeliveryDining size={18} /> Tandai Siap{' '}
                      {order.deliveryMethod === 'delivery'
                        ? 'Dikirim'
                        : 'Diambil'}
                    </button>
                  )}

                  {/* Actions for Ready */}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => handleCompleteOrder(order.id)}
                      className="w-full md:w-auto py-2.5 px-6 text-sm font-bold bg-green-600 text-white rounded-xl shadow-sm shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                      <MdDoneAll size={18} /> Selesaikan Order
                    </button>
                  )}

                  {/* Actions for History (View Proof only maybe) */}
                  {['completed', 'rejected'].includes(order.status) &&
                    order.paymentProofUrl && (
                      <button
                        onClick={() => setSelectedProof(order.paymentProofUrl)}
                        className="text-xs text-gray-500 underline hover:text-primary transition-colors"
                      >
                        Lihat Bukti Bayar
                      </button>
                    )}
                </div>
              </div>

              {/* Rejection Reason Display */}
              {order.status === 'rejected' && order.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex gap-2">
                  <MdCancel className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-xs uppercase opacity-70 mb-1">
                      Alasan Penolakan
                    </span>
                    {order.rejectionReason}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <MdHistory size={32} />
            </div>
            <p className="text-text-dark font-medium">Tidak ada pesanan</p>
            <p className="text-sm text-gray-500">
              Coba ubah filter atau tunggu pesanan baru
            </p>
          </div>
        )}
      </div>

      <ImageModal url={selectedProof} onClose={() => setSelectedProof(null)} />

      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onViewProof={(url) => setSelectedProof(url)}
      />

      {/* Reject Modal */}
      <RejectModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedOrderIdToReject(null);
        }}
        onConfirm={handleRejectOrder}
      />
    </div>
  );
}
