import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEMO_USERS = {
  admin: {
    user_id: 6,
    name: "Admin User",
    email: "admin@bookhive.com",
    role: "ADMIN",
    status: "active",
    joined: "2024-12-01",
    avatar: null
  },
  user: {
    user_id: 1,
    name: "Alice Johnson",
    email: "alice@university.edu",
    role: "USER",
    status: "active",
    joined: "2025-01-15",
    avatar: null
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const savedUser = localStorage.getItem('archivalia_user');
    const savedToken = localStorage.getItem('archivalia_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock authentication
    if ((email === 'admin@bookhive.com' || email === 'admin@archivalia.com') && password === 'admin123') {
      const userData = DEMO_USERS.admin;
      const mockToken = 'eyJhbGciOiJIUzI1NiJ9.admin.mock-jwt-token';
      setUser(userData);
      setToken(mockToken);
      localStorage.setItem('archivalia_user', JSON.stringify(userData));
      localStorage.setItem('archivalia_token', mockToken);
      return { success: true, user: userData };
    } else if (email === 'alice@university.edu' && password === 'user123') {
      const userData = DEMO_USERS.user;
      const mockToken = 'eyJhbGciOiJIUzI1NiJ9.user.mock-jwt-token';
      setUser(userData);
      setToken(mockToken);
      localStorage.setItem('archivalia_user', JSON.stringify(userData));
      localStorage.setItem('archivalia_token', mockToken);
      return { success: true, user: userData };
    }

    return { success: false, message: 'Invalid email or password' };
  };

  const register = async (name, email, password) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock registration
    const newUser = {
      user_id: Date.now(),
      name,
      email,
      role: "USER",
      status: "active",
      joined: new Date().toISOString().split('T')[0],
      avatar: null
    };

    const mockToken = 'eyJhbGciOiJIUzI1NiJ9.new-user.mock-jwt-token';
    setUser(newUser);
    setToken(mockToken);
    localStorage.setItem('archivalia_user', JSON.stringify(newUser));
    localStorage.setItem('archivalia_token', mockToken);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('archivalia_user');
    localStorage.removeItem('archivalia_token');
  };

  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('archivalia_user', JSON.stringify(updatedUser));
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAdmin,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
