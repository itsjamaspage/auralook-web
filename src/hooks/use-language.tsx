
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
    uz: 'Liboslarni Ko\'rish',
    ru: 'Посмотреть образы',
    en: 'Browse Looks'
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
    uz: 'Admin Panel',
    ru: 'Панель администратора',
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
  totalSales: {
    uz: 'Jami savdo',
    ru: 'Общие продажи',
    en: 'Total Sales'
  },
  activeOrders: {
    uz: 'Faol buyurtmalar',
    ru: 'Активные заказы',
    en: 'Active Orders'
  },
  catalog: {
    uz: 'Katalog',
    ru: 'Каталог',
    en: 'Catalog'
  },
  newItems: {
    uz: 'Yangilar',
    ru: 'Новые',
    en: 'New'
  },
  orders: {
    uz: 'Buyurtmalar',
    ru: 'Заказы',
    en: 'Orders'
  },
  orderId: {
    uz: 'ID',
    ru: 'ID',
    en: 'ID'
  },
  customer: {
    uz: 'Mijoz',
    ru: 'Клиент',
    en: 'Customer'
  },
  status: {
    uz: 'Holat',
    ru: 'Статус',
    en: 'Status'
  },
  amount: {
    uz: 'Summa',
    ru: 'Сумма',
    en: 'Amount'
  },
  actions: {
    uz: 'Amallar',
    ru: 'Действия',
    en: 'Actions'
  },
  noOrders: {
    uz: "Hozircha buyurtmalar yo'q.",
    ru: 'Заказов пока нет.',
    en: 'No orders yet.'
  },

  // New Look Page
  createNewLook: {
    uz: 'Yangi Libos Yaratish',
    ru: 'Создать новый образ',
    en: 'Create New Look'
  },
  createNewLookDesc: {
    uz: 'Yuqori sifatli media va AI tomonidan yaratilgan tavsiflarni qo\'shing.',
    ru: 'Добавьте высококачественные медиа и описания, созданные ИИ.',
    en: 'Add high-quality media and AI-generated descriptions.'
  },
  uploadImage: {
    uz: 'Rasm yuklash',
    ru: 'Загрузить фото',
    en: 'Upload Photo'
  },
  lookName: {
    uz: 'Libos nomi',
    ru: 'Название образа',
    en: 'Look Name'
  },
  lookPrice: {
    uz: 'Narxi (USD)',
    ru: 'Цена (USD)',
    en: 'Price (USD)'
  },
  aiDescGenerator: {
    uz: 'AI Tavsif Yaratuvchi',
    ru: 'ИИ Генератор описаний',
    en: 'AI Description Generator'
  },
  keywordsPlaceholder: {
    uz: 'Kalit so\'zlar (masalan, techwear, neon)',
    ru: 'Ключевые слова (например, techwear, neon)',
    en: 'Keywords (e.g., techwear, neon)'
  },
  generate: {
    uz: 'Yaratish',
    ru: 'Создать',
    en: 'Generate'
  },
  aiUzbekHint: {
    uz: 'AI professional matn yaratadi',
    ru: 'ИИ создаст профессиональный текст',
    en: 'AI creates professional text'
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
  t: (translations: Record<Language, string>) => string;
  dictionary: typeof dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('uz');

  const t = (translations: Record<Language, string>) => {
    return translations[lang] || translations['uz'];
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
