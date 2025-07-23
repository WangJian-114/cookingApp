import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

type AuthContextType = {
  userToken: string | null;
  loading: boolean;
  login: (token: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  checkToken: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper para verificar expiración
const isTokenExpired = (token: string | null) => {
  if (!token) return true;
  try {
    const decoded: any = jwtDecode(token);
    if (!decoded.exp) return true;
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch (e) {
    return true;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkToken = useCallback(async () => {
    const token = await AsyncStorage.getItem('ACCESS_TOKEN');
    console.log("Console token : ", token);
    if (!token || isTokenExpired(token)) {
      console.log("Console se expiro o no existe : ", token);
      await AsyncStorage.multiRemove(['ACCESS_TOKEN', 'REFRESH_TOKEN']);
      setUserToken(null);
    } else {
      console.log("Console si existe token : ", token);
      setUserToken(token);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkToken();

    // Opcional: Revalida cada minuto para detectar expiración en tiempo real
    const interval = setInterval(checkToken, 60 * 1000);
    return () => clearInterval(interval);
  }, [checkToken]);

  // Llamá esto en tu login exitoso
  const login = async (token: string, refreshToken: string) => {
    await AsyncStorage.setItem('ACCESS_TOKEN', token);
    await AsyncStorage.setItem('REFRESH_TOKEN', refreshToken);
    setUserToken(token);
  };

  // Llamá esto en logout o token expirado
  const logout = async () => {
    await AsyncStorage.multiRemove(['ACCESS_TOKEN', 'REFRESH_TOKEN']);
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, loading, login, logout, checkToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
