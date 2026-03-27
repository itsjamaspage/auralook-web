"use client"

import { useState, useEffect } from 'react';
import { Language } from '@/lib/mock-data';

export function useLanguage() {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('jama_lang') as Language;
    if (saved) setLang(saved);
  }, []);

  const changeLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('jama_lang', newLang);
  };

  const t = (translations: Record<Language, string>) => {
    return translations[lang] || translations['en'];
  };

  const dictionary = {
    heroTitle: { en: 'Next Gen Style', ru: 'Стиль Нового Поколения', uz: 'Yangi Avlod Usul' },
    heroSub: { en: 'JamaStore: Future of Fashion in Uzbekistan', ru: 'JamaStore: Будущее моды в Узбекистане', uz: 'JamaStore: O\'zbekistonda modaning kelajagi' },
    browseLooks: { en: 'Browse Looks', ru: 'Посмотреть Образы', uz: 'Liboslarni Ko\'rish' },
    sizeAdvisor: { en: 'Smart Size Advisor', ru: 'Умный Советник по Размеру', uz: 'Aqlli O\'lcham Maslahatchisi' },
    adminPanel: { en: 'Admin Dashboard', ru: 'Панель Администратора', uz: 'Admin Paneli' },
    buyNow: { en: 'Buy Look', ru: 'Купить Образ', uz: 'Sotib Olish' },
    price: { en: 'Price', ru: 'Цена', uz: 'Narxi' },
  };

  return { lang, changeLanguage, t, dictionary };
}