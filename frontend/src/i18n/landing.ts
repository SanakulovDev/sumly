export type LandingLang = 'en' | 'ru' | 'uz';

export interface LandingCopy {
  nav: { features: string; how: string; languages: string; login: string; signup: string };
  hero: { badge: string; titleA: string; titleAccent: string; titleB: string; subtitle: string; cta: string; secondary: string };
  trust: string[];
  featuresTitle: string;
  featuresSubtitle: string;
  features: { title: string; desc: string }[];
  howTitle: string;
  how: { title: string; desc: string }[];
  receipt: { badge: string; title: string; desc: string; cta: string };
  langs: { title: string; desc: string };
  finalCta: { title: string; subtitle: string; cta: string };
  footer: { tagline: string; rights: string };
}

const en: LandingCopy = {
  nav: { features: 'Features', how: 'How it works', languages: 'Languages', login: 'Log in', signup: 'Sign up' },
  hero: {
    badge: '💰 Money, made simple',
    titleA: 'Know exactly where your ',
    titleAccent: 'money',
    titleB: ' goes.',
    subtitle: 'Record income and expenses in seconds. Built for Uzbekistan — mobile-first, in your language, free.',
    cta: 'Get started free',
    secondary: 'Log in',
  },
  trust: ['Free to use', '3 languages', 'Works on any phone', 'Export to Excel'],
  featuresTitle: 'Everything you need to track your money',
  featuresSubtitle: 'Simple enough for daily use, powerful enough to see the full picture.',
  features: [
    { title: 'Fast entry', desc: 'Add an income or expense in seconds — one tap from anywhere.' },
    { title: 'Receipt scan', desc: 'Snap a receipt photo and let AI read the amount for you.' },
    { title: 'Cash or card', desc: 'Mark a method as a card and capture the last 4 digits automatically.' },
    { title: 'Live dashboard', desc: 'See your balance plus today’s and this month’s income, expense and profit.' },
    { title: 'Filters & reports', desc: 'Filter by type, category, method and date; daily and monthly breakdowns.' },
    { title: 'Excel export', desc: 'Download filtered transactions or a full monthly workbook as a real .xlsx file.' },
  ],
  howTitle: 'Start in three steps',
  how: [
    { title: 'Create your account', desc: 'Sign up free — default categories and payment methods are ready instantly.' },
    { title: 'Add a transaction', desc: 'Record income or an expense, by cash or card, in a few taps.' },
    { title: 'See your money clearly', desc: 'Watch your balance and reports update live, and export anytime.' },
  ],
  receipt: {
    badge: 'AI receipt scan',
    title: 'Snap a receipt. We’ll do the typing.',
    desc: 'Take a photo of any receipt and Sumly reads the amount and details, so you just review and save. No more manual entry.',
    cta: 'Try it free',
  },
  langs: {
    title: 'In your language, for your market',
    desc: 'Switch instantly between O‘zbekcha, Русский and English. Amounts in so‘m, built for how Uzbekistan tracks money.',
  },
  finalCta: { title: 'Start tracking every so‘m — free.', subtitle: 'Join Sumly and take control of your money today.', cta: 'Get started free' },
  footer: { tagline: 'Track every so‘m.', rights: 'All rights reserved.' },
};

const ru: LandingCopy = {
  nav: { features: 'Возможности', how: 'Как это работает', languages: 'Языки', login: 'Войти', signup: 'Регистрация' },
  hero: {
    badge: '💰 Деньги — это просто',
    titleA: 'Точно знайте, куда уходят ваши ',
    titleAccent: 'деньги',
    titleB: '.',
    subtitle: 'Записывайте доходы и расходы за секунды. Создано для Узбекистана — удобно на телефоне, на вашем языке, бесплатно.',
    cta: 'Начать бесплатно',
    secondary: 'Войти',
  },
  trust: ['Бесплатно', '3 языка', 'Работает на любом телефоне', 'Экспорт в Excel'],
  featuresTitle: 'Всё, что нужно для учёта денег',
  featuresSubtitle: 'Достаточно просто для каждого дня и достаточно мощно, чтобы видеть полную картину.',
  features: [
    { title: 'Быстрый ввод', desc: 'Добавьте доход или расход за секунды — одним касанием из любого места.' },
    { title: 'Сканирование чека', desc: 'Сфотографируйте чек, и ИИ сам прочитает сумму.' },
    { title: 'Наличные или карта', desc: 'Отметьте способ как карту и автоматически сохраните последние 4 цифры.' },
    { title: 'Живая панель', desc: 'Баланс, а также доход, расход и прибыль за сегодня и за месяц.' },
    { title: 'Фильтры и отчёты', desc: 'Фильтр по типу, категории, способу и дате; разбивка по дням и месяцам.' },
    { title: 'Экспорт в Excel', desc: 'Скачайте отфильтрованные операции или месячную книгу в реальном .xlsx.' },
  ],
  howTitle: 'Начните за три шага',
  how: [
    { title: 'Создайте аккаунт', desc: 'Регистрация бесплатна — категории и способы оплаты готовы сразу.' },
    { title: 'Добавьте операцию', desc: 'Запишите доход или расход, наличными или картой, в пару касаний.' },
    { title: 'Видьте деньги ясно', desc: 'Баланс и отчёты обновляются вживую, экспорт в любой момент.' },
  ],
  receipt: {
    badge: 'ИИ-сканирование чеков',
    title: 'Сфотографируйте чек. Печатать будем мы.',
    desc: 'Сделайте фото любого чека — Sumly прочитает сумму и детали, вам остаётся проверить и сохранить. Больше никакого ручного ввода.',
    cta: 'Попробовать бесплатно',
  },
  langs: {
    title: 'На вашем языке, для вашего рынка',
    desc: 'Мгновенно переключайтесь между O‘zbekcha, Русским и English. Суммы в сумах, как принято в Узбекистане.',
  },
  finalCta: { title: 'Считайте каждый сум — бесплатно.', subtitle: 'Присоединяйтесь к Sumly и возьмите деньги под контроль уже сегодня.', cta: 'Начать бесплатно' },
  footer: { tagline: 'Считайте каждый сум.', rights: 'Все права защищены.' },
};

