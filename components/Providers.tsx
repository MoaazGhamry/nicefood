'use client';

import React, { ReactNode } from 'react';
import { LocaleProvider } from '@/lib/locale-context';
import { CartProvider } from '@/lib/cart-context';
import { ThemeProvider } from '@/lib/theme-context';
import { CustomerAuthProvider } from '@/lib/customer-auth-context';
import BrandThemeSync from '@/components/BrandThemeSync';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <BrandThemeSync />
      <LocaleProvider>
        <CustomerAuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </CustomerAuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
