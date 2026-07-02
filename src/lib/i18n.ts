export type Lang = 'uz' | 'ru' | 'en';

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'uz', label: "O'zbekcha" },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
];

export interface LandingDict {
  nav: { login: string; freeLesson: string };
  hero: {
    badge: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  stats: { graduates: string; passRate: string; questions: string; days: string };
  problem: {
    title: string;
    items: { problem: string; solution: string }[];
  };
  features: {
    title: string;
    subtitle: string;
    items: { title: string; desc: string }[];
  };
  howItWorks: {
    title: string;
    steps: { title: string; desc: string }[];
  };
  pricing: {
    title: string;
    subtitle: string;
    freeBadge: string;
    onlineNote: string;
    plans: { name: string; price: string; desc: string; features: string[]; highlight?: boolean }[];
    cta: string;
  };
  locations: {
    title: string;
    schedule: string;
    branches: { name: string; address: string }[];
  };
  testimonials: {
    title: string;
    note: string;
    items: { quote: string; author: string }[];
  };
  faq: {
    title: string;
    items: { q: string; a: string }[];
  };
  footer: {
    tagline: string;
    contact: string;
    legal: string;
    offer: string;
    privacy: string;
    rights: string;
  };
}

export const LANDING_DICTS: Record<Lang, LandingDict> = {
  uz: {
    nav: { login: 'Кириш', freeLesson: 'Бепул дарс' },
    hero: {
      badge: '12 000+ ўқувчи ҳайдовчилик гувоҳномасини олган',
      title: 'ПДДни',
      titleHighlight: '7 кунда',
      subtitle:
        'Мнемоника усули билан 1300+ саволни осон ва тез эслаб қолинг. Ўзбекистондаги биринчи мнемоника асосидаги ҳайдовчилик тест платформаси.',
      ctaPrimary: 'Бепул дарсни бошлаш',
      ctaSecondary: "Рўйхатдан ўтиш",
    },
    stats: {
      graduates: 'битирувчи',
      passRate: 'биринчи уринишда топширади',
      questions: 'расмий savol',
      days: 'кунлик курс',
    },
    problem: {
      title: 'Танишми бу ҳолат?',
      items: [
        { problem: 'Имтиҳондан қўрқасиз', solution: 'Ҳақиқий имтиҳон форматида кўп марта машқ қиласиз — қўрқув йўқолади' },
        { problem: 'Қоидаларни эслаб қололмайсиз', solution: 'Мнемоника усули ҳар бир белги ва қоидани миянгизга осон жойлаштиради' },
        { problem: 'Вақтингиз йўқ', solution: '7 кунлик экспресс курс — кунига атиги 3 соат' },
      ],
    },
    features: {
      title: 'Платформада нима бор',
      subtitle: 'Фақат тест эмас — тўлиқ тайёргарлик тизими',
      items: [
        { title: 'Мнемоника усули', desc: 'Ҳар бир қийин саволни осон эслаб қолиш усули билан ўрганасиз' },
        { title: 'Мусобақа режими', desc: 'Дўстларингиз билан 1:1 дуэлда билимингизни синанг' },
        { title: 'Рекорд вақт', desc: 'Ҳар мавзу бўйича энг тез ечиш вақтингиз сақланади' },
        { title: 'Якуний тест — доим очиқ', desc: '20/50/100/200 та тасодифий савол билан ўзингизни синаб кўринг' },
        { title: "Foydali ma'lumotlar", desc: 'Барча йўл белгилари расмлари ва тушунтиришлари билан' },
        { title: 'Хатолар устида ишлаш', desc: 'Хато қилган саволларингизни алоҳида такрорлайсиз' },
      ],
    },
    howItWorks: {
      title: 'Қандай ишлайди',
      steps: [
        { title: 'Рўйхатдан ўтинг', desc: 'Телефон рақамингиз билан бир неча сонияда' },
        { title: 'Telegram орқали тасдиқланг', desc: 'Бот орқали рақамингизни тасдиқлайсиз — хавфсиз ва тез' },
        { title: "Ўрганишни бошланг", desc: '44 мавзу, 1300+ савол — мнемоника усулида' },
      ],
    },
    pricing: {
      title: 'Тарифлар',
      subtitle: 'Ўзингизга мосини танланг',
      freeBadge: "1-дарс ва Якуний тест — рўйхатдан ўтмасдан бепул",
      onlineNote:
        'Офлайн курс сотиб олганларга 15 кунлик, тўлиқ онлайн курс сотиб олганларга эса 30 кунлик онлайн доступ (видео дарслар билан) берилади.',
      plans: [
        { name: 'Standard', price: "590 000 сўм", desc: 'Назарий дарслар', features: ['Йўл қоидалари', 'Тест тайёргарлиги'] },
        {
          name: 'Premium+',
          price: '1 290 000 сўм',
          desc: 'Тўлиқ мнемоника курси',
          features: ['Кунига 3 соат назария', 'Мнемоника усули', 'Кенгайтирилган тест тайёргарлиги', '7 кунда тайёр'],
          highlight: true,
        },
        {
          name: 'VIP',
          price: '2 500 000 сўм',
          desc: 'Шахсий устоз билан',
          features: ['Premium+ барча имкониятлари', 'Шахсий устоз', 'Индивидуал жадвал'],
        },
        { name: 'Booster', price: 'Нархни сўранг', desc: 'Дам олиш кунлари интенсив', features: ['Шанба-якшанба', 'Жами 8 соат'] },
      ],
      cta: "Танлаш",
    },
    locations: {
      title: 'Филиалларимиз',
      schedule: 'Дарс вақтлари: 10:30 / 15:00 / 19:00 (ҳар бири 3 соат)',
      branches: [
        { name: 'Нўзà филиали', address: 'Тошкент, Нўзà тумани' },
        { name: 'Юнусобод филиали', address: 'Тошкент, Юнусобод тумани' },
      ],
    },
    testimonials: {
      title: 'Ўқувчилар фикри',
      note: "Тез орада ҳақиқий ўқувчиларимизнинг видео ва ёзма фикрлари қўшилади",
      items: [
        { quote: 'Мнемоника усули ҳақиқатан ҳам ишлайди — қоидаларни унутмай қолдим.', author: 'Курс ўқувчиси' },
        { quote: 'Booster курси орқали дам олиш кунида тайёрланиб, биринчи уринишда топширдим.', author: 'Курс ўқувчиси' },
        { quote: 'Онлайн видео дарслар жуда қулай — уйдан чиқмасдан тайёрландим.', author: 'Курс ўқувчиси' },
      ],
    },
    faq: {
      title: 'Кўп сўраладиган саволлар',
      items: [
        { q: 'Бепул бошлаш мумкинми?', a: 'Ҳа, биринчи дарс ва Якуний тест ҳеч қандай рўйхатдан ўтмасдан бепул.' },
        { q: 'Курс неча кун давом этади?', a: 'Экспресс курс — 7 кун. Booster курси эса дам олиш кунлари, жами 8 соат.' },
        { q: 'Онлайн ёки офлайнми?', a: 'Иккаласи ҳам мавжуд — офлайн филиалларда ёки тўлиқ онлайн платформа орқали.' },
        { q: "Тўловни қандай амалга ошираман?", a: "Ҳозирча Telegram орқали оператор билан боғланиб тўлов қиласиз. Онлайн тўлов яқин орада қўшилади." },
        { q: 'Агар топширолмасам-чи?', a: 'Хатолар устида алоҳида ишлаш тизими ва такрорий тестлар сизга ёрдам беради.' },
      ],
    },
    footer: {
      tagline: "Мнемоника усулида ПДД тайёргарлиги",
      contact: 'Боғланиш',
      legal: 'Ҳужжатлар',
      offer: 'Оммавий оферта',
      privacy: 'Махфийлик сиёсати',
      rights: 'Барча ҳуқуқлар ҳимояланган',
    },
  },
  ru: {
    nav: { login: 'Войти', freeLesson: 'Бесплатный урок' },
    hero: {
      badge: '12 000+ учеников уже получили права',
      title: 'ПДД за',
      titleHighlight: '7 дней',
      subtitle:
        'Запоминайте 1300+ вопросов легко и быстро с помощью метода мнемоники. Первая в Узбекистане платформа подготовки к экзамену ПДД на основе мнемотехники.',
      ctaPrimary: 'Начать бесплатный урок',
      ctaSecondary: 'Зарегистрироваться',
    },
    stats: { graduates: 'выпускников', passRate: 'сдают с первой попытки', questions: 'официальных вопросов', days: 'дней курс' },
    problem: {
      title: 'Знакомая ситуация?',
      items: [
        { problem: 'Боитесь экзамена', solution: 'Тренируетесь в формате реального экзамена столько раз, сколько нужно — страх уходит' },
        { problem: 'Не можете запомнить правила', solution: 'Метод мнемоники закладывает каждый знак и правило в память легко и надолго' },
        { problem: 'Нет времени', solution: 'Экспресс-курс за 7 дней — всего 3 часа в день' },
      ],
    },
    features: {
      title: 'Что есть на платформе',
      subtitle: 'Не просто тесты — полноценная система подготовки',
      items: [
        { title: 'Метод мнемоники', desc: 'Учите каждый сложный вопрос по методике лёгкого запоминания' },
        { title: 'Режим дуэли', desc: 'Проверьте знания в формате 1 на 1 с друзьями' },
        { title: 'Рекорд времени', desc: 'Сохраняется ваш лучший результат по времени для каждой темы' },
        { title: 'Финальный тест — всегда открыт', desc: 'Проверьте себя на 20/50/100/200 случайных вопросах' },
        { title: 'Полезные материалы', desc: 'Все дорожные знаки с фото и пояснениями' },
        { title: 'Работа над ошибками', desc: 'Отдельно повторяете вопросы, где ошиблись' },
      ],
    },
    howItWorks: {
      title: 'Как это работает',
      steps: [
        { title: 'Регистрация', desc: 'По номеру телефона за пару секунд' },
        { title: 'Подтверждение через Telegram', desc: 'Подтверждаете номер через бота — быстро и безопасно' },
        { title: 'Начинаете учиться', desc: '44 темы, 1300+ вопросов — по методу мнемоники' },
      ],
    },
    pricing: {
      title: 'Тарифы',
      subtitle: 'Выберите подходящий вариант',
      freeBadge: 'Первый урок и финальный тест — бесплатно, без регистрации',
      onlineNote:
        'Купившим офлайн-курс даётся 15 дней онлайн-доступа, а купившим полностью онлайн-курс — 30 дней доступа с видеоуроками.',
      plans: [
        { name: 'Standard', price: '590 000 сум', desc: 'Теоретические занятия', features: ['Правила дорожного движения', 'Подготовка к тестам'] },
        {
          name: 'Premium+',
          price: '1 290 000 сум',
          desc: 'Полный курс мнемоники',
          features: ['3 часа теории в день', 'Метод мнемоники', 'Расширенная подготовка к тестам', 'Готовность за 7 дней'],
          highlight: true,
        },
        {
          name: 'VIP',
          price: '2 500 000 сум',
          desc: 'С личным наставником',
          features: ['Всё из Premium+', 'Личный наставник', 'Индивидуальный график'],
        },
        { name: 'Booster', price: 'Узнать цену', desc: 'Интенсив выходного дня', features: ['Суббота-воскресенье', '8 часов всего'] },
      ],
      cta: 'Выбрать',
    },
    locations: {
      title: 'Наши филиалы',
      schedule: 'Время занятий: 10:30 / 15:00 / 19:00 (по 3 часа)',
      branches: [
        { name: 'Филиал Нузя', address: 'Ташкент, Нузинский район' },
        { name: 'Филиал Юнусабад', address: 'Ташкент, Юнусабадский район' },
      ],
    },
    testimonials: {
      title: 'Отзывы учеников',
      note: 'Скоро добавим видео и текстовые отзывы наших реальных учеников',
      items: [
        { quote: 'Метод мнемоники правда работает — перестал(а) забывать правила.', author: 'Ученик курса' },
        { quote: 'Прошёл(ла) Booster-курс за выходные и сдал(а) с первого раза.', author: 'Ученик курса' },
        { quote: 'Онлайн-видеоуроки очень удобны — готовился(ась) не выходя из дома.', author: 'Ученик курса' },
      ],
    },
    faq: {
      title: 'Часто задаваемые вопросы',
      items: [
        { q: 'Можно начать бесплатно?', a: 'Да, первый урок и финальный тест доступны без какой-либо регистрации.' },
        { q: 'Сколько длится курс?', a: 'Экспресс-курс — 7 дней. Booster-курс проходит в выходные, всего 8 часов.' },
        { q: 'Онлайн или офлайн?', a: 'Доступны оба варианта — в филиалах офлайн или полностью онлайн через платформу.' },
        { q: 'Как оплатить?', a: 'Сейчас оплата через оператора в Telegram. Онлайн-оплата появится в ближайшее время.' },
        { q: 'А если не сдам?', a: 'Система работы над ошибками и повторные тесты помогут подготовиться лучше.' },
      ],
    },
    footer: {
      tagline: 'Подготовка к ПДД по методу мнемоники',
      contact: 'Контакты',
      legal: 'Документы',
      offer: 'Публичная оферта',
      privacy: 'Политика конфиденциальности',
      rights: 'Все права защищены',
    },
  },
  en: {
    nav: { login: 'Log in', freeLesson: 'Free lesson' },
    hero: {
      badge: '12,000+ students already got their license',
      title: 'Traffic rules in',
      titleHighlight: '7 days',
      subtitle:
        'Memorize 1,300+ exam questions easily and fast with the mnemonic method — the first mnemonic-based driving test prep platform in Uzbekistan.',
      ctaPrimary: 'Start free lesson',
      ctaSecondary: 'Sign up',
    },
    stats: { graduates: 'graduates', passRate: 'pass on the first try', questions: 'official questions', days: 'day course' },
    problem: {
      title: 'Sound familiar?',
      items: [
        { problem: 'Afraid of the exam', solution: 'Practice in the real exam format as many times as you need — the fear disappears' },
        { problem: "Can't remember the rules", solution: 'The mnemonic method locks every sign and rule into memory, easily and for good' },
        { problem: "Don't have time", solution: 'A 7-day express course — just 3 hours a day' },
      ],
    },
    features: {
      title: "What's on the platform",
      subtitle: 'Not just tests — a full prep system',
      items: [
        { title: 'Mnemonic method', desc: 'Learn every tricky question with an easy-to-remember technique' },
        { title: 'Duel mode', desc: 'Test your knowledge 1-on-1 against friends' },
        { title: 'Best time record', desc: 'Your fastest completion time is saved for every topic' },
        { title: 'Final test — always open', desc: 'Challenge yourself with 20/50/100/200 random questions' },
        { title: 'Useful info', desc: 'Every road sign, with photos and explanations' },
        { title: 'Mistake review', desc: 'Questions you got wrong are automatically queued for a retry' },
      ],
    },
    howItWorks: {
      title: 'How it works',
      steps: [
        { title: 'Register', desc: 'With your phone number, in seconds' },
        { title: 'Verify via Telegram', desc: "Confirm your number through the bot — fast and secure" },
        { title: 'Start learning', desc: '44 topics, 1,300+ questions — the mnemonic way' },
      ],
    },
    pricing: {
      title: 'Pricing',
      subtitle: 'Pick what fits you',
      freeBadge: 'Lesson 1 and the final test — free, no signup needed',
      onlineNote:
        'Offline-course buyers get 15 days of online access; buyers of the fully-online course get 30 days of access with video lessons.',
      plans: [
        { name: 'Standard', price: '590,000 UZS', desc: 'Theory lessons', features: ['Traffic rules', 'Test prep'] },
        {
          name: 'Premium+',
          price: '1,290,000 UZS',
          desc: 'Full mnemonic course',
          features: ['3 hours of theory daily', 'Mnemonic method', 'Extended test prep', 'Ready in 7 days'],
          highlight: true,
        },
        {
          name: 'VIP',
          price: '2,500,000 UZS',
          desc: 'With a personal mentor',
          features: ['Everything in Premium+', 'Personal mentor', 'Custom schedule'],
        },
        { name: 'Booster', price: 'Ask for price', desc: 'Weekend intensive', features: ['Saturday-Sunday', '8 hours total'] },
      ],
      cta: 'Choose',
    },
    locations: {
      title: 'Our branches',
      schedule: 'Class times: 10:30 / 15:00 / 19:00 (3 hours each)',
      branches: [
        { name: 'Novza branch', address: 'Tashkent, Novza district' },
        { name: 'Yunusobod branch', address: 'Tashkent, Yunusobod district' },
      ],
    },
    testimonials: {
      title: 'What students say',
      note: "Real video and written reviews from our students are coming soon",
      items: [
        { quote: 'The mnemonic method really works — I stopped forgetting the rules.', author: 'Course student' },
        { quote: 'Did the Booster course over a weekend and passed on the first try.', author: 'Course student' },
        { quote: 'The online video lessons are super convenient — studied from home.', author: 'Course student' },
      ],
    },
    faq: {
      title: 'Frequently asked questions',
      items: [
        { q: 'Can I start for free?', a: 'Yes, the first lesson and the final test are free, no signup required.' },
        { q: 'How long is the course?', a: 'The express course is 7 days. The Booster course runs on weekends, 8 hours total.' },
        { q: 'Online or offline?', a: 'Both — at our branches offline, or fully online through the platform.' },
        { q: 'How do I pay?', a: "Right now payment goes through a Telegram operator. Online payment is coming soon." },
        { q: "What if I don't pass?", a: 'The mistake-review system and repeat tests help you prepare better.' },
      ],
    },
    footer: {
      tagline: 'Driving test prep with the mnemonic method',
      contact: 'Contact',
      legal: 'Legal',
      offer: 'Public offer',
      privacy: 'Privacy policy',
      rights: 'All rights reserved',
    },
  },
};