const uz: LandingCopy = {
  nav: { features: 'Imkoniyatlar', how: 'Qanday ishlaydi', languages: 'Tillar', login: 'Kirish', signup: 'Ro‘yxatdan o‘tish' },
  hero: {
    badge: '💰 Pulni boshqarish oson',
    titleA: 'Pulingiz qayerga ketayotganini aniq ',
    titleAccent: 'biling',
    titleB: '.',
    subtitle: 'Daromad va xarajatlarni soniyalarda yozing. O‘zbekiston uchun — telefonga qulay, o‘z tilingizda, bepul.',
    cta: 'Bepul boshlash',
    secondary: 'Kirish',
  },
  trust: ['Bepul', '3 til', 'Har qanday telefonda', 'Excelга eksport'],
  featuresTitle: 'Pulingizni nazorat qilish uchun hammasi',
  featuresSubtitle: 'Har kuni ishlatishga yetarlicha sodda, to‘liq manzarani ko‘rishga yetarlicha kuchli.',
  features: [
    { title: 'Tez kiritish', desc: 'Daromad yoki xarajatni soniyalarda qo‘shing — istalgan joydan bir tegishda.' },
    { title: 'Chek skani', desc: 'Chek suratini oling, summani sun’iy intellekt o‘zi o‘qiydi.' },
    { title: 'Naqd yoki karta', desc: 'Usulni karta deb belgilang va oxirgi 4 raqamni avtomatik saqlang.' },
    { title: 'Jonli panel', desc: 'Balans hamda bugungi va shu oylik daromad, xarajat va foyda.' },
    { title: 'Filtr va hisobotlar', desc: 'Turi, toifa, usul va sana bo‘yicha filtr; kunlik va oylik tahlil.' },
    { title: 'Excelга eksport', desc: 'Filtrlangan amallarni yoki oylik kitobni haqiqiy .xlsx sifatida yuklab oling.' },
  ],
  howTitle: 'Uch qadamda boshlang',
  how: [
    { title: 'Hisob yarating', desc: 'Ro‘yxatdan o‘tish bepul — toifalar va to‘lov usullari darhol tayyor.' },
    { title: 'Amal qo‘shing', desc: 'Daromad yoki xarajatni naqd yoki karta orqali bir necha tegishda yozing.' },
    { title: 'Pulni aniq ko‘ring', desc: 'Balans va hisobotlar jonli yangilanadi, istalgan vaqtda eksport qiling.' },
  ],
  receipt: {
    badge: 'AI chek skani',
    title: 'Chekni suratga oling. Yozishni biz qilamiz.',
    desc: 'Istalgan chek suratini oling — Sumly summa va tafsilotlarni o‘qiydi, siz faqat tekshirib saqlaysiz. Endi qo‘lda kiritish yo‘q.',
    cta: 'Bepul sinab ko‘ring',
  },
  langs: {
    title: 'O‘z tilingizda, o‘z bozoringiz uchun',
    desc: 'O‘zbekcha, Русский va English o‘rtasida bir zumda almashing. Summalar so‘mda, O‘zbekiston uchun moslangan.',
  },
  finalCta: { title: 'Har so‘mni hisoblang — bepul.', subtitle: 'Sumly’ga qo‘shiling va bugun pulingizni nazoratga oling.', cta: 'Bepul boshlash' },
  footer: { tagline: 'Har so‘mni hisobla.', rights: 'Barcha huquqlar himoyalangan.' },
};

const copies: Record<LandingLang, LandingCopy> = { en, ru, uz };

export function getLandingCopy(lang: LandingLang): LandingCopy {
  return copies[lang];
}
