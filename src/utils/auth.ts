export async function isAuthenticated(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const token = localStorage.getItem('token');

  if (!token) {
    return false;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/check`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.status === 200;
  } catch {
    return false;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
}

export async function login(emailOrUsername: string, password: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: emailOrUsername,
        password,
      }),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Login gagal');
  }

  // Save token to localStorage and Cookie for Middleware
  localStorage.setItem('token', result.data.token);
  localStorage.setItem('user', JSON.stringify(result.data.user));

  // Set cookie for middleware access
  document.cookie = `token=${result.data.token}; path=/; max-age=3600; SameSite=Strict`;

  return result.data;
}

export async function logout() {
  const token = localStorage.getItem('token');

  try {
    if (token) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/login';
  }
}
