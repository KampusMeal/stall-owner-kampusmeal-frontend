import { authenticatedFetch } from './api';

// --- Types ---

export enum StallCategory {
  INDONESIAN_FOOD = 'Indonesian Food',
  FAST_FOOD = 'Fast Food',
  BEVERAGES = 'Beverages',
  SNACKS = 'Snacks',
  DESSERTS = 'Desserts',
  ASIAN_FOOD = 'Asian Food',
  WESTERN_FOOD = 'Western Food',
  HALAL_FOOD = 'Halal Food',
  VEGETARIAN = 'Vegetarian',
  OTHERS = 'Others',
}

export interface Stall {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  stallImageUrl: string;
  qrisImageUrl: string;
  category: StallCategory;
  foodTypes: string[];
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface StallResponse {
  statusCode: number;
  message: string;
  data: Stall;
}

export interface UpdateStallDto {
  name?: string;
  description?: string;
  category?: StallCategory;
  foodTypes?: string[];
  image?: File;
  qrisImage?: File;
}

// --- API Functions ---

// Helper to normalize stall data
function normalizeStallData(data: unknown): Stall {
  const stall = { ...(data as Stall) };

  // Ensure foodTypes is an array
  if (typeof stall.foodTypes === 'string') {
    try {
      stall.foodTypes = JSON.parse(stall.foodTypes);
    } catch (e) {
      console.warn('Failed to parse foodTypes JSON:', e);
      stall.foodTypes = [];
    }
  }

  // Fallback if still not an array
  if (!Array.isArray(stall.foodTypes)) {
    stall.foodTypes = [];
  }

  return stall;
}

/**
 * Get my stall profile
 */
export async function getMyStall(): Promise<Stall> {
  const response = await authenticatedFetch('/stalls/my-stall');
  const result: StallResponse = await response.json();
  return normalizeStallData(result.data);
}

/**
 * Update my stall profile
 */
export async function updateMyStall(dto: UpdateStallDto): Promise<Stall> {
  const formData = new FormData();

  if (dto.name) formData.append('name', dto.name);
  if (dto.description) formData.append('description', dto.description);
  if (dto.category) formData.append('category', dto.category);

  if (dto.foodTypes && dto.foodTypes.length > 0) {
    // foodTypes must be sent as JSON string according to doc
    formData.append('foodTypes', JSON.stringify(dto.foodTypes));
  }

  if (dto.image) {
    formData.append('image', dto.image);
  }

  if (dto.qrisImage) {
    formData.append('qrisImage', dto.qrisImage);
  }

  const response = await authenticatedFetch('/stalls/my-stall', {
    method: 'PATCH',
    body: formData,
    // Content-Type header is set automatically by browser for FormData
  });

  const result: StallResponse = await response.json();
  return normalizeStallData(result.data);
}

/**
 * Delete my stall
 */
export async function deleteMyStall(): Promise<void> {
  const response = await authenticatedFetch('/stalls/my-stall', {
    method: 'DELETE',
  });

  if (!response.ok) {
    // In case delete returns an error object, parse it
    // But authenticatedFetch throws on 401.
    // If it's 400 or 500 we might want to throw custom error
    const result = await response.json();
    throw new Error(result.message || 'Gagal menghapus warung');
  }
}

/**
 * Validate image file
 */
export function validateImage(file: File): string | null {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return 'Format file tidak valid. Harus JPG, PNG, atau WebP';
  }

  if (file.size > maxSize) {
    return 'File terlalu besar. Maksimal 5MB';
  }

  return null;
}
