"use client"

import { useState } from 'react';

export type Language = 'uz';

export function useLanguage() {
  const [lang] = useState<Language>('uz');

  const t = (translations: any) => {
    if (!translations) return '';
    if (typeof translations === 'string') return translations;
    return (translations && typeof translations === 'object') 
      ? (translations[lang] || translations['uz'] || '')
      : String(translations || '');
  };

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

  return { lang, t, dictionary };
}
