export const login = async (username, password) => {
  console.log('Sending:', { username, password });

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
  return fetch('http://localhost:8000/api/auth/me/', {
    credentials: 'include',
  });
};
