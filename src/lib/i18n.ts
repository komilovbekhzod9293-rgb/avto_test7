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
    shifts: string[];
    mapCta: string;
    branches: { name: string; address: string; mapUrl: string }[];
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
      title: 'Права',
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
        { title: 'Фойдали маълумотлар', desc: 'Барча йўл белгилари расмлари ва тушунтиришлари билан' },
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
      freeBadge: "1-дарс ва Якуний тест — бепул",
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
      schedule: '5 та смена мавжуд',
      shifts: ['10:00–13:00', '13:00–15:00', '15:00–18:00', '19:00–21:00', '21:00–23:00'],
      mapCta: "Харитада кўриш",
      branches: [
        { name: 'Новза филиали', address: 'Тошкент, Новза', mapUrl: 'https://www.google.com/maps?q=41.288832,69.229788' },
        { name: 'Юнусобод филиали', address: 'Тошкент, Юнусобод', mapUrl: 'https://www.google.com/maps?q=41.369306,69.281378' },
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
        {
          q: 'Сизда фақат офлайн дарслар борми ёки онлайн дарслар ҳам борми?',
          a: 'Бизда офлайн ва онлайн дарслар мавжуд, дарсларнинг сифат даражаси бирхил. Онлайн дарсларимиз платформамизда жойлашган ва юқори сифатдаги видео дарсликлар ҳам бор, билимни олиб кетидан тест ечасиз. Права олиш эҳтимоли 95%.',
        },
        {
          q: 'Онлайн платформангизда барча 1300 савол мавжудми ва янги саволлар ҳам қўшилиб турадими?',
          a: 'Ҳа, онлайн платформамизда барча саволлар бор, биз учун ўқувчиларимиз билим даражаси муҳим ва шу сабаб платформа устида тўхтовсиз ишлаймиз ва ривожлантирамиз.',
        },
        {
          q: 'Онлайн ўқиб ҳам права олишимни иложи борми?',
          a: 'Ҳа, албатта! Платформамиз орқали 2 кунда ҳам права олган ўқувчиларимиз бор. Дарслар ва платформа сифатига баҳо бериш учун ундан бепул фойдаланиб кўришингиз мумкин.',
        },
        {
          q: 'Мен вилоятда яшайман, Тошкентга боришга қийналаман, сизларда қандай ўқисам бўлади?',
          a: 'Сиз бизнинг онлайн курсимизда ўқисангиз бўлади.',
        },
        {
          q: 'Курсда ўқиб права олишимга кафолат берасизми?',
          a: 'Ҳа, биз сизни имтиҳондан ўтиш учун максимал тарзда тайёрлаймиз, ҳар кунлик дарслардан ташқари сизга уйга вазифалар ҳам берилади ва онлайн платформамиздан ҳам фойдалана оласиз. Бу учун биз барча шароитларни яратиб берамиз.',
        },
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
      title: 'Права за',
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
      freeBadge: 'Первый урок и финальный тест — бесплатно',
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
      schedule: 'Доступно 5 смен',
      shifts: ['10:00–13:00', '13:00–15:00', '15:00–18:00', '19:00–21:00', '21:00–23:00'],
      mapCta: 'Посмотреть на карте',
      branches: [
        { name: 'Филиал Новза', address: 'Ташкент, Новза', mapUrl: 'https://www.google.com/maps?q=41.288832,69.229788' },
        { name: 'Филиал Юнусабад', address: 'Ташкент, Юнусабад', mapUrl: 'https://www.google.com/maps?q=41.369306,69.281378' },
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
        {
          q: 'У вас только офлайн-уроки или есть и онлайн?',
          a: 'У нас есть и офлайн, и онлайн уроки — уровень качества одинаковый. Наши онлайн-уроки размещены на платформе, есть видеоуроки высокого качества; после изучения вы решаете тесты. Вероятность получить права — 95%.',
        },
        {
          q: 'На онлайн-платформе есть все 1300 вопросов и добавляются ли новые?',
          a: 'Да, на онлайн-платформе есть все вопросы. Для нас важен уровень знаний наших учеников, поэтому мы непрерывно работаем над платформой и развиваем её.',
        },
        {
          q: 'Можно ли получить права, обучаясь только онлайн?',
          a: 'Да, конечно! Через нашу платформу есть ученики, получившие права даже за 2 дня. Чтобы оценить уроки и платформу, вы можете попробовать её бесплатно.',
        },
        {
          q: 'Я живу в области, мне трудно приезжать в Ташкент — как я могу у вас учиться?',
          a: 'Вы можете учиться на нашем онлайн-курсе.',
        },
        {
          q: 'Даёте ли вы гарантию, что я получу права, обучаясь на курсе?',
          a: 'Да, мы максимально готовим вас к сдаче экзамена: помимо ежедневных занятий вам даются домашние задания, и вы также можете пользоваться нашей онлайн-платформой. Мы создаём для этого все условия.',
        },
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
      freeBadge: 'Lesson 1 and the final test are free',
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
      schedule: '5 shifts available',
      shifts: ['10:00–13:00', '13:00–15:00', '15:00–18:00', '19:00–21:00', '21:00–23:00'],
      mapCta: 'View on map',
      branches: [
        { name: 'Novza branch', address: 'Tashkent, Novza', mapUrl: 'https://www.google.com/maps?q=41.288832,69.229788' },
        { name: 'Yunusobod branch', address: 'Tashkent, Yunusobod', mapUrl: 'https://www.google.com/maps?q=41.369306,69.281378' },
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
        {
          q: 'Do you only have offline lessons, or online lessons too?',
          a: 'We have both offline and online lessons — the quality is the same. Our online lessons live on the platform, with high-quality video lessons; after studying, you solve tests. The chance of getting your license is 95%.',
        },
        {
          q: 'Does the online platform have all 1300 questions, and are new ones added?',
          a: "Yes, the online platform has all the questions. Our students' knowledge matters to us, so we work on and improve the platform non-stop.",
        },
        {
          q: 'Can I get my license by studying only online?',
          a: 'Yes, absolutely! Some of our students got their license in just 2 days through the platform. You can try it for free to judge the lessons and the platform.',
        },
        {
          q: 'I live in a region and find it hard to come to Tashkent — how can I study with you?',
          a: 'You can study on our online course.',
        },
        {
          q: 'Do you guarantee I will get my license if I study on the course?',
          a: 'Yes — we prepare you as much as possible to pass the exam: besides daily lessons you also get homework, and you can use our online platform. We create all the conditions for it.',
        },
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
