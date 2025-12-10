import { getToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Helper function for authenticated API calls
 */
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {},
) {
  const token = getToken();

  if (!token) {
    throw new Error('Token tidak ditemukan. Silakan login kembali.');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    // Clear auth data and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/login';
    throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
  }

  return response;
}

/**
 * Helper to handle API response
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Terjadi kesalahan pada server');
  }

  return data.data;
}
