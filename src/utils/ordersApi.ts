import { authenticatedFetch, handleApiResponse } from './api';

/**
 * Order Status Types
 */
export type OrderStatus =
  | 'waiting_confirmation'
  | 'processing'
  | 'ready'
  | 'completed'
  | 'rejected'
  | 'pending_payment';

export type DeliveryMethod = 'pickup' | 'delivery';

/**
 * Order Item Interface
 */
export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  subtotal: number;
}

/**
 * Order Interface - matches backend response
 */
export interface Order {
  id: string;
  username: string; // Username pembeli
  stallId: string;
  stallName: string;
  stallImageUrl: string;
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

/**
 * Pagination Meta
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Orders Response with Pagination
 */
export interface OrdersResponse {
  data: Order[];
  meta: PaginationMeta;
}

/**
 * Get all orders for the current stall owner
 */
export async function getStallOrders(
  status?: OrderStatus | 'all',
  page: number = 1,
  limit: number = 10,
): Promise<OrdersResponse> {
  // Build query params
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status && status !== 'all') {
    params.append('status', status);
  }

  const response = await authenticatedFetch(
    `/orders/my-stall/orders?${params}`,
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Gagal mengambil orders');
  }

  return {
    data: result.data,
    meta: result.meta,
  };
}

/**
 * Get order detail by ID
 */
export async function getOrderDetail(orderId: string): Promise<Order> {
  const response = await authenticatedFetch(
    `/orders/my-stall/orders/${orderId}`,
  );
  return handleApiResponse<Order>(response);
}

/**
 * Confirm payment - waiting_confirmation → processing
 */
export async function confirmPayment(orderId: string): Promise<Order> {
  const response = await authenticatedFetch(
    `/orders/my-stall/orders/${orderId}/confirm`,
    {
      method: 'PATCH',
    },
  );
  return handleApiResponse<Order>(response);
}

/**
 * Reject payment - waiting_confirmation → rejected
 */
export async function rejectPayment(
  orderId: string,
  reason: string,
): Promise<Order> {
  const response = await authenticatedFetch(
    `/orders/my-stall/orders/${orderId}/reject`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    },
  );
  return handleApiResponse<Order>(response);
}

/**
 * Mark order ready - processing → ready
 */
export async function markOrderReady(orderId: string): Promise<Order> {
  const response = await authenticatedFetch(
    `/orders/my-stall/orders/${orderId}/ready`,
    {
      method: 'PATCH',
    },
  );
  return handleApiResponse<Order>(response);
}

/**
 * Complete order - ready → completed
 */
export async function completeOrder(orderId: string): Promise<Order> {
  const response = await authenticatedFetch(
    `/orders/my-stall/orders/${orderId}/complete`,
    {
      method: 'PATCH',
    },
  );
  return handleApiResponse<Order>(response);
}
