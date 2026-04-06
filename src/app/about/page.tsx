
"use client"

import { useLanguage } from '@/hooks/use-language';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Globe, ShieldCheck, Zap, ArrowRight, Quote } from 'lucide-react';
import Link from 'next/link';

const TESTIMONIALS = [
  { name: 'Shohruh', uz: 'Sifat darajasi narxiga nisbatan kutilganidan ancha yuqori. Men kurtka buyurtma qildim va u hayotda rasmdagidan ham yaxshiroq ko\'rinadi.', ru: 'Качество за такую цену превзошло все ожидания. Заказал куртку, вживую выглядит круче, чем на фото.', en: 'Honestly didn’t expect this level of quality for the price. I ordered a jacket and it looked even better in real life than in the photos.' },
  { name: 'Azimjon', uz: 'Tez va oddiy jarayon. Buyurtma berdim va tezda tasdiqlandi. Kiyimlar sifatli — allaqachon bir necha marta buyurtma berdim.', ru: 'Быстрый и простой процесс. Оформил заказ, быстро подтвердили. Вещи качественные — заказываю уже не первый раз.', en: 'Fast and simple process. I placed my order and got confirmation quickly. The clothes are good quality — already ordered multiple times.' },
  { name: 'Aziz', uz: 'Boshida Xitoydan buyurtma berishga ishonmagandim, lekin mato zo\'r chiqdi. Yaxshi o\'tiradi, begona hidlar yo\'q. Zo\'r tajriba.', ru: 'Сначала сомневался в заказе из Китая, но ткань оказалась отличной. Сидит хорошо, без запахов. Отличный опыт.', en: 'At first I wasn’t sure about ordering from China, but the fabric turned out great. Fits well, no strange smells, no loose threads. Solid experience.' },
  { name: 'Otabek', uz: 'Narxlar haqiqatan ham adolatli. Mahalliy do\'konlar bilan solishtirdim — bu ancha yaxshi. Zamonaviy uslub va aniq o\'lchamlar.', ru: 'Цены действительно честные. Сравнил с местными магазинами — этот вариант намного лучше. Современный стиль и точный размер.', en: 'Prices are actually fair. I compared with local stores and this is way better. Modern styles and accurate sizing.' },
  { name: 'Samandar', uz: 'Menga hamma narsa qanchalik osonligi yoqadi. Magazinma-magazin yurish yo\'q, navbatlar yo\'q. Telefon orqali buyurtma berdim va bir necha kunda oldim.', ru: 'Больше всего нравится, как все просто. Никаких походов по магазинам и очередей. Заказал через телефон и получил за несколько дней.', en: 'What I like most is how easy everything is. No shops, no waiting in lines. Ordered through phone and received it in a few days.' },
];

