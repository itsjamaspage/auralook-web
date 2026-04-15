
/**
 * @fileOverview Multilingual FAQ data for the Auralook Telegram bot.
 * Supports Uzbek (uz), Russian (ru), and English (en).
 */

const MINI_APP_LINK = 'https://t.me/jamastore_aibot/auralook';

export type FaqLang = 'uz' | 'ru' | 'en';
export type FaqKey = 'prices' | 'order' | 'delivery' | 'deposit' | 'cancel' | 'sizes' | 'quality' | 'payment' | 'looks';

export interface FaqQuestion {
  label: string;
  key: FaqKey;
}

export interface FaqLanguage {
  welcome: string;
  questions: FaqQuestion[];
  answers: Record<FaqKey, string>;
}

export const FAQ: Record<FaqLang, FaqLanguage> = {
  uz: {
    welcome: `👋 Salom! Auralook botiga xush kelibsiz!\n\nSavolingizni tanlang:`,
    questions: [
      { label: '💰 Narxlar',               key: 'prices'   },
      { label: '📦 Qanday buyurtma berish', key: 'order'    },
      { label: '🚚 Cargo yetkazib berish',  key: 'delivery' },
      { label: '💳 30% avans nima',         key: 'deposit'  },
      { label: '❌ Bekor qilish',           key: 'cancel'   },
      { label: "📏 O'lchamlar",             key: 'sizes'    },
      { label: '✅ Sifat',                  key: 'quality'  },
      { label: "💳 To'lov usullari",        key: 'payment'  },
      { label: '🧥 Barcha looklar',         key: 'looks'    },
    ],
    answers: {
      prices:   `Bizning narxlar 💰\n\nHar bir lookning narxi turlicha — pastki qismida ko'rsatilgan.\n\n📦 Cargo xarajati alohida to'lanadi\n💳 30% avans, qolgan qismi produkt yetkazib berilganidan keyin\n\nBarcha looklarni ko'rish uchun havolaga bosing: ${MINI_APP_LINK}`,
      order:    `Buyurtma berish juda oson! 👇\n\n1️⃣ Mini app'da lookni tanlang\n2️⃣ 30% avans to'lang (Payme/Click)\n3️⃣ 7–12 kun kutamiz — Xitoydan avia yetkazib berish\n4️⃣ Mahsulot kelganda qolgan 70% + cargo to'lang\n\nBuyurtma: ${MINI_APP_LINK} ✅`,
      delivery: `🚚 Cargo yetkazib berish nima?\n\nCargo — bu Xitoydan Toshkentga avia orqali jo'natiladigan yetkazib berish xizmati. Buyurtma Xitoydan jo'natiladi va 7–12 kun ichida yetib keladi.`,
      deposit:  `💳 30% avans nima?\n\nBu buyurtmangizni tasdiqlash uchun oldindan to'lanadigan qism. Masalan, 300,000 so'mlik lookda siz 90,000 so'm avans to'laysiz. Qolgan qism mahsulot yetib kelganda to'lanadi.\n\nBu bizning ehtiyot choramizdir — ba'zi mijozlar buyurtma Toshkentga yetib kelganidan keyin to'lashdan bosh tortishi yoki aloqani uzishi mumkin. 30% avans bu holatdan himoya qiladi.\n\n⚠️ Avans qaytarilmaydi.`,
      cancel:   `❌ Buyurtmani bekor qilish mumkin emas\n\nSiz 30% avans to'laganingizdan so'ng, biz darhol Xitoydan buyurtmani berib, to'lovni amalga oshiramiz. Buyurtma Xitoyda to'langanidan keyin bekor qilinmaydi va pullar qaytarilmaydi.`,
      sizes:    `📏 O'lchamlar\n\nTo'g'ri o'lchamni tanlash uchun bo'yingiz, vazningiz va odatda kiygan kiyim o'lchamingizni (S, M, L, XL va h.k.) bilishingiz kerak.\n\nAgar o'z o'lchamingizni bilsangiz — mini app'da buyurtma berayotganingizda yozing.\n\n${MINI_APP_LINK}`,
      quality:  `✅ Sifat haqida\n\nKiyimlar Xitoyning tekshirilgan sotuvchilari va fabrikalaridan buyurtma qilinadi.\n\nSifat yaxshi — kundalik foydalanish uchun mos. Lekin bu arzon narxdagi mahsulot ekanligini hisobga oling: premium yoki original brend sifatini kutmang.`,
      payment:  `💳 To'lov usullari\n\n✅ Payme\n✅ Click`,
      looks:    `🧥 Barcha looklarni ko'rish uchun havolaga bosing:\n\n👉 ${MINI_APP_LINK}`,
    },
  },

  ru: {
    welcome: `👋 Привет! Добро пожаловать в Auralook!\n\nВыберите вопрос:`,
    questions: [
      { label: '💰 Цены',           key: 'prices'   },
      { label: '📦 Как заказать',    key: 'order'    },
      { label: '🚚 Карго-доставка',  key: 'delivery' },
      { label: '💳 Предоплата 30%',  key: 'deposit'  },
      { label: '❌ Отмена заказа',   key: 'cancel'   },
      { label: '📏 Размеры',         key: 'sizes'    },
      { label: '✅ Качество',        key: 'quality'  },
      { label: '💳 Оплата',          key: 'payment'  },
      { label: '🧥 Все луки',        key: 'looks'    },
    ],
    answers: {
      prices:   `Наши цены 💰\n\nЦена каждого лука разная — указана под каждым луком.\n\n📦 Стоимость карго оплачивается отдельно\n💳 Предоплата 30%, остаток после доставки товара\n\nСмотреть все луки: ${MINI_APP_LINK}`,
      order:    `Как сделать заказ? Очень просто! 👇\n\n1️⃣ Выберите лук в мини-приложении\n2️⃣ Оплатите 30% аванс (Payme/Click)\n3️⃣ Ждите 7–12 дней — авиадоставка из Китая\n4️⃣ При получении оплатите остаток 70% + карго\n\nЗаказать: ${MINI_APP_LINK} ✅`,
      delivery: `🚚 Что такое карго-доставка?\n\nКарго — это служба авиадоставки из Китая в Ташкент. Заказ отправляется из Китая и прибывает в течение 7–12 дней.`,
      deposit:  `💳 Что такое предоплата 30%?\n\nЭто часть суммы, которую вы платите заранее для подтверждения заказа. Например, для лука за 300 000 сум вы платите 90 000 сум сразу. Оставшаяся часть оплачивается при получении.\n\nЭто наша мера предосторожности — некоторые покупатели могут отказаться от оплаты или перестать выходить на связь после того, как заказ прибыл в Ташкент. Предоплата защищает от этого.\n\n⚠️ Предоплата не возвращается.`,
      cancel:   `❌ Отмена заказа невозможна\n\nПосле того как вы вносите предоплату 30%, мы сразу же оформляем и оплачиваем заказ в Китае. После оплаты в Китае заказ не может быть отменён и средства не возвращаются.`,
      sizes:    `📏 Размеры\n\nЧтобы подобрать правильный размер, нам понадобятся ваш рост, вес и размер одежды, который вы обычно носите (S, M, L, XL и т.д.).\n\nЕсли вы знаете свои параметры — укажите их при оформлении заказа в мини-приложении.\n\n${MINI_APP_LINK}`,
      quality:  `✅ О качестве\n\nОдежда заказывается у проверенных продавцов и фабрик в Китае.\n\nКачество хорошее — подходит для повседневной носки. Но учитывайте, что это бюджетная одежда: не ожидайте премиального или оригинального брендового качества. Гарантируем качество, соответствующее цене.`,
      payment:  `💳 Способы оплаты\n\n✅ Payme\n✅ Click`,
      looks:    `🧥 Все луки здесь:\n\n👉 ${MINI_APP_LINK}`,
    },
  },

  en: {
    welcome: `👋 Hello! Welcome to Auralook!\n\nChoose a question:`,
    questions: [
      { label: '💰 Prices',         key: 'prices'   },
      { label: '📦 How to order',   key: 'order'    },
      { label: '🚚 Cargo delivery', key: 'delivery' },
      { label: '💳 30% deposit',    key: 'deposit'  },
      { label: '❌ Cancellation',   key: 'cancel'   },
      { label: '📏 Sizes',          key: 'sizes'    },
      { label: '✅ Quality',        key: 'quality'  },
      { label: '💳 Payment',        key: 'payment'  },
      { label: '🧥 All looks',      key: 'looks'    },
    ],
    answers: {
      prices:   `Our prices 💰\n\nEach look has its own price — shown under each item.\n\n📦 Cargo cost is paid separately\n💳 30% upfront, the rest after the product is delivered\n\nBrowse all looks: ${MINI_APP_LINK}`,
      order:    `Ordering is simple! 👇\n\n1️⃣ Pick a look in the Mini App\n2️⃣ Pay 30% deposit (Payme/Click)\n3️⃣ Wait 7–12 days — air delivery from China\n4️⃣ Pay remaining 70% + cargo on delivery\n\nOrder here: ${MINI_APP_LINK} ✅`,
      delivery: `🚚 What is cargo delivery?\n\nCargo is an air delivery service from China to Tashkent. Your order is shipped from China and arrives within 7–12 days.`,
      deposit:  `💳 What is the 30% deposit?\n\nIt is the part of the payment you make upfront to confirm your order. For example, for a 300,000 UZS look you pay 90,000 UZS now. The rest is paid on delivery.\n\nThis is our precaution — some customers may refuse to pay or stop responding after the order has arrived in Tashkent. The deposit protects against that.\n\n⚠️ The deposit is non-refundable.`,
      cancel:   `❌ Orders cannot be cancelled\n\nOnce you pay the 30% deposit, we immediately place and pay for the order in China. After the order is paid for in China, it cannot be cancelled and no refunds are issued.`,
      sizes:    `📏 Sizes\n\nTo get the right size, we need your height, weight and the clothing size you usually wear (S, M, L, XL etc.).\n\nIf you know your measurements — add them when placing your order in the Mini App.\n\n${MINI_APP_LINK}`,
      quality:  `✅ Quality\n\nClothes are ordered from verified sellers and factories in China.\n\nThe quality is good — suitable for everyday wear. However, keep in mind this is affordable clothing: do not expect premium or original brand quality. We guarantee quality that matches the price.`,
      payment:  `💳 Payment methods\n\n✅ Payme\n✅ Click`,
      looks:    `🧥 See all looks here:\n\n👉 ${MINI_APP_LINK}`,
    },
  },
};
