'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function BrandThemeSync() {
  const pathname = usePathname();

  useEffect(() => {
    let brand = 'nicefood';
    if (!pathname) {
      brand = 'nicefood';
    } else if (pathname.includes('/brand/tamoush')) {
      brand = 'tamoush';
    } else if (pathname.includes('/brand/ibn-el-asoul')) {
      brand = 'ibn-el-asoul';
    } else if (pathname.includes('/brand/mazaya')) {
      brand = 'mazaya';
    } else if (pathname.includes('/offers')) {
      brand = 'offers';
    } else {
      brand = 'nicefood';
    }

    document.documentElement.setAttribute('data-brand', brand);
  }, [pathname]);

  return null;
}
