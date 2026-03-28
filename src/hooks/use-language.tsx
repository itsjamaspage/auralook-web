"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ru' | 'uz';

const dictionary = {
  // Hero & Navigation
  heroTitle: { en: 'Next Gen Style', ru: 'Стиль Нового Поколения', uz: 'Yangi Avlod Uslubi' },
  heroSub: { en: 'Auralook.uz: Future of Fashion in Uzbekistan', ru: 'Auralook.uz: Будущее моды в Узбекистане', uz: 'Auralook.uz: O\'zbekistonda modaning kelajagi' },
  browseLooks: { en: 'Browse Looks', ru: 'Посмотреть Образы', uz: 'Liboslarni Ko\'rish' },
  myOrders: { en: 'My Orders', ru: 'Мои заказы', uz: 'Mening buyurtmalarim' },
  logout: { en: 'Logout', ru: 'Выйти', uz: 'Chiqish' },
  login: { en: 'Login', ru: 'Войти', uz: 'Kirish' },

  // Auth Pages
  welcomeBack: { en: 'Welcome Back', ru: 'С возвращением', uz: 'Xush kelibsiz' },
  createAccount: { en: 'Create Account', ru: 'Создать аккаунт', uz: 'Hisob yaratish' },
  accessOrders: { en: 'Access your orders and sizes', ru: 'Доступ к вашим заказам и размерам', uz: 'Buyurtmalaringiz va o\'lchamlaringizga kiring' },
  joinFuture: { en: 'Join the future of fashion', ru: 'Присоединяйтесь к будущему моды', uz: 'Moda kelajagiga qo\'shiling' },
  email: { en: 'Email', ru: 'Электронная почта', uz: 'Email' },
  password: { en: 'Password', ru: 'Пароль', uz: 'Parol' },
  telegramUsername: { en: 'Telegram Username', ru: 'Имя пользователя Telegram', uz: 'Telegram foydalanuvchi nomi' },
  emailPlaceholder: { en: 'name@example.com', ru: 'name@example.com', uz: 'ism@misol.com' },
  passwordPlaceholder: { en: '••••••••', ru: '••••••••', uz: '••••••••' },
  telegramPlaceholder: { en: '@username', ru: '@имя_пользователя', uz: '@foydalanuvchi' },
  getStarted: { en: 'Get Started', ru: 'Начать', uz: 'Boshlash' },
  dontHaveAccount: { en: "Don't have an account? Sign up", ru: 'Нет аккаунта? Зарегистрироваться', uz: "Akkauntingiz yo'qmi? Yaratish" },
  alreadyHaveAccount: { en: 'Already have an account? Login', ru: 'Уже есть аккаунт? Войти', uz: 'Hisobingiz bormi? Kirish' },
  processing: { en: 'Processing...', ru: 'Обработка...', uz: 'Ishlanmoqda...' },

  // Home Page Content
  curatedLooks: { en: 'Curated Looks', ru: 'Подобранные Образы', uz: 'Tanlangan Liboslar' },
  curatedLooksSub: { en: 'Our stylists and AI algorithms have hand-picked these outfits for the ultimate futuristic look.', ru: 'Наши стилистические и AI-алгоритмы вручную отобрали эти наряды для создания совершенного футуристического образа.', uz: 'Bizning stilistlarimiz va AI algoritmlarimiz ushbu kiyimlarni eng yaxshi futuristik ko\'rinish uchun qo\'lda tanlab olishdi.' },
  all: { en: 'All', ru: 'Все', uz: 'Hammasi' },
  viewDetails: { en: 'View Details', ru: 'Подробнее', uz: 'Batafsil ko\'rish' },
  aiSizeEngine: { en: 'AI Size Engine', ru: 'Движок ИИ для Размеров', uz: 'AI o\'lcham mexanizmi' },
  aiSizeEngineSub: { en: 'Stop guessing your size. Our advanced neural networks calculate the perfect fit based on your body dimensions.', ru: 'Хватит гадать свой размер. Наши передовые нейронные сети вычисляют идеальную посадку на основе размеров вашего тела.', uz: 'O\'lchamingizni taxmin qilishni to\'xtating. Bizning ilg\'or neyron tarmoqlarimiz tana o\'lchamingizga qarab mukammal moslikni hisoblab chiqadi.' },
  quickLogistics: { en: 'Quick Logistics', ru: 'Быстрая Логистика', uz: 'Tezkor Logistika' },
  quickLogisticsSub: { en: 'Fast delivery across Uzbekistan with real-time status updates via our Telegram integration.', ru: 'Быстрая доставка по всему Узбекистану с обновлением статуса в реальном времени через нашу интеграцию с Telegram.', uz: 'O\'zbekiston bo\'ylab tezkor yetkazib berish va Telegram integratsiyamiz orqali real vaqt rejimida holat yangilanishi.' },
  globalAesthetics: { en: 'Global Aesthetics', ru: 'Глобальная Эстетика', uz: 'Global Estetika' },
  globalAestheticsSub: { en: 'Curated from the best designers worldwide, tailored for the unique style of modern Tashkent.', ru: 'Собрано от лучших дизайнеров мира, адаптировано под уникальный стиль современного Ташкента.', uz: 'Dunyo bo\'ylab eng yaxshi dizaynerlardan saralangan, zamonaviy Toshkentning o\'ziga xos uslubiga moslashtirilgan.' },

  // Product Detail
  sizeAdvisor: { en: 'Smart Size Advisor', ru: 'Умный Советник по Размеру', uz: 'Aqlli O\'lcham Maslahatchisi' },
  buyNow: { en: 'Buy Look', ru: 'Купить Образ', uz: 'Sotib Olish' },
  price: { en: 'Price', ru: 'Цена', uz: 'Narxi' },
  freeDelivery: { en: 'Free Delivery in Tashkent', ru: 'Бесплатная доставка в Ташкенте', uz: 'Toshkent bo\'ylab bepul yetkazib berish' },
  authenticity: { en: 'Authenticity Guaranteed', ru: 'Гарантия подлинности', uz: 'Haqiqiyligi kafolatlangan' },
  returns: { en: '14-Day Free Returns', ru: 'Бесплатный возврат в течение 14 дней', uz: '14 kunlik bepul qaytarish' },

  // Footer
  allRightsReserved: { en: '© 2026 Auralook.uz. All rights reserved.', ru: '© 2026 Auralook.uz. Все права защищены.', uz: '© 2026 Auralook.uz. Barcha huquqlar himoyalangan.' },
  contact: { en: 'Contact', ru: 'Контакт', uz: 'Aloqa' },
};

interface LanguageContextType {
  lang: Language;
  changeLanguage: (newLang: Language) => void;
  t: (translations: Record<Language, string>) => string;
  dictionary: typeof dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('aura_lang') as Language;
    if (saved && ['en', 'ru', 'uz'].includes(saved)) {
      setLang(saved);
    }
  }, []);

  const changeLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('aura_lang', newLang);
  };

  const t = (translations: Record<Language, string>) => {
    return translations[lang] || translations['en'];
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t, dictionary }}>
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