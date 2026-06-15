export type LandingLang = 'en' | 'ru' | 'uz';

export interface LandingCopy {
  nav: { features: string; how: string; languages: string; login: string; signup: string };
  hero: {
    badge: string;
    titleA: string;
    titleAccent: string;
    titleB: string;
    subtitle: string;
    cta: string;
    secondary: string;
    note: string;
  };
  trust: string[];
  demo: {
    tabs: { dashboard: string; add: string; receipt: string };
    balanceLabel: string;
    balanceDelta: string;
    today: string;
    month: string;
    chartCaption: string;
    rows: { name: string; method: string; amount: string }[];
    add: {
      income: string;
      expense: string;
      amountLabel: string;
      categoryLabel: string;
      category: string;
      methodLabel: string;
      cash: string;
      card: string;
      save: string;
    };
    scan: {
      caption: string;
      merchant: string;
      totalLabel: string;
      category: string;
      done: string;
    };
  };
  featuresTitle: string;
  featuresSubtitle: string;
  features: { title: string; desc: string }[];
  valueProps: { title: string; subtitle: string; items: { title: string; desc: string }[] };
  howTitle: string;
  how: { title: string; desc: string }[];
  receipt: { badge: string; title: string; desc: string; cta: string };
  comparison: {
    title: string;
    subtitle: string;
    sumly: string;
    other: string;
    rows: { label: string; sumly: boolean; other: boolean }[];
  };
  langs: { title: string; desc: string };
  free: { badge: string; title: string; desc: string; cta: string; points: string[] };
  faq: { title: string; items: { q: string; a: string }[] };
  finalCta: { title: string; subtitle: string; cta: string };
  footer: { tagline: string; rights: string; madeIn: string };
}

const en: LandingCopy = {
  nav: { features: 'Features', how: 'How it works', languages: 'Languages', login: 'Log in', signup: 'Sign up' },
  hero: {
    badge: 'Money, made simple',
    titleA: 'Know exactly where your ',
    titleAccent: 'money',
    titleB: ' goes.',
    subtitle:
      'Sumly turns every income and expense into a clear picture of your finances — in seconds, on any phone, in your language.',
    cta: 'Get started free',
    secondary: 'Log in',
    note: 'Free forever · No card required',
  },
  trust: ['Free to use', '3 languages', 'AI receipt scan', 'Works on any phone', 'Your data secured'],
  demo: {
    tabs: { dashboard: 'Dashboard', add: 'Add', receipt: 'Receipt scan' },
    balanceLabel: 'Total balance',
    balanceDelta: '+12% this month',
    today: 'Today',
    month: 'Month',
    chartCaption: 'Last 7 days',
    rows: [
      { name: 'Salary', method: 'Cash', amount: '+3 000 000' },
      { name: 'Groceries', method: 'Card •• 4242', amount: '−85 000' },
      { name: 'Freelance', method: 'Card •• 4242', amount: '+450 000' },
      { name: 'Taxi', method: 'Cash', amount: '−22 000' },
    ],
    add: {
      income: 'Income',
      expense: 'Expense',
      amountLabel: 'Amount',
      categoryLabel: 'Category',
      category: 'Groceries',
      methodLabel: 'Method',
      cash: 'Cash',
      card: 'Card',
      save: 'Save transaction',
    },
    scan: {
      caption: 'Reading receipt…',
      merchant: 'Korzinka',
      totalLabel: 'Total',
      category: 'Groceries',
      done: 'Read automatically',
    },
  },
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
  valueProps: {
    title: 'Why people switch to Sumly',
    subtitle: 'The fastest way to actually keep track — and finally understand your money.',
    items: [
      {
        title: 'Stop wondering where it went',
        desc: 'Every so‘m is recorded and sorted, so your balance and spending are never a mystery.',
      },
      {
        title: 'Faster than a notebook',
        desc: 'No formulas, no clutter. Log a transaction in a few taps and get back to your day.',
      },
      {
        title: 'Made for Uzbekistan',
        desc: 'Amounts in so‘m, three languages, and a design that works on the phone in your pocket.',
      },
    ],
  },
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
  comparison: {
    title: 'Sumly vs. the old way',
    subtitle: 'Spreadsheets and paper notebooks weren’t built for daily money on your phone.',
    sumly: 'Sumly',
    other: 'Spreadsheet / notebook',
    rows: [
      { label: 'Add an expense in seconds', sumly: true, other: false },
      { label: 'Built for your phone', sumly: true, other: false },
      { label: 'Automatic balance & reports', sumly: true, other: false },
      { label: 'AI receipt scanning', sumly: true, other: false },
      { label: 'In your language, so‘m-native', sumly: true, other: false },
      { label: 'Free to use', sumly: true, other: true },
    ],
  },
  langs: {
    title: 'In your language, for your market',
    desc: 'Switch instantly between O‘zbekcha, Русский and English. Amounts in so‘m, built for how Uzbekistan tracks money.',
  },
  free: {
    badge: 'Free to start',
    title: 'Everything above, for free.',
    desc: 'Create an account and use Sumly today — no payment, no trial countdown, no catch.',
    cta: 'Create my free account',
    points: ['No card required', 'Unlimited transactions', 'All features included'],
  },
  faq: {
    title: 'Questions, answered',
    items: [
      { q: 'Is Sumly really free?', a: 'Yes. You can create an account and track your money for free — no card and no trial countdown.' },
      {
        q: 'Is my financial data safe?',
        a: 'Your account is protected by your password and your data is private to you. We never sell your information.',
      },
      { q: 'Does it work on my phone?', a: 'Yes. Sumly is mobile-first and runs in any modern browser — no app store download needed.' },
      { q: 'Which languages are supported?', a: 'English, Русский and O‘zbekcha. Switch anytime and the whole app follows.' },
      { q: 'Can I export my data?', a: 'Yes. Download filtered transactions or a full monthly workbook as a real Excel (.xlsx) file.' },
    ],
  },
  finalCta: { title: 'Start tracking every so‘m — free.', subtitle: 'Join Sumly and take control of your money today.', cta: 'Get started free' },
  footer: { tagline: 'Track every so‘m.', rights: 'All rights reserved.', madeIn: 'Made for Uzbekistan' },
};

