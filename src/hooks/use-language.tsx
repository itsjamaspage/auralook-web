
"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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

  // Cart & Orders
  cart: {
    uz: 'Savatcha',
    ru: 'Корзина',
    en: 'Cart'
  },
  orderPending: {
    uz: 'Tasdiqlanish kutilmoqda',
    ru: 'Ожидает подтверждения',
    en: 'Pending'
  },
  orderAccepted: {
    uz: 'Tasdiqlandi',
    ru: 'Принято',
    en: 'Accepted'
  },
  orderRef: { 
    uz: 'Buyurtma kodi', 
    ru: 'Код заказа', 
    en: 'Order Ref' 
  },
  transactionDate: { 
    uz: 'Tranzaksiya sanasi', 
    ru: 'Дата транзакции', 
    en: 'Transaction Date' 
  },
  total: { 
    uz: 'Jami', 
    ru: 'Итого', 
    en: 'Total' 
  },
  unknown: { 
    uz: 'Noma\'lum', 
    ru: 'Неизвестно', 
    en: 'Unknown' 
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

  // Admin Dashboard
  adminDashboard: {
    uz: 'Boshqaruv Paneli',
    ru: 'Панель управления',
    en: 'Admin Dashboard'
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
  createNewLook: {
    uz: "Yangi Libos Yaratish",
    ru: "Создать новый образ",
    en: "Create New Look"
  },
  createNewLookDesc: {
    uz: "Katalog uchun yangi texnik ko'rinish qo'shing.",
    ru: "Добавьте новый технический образ в каталог.",
    en: "Add a new technical specification to the catalog."
  },
  editCatalogItem: {
    uz: "Katalog elementini tahrirlash",
    ru: "Редактировать элемент каталога",
    en: "Edit Catalog Item"
  },
  editCatalogItemDesc: {
    uz: "Texnik spetsifikatsiyalar va vizual aktivlarni o'zgartiring.",
    ru: "Измените технические характеристики и визуальные ресурсы.",
    en: "Modify technical specifications and visual assets."
  },
  uploadImage: {
    uz: "Rasm Yuklash",
    ru: "Загрузить изображение",
    en: "Upload Image"
  },
  imageUrlPlaceholder: {
    uz: "Yoki rasm URL manzilini kiriting",
    ru: "Или введите URL изображения",
    en: "Or enter Image URL"
  },
  itemName: {
    uz: "Element nomi",
    ru: "Название элемента",
    en: "Item Name"
  },
  lookPrice: {
    uz: "Narxi",
    ru: "Цена",
    en: "Price"
  },
  discountLabel: {
    uz: "Chegirma (%)",
    ru: "Скидка (%)",
    en: "Discount (%)"
  },
  lookDescription: {
    uz: "Tavsif",
    ru: "Описание",
    en: "Description"
  },
  lookDescriptionPlaceholder: {
    uz: "Estetikani tasvirlab bering...",
    ru: "Опишите эстетику...",
    en: "Describe the aesthetic..."
  },
  cancel: {
    uz: "Bekor qilish",
    ru: "Отмена",
    en: "Cancel"
  },
  publish: {
    uz: "Qo'shish",
    ru: "Nashr qilish",
    en: "Publish"
  },
  updateCatalog: {
    uz: "Yangilash",
    ru: "Обновить каталог",
    en: "Update Catalog"
  },
  lookSavedSuccess: {
    uz: "Libos muvaffaqiyatli saqlandi",
    ru: "Образ успешно сохранен",
    en: "Look saved successfully"
  },
  inventory: { uz: 'Inventar', ru: 'Инвентарь', en: 'Inventory' },
  orders: { uz: 'Buyurtmalar', ru: 'Заказы', en: 'Orders' },
  customer: { uz: 'Mijoz', ru: 'Клиент', en: 'Customer' },
  outfit: { uz: 'Libos', ru: 'Образ', en: 'Outfit' },
  amount: { uz: 'Summa', ru: 'Сумма', en: 'Amount' },
  action: { uz: 'Amal', ru: 'Действие', en: 'Action' },
  accept: { uz: 'Qabul qilish', ru: 'Принять', en: 'Accept' },
  confirmDeleteTitle: { uz: "O'chirishni tasdiqlang", ru: 'Подтвердите удаление', en: 'Confirm Deletion' },
  confirmDeleteDesc: { uz: "Ushbu elementni katalogni olib tashlamoqchimisiz?", ru: 'Вы хотите удалить этот элемент из каталога?', en: 'Are you sure you want to remove this item from the catalog?' },
  delete: { uz: "O'chirish", ru: 'Удалить', en: 'Delete' },

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
