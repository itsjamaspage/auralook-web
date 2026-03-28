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
    uz: 'Kelajakni kiying, merosni his qiling.',
    ru: 'Носите будущее, чувствуйте наследие.',
    en: 'Wear the Future, Feel the Heritage.'
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

  // Home Page Content
  curatedLooks: { 
    uz: 'Tanlangan Liboslar',
    ru: 'Курируемые образы',
    en: 'Curated Looks'
  },
  curatedLooksSub: { 
    uz: 'Bizning stilistlarimiz va AI algoritmlarimiz ushbu kiyimlarni eng yaxshi futuristik ko\'rinish uchun qo\'lda tanlab olishdi.',
    ru: 'Наши стилисты и ИИ-алгоритмы вручную отобрали эти наряды для лучшего футуристического образа.',
    en: 'Our stylists and AI algorithms hand-picked these outfits for the best futuristic look.'
  },
  all: { 
    uz: 'Hammasi',
    ru: 'Все',
    en: 'All'
  },
  viewDetails: { 
    uz: 'Batafsil ko\'rish',
    ru: 'Посмотреть детали',
    en: 'View Details'
  },
  aiSizeEngine: { 
    uz: 'AI o\'lcham mexanizmi',
    ru: 'ИИ-движок размеров',
    en: 'AI Size Engine'
  },
  aiSizeEngineSub: { 
    uz: 'O\'lchamingizni taxmin qilishni to\'xtating. Bizning ilg\'or neyron tarmoqlarimiz tana o\'lchamingizga qarab mukammal moslikni hisoblab chiqadi.',
    ru: 'Перестаньте угадывать свой размер. Наши передовые нейронные сети рассчитают идеальную посадку на основе ваших параметров.',
    en: 'Stop guessing your size. Our advanced neural networks calculate the perfect fit based on your body dimensions.'
  },
  quickLogistics: { 
    uz: 'Tezkor Logistika',
    ru: 'Быстрая логистика',
    en: 'Quick Logistics'
  },
  quickLogisticsSub: { 
    uz: 'O\'zbekiston bo\'ylab tezkor yetkazib berish va Telegram integratsiyamiz orqali real vaqt rejimida holat yangilanishi.',
    ru: 'Быстрая доставка по всему Узбекистану и обновления статуса в реальном времени через нашу интеграцию с Telegram.',
    en: 'Fast delivery across Uzbekistan and real-time status updates via our Telegram integration.'
  },
  globalAesthetics: { 
    uz: 'Global Estetika',
    ru: 'Глобальная эстетика',
    en: 'Global Aesthetics'
  },
  globalAestheticsSub: { 
    uz: 'Dunyo bo\'ylab eng yaxshi dizaynerlardan saralangan, zamonaviy Toshkentning o\'ziga xos uslubiga moslashtirilgan.',
    ru: 'Отобрано у лучших дизайнеров со всего мира, адаптировано под уникальный стиль современного Ташкента.',
    en: 'Curated from the best designers worldwide, adapted to the unique style of modern Tashkent.'
  },

  // Product Detail
  sizeAdvisor: { 
    uz: 'Aqlli O\'lcham Maslahatchisi',
    ru: 'Умный советник по размерам',
    en: 'Smart Size Advisor'
  },
  buyNow: { 
    uz: 'Sotib Olish',
    ru: 'Купить сейчас',
    en: 'Buy Now'
  },
  price: { 
    uz: 'Narxi',
    ru: 'Цена',
    en: 'Price'
  },
  freeDelivery: { 
    uz: 'Toshkent bo\'ylab bepul yetkazib berish',
    ru: 'Бесплатная доставка по Ташкенту',
    en: 'Free Delivery in Tashkent'
  },
  authenticity: { 
    uz: 'Haqiqiyligi kafolatlangan',
    ru: 'Гарантия подлинности',
    en: 'Authenticity Guaranteed'
  },
  returns: { 
    uz: '14 kunlik bepul qaytarish',
    ru: '14 дней бесплатного возврата',
    en: '14-Day Free Returns'
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
