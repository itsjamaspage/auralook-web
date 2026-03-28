"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'uz';

const dictionary = {
  // Hero & Navigation
  heroTitle: { uz: 'Yangi Avlod Uslubi' },
  heroSub: { uz: 'Auralook.uz: O\'zbekistonda modaning kelajagi' },
  browseLooks: { uz: 'Liboslarni Ko\'rish' },
  myOrders: { uz: 'Mening buyurtmalarim' },
  logout: { uz: 'Chiqish' },
  login: { uz: 'Kirish' },

  // Auth Pages
  welcomeBack: { uz: 'Xush kelibsiz' },
  createAccount: { uz: 'Hisob yaratish' },
  accessOrders: { uz: 'Buyurtmalaringiz va o\'lchamlaringizga kiring' },
  joinFuture: { uz: 'Moda kelajagiga qo\'shiling' },
  email: { uz: 'Email' },
  password: { uz: 'Parol' },
  telegramUsername: { uz: 'Telegram foydalanuvchi nomi' },
  emailPlaceholder: { uz: 'ism@misol.com' },
  passwordPlaceholder: { uz: '••••••••' },
  telegramPlaceholder: { uz: '@foydalanuvchi' },
  getStarted: { uz: 'Boshlash' },
  dontHaveAccount: { uz: "Akkauntingiz yo'qmi? Yaratish" },
  alreadyHaveAccount: { uz: 'Hisobingiz bormi? Kirish' },
  processing: { uz: 'Ishlanmoqda...' },

  // Home Page Content
  curatedLooks: { uz: 'Tanlangan Liboslar' },
  curatedLooksSub: { uz: 'Bizning stilistlarimiz va AI algoritmlarimiz ushbu kiyimlarni eng yaxshi futuristik ko\'rinish uchun qo\'lda tanlab olishdi.' },
  all: { uz: 'Hammasi' },
  viewDetails: { uz: 'Batafsil ko\'rish' },
  aiSizeEngine: { uz: 'AI o\'lcham mexanizmi' },
  aiSizeEngineSub: { uz: 'O\'lchamingizni taxmin qilishni to\'xtating. Bizning ilg\'or neyron tarmoqlarimiz tana o\'lchamingizga qarab mukammal moslikni hisoblab chiqadi.' },
  quickLogistics: { uz: 'Tezkor Logistika' },
  quickLogisticsSub: { uz: 'O\'zbekiston bo\'ylab tezkor yetkazib berish va Telegram integratsiyamiz orqali real vaqt rejimida holat yangilanishi.' },
  globalAesthetics: { uz: 'Global Estetika' },
  globalAestheticsSub: { uz: 'Dunyo bo\'ylab eng yaxshi dizaynerlardan saralangan, zamonaviy Toshkentning o\'ziga xos uslubiga moslashtirilgan.' },

  // Product Detail
  sizeAdvisor: { uz: 'Aqlli O\'lcham Maslahatchisi' },
  buyNow: { uz: 'Sotib Olish' },
  price: { uz: 'Narxi' },
  freeDelivery: { uz: 'Toshkent bo\'ylab bepul yetkazib berish' },
  authenticity: { uz: 'Haqiqiyligi kafolatlangan' },
  returns: { uz: '14 kunlik bepul qaytarish' },

  // Footer
  allRightsReserved: { uz: '© 2026 Auralook.uz. Barcha huquqlar himoyalangan.' },
  contact: { uz: 'Aloqa' },
};

interface LanguageContextType {
  lang: Language;
  t: (translations: Record<Language, string>) => string;
  dictionary: typeof dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang] = useState<Language>('uz');

  const t = (translations: Record<Language, string>) => {
    return translations[lang];
  };

  return (
    <LanguageContext.Provider value={{ lang, t, dictionary }}>
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
