export type Language = 'uz';

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
      uz: 'Cyber Runner Libosi'
    },
    description: {
      uz: 'Shahar tadqiqotlari uchun mo\'ljallangan yuqori samarali techwear ansambli.'
    },
    imageUrl: 'https://picsum.photos/seed/look1/600/800',
    price: 249,
    tags: ['Techwear', 'Neon', 'Street']
  },
  {
    id: '2',
    name: {
      uz: 'Neon Nomad To\'plami'
    },
    description: {
      uz: 'Tungi vaqtda ko\'rinish uchun aks ettiruvchi elementlarga ega ko\'p qirrali kiyimlar.'
    },
    imageUrl: 'https://picsum.photos/seed/look2/600/800',
    price: 189,
    tags: ['Reflective', 'Nomad', 'Urban']
  },
  {
    id: '3',
    name: {
      uz: 'Matrix Minimalist'
    },
    description: {
      uz: 'Namlikni o\'tkazmaydigan ilg\'or matolarga ega zamonaviy qora-qora estetika.'
    },
    imageUrl: 'https://picsum.photos/seed/look3/600/800',
    price: 320,
    tags: ['Minimalist', 'Black', 'Matrix']
  },
  {
    id: '4',
    name: {
      uz: 'Zenith Aviator'
    },
    description: {
      uz: 'Yuqori balandlikdagi parvoz asbob-uskunalaridan ilhomlangan, qulaylik va chidamlilikni uyg\'unlashtirgan.'
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
