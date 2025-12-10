import { authenticatedFetch } from './api';

// --- Types ---

export type ReviewRating = 1 | 2 | 3 | 4 | 5;
export type SortBy = 'createdAt' | 'rating';
export type SortOrder = 'asc' | 'desc';

export interface Review {
  id: string;
  orderId: string;
  userId: string;
  stallId: string;
  stallName: string;
  userName: string;
  rating: number;
  comment: string;
  tags: string[];
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReviewResponse {
  statusCode: number;
  message: string;
  data: Review[];
  meta: ReviewMeta;
}

export interface ReviewQueryParams {
  rating?: ReviewRating;
  page?: number;
  limit?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}

export enum PositiveTag {
  PORSI_BESAR = 'Porsi Besar',
  ENAK_BANGET = 'Enak Banget',
  HARGA_TERJANGKAU = 'Harga Terjangkau',
  CEPAT_DISAJIKAN = 'Cepat Disajikan',
  BERSIH_HIGIENIS = 'Bersih & Higienis',
  PELAYANAN_RAMAH = 'Pelayanan Ramah',
  BUMBU_PAS = 'Bumbu Pas',
  MASIH_HANGAT = 'Masih Hangat',
  BAHAN_SEGAR = 'Bahan Segar',
  LOKASI_STRATEGIS = 'Lokasi Strategis',
}

export enum NegativeTag {
  LAMA_PENYAJIAN = 'Lama Penyajian',
  AGAK_MAHAL = 'Agak Mahal',
  PORSI_KECIL = 'Porsi Kecil',
  KURANG_BUMBU = 'Kurang Bumbu',
  SUDAH_DINGIN = 'Sudah Dingin',
  KURANG_HIGIENIS = 'Kurang Higienis',
}

// --- API Functions ---

/**
 * Get all reviews for stall owner
 */
export async function getReviews(
  params?: ReviewQueryParams,
): Promise<ReviewResponse> {
  // Build query string
  const queryParams = new URLSearchParams();
  if (params?.rating) queryParams.append('rating', params.rating.toString());
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sortBy)
    queryParams.append('sortBy', params.sortBy || 'createdAt');
  if (params?.sortOrder)
    queryParams.append('sortOrder', params.sortOrder || 'desc');

  const response = await authenticatedFetch(
    `/reviews/my-stall/reviews?${queryParams.toString()}`,
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Gagal mengambil reviews');
  }

  return result;
}

// --- Helper Functions ---

/**
 * Calculate average rating from reviews
 */
export function calculateAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Number((sum / reviews.length).toFixed(1));
}

/**
 * Group reviews by rating for stats
 */
export function groupByRating(reviews: Review[]): Record<number, Review[]> {
  return reviews.reduce(
    (acc, review) => {
      if (!acc[review.rating]) {
        acc[review.rating] = [];
      }
      acc[review.rating].push(review);
      return acc;
    },
    {} as Record<number, Review[]>,
  );
}

/**
 * Get most common tags
 */
export function getMostCommonTags(
  reviews: Review[],
  limit = 10,
): Array<{ tag: string; count: number }> {
  const tagCounts: Record<string, number> = {};

  reviews.forEach((review) => {
    review.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
