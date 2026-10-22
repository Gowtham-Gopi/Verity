import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY = 'verity_jwt_token';

// Client-side helper to decode JWT payload without external libraries
export function decodeJWT(token) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonStr);
  } catch (err) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup'

  // Verify and load user on initial boot
  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setLoading(false);
        return;
      }

      const decoded = decodeJWT(storedToken);
      const now = Math.floor(Date.now() / 1000);

      // Check if expired
      if (!decoded || (decoded.exp && decoded.exp < now)) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setLoading(false);
        return;
      }

      // Token is valid; fetch fresh user data from /api/auth/me
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(storedToken);
        } else {
          // Token rejected by server
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('[Verity Auth] Could not reach auth server, using decoded JWT claims:', err);
        // Fallback to claims in token
        setUser({
          id: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
          desk: decoded.desk,
          clearance: decoded.clearance
        });
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication rejected by security enclave.');
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    setIsAuthModalOpen(false);
    return data;
  }, []);

  const signup = useCallback(async (userData) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed.');
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    setIsAuthModalOpen(false);
    return data;
  }, []);

  const [authNotice, setAuthNotice] = useState('');

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});
      }
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setAuthNotice('');
    }
  }, [token]);

  const openAuthModal = useCallback((mode = 'login', notice = '') => {
    setAuthModalMode(mode);
    setAuthNotice(notice);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthNotice('');
  }, []);

  return (
    <AuthContext.Provider value={{
      token,
      user,
      isAuthenticated: !!user && !!token,
      loading,
      login,
      signup,
      logout,
      isAuthModalOpen,
      authModalMode,
      setAuthModalMode,
      authNotice,
      setAuthNotice,
      openAuthModal,
      closeAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
