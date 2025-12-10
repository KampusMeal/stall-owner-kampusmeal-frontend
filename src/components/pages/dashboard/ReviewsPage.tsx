'use client';

import {
  calculateAverageRating,
  getMostCommonTags,
  getReviews,
  groupByRating,
  Review,
  ReviewQueryParams,
  ReviewRating,
  SortBy,
  SortOrder,
} from '@/utils/reviewsApi';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdFilterList,
  MdImage,
  MdStar,
  MdStarBorder,
  MdTrendingUp,
} from 'react-icons/md';

/**
 * Star Rating Display
 */
const StarRating = ({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) => {
  return (
    <div className="flex text-yellow-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>
          {i < rating ? (
            <MdStar size={size} />
          ) : (
            <MdStarBorder size={size} className="text-gray-300" />
          )}
        </span>
      ))}
    </div>
  );
};

/**
 * Image Modal
 */
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
        alt="Full size review"
        className="relative max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
      />
      <button className="absolute top-6 right-6 text-white text-sm font-medium opacity-70 hover:opacity-100">
        Tutup (ESC)
      </button>
    </div>
  );
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statsData, setStatsData] = useState<Review[]>([]); // Data for stats (potentially larger set)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters State
  const [ratingFilter, setRatingFilter] = useState<ReviewRating | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Modal State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Initial Data Load
  useEffect(() => {
    fetchReviews();
    fetchStatsData();
  }, [page, ratingFilter, sortBy, sortOrder]);

  async function fetchReviews() {
    setIsLoading(true);
    setError('');
    try {
      const params: ReviewQueryParams = {
        page,
        limit,
        sortBy,
        sortOrder,
        rating: ratingFilter !== 'all' ? ratingFilter : undefined,
      };
      const response = await getReviews(params);
      setReviews(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat ulasan');
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch larger dataset for stats (optional, ensures stats are more representative)
  async function fetchStatsData() {
    try {
      // Just fetch up to 100 recent reviews for stats analysis
      const response = await getReviews({
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setStatsData(response.data);
    } catch (err) {
      console.warn('Failed to fetch stats data', err);
    }
  }

  // --- Derived Stats (from statsData) ---
  const averageRating = calculateAverageRating(statsData);
  const groupedRatings = groupByRating(statsData);
  const totalReviewsCount = statsData.length;
  const commonTags = getMostCommonTags(statsData, 5);

  const getRatingPercentage = (stars: number) => {
    if (totalReviewsCount === 0) return 0;
    const count = groupedRatings[stars]?.length || 0;
    return (count / totalReviewsCount) * 100;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-dark">Ulasan & Rating</h1>
        <p className="text-gray-500 text-sm">Analisis ulasan pelanggan</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Rating Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="text-5xl font-bold text-text-dark mb-2">
            {averageRating}
          </div>
          <div className="flex gap-1 mb-2">
            <StarRating rating={Math.round(averageRating)} size={24} />
          </div>
          <p className="text-sm text-gray-400">
            Rata-rata dari {totalReviewsCount} ulasan
          </p>
        </div>

        {/* Rating Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
          <h3 className="font-bold text-text-dark text-sm mb-4">
            Distribusi Rating
          </h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="w-6 font-medium text-gray-500 flex items-center gap-1">
                  {star} <MdStar className="text-gray-300" size={12} />
                </span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${getRatingPercentage(star)}%` }}
                  />
                </div>
                <span className="w-10 text-right text-gray-400 text-xs">
                  {groupedRatings[star]?.length || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tags */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-text-dark text-sm mb-4 flex items-center gap-2">
            <MdTrendingUp className="text-primary" /> Apa kata mereka?
          </h3>
          <div className="flex flex-wrap gap-2">
            {commonTags.length > 0 ? (
              commonTags.map(({ tag, count }) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium border border-orange-100 flex items-center gap-1.5"
                >
                  {tag}
                  <span className="bg-white/50 px-1.5 py-0.5 rounded text-[10px]">
                    {count}
                  </span>
                </span>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Belum ada tags</p>
            )}
          </div>
        </div>
      </div>

      {/* Filters & Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-2 text-sm text-gray-500 min-w-max">
            <MdFilterList /> Filter:
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setRatingFilter('all');
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                ratingFilter === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua
            </button>
            {[5, 4, 3, 2, 1].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRatingFilter(r as ReviewRating);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
                  ratingFilter === r
                    ? 'bg-yellow-500 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {r}{' '}
                <MdStar
                  size={12}
                  className={
                    ratingFilter === r ? 'text-white' : 'text-yellow-400'
                  }
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSort, newOrder] = e.target.value.split('-');
              setSortBy(newSort as SortBy);
              setSortOrder(newOrder as SortOrder);
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto"
          >
            <option value="createdAt-desc">Terbaru</option>
            <option value="createdAt-asc">Terlama</option>
            <option value="rating-desc">Rating Tertinggi</option>
            <option value="rating-asc">Rating Terendah</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-[400px]">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 text-sm">Memuat ulasan review...</p>
          </div>
        ) : error ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
              <MdClose size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Terjadi Kesalahan
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => fetchReviews()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600"
            >
              Coba Lagi
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <MdStar className="text-gray-300 text-4xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Belum Ada Ulasan
            </h3>
            <p className="text-gray-500 max-w-sm">
              Belum ada ulasan yang sesuai dengan filter ini. Ulasan akan muncul
              setelah pelanggan menyelesaikan pesanan.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100">
                      {review.userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-text-dark text-sm">
                        {review.userName}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString(
                          'id-ID',
                          {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-100">
                    <div className="flex text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <MdStar
                          key={i}
                          size={14}
                          className={
                            i < review.rating ? 'opacity-100' : 'opacity-30'
                          }
                        />
                      ))}
                    </div>
                    <span className="font-bold text-yellow-700 text-sm">
                      {review.rating}.0
                    </span>
                  </div>
                </div>

                {review.comment && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {review.comment}
                  </p>
                )}

                {/* Tags */}
                {review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {review.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-medium border border-gray-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Images */}
                {review.imageUrls.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {review.imageUrls.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(url)}
                        className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-gray-100 group"
                      >
                        <Image
                          src={url}
                          alt="Review"
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <MdImage className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-6 gap-4">
          <p className="text-sm text-gray-500">
            Menampilkan{' '}
            <span className="font-medium text-text-dark">
              {(page - 1) * limit + 1}
            </span>{' '}
            -{' '}
            <span className="font-medium text-text-dark">
              {Math.min(page * limit, (page - 1) * limit + reviews.length)}
            </span>{' '}
            dari{' '}
            <span className="font-medium text-text-dark">{totalItems}</span>{' '}
            ulasan
          </p>

          <div className="flex items-center gap-1">
            {/* Previous Button */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`p-2 rounded-lg border transition-all ${
                page === 1
                  ? 'border-transparent text-gray-300 cursor-not-allowed'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary active:scale-95'
              }`}
            >
              <MdChevronLeft size={20} />
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {/* Show limited page numbers if too many */}
              {(() => {
                return Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`min-w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                        page === p
                          ? 'bg-primary text-white shadow-sm shadow-orange-200'
                          : 'text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  ),
                );
              })()}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`p-2 rounded-lg border transition-all ${
                page === totalPages
                  ? 'border-transparent text-gray-300 cursor-not-allowed'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary active:scale-95'
              }`}
            >
              <MdChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Logic for Image Modal */}
      <ImageModal url={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
}
