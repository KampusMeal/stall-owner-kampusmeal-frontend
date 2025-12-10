import { authenticatedFetch, handleApiResponse } from './api';

/**
 * Menu Item Interface - matches backend response
 */
export interface MenuItem {
  id: string;
  stallId: string;
  name: string;
  description: string;
  category: string[]; // Array of categories
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Form data for creating/updating menu items
 */
export interface MenuFormInput {
  name: string;
  description: string;
  category: string[]; // Array of categories
  price: number;
  image?: File;
  isAvailable: boolean;
}

/**
 * Get all menu items for the current stall owner
 */
export async function getMenuItems(): Promise<MenuItem[]> {
  const response = await authenticatedFetch('/stalls/my-stall/menu-items');
  return handleApiResponse<MenuItem[]>(response);
}

/**
 * Get a single menu item by ID
 */
export async function getMenuItem(id: string): Promise<MenuItem> {
  const response = await authenticatedFetch(
    `/stalls/my-stall/menu-items/${id}`,
  );
  return handleApiResponse<MenuItem>(response);
}

/**
 * Create a new menu item
 */
export async function createMenuItem(data: MenuFormInput): Promise<MenuItem> {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('category', JSON.stringify(data.category)); // Send as JSON array
  formData.append('price', data.price.toString());
  formData.append('isAvailable', data.isAvailable.toString());

  if (data.image) {
    formData.append('image', data.image);
  }

  const response = await authenticatedFetch('/stalls/my-stall/menu-items', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
  });

  return handleApiResponse<MenuItem>(response);
}

/**
 * Update an existing menu item
 */
export async function updateMenuItem(
  id: string,
  data: Partial<MenuFormInput>,
): Promise<MenuItem> {
  const formData = new FormData();

  if (data.name !== undefined) {
    formData.append('name', data.name);
  }
  if (data.description !== undefined) {
    formData.append('description', data.description);
  }
  if (data.category !== undefined) {
    formData.append('category', JSON.stringify(data.category)); // Send as JSON array
  }
  if (data.price !== undefined) {
    formData.append('price', data.price.toString());
  }
  if (data.isAvailable !== undefined) {
    formData.append('isAvailable', data.isAvailable.toString());
  }
  if (data.image) {
    formData.append('image', data.image);
  }

  const response = await authenticatedFetch(
    `/stalls/my-stall/menu-items/${id}`,
    {
      method: 'PATCH',
      body: formData,
    },
  );

  return handleApiResponse<MenuItem>(response);
}

/**
 * Delete a menu item
 */
export async function deleteMenuItem(id: string): Promise<void> {
  const response = await authenticatedFetch(
    `/stalls/my-stall/menu-items/${id}`,
    {
      method: 'DELETE',
    },
  );

  await handleApiResponse<null>(response);
}

/**
 * Validate image file before upload
 */
export function validateImage(file: File): string | null {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return 'Format file harus JPG, PNG, atau WebP';
  }

  // Check file size (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return 'Ukuran file maksimal 5MB';
  }

  return null; // Valid
}
