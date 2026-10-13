'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  address?: string | null;
  role?: string;
}

interface CustomerAuthContextType {
  customer: CustomerUser | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; phone: string; password: string; address?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateCustomer: (data: Partial<CustomerUser>) => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const STORAGE_KEY = 'nicefood_customer_session';

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCustomer(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse customer session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (phone: string, password: string) => {
    try {
      const res = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'فشل تسجيل الدخول' };
      }

      setCustomer(data.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'حدث خطأ في الاتصال' };
    }
  };

  const register = async (userData: { name: string; phone: string; password: string; address?: string }) => {
    try {
      const res = await fetch('/api/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'فشل إنشاء الحساب' };
      }

      setCustomer(data.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'حدث خطأ في الاتصال' };
    }
  };

  const logout = () => {
    setCustomer(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const updateCustomer = (data: Partial<CustomerUser>) => {
    setCustomer((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoading,
        login,
        register,
        logout,
        updateCustomer,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
