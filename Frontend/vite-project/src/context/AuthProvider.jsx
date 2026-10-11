import { useState } from 'react';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  // localstorage se saved user aur token nikal rahe
  const savedToken = localStorage.getItem('token') || '';

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(savedToken);

  // login hone pe state aur localstorage update karenge
  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  // logout karne pe state aur storage clean karenge
  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        userRole: user ? user.role : null,
        isAuthenticated: token !== '',
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
