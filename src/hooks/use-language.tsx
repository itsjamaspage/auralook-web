"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'uz' | 'ru' | 'en';

const dictionary = {
  // Hero & Navigation
  heroTitle: { 
    uz: 'Yangi Avlod kiyimlari',
    ru: 'Одежды Нового Поколения',
    en: 'New Generation Clothes'
  },
  heroSub: { 
    uz: 'Kelajak kiyimlarini kiying, merosni his qiling',
    ru: 'Одевай одежду будущего, почувсвтуй наследие',
    en: 'Wear clothes of the future, feel the heritage'
  },
  browseLooks: { 
    uz: 'Qidirish',
    ru: 'Поиск',
    en: 'Explore'
  },
  favorites: {
    uz: 'Saralanganlar',
    ru: 'Избранное',
    en: 'Favorites'
  },
  razmeringiz: {
    uz: 'Razmeringiz',
    ru: 'Ваш размер',
    en: 'Your Size'
  },
  profile: {
    uz: 'Profil',
    ru: 'Профиль',
    en: 'Profile'
  },
  myOrders: { 
    uz: 'Mening buyurtmalarim',
    ru: 'Мои заказы',
    en: 'My Orders'
  },
  logout: { 
    uz: 'Chiqish',
    ru: 'Выйти',
    en: 'Logout'
  },
  login: { 
    uz: 'Kirish',
    ru: 'Войти',
    en: 'Login'
  },
  adminPanel: {
    uz: 'Boshqaruv Paneli',
    ru: 'Панель управления',
    en: 'Admin Panel'
  },

  // Auth Pages
  welcomeBack: { 
    uz: 'Xush kelibsiz',
    ru: 'С возвращением',
    en: 'Welcome Back'
  },
  createAccount: { 
    uz: 'Hisob yaratish',
    ru: 'Создать аккаунт',
    en: 'Create Account'
  },
  accessOrders: { 
    uz: 'Buyurtmalaringiz va o\'lchamlaringizga kiring',
    ru: 'Доступ к вашим заказам и размерам',
    en: 'Access your orders and sizes'
  },
  joinFuture: { 
    uz: 'Moda kelajagiga qo\'shiling',
    ru: 'Присоединяйтесь к будущему моды',
    en: 'Join the future of fashion'
  },
  email: { 
    uz: 'Email',
    ru: 'Email',
    en: 'Email'
  },
  password: { 
    uz: 'Parol',
    ru: 'Пароль',
    en: 'Password'
  },
  telegramUsername: { 
    uz: 'Telegram foydalanuvchi nomi',
    ru: 'Имя пользователя Telegram',
    en: 'Telegram Username'
  },
  emailPlaceholder: { 
    uz: 'ism@misol.com',
    ru: 'имя@пример.ком',
    en: 'name@example.com'
  },
  passwordPlaceholder: { 
    uz: '••••••••',
    ru: '••••••••',
    en: '••••••••'
  },
  telegramPlaceholder: { 
    uz: '@foydalanuvchi',
    ru: '@пользователь',
    en: '@username'
  },
  getStarted: { 
    uz: 'Boshlash',
    ru: 'Начать',
    en: 'Get Started'
  },
  dontHaveAccount: { 
    uz: "Akkauntingiz yo'qmi? Yaratish",
    ru: "Нет аккаунта? Создать",
    en: "Don't have an account? Create"
  },
  alreadyHaveAccount: { 
    uz: 'Hisobingiz bormi? Kirish',
    ru: 'Уже есть аккаунт? Войти',
    en: 'Already have an account? Login'
  },
  processing: { 
    uz: 'Ishlanmoqda...',
    ru: 'Обработка...',
    en: 'Processing...'
  },

  // Look Detail Page
  catalog: {
    uz: 'KATALOG',
    ru: 'КАТАЛОГ',
    en: 'CATALOG'
  },
  status: {
    uz: 'HOLATI',
    ru: 'СТАТУС',
    en: 'STATUS'
  },
  readyForDispatch: {
    uz: 'YUBORISHGA TAYYOR',
    ru: 'ГОТОВ К ОТПРАВКЕ',
    en: 'READY FOR DISPATCH'
  },
  technicalDetails: {
    uz: 'TEXNIK TAFSILOTLAR',
    ru: 'ТЕХНИЧЕСКИЕ ДЕТАЛИ',
    en: 'TECHNICAL DETAILS'
  },
  selectSizeMatrix: {
    uz: 'O\'LCHAMNI TANLANG',
    ru: 'ВЫБЕРИТЕ РАЗМЕР',
    en: 'SELECT SIZE MATRIX'
  },
  executePurchase: {
    uz: 'BUYURTMANI TASDIQLASH',
    ru: 'ИСПОЛНИТЬ ПОКУПКУ',
    en: 'EXECUTE PURCHASE'
  },
  secureCheckout: {
    uz: 'XAVFSIZ TO\'LOV // SHIFRLANGAN SEANS',
    ru: 'БЕЗОПАСНАЯ ОПЛАТА // ЗАШИФРОВАННАЯ СЕССИЯ',
    en: 'SECURE CHECKOUT // ENCRYPTED SESSION'
  },
  estDelivery: {
    uz: 'TAXMINIY: 2-3 KUN',
    ru: 'ОЖИДАНИЕ: 2-3 ДНЯ',
    en: 'EST: 2-3 DAYS'
  },
  freeDeliveryLabel: {
    uz: 'BEPUL YETKAZIB BERISH',
    ru: 'БЕСПЛАТНАЯ ДОСТАВКА',
    en: 'FREE DELIVERY'
  },

  // Cart & Orders
  cart: {
    uz: 'Savatcha',
    ru: 'Корзина',
    en: 'Cart'
  },
  orderPending: {
    uz: 'Tasdiqlanish kutilmoqda',
    ru: 'Ожидает подтверждения',
    en: 'Pending Acceptance'
  },
  orderAccepted: {
    uz: 'Tasdiqlandi',
    ru: 'Принято',
    en: 'Accepted'
  },
  orderShipped: {
    uz: 'Yuborildi',
    ru: 'Отправлено',
    en: 'Shipped'
  },
  orderDelivered: {
    uz: 'Yetkazildi',
    ru: 'Доставлено',
    en: 'Delivered'
  },
  activeOrders: {
    uz: 'Faol buyurtmalar',
    ru: 'Активные заказы',
    en: 'Active Orders'
  },
  acceptOrder: {
    uz: 'Qabul qilish',
    ru: 'Принять',
    en: 'Accept'
  },

  // Toast Notifications
  orderProcessedTitle: {
    uz: 'Buyurtma qabul qilindi',
    ru: 'Заказ обработан',
    en: 'Order Processed'
  },
  orderProcessedDesc: {
    uz: 'Tez orada menejerimiz siz bilan Telegram orqali bog\'lanadi.',
    ru: 'Наш менеджер скоро свяжется с вами в Telegram.',
    en: 'Our manager will contact you on Telegram shortly.'
  },
  orderFailedTitle: {
    uz: 'Xatolik yuz berdi',
    ru: 'Ошибка заказа',
    en: 'Order Failed'
  },
  orderFailedDesc: {
    uz: 'Tizimda xatolik yuz berdi. Iltimos qaytadan urunib ko\'ring.',
    ru: 'Системная ошибка. Пожалуйста, попробуйте еще раз.',
    en: 'System error. Please retry.'
  },
  registrationRequiredTitle: {
    uz: 'Ro\'yxatdan o\'tish kerak',
    ru: 'Требуется регистрация',
    en: 'Registration Required'
  },
  registrationRequiredDesc: {
    uz: 'Buyurtma berish uchun iltimos hisobingizga kiring.',
    ru: 'Пожалуйста, войдите, чтобы оформить заказ.',
    en: 'Please log in to place an order.'
  },

  // Admin Dashboard
  adminDashboard: {
    uz: 'Boshqaruv Paneli',
    ru: 'Панель управления',
    en: 'Admin Dashboard'
  },
  adminDashboardDesc: {
    uz: 'Buyurtmalar va liboslar katalogini boshqarish.',
    ru: 'Управление заказами и каталогом одежды.',
    en: 'Manage orders and the clothing catalog.'
  },
  newLook: {
    uz: 'Yangi Libos',
    ru: 'Новый образ',
    en: 'New Look'
  },
  activeInventory: {
    uz: 'Faol inventar',
    ru: 'Активный инвентарь',
    en: 'Active Inventory'
  },
  visual: {
    uz: 'Rasm',
    ru: 'Изображение',
    en: 'Visual'
  },
  productName: {
    uz: 'Mahsulot nomi',
    ru: 'Название товара',
    en: 'Product Name'
  },
  marketValue: {
    uz: 'Bozor qiymati',
    ru: 'Рыночная стоимость',
    en: 'Market Value'
  },
  operations: {
    uz: 'Amallar',
    ru: 'Операции',
    en: 'Operations'
  },
  emptyCatalog: {
    uz: 'Katalogingiz hozirda bo\'sh.',
    ru: 'Ваш каталог сейчас пуст.',
    en: 'Your catalog is currently empty.'
  },
  createFirstLook: {
    uz: 'Birinchi libosni yarating',
    ru: 'Создать первый образ',
    en: 'Create First Look'
  },

  // New Look Page
  createNewLook: {
    uz: 'Yangi Libos Yaratish',
    ru: 'Создать новый образ',
    en: 'Create New Look'
  },
  createNewLookDesc: {
    uz: 'Yuqori sifatli media va tavsiflarni qo\'shing.',
    ru: 'Добавьте высококачественные медиа и описания.',
    en: 'Add high-quality media and descriptions.'
  },
  uploadImage: {
    uz: 'Rasm yuklash',
    ru: 'Загрузить фото',
    en: 'Upload Photo'
  },
  lookPrice: {
    uz: 'Narxi',
    ru: 'Цена',
    en: 'Price'
  },
  lookDescription: {
    uz: 'Tavsif',
    ru: 'Описание',
    en: 'Description'
  },
  cancel: {
    uz: 'Bekor qilish',
    ru: 'Отмена',
    en: 'Cancel'
  },
  publish: {
    uz: 'Nashr qilish',
    ru: 'Опубликовать',
    en: 'Publish'
  },
  lookSavedSuccess: {
    uz: 'Libos muvaffaqiyatli saqlandi!',
    ru: 'Образ успешно сохранен!',
    en: 'Look saved successfully!'
  },
  viewDetails: {
    uz: 'Batafsil ko\'rish',
    ru: 'Посмотреть детали',
    en: 'View Details'
  },
  curatedLooksSub: {
    uz: 'Bizning stilistlarimiz va AI algoritmlarimiz ushbu kiyimlarni eng yaxshi futuristik ko\'rinish uchun qo\'lda tanlab olishdi.',
    ru: 'Наши стилисты и алгоритмы ИИ вручную отобрали эти наряды для лучшего футуристического образа.',
    en: 'Our stylists and AI algorithms have hand-picked these outfits for the ultimate futuristic look.'
  },

  // Footer
  allRightsReserved: { 
    uz: '© 2026 Auralook.uz. Barcha huquqlar himoyalangan.',
    ru: '© 2026 Auralook.uz. Все права защищены.',
    en: '© 2026 Auralook.uz. All rights reserved.'
  },
  contact: { 
    uz: 'Aloqa',
    ru: 'Контакт',
    en: 'Contact'
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (translations: any) => string;
  dictionary: typeof dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('uz');

  const t = (translations: any): string => {
    if (!translations) return '';
    if (typeof translations === 'string') return translations;
    try {
      return (translations && typeof translations === 'object') 
        ? (translations[lang] || translations['uz'] || translations['en'] || '')
        : String(translations || '');
    } catch (e) {
      return String(translations || '');
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dictionary }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
