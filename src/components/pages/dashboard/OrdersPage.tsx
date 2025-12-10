'use client';

import OrderDetailModal from '@/components/features/orders/OrderDetailModal';
import { useState } from 'react';
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

// --- Types matched to API Response ---

type OrderStatus =
  | 'waiting_confirmation'
  | 'processing'
  | 'ready'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'pending_payment';
type DeliveryMethod = 'pickup' | 'delivery';

interface OrderItem {
  menuItemId: string;
  name: string;
  price: string | number; // API might return string or number based on example
  imageUrl: string;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  userId: string;
  stallId: string;
  stallName: string;
  items: OrderItem[];
  itemsTotal: number;
  appFee: number;
  deliveryMethod: DeliveryMethod;
  deliveryFee: number;
  totalPrice: number;
  paymentProofUrl: string | null;
  status: OrderStatus;
  rejectionReason: string | null;
  isReviewed: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Mock Data (Response structure matched) ---

const MOCK_ORDERS_DATA: Order[] = [
  {
    id: '864359f3-ef12-48ad-bea0-2a805e73af24',
    userId: '0bE2MBaWbGeC1qLUxXWN0IIAoqr1',
    stallId: '5f637f13-65e2-44ad-94d3-bde2c6d42254',
    stallName: 'Warung Bu Siti',
    items: [
      {
        menuItemId: '97272448-cf0d-4477-88d3-466e7a751acf',
        name: 'Nasi Goreng Special',
        price: '15000',
        imageUrl: '', // Placeholder if empty
        quantity: 1,
        subtotal: 15000,
      },
    ],
    itemsTotal: 15000,
    appFee: 1000,
    deliveryMethod: 'delivery',
    deliveryFee: 5000,
    totalPrice: 21000,
    paymentProofUrl: 'https://placehold.co/400x600/png?text=Bukti+Transfer', // Dummy URL
    status: 'completed',
    rejectionReason: null,
    isReviewed: true,
    createdAt: '2025-12-10T05:01:39.065Z',
    updatedAt: '2025-12-10T09:26:58.782Z',
  },
  {
    id: 'adf7a77e-0a2c-4f25-b795-4b1bf5572296',
    userId: '0bE2MBaWbGeC1qLUxXWN0IIAoqr1',
    stallId: '5f637f13-65e2-44ad-94d3-bde2c6d42254',
    stallName: 'Warung Bu Siti',
    items: [
      {
        menuItemId: '97272448-cf0d-4477-88d3-466e7a751acf',
        name: 'Nasi Goreng Special',
        price: 15000,
        imageUrl: '',
        quantity: 1,
        subtotal: 15000,
      },
    ],
    itemsTotal: 15000,
    appFee: 1000,
    deliveryMethod: 'pickup',
    deliveryFee: 0,
    totalPrice: 16000,
    paymentProofUrl: 'https://placehold.co/400x600/png?text=Bukti+Transfer',
    status: 'waiting_confirmation',
    rejectionReason: null,
    isReviewed: false,
    createdAt: '2025-12-10T04:58:06.165Z',
    updatedAt: '2025-12-10T04:58:06.165Z',
  },
  {
    id: 'order_processing_1',
    userId: 'user_123',
    stallId: '5f637f13-65e2-44ad-94d3-bde2c6d42254',
    stallName: 'Warung Bu Siti',
    items: [
      {
        menuItemId: 'menu_002',
        name: 'Es Teh Manis',
        price: 5000,
        imageUrl: '',
        quantity: 2,
        subtotal: 10000,
      },
    ],
    itemsTotal: 10000,
    appFee: 1000,
    deliveryMethod: 'pickup',
    deliveryFee: 0,
    totalPrice: 11000,
    paymentProofUrl: 'https://placehold.co/400x600/png?text=Bukti+Transfer',
    status: 'processing',
    rejectionReason: null,
    isReviewed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'order_ready_1',
    userId: 'user_456',
    stallId: '5f637f13-65e2-44ad-94d3-bde2c6d42254',
    stallName: 'Warung Bu Siti',
    items: [
      {
        menuItemId: 'menu_003',
        name: 'Ayam Bakar',
        price: 20000,
        imageUrl: '',
        quantity: 1,
        subtotal: 20000,
      },
    ],
    itemsTotal: 20000,
    appFee: 1000,
    deliveryMethod: 'delivery',
    deliveryFee: 5000,
    totalPrice: 26000,
    paymentProofUrl: 'https://placehold.co/400x600/png?text=Bukti+Transfer',
    status: 'ready',
    rejectionReason: null,
    isReviewed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
    case 'cancelled':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200 flex items-center gap-1.5">
          <MdCancel size={14} /> Dibatalkan
        </span>
      );
    case 'rejected':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1.5">
          <MdClose size={14} /> Ditolak
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
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS_DATA);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedOrderIdToReject, setSelectedOrderIdToReject] = useState<
    string | null
  >(null);

  // Filter Logic
  // Filter Logic
  const filteredOrders = orders.filter((order) => {
    // Tab Filtering
    if (activeTab === 'HISTORY') {
      return ['completed', 'cancelled', 'rejected'].includes(order.status);
    }

    // Active Tab (Now functioning as Main list with filters)
    if (activeTab === 'ACTIVE') {
      if (statusFilter !== 'all') {
        return order.status === statusFilter;
      }
      // If 'all', show everything except maybe cancelled if not in list?
      // Or show everything including history since user added 'Selesai' filter.
      // Let's show everything to be flexible.
      return true;
    }

    return true;
  });

  // Sort by date (newest first)
  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // --- Actions ---

  const handleConfirmOrder = (orderId: string) => {
    // API Call: PATCH /orders/my-stall/orders/:orderId/confirm
    console.log(`Confirming order: ${orderId}`);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'processing', updatedAt: new Date().toISOString() }
          : o,
      ),
    );
  };

  const handleMarkReady = (orderId: string) => {
    // API Call: PATCH /orders/my-stall/orders/:orderId/ready
    console.log(`Marking ready: ${orderId}`);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'ready', updatedAt: new Date().toISOString() }
          : o,
      ),
    );
  };

  const handleCompleteOrder = (orderId: string) => {
    // API Call: PATCH /orders/my-stall/orders/:orderId/complete
    console.log(`Completing order: ${orderId}`);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'completed', updatedAt: new Date().toISOString() }
          : o,
      ),
    );
  };

  const openRejectModal = (orderId: string) => {
    setSelectedOrderIdToReject(orderId);
    setRejectModalOpen(true);
  };

  const handleRejectOrder = (reason: string) => {
    if (!selectedOrderIdToReject) return;
    // API Call: PATCH /orders/my-stall/orders/:orderId/reject
    console.log(
      `Rejecting order ${selectedOrderIdToReject} with reason: ${reason}`,
    );
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrderIdToReject
          ? {
              ...o,
              status: 'rejected',
              rejectionReason: reason,
              updatedAt: new Date().toISOString(),
            }
          : o,
      ),
    );
    setRejectModalOpen(false);
    setSelectedOrderIdToReject(null);
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
            {orders.length}
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
            { id: 'rejected', label: 'Ditolak' },
            { id: 'completed', label: 'Selesai' },
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
                  {['completed', 'rejected', 'cancelled'].includes(
                    order.status,
                  ) &&
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