const ru: LandingCopy = {
  nav: { features: 'Возможности', how: 'Как это работает', languages: 'Языки', login: 'Войти', signup: 'Регистрация' },
  hero: {
    badge: 'Деньги — это просто',
    titleA: 'Точно знайте, куда уходят ваши ',
    titleAccent: 'деньги',
    titleB: '.',
    subtitle:
      'Sumly превращает каждый доход и расход в ясную картину ваших финансов — за секунды, на любом телефоне, на вашем языке.',
    cta: 'Начать бесплатно',
    secondary: 'Войти',
    note: 'Бесплатно навсегда · Без карты',
  },
  trust: ['Бесплатно', '3 языка', 'ИИ-сканер чеков', 'Работает на любом телефоне', 'Ваши данные защищены'],
  demo: {
    tabs: { dashboard: 'Панель', add: 'Добавить', receipt: 'Скан чека' },
    balanceLabel: 'Общий баланс',
    balanceDelta: '+12% за месяц',
    today: 'Сегодня',
    month: 'Месяц',
    chartCaption: 'Последние 7 дней',
    rows: [
      { name: 'Зарплата', method: 'Наличные', amount: '+3 000 000' },
      { name: 'Продукты', method: 'Карта •• 4242', amount: '−85 000' },
      { name: 'Фриланс', method: 'Карта •• 4242', amount: '+450 000' },
      { name: 'Такси', method: 'Наличные', amount: '−22 000' },
    ],
    add: {
      income: 'Доход',
      expense: 'Расход',
      amountLabel: 'Сумма',
      categoryLabel: 'Категория',
      category: 'Продукты',
      methodLabel: 'Способ',
      cash: 'Наличные',
      card: 'Карта',
      save: 'Сохранить операцию',
    },
    scan: {
      caption: 'Читаем чек…',
      merchant: 'Korzinka',
      totalLabel: 'Итого',
      category: 'Продукты',
      done: 'Прочитано автоматически',
    },
  },
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
  valueProps: {
    title: 'Почему выбирают Sumly',
    subtitle: 'Самый быстрый способ действительно вести учёт — и наконец понять свои деньги.',
    items: [
      {
        title: 'Хватит гадать, куда ушли деньги',
        desc: 'Каждый сум записан и распределён, поэтому баланс и траты больше не загадка.',
      },
      {
        title: 'Быстрее, чем блокнот',
        desc: 'Никаких формул и беспорядка. Запишите операцию в пару касаний и вернитесь к делам.',
      },
      {
        title: 'Создано для Узбекистана',
        desc: 'Суммы в сумах, три языка и дизайн, который работает на телефоне в вашем кармане.',
      },
    ],
  },
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
  comparison: {
    title: 'Sumly против старых способов',
    subtitle: 'Таблицы и бумажные блокноты не созданы для ежедневных денег на телефоне.',
    sumly: 'Sumly',
    other: 'Таблица / блокнот',
    rows: [
      { label: 'Добавить расход за секунды', sumly: true, other: false },
      { label: 'Создано для телефона', sumly: true, other: false },
      { label: 'Автоматический баланс и отчёты', sumly: true, other: false },
      { label: 'ИИ-сканирование чеков', sumly: true, other: false },
      { label: 'На вашем языке, в сумах', sumly: true, other: false },
      { label: 'Бесплатно', sumly: true, other: true },
    ],
  },
  langs: {
    title: 'На вашем языке, для вашего рынка',
    desc: 'Мгновенно переключайтесь между O‘zbekcha, Русским и English. Суммы в сумах, как принято в Узбекистане.',
  },
  free: {
    badge: 'Бесплатный старт',
    title: 'Всё перечисленное — бесплатно.',
    desc: 'Создайте аккаунт и пользуйтесь Sumly уже сегодня — без оплаты, без отсчёта пробного периода, без подвоха.',
    cta: 'Создать бесплатный аккаунт',
    points: ['Без карты', 'Неограниченно операций', 'Все функции включены'],
  },
  faq: {
    title: 'Ответы на вопросы',
    items: [
      { q: 'Sumly действительно бесплатен?', a: 'Да. Вы можете создать аккаунт и вести учёт бесплатно — без карты и без отсчёта пробного периода.' },
      {
        q: 'Мои финансовые данные в безопасности?',
        a: 'Ваш аккаунт защищён паролем, а данные доступны только вам. Мы никогда не продаём вашу информацию.',
      },
      { q: 'Работает ли на моём телефоне?', a: 'Да. Sumly создан в первую очередь для телефона и работает в любом современном браузере — без установки из магазина.' },
      { q: 'Какие языки поддерживаются?', a: 'English, Русский и O‘zbekcha. Переключайтесь в любой момент — весь интерфейс меняется.' },
      { q: 'Можно ли экспортировать данные?', a: 'Да. Скачайте отфильтрованные операции или полную месячную книгу в реальном формате Excel (.xlsx).' },
    ],
  },
  finalCta: { title: 'Считайте каждый сум — бесплатно.', subtitle: 'Присоединяйтесь к Sumly и возьмите деньги под контроль уже сегодня.', cta: 'Начать бесплатно' },
  footer: { tagline: 'Считайте каждый сум.', rights: 'Все права защищены.', madeIn: 'Создано для Узбекистана' },
};

