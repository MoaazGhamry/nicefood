'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

type Locale = 'ar' | 'en';

interface Translations {
  [key: string]: string;
}

const translations: Record<Locale, Translations> = {
  ar: {
    // Header
    'nav.home': 'الرئيسية',
    'nav.brands': 'العلامات التجارية',
    'nav.offers': 'العروض',
    'nav.cart': 'السلة',
    'nav.contact': 'تواصل معنا',
    
    // Hero
    'hero.badge': 'أجود المنتجات الغذائية المصرية',
    'hero.title': 'مرحباً بكم في',
    'hero.title2': 'نايس فود',
    'hero.desc': 'شركة مصرية رائدة في صناعة المواد الغذائية عالية الجودة. اكتشف منتجاتنا من فراخ مجمدة، لانشون، سجق وسوسيس.',
    
    // Brands
    'brand.tamoush': 'طعموش',
    'brand.tamoush.desc': 'منتجات غذائية مجمدة عالية الجودة',
    'brand.ibn': 'ابن الأصول',
    'brand.ibn.desc': 'أغذية مصرية أصيلة بأعلى معايير الجودة',
    'brand.mazaya': 'مزايا',
    'brand.mazaya.desc': 'مزايا الطعم الأصيل',
    'brand.offers': 'العروض',
    'brand.offers.desc': 'أقوى العروض والخصومات على منتجاتنا',
    
    // Products
    'product.addToCart': 'أضف للسلة',
    'product.added': 'تم الإضافة',
    'product.kg': 'كجم',
    'product.piece': 'قطعة',
    'product.pack': 'عبوة',
    
    // Categories
    'cat.all': 'الكل',
    'cat.chicken': 'فراخ مجمدة',
    'cat.luncheon': 'لانشون',
    'cat.sausage': 'سجق',
    'cat.cocktail': 'سوسيس',
    'cat.other': 'أخرى',
    
    // Cart
    'cart.title': 'سلة التسوق',
    'cart.empty': 'السلة فارغة',
    'cart.emptyDesc': 'أضف منتجات من متاجرنا لبدء التسوق',
    'cart.summary': 'ملخص الطلب',
    'cart.subtotal': 'المجموع الفرعي',
    'cart.delivery': 'التوصيل',
    'cart.total': 'المجموع الكلي',
    'cart.checkout': 'إتمام الطلب',
    'cart.continueShopping': 'متابعة التسوق',
    'cart.free': 'مجاني',
    'cart.orderViaWhatsapp': 'اطلب عبر واتساب',
    
    // Checkout
    'checkout.title': 'إتمام الطلب',
    'checkout.name': 'الاسم الكامل',
    'checkout.phone': 'رقم الموبايل',
    'checkout.address': 'العنوان التفصيلي',
    'checkout.notes': 'ملاحظات',
    'checkout.paymentMethod': 'طريقة الدفع',
    'checkout.cash': 'الدفع عند الاستلام',
    'checkout.cashDesc': 'ادفع كاش عند التوصيل',
    'checkout.visa': 'Paymob / فيزا وماستركارد',
    'checkout.visaDesc': 'ادفع بالبطاقة البنكية عبر بوابة Paymob',
    'checkout.deliveryTime': 'وقت التوصيل المفضل',
    'checkout.placeOrder': 'تأكيد الطلب',
    'checkout.processing': 'جاري المعالجة...',
    'checkout.success': 'تم الطلب بنجاح',
    'checkout.successDesc': 'هنتواصل معاك لتأكيد الطلب',
    
    // Admin
    'admin.dashboard': 'لوحة التحكم',
    'admin.products': 'المنتجات',
    'admin.orders': 'الطلبات',
    'admin.offers': 'العروض',
    'admin.brands': 'العلامات التجارية',
    'admin.settings': 'الإعدادات',
    'admin.login': 'تسجيل الدخول',
    'admin.email': 'البريد الإلكتروني',
    'admin.password': 'كلمة المرر',
    'admin.loginBtn': 'دخول',
    'admin.addProduct': 'إضافة منتج',
    'admin.editProduct': 'تعديل المنتج',
    'admin.productName': 'اسم المنتج (إنجليزي)',
    'admin.productNameAr': 'اسم المنتج (عربي)',
    'admin.productPrice': 'السعر',
    'admin.productOfferPrice': 'سعر العرض',
    'admin.productCategory': 'التصنيف',
    'admin.productBrand': 'العلامة التجارية',
    'admin.productImage': 'رابط الصورة',
    'admin.productActive': 'نشط',
    'admin.productIsOffer': 'عرض خاص',
    'admin.save': 'حفظ',
    'admin.cancel': 'إلغاء',
    'admin.delete': 'حذف',
    'admin.totalOrders': 'إجمالي الطلبات',
    'admin.totalProducts': 'إجمالي المنتجات',
    'admin.totalRevenue': 'إجمالي الإيرادات',
    'admin.pendingOrders': 'طلبات معلقة',
    'admin.logout': 'تسجيل خروج',
    
    // Footer
    'footer.about': 'عن نايس فود',
    'footer.aboutDesc': 'شركة مصرية رائدة في صناعة المواد الغذائية عالية الجودة في الشرق الأوسط.',
    'footer.links': 'روابط سريعة',
    'footer.brands': 'علاماتنا التجارية',
    'footer.contact': 'تواصل معنا',
    'footer.rights': 'جميع الحقوق محفوظة',
    'footer.location': 'العاشر من رمضان، مصر',

    // General
    'currency': 'ج.م',
    'search': 'بحث...',
    'loading': 'جاري التحميل...',
    'error': 'حدث خطأ',
    'noResults': 'لا توجد نتائج',
  },
  en: {
    // Header
    'nav.home': 'Home',
    'nav.brands': 'Brands',
    'nav.offers': 'Offers',
    'nav.cart': 'Cart',
    'nav.contact': 'Contact',
    
    // Hero
    'hero.badge': 'Premium Egyptian Food Manufacturing',
    'hero.title': 'Welcome to',
    'hero.title2': 'NiceFood',
    'hero.desc': 'A leading Egyptian manufacturer of high quality foods: poultry, luncheon, oriental sausage, and cold cuts.',
    
    // Brands
    'brand.tamoush': 'Taamoosh',
    'brand.tamoush.desc': 'Poultry and frozen foods',
    'brand.ibn': 'Ibn El Asoul',
    'brand.ibn.desc': 'Authentic traditional meats & baladi sausage',
    'brand.mazaya': 'Mazaya',
    'brand.mazaya.desc': 'Premium luncheons & smoked cuts',
    'brand.offers': 'Offers',
    'brand.offers.desc': 'Special factory deals & volume savings',
    
    // Products
    'product.addToCart': 'Add to Cart',
    'product.added': 'Added',
    'product.kg': 'kg',
    'product.piece': 'piece',
    'product.pack': 'pack',
    
    // Categories
    'cat.all': 'All',
    'cat.chicken': 'Frozen Poultry',
    'cat.luncheon': 'Luncheon & Cold Cuts',
    'cat.sausage': 'Baladi Sausage & Kofta',
    'cat.cocktail': 'Hotdogs & Frankfurters',
    'cat.other': 'Other Products',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Cart is Empty',
    'cart.emptyDesc': 'Explore our brand catalogs to add items',
    'cart.summary': 'Order Summary',
    'cart.subtotal': 'Subtotal',
    'cart.delivery': 'Delivery',
    'cart.total': 'Total',
    'cart.checkout': 'Proceed to Checkout',
    'cart.continueShopping': 'Continue Shopping',
    'cart.free': 'Free',
    'cart.orderViaWhatsapp': 'Order via WhatsApp',
    
    // Checkout
    'checkout.title': 'Checkout',
    'checkout.name': 'Full Name',
    'checkout.phone': 'Phone Number',
    'checkout.address': 'Detailed Address',
    'checkout.notes': 'Order Notes',
    'checkout.paymentMethod': 'Payment Method',
    'checkout.cash': 'Cash on Delivery',
    'checkout.cashDesc': 'Pay cash when order is delivered',
    'checkout.visa': 'Paymob / Visa & Mastercard',
    'checkout.visaDesc': 'Pay securely with your credit/debit card via Paymob',
    'checkout.deliveryTime': 'Preferred Delivery Time',
    'checkout.placeOrder': 'Confirm Order',
    'checkout.processing': 'Processing...',
    'checkout.success': 'Order Placed Successfully',
    'checkout.successDesc': 'Our team will contact you to confirm delivery',
    
    // Admin
    'admin.dashboard': 'Dashboard',
    'admin.products': 'Products',
    'admin.orders': 'Orders',
    'admin.offers': 'Offers',
    'admin.brands': 'Brands',
    'admin.settings': 'Settings',
    'admin.login': 'Admin Login',
    'admin.email': 'Email',
    'admin.password': 'Password',
    'admin.loginBtn': 'Login',
    'admin.addProduct': 'Add Product',
    'admin.editProduct': 'Edit Product',
    'admin.productName': 'Product Name (English)',
    'admin.productNameAr': 'Product Name (Arabic)',
    'admin.productPrice': 'Price',
    'admin.productOfferPrice': 'Offer Price',
    'admin.productCategory': 'Category',
    'admin.productBrand': 'Brand',
    'admin.productImage': 'Image URL',
    'admin.productActive': 'Active',
    'admin.productIsOffer': 'Special Offer',
    'admin.save': 'Save',
    'admin.cancel': 'Cancel',
    'admin.delete': 'Delete',
    'admin.totalOrders': 'Total Orders',
    'admin.totalProducts': 'Total Products',
    'admin.totalRevenue': 'Total Revenue',
    'admin.pendingOrders': 'Pending Orders',
    'admin.logout': 'Logout',
    
    // Footer
    'footer.about': 'About NiceFood',
    'footer.aboutDesc': 'A leading Egyptian company in high-quality food manufacturing in the Middle East.',
    'footer.links': 'Quick Links',
    'footer.brands': 'Our Brands',
    'footer.contact': 'Contact Us',
    'footer.rights': 'All rights reserved',
    'footer.location': '10th of Ramadan City, Egypt',

    // General
    'currency': 'EGP',
    'search': 'Search...',
    'loading': 'Loading...',
    'error': 'An error occurred',
    'noResults': 'No results found',
  },
};

interface LocaleContextType {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  t: (key: string) => string;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ar');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nicefood_locale');
      if (saved === 'ar' || saved === 'en') {
        setLocaleState(saved);
      }
    } catch (e) {
      // localStorage may fail in private mode
    }
  }, []);

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('nicefood_locale', locale);
    } catch (e) {}
  }, [locale]);

  const t = useCallback(
    (key: string) => translations[locale][key] || key,
    [locale]
  );

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState(prev => (prev === 'ar' ? 'en' : 'ar'));
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, dir, t, setLocale, toggleLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
