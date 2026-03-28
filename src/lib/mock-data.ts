export type Language = 'uz' | 'ru' | 'en';

export interface Look {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  imageUrl: string;
  price: number;
  tags: string[];
}

export interface Order {
  id: string;
  customerName: string;
  telegramUsername: string;
  lookId: string;
  status: 'New' | 'Confirmed' | 'Shipped' | 'Delivered';
  createdAt: string;
  amount: number;
}

export const MOCK_LOOKS: Look[] = [
  {
    id: '1',
    name: {
      uz: 'Cyber Runner Libosi',
      ru: 'Костюм Cyber Runner',
      en: 'Cyber Runner Outfit'
    },
    description: {
      uz: 'Shahar tadqiqotlari uchun mo\'ljallangan yuqori samarali techwear ansambli.',
      ru: 'Высокоэффективный ансамбль технологичной одежды, предназначенный для городских исследований.',
      en: 'High-performance techwear ensemble designed for urban exploration.'
    },
    imageUrl: 'https://picsum.photos/seed/look1/600/800',
    price: 249,
    tags: ['Techwear', 'Neon', 'Street']
  },
  {
    id: '2',
    name: {
      uz: 'Neon Nomad To\'plami',
      ru: 'Комплект Neon Nomad',
      en: 'Neon Nomad Set'
    },
    description: {
      uz: 'Tungi vaqtda ko\'rinish uchun aks ettiruvchi elementlarga ega ko\'p qirrali kiyimlar.',
      ru: 'Универсальная одежда со светоотражающими элементами для видимости в ночное время.',
      en: 'Versatile apparel featuring reflective elements for nighttime visibility.'
    },
    imageUrl: 'https://picsum.photos/seed/look2/600/800',
    price: 189,
    tags: ['Reflective', 'Nomad', 'Urban']
  },
  {
    id: '3',
    name: {
      uz: 'Matrix Minimalist',
      ru: 'Минималист Matrix',
      en: 'Matrix Minimalist'
    },
    description: {
      uz: 'Namlikni o\'tkazmaydigan ilg\'or matolarga ega zamonaviy qora-qora estetika.',
      ru: 'Современная эстетика «черное на черном» с использованием современных влагоотводящих тканей.',
      en: 'Modern black-on-black aesthetic featuring advanced moisture-wicking fabrics.'
    },
    imageUrl: 'https://picsum.photos/seed/look3/600/800',
    price: 320,
    tags: ['Minimalist', 'Black', 'Matrix']
  },
  {
    id: '4',
    name: {
      uz: 'Zenith Aviator',
      ru: 'Зенит Авиатор',
      en: 'Zenith Aviator'
    },
    description: {
      uz: 'Yuqori balandlikdagi parvoz asbob-uskunalaridan ilhomlangan, qulaylik va chidamlilikni uyg\'unlashtirgan.',
      ru: 'Вдохновлен высотным летным снаряжением, сочетающим в себе комфорт и долговечность.',
      en: 'Inspired by high-altitude flight gear, blending comfort and durability.'
    },
    imageUrl: 'https://picsum.photos/seed/look4/600/800',
    price: 450,
    tags: ['Aviation', 'Premium', 'Tech']
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Aziz Rakimov',
    telegramUsername: '@aziz_dev',
    lookId: '1',
    status: 'New',
    createdAt: new Date().toISOString(),
    amount: 249
  },
  {
    id: 'ORD-002',
    customerName: 'Elena Petrova',
    telegramUsername: '@elena_p',
    lookId: '3',
    status: 'Confirmed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    amount: 320
  }
];
