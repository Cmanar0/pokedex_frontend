export const login = async (username, password) => {
  return fetch('http://localhost:8000/api/auth/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Send and receive session cookie
    body: JSON.stringify({ username, password }),
  });
};

export const logout = async () => {
  return fetch('http://localhost:8000/api/auth/logout/', {
    method: 'POST',
    credentials: 'include',
  });
};

// Optional: Check authentication status
export const checkAuth = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/auth/me/', {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Status ${response.status}: Unauthorized or forbidden`);
    }

    const data = await response.json();
    console.log('CheckAuth result:', data);
    return data;
  } catch (error) {
    console.error('CheckAuth failed:', error.message);
    return null;
  }
};
