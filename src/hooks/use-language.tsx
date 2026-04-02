
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
  cart: {
    uz: 'Savatcha',
    ru: 'Корзина',
    en: 'Cart'
  },
  razmeringiz: {
    uz: 'O\'lchamingiz',
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
    uz: 'Telegram username',
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
    uz: '@username',
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

  // Profile & Status
  orderHistory: {
    uz: 'Buyurtmalar tarixi',
    ru: 'История заказов',
    en: 'Order History'
  },
  securityProtocols: {
    uz: 'Xavfsizlik protokollari',
    ru: 'Протоколы безопасности',
    en: 'Security Protocols'
  },
  systemPreferences: {
    uz: 'Tizim sozlamalari',
    ru: 'Системные настройки',
    en: 'System Preferences'
  },
  terminateSession: {
    uz: 'Seansni yakunlash',
    ru: 'Завершить сессию',
    en: 'Terminate Session'
  },
  profileControl: {
    uz: 'Profil boshqaruvi',
    ru: 'Управление профилем',
    en: 'Profile Control'
  },
  activeNode: {
    uz: 'Holat: Faol',
    ru: 'Статус: Активен',
    en: 'Status: Active Node'
  },
  identifyingSession: {
    uz: 'Seans aniqlanmoqda...',
    ru: 'Идентификация сеанса...',
    en: 'Identifying Session...'
  },
  synchronizingProfile: {
    uz: 'Profil sinxronizatsiya qilinmoqda...',
    ru: 'Синхронизация профиля...',
    en: 'Synchronizing Profile...'
  },
  cyberVoyager: {
    uz: 'Cyber Voyager',
    ru: 'Cyber Voyager',
    en: 'Cyber Voyager'
  },

  // Checkout Flow
  knowSizeQuestion: {
    uz: "O'lchamingizni bilasizmi?",
    ru: "Вы знаете свой размер?",
    en: "Do you know your size?"
  },
  yesIKnow: {
    uz: "Ha, bilaman",
    ru: "Да, знаю",
    en: "Yes, I know"
  },
  noHelpMe: {
    uz: "Yo'q, yordam bering",
    ru: "Нет, помогите мне",
    en: "No, help me"
  },
  selectSizeTitle: {
    uz: "O'lchamni tanlang",
    ru: "Выберите размер",
    en: "Select Size"
  },
  enterMeasurementsTitle: {
    uz: "O'lchamlaringizni kiriting",
    ru: "Введите свои мерки",
    en: "Enter Measurements"
  },
  managerAdvisory: {
    uz: "Menejerimiz ushbu ma'lumotlar asosida sizga eng mos keladigan o'lchamni tanlab beradi.",
    ru: "Наш менеджер выберет для вас наиболее подходящий размер на основе этих данных.",
    en: "Our manager will select the most suitable size for you based on this information."
  },
  nextStep: {
    uz: "Keyingisi",
    ru: "Далее",
    en: "Next"
  },
  shippingAddress: {
    uz: 'Yetkazib berish manzili',
    ru: 'Адрес доставки',
    en: 'Shipping Address'
  },
  phoneNumber: {
    uz: 'Telefon raqami',
    ru: 'Номер телефона',
    en: 'Phone Number'
  },
  addressPlaceholder: {
    uz: 'Shahar, tuman, ko\'cha...',
    ru: 'Город, район, улица...',
    en: 'City, district, street...'
  },
  phonePlaceholder: {
    uz: '+998 90 123 45 67',
    ru: '+998 90 123 45 67',
    en: '+998 90 123 45 67'
  },
  technicalDetails: {
    uz: 'TEXNIK TAFSILOTLAR',
    ru: 'ТЕХНИЧЕСКИЕ ДЕТАЛИ',
    en: 'TECHNICAL DETAILS'
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

  // Catalog & Filters
  filter: { uz: 'Filtr', ru: 'Фильтр', en: 'Filter' },
  listingsDetected: { uz: 'Liboslar topildi', ru: 'Найдено образов', en: 'Listings Found' },
  filterParameters: { uz: 'Filtr parametrlari', ru: 'Параметры фильтра', en: 'Filter Parameters' },
  currencyUnit: { uz: 'Valyuta', ru: 'Валюта', en: 'Currency' },
  priceRange: { uz: 'Narx oralig\'i', ru: 'Диапазон цен', en: 'Price Range' },
  minPrice: { uz: 'Minimal narx', ru: 'Мин. цена', en: 'Min Price' },
  maxPrice: { uz: 'Maksimal narx', ru: 'Макс. цена', en: 'Max Price' },
  availableNow: { uz: 'Mavjud', ru: 'В наличии', en: 'Available Now' },
  locationTashkent: { uz: 'Toshkent, Mirzo Ulug\'bek', ru: 'Ташкент, Мирзо-Улугбек', en: 'Tashkent, Mirzo Ulugbek' },

  // Admin Dashboard
  adminDashboard: {
    uz: 'Boshqaruv Paneli',
    ru: 'Панель управления',
    en: 'Admin Dashboard'
  },
  inventory: { uz: 'Inventar', ru: 'Инвентарь', en: 'Inventory' },
  orders: { uz: 'Buyurtmalar', ru: 'Заказы', en: 'Orders' },
  customer: { uz: 'Mijoz', ru: 'Клиент', en: 'Customer' },
  outfit: { uz: 'Libos', ru: 'Образ', en: 'Outfit' },
  amount: { uz: 'Summa', ru: 'Сумма', en: 'Amount' },
  status: { uz: 'Holat', ru: 'Статус', en: 'Status' },
  action: { uz: 'Amal', ru: 'Действие', en: 'Action' },
  accept: { uz: 'Qabul qilish', ru: 'Принять', en: 'Accept' },
  delete: { uz: "O'chirish", ru: 'Удалить', en: 'Delete' },
  cancel: { uz: "Bekor qilish", ru: "Отмена", en: "Cancel" },
  confirmDeleteTitle: { uz: "O'chirishni tasdiqlang", ru: 'Подтвердите удаление', en: 'Confirm Deletion' },
  confirmDeleteDesc: { uz: "Ushbu elementni katalogni olib tashlamoqchimisiz?", ru: 'Вы хотите удалить этот элемент из каталога?', en: 'Are you sure you want to remove this item from the catalog?' },

  // Footer
  allRightsReserved: { 
    uz: '© 2026 Auralook.uz. Barcha huquqlar himoyalangan.',
    ru: '© 2026 Auralook.uz. Все права защищены.',
    en: '© 2026 Auralook.uz. All rights reserved.'
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
      return '';
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