export default function AboutPage() {
  const { t, dictionary } = useLanguage();

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden pb-32">
      {/* DECORATIVE GRID */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="about-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#about-grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-6 pt-16 space-y-24 relative z-10">
        
        {/* HERO SECTION */}
        <section className="space-y-8 max-w-4xl">
          <div className="space-y-2">
            <p className="text-[10px] font-black tracking-[0.5em] neon-text uppercase italic">
              —— {t(dictionary.est2026)}
            </p>
            <h1 className="text-6xl sm:text-8xl font-black tracking-tighter uppercase italic leading-none neon-text">
              {t(dictionary.weDressTheBold)}
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-foreground/70 font-medium leading-relaxed max-w-2xl italic">
            {t(dictionary.aboutDesc)}
          </p>
        </section>

        {/* NUMBERS SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-y border-foreground/10 py-16">
          <div className="space-y-2">
            <h2 className="text-5xl font-black neon-text italic tracking-tighter">2026</h2>
            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">{t(dictionary.foundedLabel)}</p>
          </div>
          <div className="space-y-2">
            <h2 className="text-5xl font-black neon-text italic tracking-tighter">500+</h2>
            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">{t(dictionary.ordersPlaced)}</p>
          </div>
          <div className="space-y-2">
            <h2 className="text-5xl font-black neon-text italic tracking-tighter">100%</h2>
            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">{t(dictionary.qualityChecked)}</p>
          </div>
        </section>

        {/* VALUES SECTION */}
        <section className="space-y-12">
          <h2 className="text-[10px] font-black tracking-[0.5em] text-foreground/40 uppercase">—— {t(dictionary.whatWeStandFor)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: t(dictionary.qualityTitle), desc: t(dictionary.qualityDesc) },
              { icon: Globe, title: t(dictionary.honestPriceTitle), desc: t(dictionary.honestPriceDesc) },
              { icon: Zap, title: t(dictionary.fastOrderTitle), desc: t(dictionary.fastOrderDesc) }
            ].map((v, i) => (
              <Card key={i} className="glass-surface border-foreground/5 p-8 rounded-[2.5rem] space-y-6 group hover:border-primary/20 transition-all">
                <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center group-hover:neon-border transition-all">
                  <v.icon className="w-6 h-6 neon-text" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black uppercase italic text-foreground">{v.title}</h3>
                  <p className="text-sm text-foreground/60 leading-relaxed font-medium">{v.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="space-y-12">
          <h2 className="text-[10px] font-black tracking-[0.5em] text-foreground/40 uppercase">—— {t(dictionary.howItWorks)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { id: '01', title: t(dictionary.step01Title), desc: t(dictionary.step01Desc) },
              { id: '02', title: t(dictionary.step02Title), desc: t(dictionary.step02Desc) },
              { id: '03', title: t(dictionary.step03Title), desc: t(dictionary.step03Desc) }
            ].map((step) => (
              <div key={step.id} className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-foreground/10 italic">{step.id}</span>
                  <div className="h-px flex-grow bg-foreground/10" />
                </div>
                <h3 className="text-lg font-black uppercase italic text-foreground">{step.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* DELIVERY & PAYMENT */}
        <section className="glass-surface border-foreground/10 rounded-[3rem] p-10 md:p-16 space-y-10 bg-black/40">
          <div className="space-y-2">
            <h2 className="text-3xl font-black uppercase italic neon-text">{t(dictionary.deliveryPayment)}</h2>
            <div className="h-1 w-24 neon-bg" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <ul className="space-y-4">
              {[
                t(dictionary.chinaDirect),
                t(dictionary.deliveryTimeVal),
                t(dictionary.prepaymentVal),
                t(dictionary.remainingPaymentVal),
                t(dictionary.cargoPaymentVal)
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 group">
                  <div className="w-1.5 h-1.5 neon-bg rotate-45 mt-2 shrink-0" />
                  <span className="text-sm text-foreground/80 font-bold uppercase tracking-wide group-hover:neon-text transition-colors">{item}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-6">
              <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">{t(dictionary.deliveryMethod)}</p>
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-foreground/5 border border-foreground/5">
                  <p className="text-sm text-foreground font-black italic uppercase">{t(dictionary.tashkentTaxi)}</p>
                </div>
                <div className="p-6 rounded-2xl bg-foreground/5 border border-foreground/5">
                  <p className="text-sm text-foreground font-black italic uppercase">{t(dictionary.regionsPost)}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS LOOP */}
        <section className="space-y-12">
          <h2 className="text-[10px] font-black tracking-[0.5em] text-foreground/40 uppercase text-center">—— {t(dictionary.whatPeopleSay)}</h2>
          <div className="relative overflow-hidden py-10">
            <div className="flex animate-marquee-right gap-6 whitespace-nowrap">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((test, i) => (
                <Card key={i} className="glass-surface border-foreground/5 p-8 rounded-[2.5rem] min-w-[320px] max-w-[320px] space-y-6 shrink-0 inline-block align-top whitespace-normal">
                  <Quote className="w-8 h-8 text-foreground/10" />
                  <p className="text-sm text-foreground/80 italic font-medium leading-relaxed">
                    "{t(test as any)}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-foreground/5">
                    <div className="w-8 h-8 rounded-full neon-bg flex items-center justify-center text-black font-black text-[10px]">
                      {test.name[0]}
                    </div>
                    <span className="text-xs font-black uppercase italic text-foreground tracking-widest">{test.name}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="text-center space-y-10 py-20">
          <div className="space-y-4">
            <p className="text-[10px] font-black tracking-[0.5em] text-foreground/40 uppercase">{t(dictionary.readyToUpgrade)}</p>
            <h2 className="text-5xl sm:text-7xl font-black uppercase italic neon-text tracking-tighter">{t(dictionary.findYourLook)}</h2>
            <p className="text-sm text-foreground/60 font-medium uppercase tracking-widest">{t(dictionary.startBrowsing)}</p>
          </div>
          <Button asChild className="h-20 px-16 rounded-[2rem] neon-bg text-black font-black uppercase tracking-[0.2em] border-none hover:scale-105 transition-transform shadow-[0_0_50px_var(--sync-shadow)] group">
            <Link href="/looks">
              {t(dictionary.openApp)}
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </Button>
        </section>

      </div>
    </div>
  );
}