const uz: LandingCopy = {
  nav: { features: 'Imkoniyatlar', how: 'Qanday ishlaydi', languages: 'Tillar', login: 'Kirish', signup: 'Ro‘yxatdan o‘tish' },
  hero: {
    badge: 'Pulni boshqarish oson',
    titleA: 'Pulingiz qayerga ketayotganini aniq ',
    titleAccent: 'biling',
    titleB: '.',
    subtitle:
      'Sumly har bir daromad va xarajatni moliyangizning aniq manzarasiga aylantiradi — soniyalarda, istalgan telefonda, o‘z tilingizda.',
    cta: 'Bepul boshlash',
    secondary: 'Kirish',
    note: 'Doimo bepul · Karta shart emas',
  },
  trust: ['Bepul', '3 til', 'AI chek skani', 'Har qanday telefonda', 'Maʼlumotlaringiz himoyalangan'],
  demo: {
    tabs: { dashboard: 'Panel', add: 'Qo‘shish', receipt: 'Chek skani' },
    balanceLabel: 'Umumiy balans',
    balanceDelta: 'Bu oyda +12%',
    today: 'Bugun',
    month: 'Oy',
    chartCaption: 'Oxirgi 7 kun',
    rows: [
      { name: 'Maosh', method: 'Naqd', amount: '+3 000 000' },
      { name: 'Oziq-ovqat', method: 'Karta •• 4242', amount: '−85 000' },
      { name: 'Frilans', method: 'Karta •• 4242', amount: '+450 000' },
      { name: 'Taksi', method: 'Naqd', amount: '−22 000' },
    ],
    add: {
      income: 'Daromad',
      expense: 'Xarajat',
      amountLabel: 'Summa',
      categoryLabel: 'Toifa',
      category: 'Oziq-ovqat',
      methodLabel: 'Usul',
      cash: 'Naqd',
      card: 'Karta',
      save: 'Amalni saqlash',
    },
    scan: {
      caption: 'Chek o‘qilmoqda…',
      merchant: 'Korzinka',
      totalLabel: 'Jami',
      category: 'Oziq-ovqat',
      done: 'Avtomatik o‘qildi',
    },
  },
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
  valueProps: {
    title: 'Nega Sumly’ni tanlashadi',
    subtitle: 'Haqiqatan hisob yuritishning eng tezkor yo‘li — va nihoyat pulingizni tushunish.',
    items: [
      {
        title: 'Pul qayerga ketganini taxmin qilmang',
        desc: 'Har so‘m yozib, tartiblanadi — shuning uchun balans va xarajatlar endi jumboq emas.',
      },
      {
        title: 'Daftardan tezroq',
        desc: 'Formulalar yo‘q, chalkashlik yo‘q. Amalni bir necha tegishda yozing-da, ishingizga qayting.',
      },
      {
        title: 'O‘zbekiston uchun yaratilgan',
        desc: 'Summalar so‘mda, uch til va cho‘ntagingizdagi telefonda ishlaydigan dizayn.',
      },
    ],
  },
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
  comparison: {
    title: 'Sumly va eski usul',
    subtitle: 'Jadvallar va qog‘oz daftarlar telefondagi kundalik pul uchun yaratilmagan.',
    sumly: 'Sumly',
    other: 'Jadval / daftar',
    rows: [
      { label: 'Xarajatni soniyalarda qo‘shish', sumly: true, other: false },
      { label: 'Telefon uchun yaratilgan', sumly: true, other: false },
      { label: 'Avtomatik balans va hisobotlar', sumly: true, other: false },
      { label: 'AI chek skani', sumly: true, other: false },
      { label: 'O‘z tilingizda, so‘mda', sumly: true, other: false },
      { label: 'Bepul', sumly: true, other: true },
    ],
  },
  langs: {
    title: 'O‘z tilingizda, o‘z bozoringiz uchun',
    desc: 'O‘zbekcha, Русский va English o‘rtasida bir zumda almashing. Summalar so‘mda, O‘zbekiston uchun moslangan.',
  },
  free: {
    badge: 'Bepul boshlang',
    title: 'Yuqoridagilarning hammasi — bepul.',
    desc: 'Hisob yarating va Sumly’dan bugunoq foydalaning — to‘lovsiz, sinov muddati sanoqsiz, shartsiz.',
    cta: 'Bepul hisob yaratish',
    points: ['Karta shart emas', 'Cheksiz amallar', 'Barcha imkoniyatlar'],
  },
  faq: {
    title: 'Savollarga javoblar',
    items: [
      { q: 'Sumly haqiqatan bepulmi?', a: 'Ha. Hisob yaratib, pulingizni bepul yuritishingiz mumkin — kartasiz va sinov muddati sanoqsiz.' },
      {
        q: 'Moliyaviy maʼlumotlarim xavfsizmi?',
        a: 'Hisobingiz parol bilan himoyalangan, maʼlumotlaringiz faqat sizniki. Biz maʼlumotlaringizni hech qachon sotmaymiz.',
      },
      { q: 'Telefonimda ishlaydimi?', a: 'Ha. Sumly avvalo telefon uchun yaratilgan va istalgan zamonaviy brauzerda ishlaydi — do‘kondan yuklash shart emas.' },
      { q: 'Qaysi tillar qo‘llab-quvvatlanadi?', a: 'English, Русский va O‘zbekcha. Istalgan vaqtda almashing — butun ilova mos keladi.' },
      { q: 'Maʼlumotlarimni eksport qila olamanmi?', a: 'Ha. Filtrlangan amallarni yoki to‘liq oylik kitobni haqiqiy Excel (.xlsx) faylida yuklab oling.' },
    ],
  },
  finalCta: { title: 'Har so‘mni hisoblang — bepul.', subtitle: 'Sumly’ga qo‘shiling va bugun pulingizni nazoratga oling.', cta: 'Bepul boshlash' },
  footer: { tagline: 'Har so‘mni hisobla.', rights: 'Barcha huquqlar himoyalangan.', madeIn: 'O‘zbekiston uchun yaratilgan' },
};

const copies: Record<LandingLang, LandingCopy> = { en, ru, uz };

export function getLandingCopy(lang: LandingLang): LandingCopy {
  return copies[lang];
}
