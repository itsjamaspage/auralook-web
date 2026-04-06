
"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'uz' | 'ru' | 'en';

const dictionary = {
  // Hero & Navigation
  heroTitle: { 
    uz: 'Yangi Avlod kiyimlari',
    ru: 'Одежда Нового Поколения',
    en: 'New Generation Clothes'
  },
  heroSub: { 
    uz: 'Kelajak kiyimlarini kiying, merosni his qiling',
    ru: 'Одевай одежду будущего, почувствуй наследие',
    en: 'Wear clothes of the future, feel the heritage'
  },
  browseLooks: { 
    uz: 'Katalog',
    ru: 'Каталог',
    en: 'Catalog'
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
    uz: 'Admin Paneli',
    ru: 'Админ Панель',
    en: 'Admin Panel'
  },
  protocol: {
    uz: 'Bayonnoma',
    ru: 'Протокол',
    en: 'Protocol'
  },
  expandApp: {
    uz: 'Kengaytirish',
    ru: 'Развернуть',
    en: 'Expand App'
  },
  theme: {
    uz: 'Mavzu',
    ru: 'Тема',
    en: 'Theme'
  },
  light: {
    uz: 'Yorug\'',
    ru: 'Светлая',
    en: 'Light'
  },
  dark: {
    uz: 'Qorong\'u',
    ru: 'Темная',
    en: 'Dark'
  },

  // Landing Page Specific
  landingHeroTitle: { 
    uz: 'KIYING ERTANGI KUNNI BUGUN.',
    ru: 'НОСИ ЗАВТРАШНЕЕ СЕГОДНЯ.',
    en: 'WEAR TOMORROW TODAY.'
  },
  wear: { uz: 'KIYING', ru: 'НОСИТЕ', en: 'WEAR' },
  tomorrow: { uz: 'ERTANGI KUNNI', ru: 'ЗАВТРАШНЕE', en: 'TOMORROW' },
  today: { uz: 'BUGUN', ru: 'СЕГОДНЯ', en: 'TODAY' },
  landingHeroSub: { 
    uz: 'SARALANGAN LIBOSLAR. DARHOL YETKAZIB BERISH.',
    ru: 'КУРИРОВАННЫЕ ОБРАЗЫ. МГНОВЕННАЯ ДОСТАВКА.',
    en: 'CURATED LOOKS. DELIVERED INSTANTLY.'
  },
  shopTheDrop: { uz: 'TO\'PLAMNI KO\'RISH', ru: 'КУПИТЬ КОЛЛЕКЦИЮ', en: 'SHOP THE DROP' },
  exploreLooks: { uz: 'LIBOSLARNI O\'RGANISH', ru: 'ИЗУЧИТЬ ОБРАЗЫ', en: 'EXPLORE LOOKS' },
  featuredLooks: { uz: 'SARALANGAN LIBOSLAR', ru: 'ПОПУЛЯРНЫЕ ОБРАЗЫ', en: 'FEATURED LOOKS' },
  viewAll: { uz: 'BARCHASI', ru: 'ВСЕ', en: 'VIEW ALL' },
  newArrivals: { uz: 'YANGI KELGANLAR', ru: 'НОВИНКИ', en: 'NEW ARRIVALS' },
  limitedEdition: { uz: 'CHEKLANGAN TO\'PLAM', ru: 'ЛИМИТИРОВАННАЯ СЕРИЯ', en: 'LIMITED EDITION' },
  freeDelivery: { uz: 'BEPUL YETKAZIB BERISH', ru: 'БЕСПЛАТНАЯ ДОСТАВКА', en: 'FREE DELIVERY' },
  orderViaTelegram: { uz: 'TELEGRAM ORQALI BUYURTMA', ru: 'ЗАКАЗ ЧЕРЕЗ TELEGRAM', en: 'ORDER VIA TELEGRAM' },
  goodQuality: { uz: 'YUQORI SIFAT', ru: 'ВЫСОКОЕ КАЧЕСТВО', en: 'GOOD QUALITY' },
  liveOnTelegram: { uz: 'BOTGA O\'TISH', ru: 'ПЕРЕЙТИ В БОТ', en: 'MOVE TO BOT' },
  openApp: { uz: 'BUYURTMA BERISH', ru: 'ЗАКАЗАТЬ СЕЙЧАС', en: 'ORDER NOW' },
  browseOrderTelegram: { uz: 'Telegram botimizga o\'ting va hoziroq buyurtma bering', ru: 'Перейдите в наш бот и закажите прямо сейчас', en: 'Move to our telegram bot and order now' },
  hotTag: { uz: 'QAYNOQ', ru: 'ГОРЯЧО', en: 'HOT' },
  newTag: { uz: 'YANGI', ru: 'НОВОЕ', en: 'NEW' },
  lookNumber: { uz: 'LIBOS', ru: 'ОБРАЗ', en: 'LOOK' },

  // Auth Pages
  welcomeBack: { 
    uz: 'Xush kelibsiz',
    ru: 'Xush kelibsiz',
    en: 'Welcome Back'
  },
  createAccount: { 
    uz: 'Hisob yaratish',
    ru: 'Создать аккаунт',
    en: 'Create Account'
  },
  accessOrders: { 
    uz: 'Buyurtmalaringizga kiring',
    ru: 'Доступ к вашим заказам',
    en: 'Access your orders'
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
  contactInformation: {
    uz: 'Aloqa ma\'lumotlari',
    ru: 'Контактная информация',
    en: 'Contact Information'
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
  bridgingIdentity: {
    uz: 'Telegram identifikatsiyasi bog\'lanmoqda...',
    ru: 'Связывание личности Telegram...',
    en: 'Bridging Telegram Identity...'
  },

  // Checkout Flow
  checkoutTitle: {
    uz: 'Rasmiylashtirish',
    ru: 'Оформление',
    en: 'Checkout'
  },
  knowSizeQuestion: {
    uz: "O'lchamingizni bilsizsiz?",
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
  country: {
    uz: 'Mamlakat',
    ru: 'Страна',
    en: 'Country'
  },
  select: {
    uz: 'Tanlang',
    ru: 'Выбрать',
    en: 'Select'
  },

  // Catalog & Filters
  search: { uz: 'Qidiruv', ru: 'Поиск', en: 'Search' },
  searchPlaceholder: { uz: 'Liboslar qidiruvi...', ru: 'Поиск образов...', en: 'Search outfits...' },
  filter: { uz: 'Filtr', ru: 'Фильтр', en: 'Filter' },
  listingsDetected: { uz: 'Liboslar topildi', ru: 'Найдено образов', en: 'Listings Found' },
  filterParameters: { uz: 'Filtr parametrlari', ru: 'Параметры фильтра', en: 'Filter Parameters' },
  currencyUnit: { uz: 'Valyuta', ru: 'Валюта', en: 'Currency' },
  priceRange: { uz: 'Narx oralig\'i', ru: 'Диапазон цен', en: 'Price Range' },
  minPrice: { uz: 'Minimal narx', ru: 'Мин. цена', en: 'Min Price' },
  maxPrice: { uz: 'Maksimal narx', ru: 'Макс. цена', en: 'Max Price' },
  availableNow: { uz: 'Mavjud', ru: 'В наличии', en: 'Available Now' },
  locationTashkent: { uz: 'Toshkent, Mirzo Ulug\'bek', ru: 'Ташкент, Мирзо-Улугбек', en: 'Tashkent, Mirzo Ulugbek' },
  all: { uz: 'Barchasi', ru: 'Все', en: 'All' },
  nothingFound: { uz: 'Hech narsa topilmadi', ru: 'Ничего не найдено', en: 'Nothing found' },
  selectMultiple: { uz: 'Tanlash', ru: 'Выбрать несколько', en: 'Select Mode' },
  addToCart: { uz: 'Savatchaga', ru: 'В корзину', en: 'Add to Cart' },
  itemsSelected: { uz: 'ta tanlandi', ru: 'выбрано', en: 'selected' },
  addedToCart: { uz: 'Savatchaga qo\'shildi', ru: 'Добавлено в korzinu', en: 'Added to Cart' },

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
  edit: { uz: "Tahrirlash", ru: 'Редактировать', en: 'Edit' },
  cancel: { uz: "Bekor qilish", ru: "Отмена", en: "Cancel" },
  cancelOrder: { uz: "Buyurtmani bekor qilish", ru: "Отменить заказ", en: "Cancel Order" },
  orderCancelled: { uz: "Bekor qilindi", ru: "Отменено", en: "Cancelled" },
  confirmDeleteTitle: { uz: "O'chirishni tasdiqlang", ru: 'Подтвердите удаление', en: 'Confirm Deletion' },
  confirmDeleteDesc: { uz: "Ushbu elementni katalogni olib tashlamoqchimisiz?", ru: 'Вы хотите удалить этот элемент из каталога?', en: 'Are you sure you want to remove this item from the catalog?' },
  itemName: { uz: 'Element nomi', ru: 'Название элемента', en: 'Item Name' },
  lookPrice: { uz: 'Libos narxi', ru: 'Цена образа', en: 'Look Price' },
  discountLabel: { uz: 'Chegirma %', ru: 'Скидка %', en: 'Discount %' },
  lookDescription: { uz: 'Libos tavsifi', ru: 'Описание образа', en: 'Look Description' },
  lookDescriptionPlaceholder: { uz: 'Ushbu libos haqida batafsil ma\'lumot...', ru: 'Подробности об этом образе...', en: 'Details about this look...' },
  updateCatalog: { uz: 'Katalogni yangilash', ru: 'Обновить каталог', en: 'Update Catalog' },
  uploadImage: { uz: 'Rasm yuklash', ru: 'Загрузить фото', en: 'Upload Image' },
  imageUrlPlaceholder: { uz: 'Yoki rasm URL manzilini kiriting...', ru: 'Иli введите URL изображения...', en: 'Or enter image URL...' },
  editCatalogItem: { uz: 'Katalog elementini tahrirlash', ru: 'Редактировать элемент каталога', en: 'Edit Catalog Item' },
  editCatalogItemDesc: { uz: 'Libos ma\'lumotlarini yangilang.', ru: 'Обновите информацию об образе.', en: 'Update look information.' },
  lookSavedSuccess: { uz: 'Muvaffaqiyatli saqlandi', ru: 'Успешно сохранено', en: 'Saved Successfully' },
  createNewLook: { uz: 'Yangi libos yaratish', ru: 'Создать новый образ', en: 'Create New Look' },
  createNewLookDesc: { uz: 'Katalogga yangi techwear to\'plamini qo\'shing.', ru: 'Добавьте новый комплект в каталог.', en: 'Add a new techwear set to the catalog.' },
  publish: { uz: 'Nashr qilish', ru: 'Опубликовать', en: 'Publish' },
  orderPending: { uz: 'Kutilmoqda', ru: 'Ожидается', en: 'Pending' },
  orderAccepted: { uz: 'Tasdiqlandi', ru: 'Принято', en: 'Accepted' },
  orderShipped: { uz: 'Yuborildi', ru: 'Отправлено', en: 'Shipped' },
  orderDelivered: { uz: 'Yetkazildi', ru: 'Доставлено', en: 'Delivered' },
  configPending: { uz: 'Sozlash kutilmoqda', ru: 'Ожидание настройки', en: 'Configuration Pending' },
  protocolLive: { uz: 'Bayonnoma faol', ru: 'Протокол активен', en: 'Protocol Live' },

  // Advisor Page
  sizeInfo: { uz: 'O\'lcham Ma\'lumotlari', ru: 'Информация о размерах', en: 'Size Information' },
  sizeInfoDesc: { uz: 'Menejerga ma\'lumotlaringizni yuboring va mukammal moslikni oling.', ru: 'Отправьте данные менеджеру и получите идеальную посадку.', en: 'Send your data to the manager and get the perfect fit.' },
  heightCmLabel: { uz: 'Bo\'yingiz (sm)', ru: 'Рост (см)', en: 'Height (cm)' },
  weightKgLabel: { uz: 'Vazningiz (kg)', ru: 'Вес (кг)', en: 'Weight (kg)' },
  knownSize: { uz: 'O\'lchamingiz (agar bilsangiz)', ru: 'Ваш размер (если знаете)', en: 'Your size (if known)' },
  sizeExample: { uz: 'Masalan: M yoki 48', ru: 'Например: М или 48', en: 'Example: M or 48' },
  gender: { uz: 'Jinsingiz', ru: 'Ваш пол', en: 'Gender' },
  male: { uz: 'Erkak', ru: 'Мужской', en: 'Male' },
  female: { uz: 'Ayol', ru: 'Женский', en: 'Female' },
  fitStyle: { uz: 'Kiyinish uslubingiz', ru: 'Стиль одежды', en: 'Fit style' },
  tight: { uz: 'Yopishib turadigan', ru: 'В обтяжку', en: 'Tight' },
  regular: { uz: 'O\'rtacha', ru: 'Средний', en: 'Regular' },
  loose: { uz: 'Kengroq', ru: 'Свободный', en: 'Loose' },
  aiCalculate: { uz: 'AI Hisoblash', ru: 'ИИ Расчет', en: 'AI Calculate' },
  sendToManager: { uz: 'Menejerga yuborish', ru: 'Отправить менеджеру', en: 'Send to Manager' },
  recommendedSizeResult: { uz: 'Tavsiya etilgan o\'lcham', ru: 'Рекомендуемый размер', en: 'Recommended size' },
  managerConfirm: { uz: 'Menejer tasdiqlashi', ru: 'Подтверждение менеджера', en: 'Manager confirmation' },
  changeMeasurements: { uz: 'O\'lchamlarni o\'zgartirish', ru: 'Изменить замеры', en: 'Change measurements' },
  dataSentToManager: { uz: 'Sizning ma\'lumotlaringiz menejerga yuborildi. Tez orada bog\'lanamiz.', ru: 'Ваши данные отправлены менеджеру. Мы скоро свяжемся с вами.', en: 'Your data has been sent to the manager. We will contact you soon.' },
  loginToSubmit: { uz: 'Murojaat yuborish uchun tizimga kirishingiz kerak.', ru: 'Вы должны войти в систему, чтобы отправить запрос.', en: 'You must log in to submit a request.' },
  loginRequired: { uz: 'Tizimga kiring', ru: 'Требуется вход', en: 'Login required' },
  success: { uz: 'Muvaffaqiyatli', ru: 'Успешно', en: 'Success' },
  detailsUpdated: { uz: 'Ma\'lumotlar yangilandi.', ru: 'Данные обновлены.', en: 'Details updated.' },

  // New Technical Labels & Toasts
  orderRef: { uz: 'BUYURTMA RAQAMI', ru: 'НОМЕР ЗАКАЗА', en: 'ORDER REF' },
  size: { uz: 'O\'LCHAM', ru: 'РАЗМЕР', en: 'SIZE' },
  total: { uz: 'JAMI', ru: 'ИТОГО', en: 'TOTAL' },
  transactionDate: { uz: 'XARID VAQTI', ru: 'ДАТА ТРАНЗАКЦИИ', en: 'TRANSACTION DATE' },
  managerAdviceLabel: { uz: 'Menejer maslahati', ru: 'совет менеджера', en: 'manager advice' },
  contactInfo: { uz: 'Aloqa ma\'lumotlari', ru: 'Контактная информация', en: 'Contact Information' },
  sortLabel: { uz: 'Tartiblash', ru: 'Сортировка', en: 'Sort' },
  newest: { uz: 'Yangi qo\'shilganlar', ru: 'Сначала новые', en: 'Newest Arrivals' },
  priceAsc: { uz: 'Arzonroq birinchi', ru: 'Сначала дешевле', en: 'Price: Low to High' },
  priceDesc: { uz: 'Qimmatroq birinchi', ru: 'Сначала дороже', en: 'Price: High to Low' },
  visual: { uz: 'Ko\'rinish', ru: 'Визуал', en: 'Visual' },
  repositoryEmpty: { uz: 'Ombor bo\'sh', ru: 'Репозиторий пуст', en: 'Repository Empty' },
  syncing: { uz: 'Sinxronizatsiya...', ru: 'Синхронизация...', en: 'Syncing...' },
  identificationRequired: { uz: 'Identifikatsiya lozim', ru: 'Требуется идентификация', en: 'Identification Required' },
  openInBot: { uz: 'Iltimos, ushbu ilovani rasmiy Telegram bot ichida oching.', ru: 'Пожалуйста, откройте это приложение в официальном Telegram-боте.', en: 'Please open this app inside the official Telegram bot.' },
  
  // New Localizations for Checkout & Actions
  countryLabel: { uz: 'Mamlakat', ru: 'Страна', en: 'Country' },
  about: { uz: 'BIZ HAQIMIZDA', ru: 'О НАС', en: 'ABOUT' },
  delivery: { uz: 'YETKAZIB BERISH', ru: 'ДОСТАВКА', en: 'DELIVERY' },
  selectPlaceholder: { uz: 'Tanlang', ru: 'Выберите', en: 'Select' },
  missingInformation: { uz: "Ma'lumotlar yetarli emas", ru: 'Недостаточно информации', en: 'Missing information' },
  phoneAndTelegramRequired: { uz: "Telefon raqami (to'liq) va Telegram username majburiy.", ru: 'Номер телефона (полный) и имя пользователя Telegram обязательны.', en: 'Phone number (full) and Telegram username are required.' },
  errorTitle: { uz: 'Xatolik', ru: 'Ошибка', en: 'Error' },
  errorDescription: { uz: 'Tizimda xatolik yuz berdi. Qaytadan urinib ko\'ring.', ru: 'Произошла системная ошибка. Пожалуйста, попробуйте еще раз.', en: 'A system error occurred. Please try again.' },
  orderSuccessTitle: { uz: 'Buyurtma qabul qilindi', ru: 'Заказ принят', en: 'Order accepted' },
  orderSuccessDescription: { uz: 'Tez orada menejerimiz siz bilan bog\'lanadi.', ru: 'Наш менеджер свяжется с вами в ближайшее время.', en: 'Our manager will contact you shortly.' },
  identityPendingTitle: { uz: 'Identifikatsiya kutilmoqda', ru: 'Ожидание идентификации', en: 'Identity Pending' },
  identityPendingDescription: { uz: 'Iltimos, aloqa barqarorlashishini kuting.', ru: 'Пожалуйста, подождите стабилизации соединения.', en: 'Please wait for connection to stabilize.' },
  orderCancelledSuccess: { uz: 'Buyurtma muvaffaqiyatli bekor qilindi.', ru: 'Заказ успешно отменен.', en: 'Order successfully cancelled.' },
  tashkentDirectContact: { uz: 'Toshkent (To\'g\'ridan-to\'g\'ri bog\'lanish)', ru: 'Ташкент (Прямая связь)', en: 'Tashkent (Direct Contact)' },
  operationSuccess: { uz: 'Muvaffaqiyatli', ru: 'Успешно', en: 'Success' },
  emptyCart: { uz: 'Savatchangiz bo\'sh', ru: 'Ваша корзина пуста', en: 'Your cart is empty' },
  checkout: { uz: 'Sotib olish', ru: 'Оформить заказ', en: 'Checkout' },
  clearCart: { uz: 'Tozalash', ru: 'Очистить', en: 'Clear Cart' },

  // Footer
  allRightsReserved: { 
    uz: '© 2026 Yangi Avlod. Barcha huquqlar himoyalangan.',
    ru: '© 2026 Yangi Avlod. Все права защищены.',
    en: '© 2026 Yangi Avlod. All rights reserved.'
  },
  contact: { uz: 'BOG\'LANISH', ru: 'КОНТАКТ', en: 'CONTACT' },
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
