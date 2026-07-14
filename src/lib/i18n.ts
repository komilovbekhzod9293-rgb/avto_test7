export type Lang = 'uz' | 'uzl' | 'ru' | 'en';

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'uz', label: 'Ўзбекча' },
  { code: 'uzl', label: "O'zbekcha" },
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
  legalPages: {
    offer: LegalDoc;
    privacy: LegalDoc;
  };
}

export interface LegalDoc {
  title: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
}

const BASE_DICTS: Record<'uz' | 'ru' | 'en', LandingDict> = {
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
      schedule: '5 та дарс вақти мавжуд',
      shifts: ['10:00–13:00', '13:00–15:00', '15:00–18:00', '19:00–21:00', '21:00–23:00'],
      mapCta: "Харитада кўриш",
      branches: [
        { name: 'Новза филиали', address: 'Тошкент, Новза', mapUrl: 'https://www.google.com/maps?q=41.288832,69.229788' },
        { name: 'Юнусобод филиали', address: 'Тошкент, Юнусобод', mapUrl: 'https://www.google.com/maps?q=41.369306,69.281378' },
      ],
    },
    testimonials: {
      title: 'Ўқувчилар фикри',
      note: "Ўқувчиларимизнинг ҳақиқий фикрлари",
      items: [
        { quote: 'Assalomu alaykum. Rahmat ustoz, bergan bilimlaringiz uchun. Imtihondan oʻtdim 20/20 ✅', author: 'Озода' },
        { quote: 'Bexzod aka rahmat aka, imtihondan oʻtdim ✊🏻✊🏻', author: 'Аҳад' },
        { quote: 'Kecha hujjatim hal boʻldi, bugun borib topshirib keldim. Rahmat, katta oʻtvoldim 😊', author: 'Мадина' },
        { quote: 'Rahmat aka, men oʻtdim imtihondan 🎉', author: 'Шоҳрух' },
        { quote: 'Qalaysiz, yaxshimisiz? Men oʻtdim, hozir bordim test. Rahmat hammaga 🙏', author: 'Наргиза' },
        { quote: 'Rahmat kattakon sizlarga, Prava On ENG ZOʻRI 👍👍👍', author: 'Жасур' },
        { quote: 'Video darslar juda tushunarli, uydan chiqmasdan tayyorlandim va oʻtdim 🚗', author: 'Дилноза' },
        { quote: 'Mnemonika metodi zoʻr ekan, qoidalarni oson yodladim. Rahmat! 💪', author: 'Феруз' },
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
    legalPages: {
      offer: {
        title: 'Оммавий оферта',
        updated: '2026 йил 13 июлдан амалда',
        sections: [
          {
            heading: '1. Умумий қоидалар',
            body: [
              '"EDU MAX" МЧЖ (кейинги ўринларда — "Ижрочи", "Prava On") ушбу ҳужжат орқали ҳар қандай тўлиқ муомала лаёқатига эга жисмоний шахсга (кейинги ўринларда — "Фойдаланувчи", "Ўқувчи") қуйида кўрсатилган шартларда шартнома тузишни таклиф қилади (оммавий оферта).',
              'prava-on.com сайтида рўйхатдан ўтиш ва/ёки танланган тарифни тўлаш — ушбу офертанинг шартларини тўлиқ ва сўзсиз қабул қилиш (акцепт) ҳисобланади.',
              'Ушбу ҳужжатнинг тил версиялари ўртасида фарқ бўлган тақдирда, ўзбек тилидаги версия устувор ҳисобланади.',
            ],
          },
          {
            heading: '2. Шартнома предмети',
            body: [
              'Ижрочи Фойдаланувчига ҳайдовчилик гувоҳномасини олиш назарий имтиҳонига тайёргарлик кўриш учун Prava On онлайн ва офлайн платформасидан фойдаланиш имкониятини беради: видео дарслар, мнемоника усулидаги ўқув материаллари, 44 мавзу бўйича тест топшириқлари (1300+ савол), Якуний тест функцияси, дуэль режими ва йўл белгилари бўлими.',
              'Хизматлар қуйидаги тарифлардан бирига мувофиқ кўрсатилади: Standard, Premium+, VIP, Booster — ҳар бир тарифнинг таркиби ва нархи тўлов пайтида сайтда кўрсатилади.',
            ],
          },
          {
            heading: '3. Нарх ва тўлов тартиби',
            body: [
              'Тарифлар нархи: Standard — 590 000 сўм, Premium+ — 1 290 000 сўм, VIP — 2 500 000 сўм, Booster — сўров бўйича.',
              'Тўлов Click, Payme орқали, шунингдек нақд пул ёки филиалда банк картаси (Uzcard/Humo) орқали қабул қилинади. Фойдаланувчи ушбу усуллардан ўзига қулайини мустақил танлаш ҳуқуқига эга.',
              'Офлайн курс сотиб олган Фойдаланувчиларга платформадан 15 кун давомида, тўлиқ онлайн курс сотиб олганларга эса видео дарслар билан 30 кун давомида фойдаланиш имконияти берилади.',
            ],
          },
          {
            heading: '4. Пул маблағларини қайтариш',
            body: [
              'Ушбу шартнома бўйича тўлов якуний ҳисобланади. Тўланган маблағлар, шу жумладан Фойдаланувчи хизмат кўрсатилиши бошлангандан кейин ўқишни давом эттиришдан воз кечган тақдирда ҳам, ҳеч қандай ҳолатда қайтарилмайди.',
            ],
          },
          {
            heading: '5. Тарафларнинг ҳуқуқ ва мажбуриятлари',
            body: [
              'Ижрочи танланган тариф доирасида материаллардан фойдаланиш имкониятини ва платформанинг ишлашини таъминлайди.',
              'Фойдаланувчи рўйхатдан ўтишда ҳақиқий маълумотларни (телефон рақами) кўрсатиши ва ўз ҳисобига кириш имкониятини учинчи шахсларга бермаслиги шарт.',
              'Ижрочи тўлов амалга оширилмаган тақдирда пуллик материалларга киришни чеклаш, шунингдек ҳисобни учинчи шахсларга узатиш ҳолати аниқланганда ҳисобни блоклаш ҳуқуқига эга.',
            ],
          },
          {
            heading: '6. Тарафларнинг жавобгарлиги',
            body: [
              'Тарафлар ушбу шартнома бўйича мажбуриятларни бажармаганлик учун Ўзбекистон Республикаси қонунчилигига мувофиқ жавобгар бўлади.',
              'Ижрочи Фойдаланувчининг ҲАВда имтиҳондан ўтиш натижаси учун жавобгар эмас, чунки бу кўплаб омилларга, шу жумладан Фойдаланувчининг шахсий тайёргарлигига боғлиқ.',
              'Тарафлардан ҳеч бири енгиб бўлмайдиган куч таъсирида (форс-мажор) юзага келган ҳолатлар учун жавобгар эмас.',
            ],
          },
          {
            heading: '7. Низоларни ҳал қилиш тартиби',
            body: [
              'Барча низо ва келишмовчиликлар музокаралар йўли билан ҳал қилинади. Келишувга эришилмаган тақдирда — претензия тартибида (ёзма мурожаат орқали), натижа бермаса — Ўзбекистон Республикаси қонунчилигига мувофиқ суд тартибида ҳал қилинади.',
            ],
          },
          {
            heading: '8. Якуний қоидалар',
            body: [
              'Ижрочи ушбу офертанинг шартларини бир томонлама тартибда ўзгартириш, янги таҳрирни сайтда жойлаштириш ҳуқуқига эга. Ўзгаришлардан кейин платформадан фойдаланишни давом эттириш — янги таҳрирга розилик билдирилганини англатади.',
              'Ижрочининг реквизитлари: "EDU MAX" МЧЖ, Ўзбекистон Республикаси, Тошкент шаҳри.',
              'Алоқа: +998 55 513 27 77, Telegram @avto_test7, Instagram @avto_test7.',
            ],
          },
        ],
      },
      privacy: {
        title: 'Махфийлик сиёсати',
        updated: '2026 йил 13 июлдан амалда',
        sections: [
          {
            heading: '1. Умумий қоидалар',
            body: [
              'Ушбу Махфийлик сиёсати "EDU MAX" МЧЖга тегишли Prava On платформаси (кейинги ўринларда — "Платформа") фойдаланувчиларининг шахсий маълумотларини қайта ишлаш тартибини Ўзбекистон Республикасининг "Шахсга доир маълумотлар тўғрисида"ги қонунига (ЎРҚ-547) мувофиқ белгилайди.',
              'Платформада рўйхатдан ўтиш орқали Фойдаланувчи ўз шахсий маълумотларини ушбу Сиёсат шартларида қайта ишлашга розилик беради.',
            ],
          },
          {
            heading: '2. Қандай маълумотлар йиғилади',
            body: [
              'Рўйхатдан ўтишда кўрсатилган телефон рақами ва исм/логин.',
              'Telegram бот орқали рақамни тасдиқлашда олинадиган Telegram ID.',
              'Дарслар ва тестларни топшириш натижалари, прогресс статистикаси, вақт бўйича рекордлар.',
              'Қурилманинг техник идентификатори (device id) — бир ҳисобни бир нечта шахсга узатишдан ҳимоя қилиш учун.',
              'Браузерда локал сақланадиган маълумотлар (localStorage): сессия токени, танланган интерфейс тили, AI-консультант билан ёзишмалар тарихи.',
            ],
          },
          {
            heading: '3. Маълумотларни қайта ишлаш мақсадлари',
            body: [
              'Платформага киришда Фойдаланувчини идентификация ва аутентификация қилиш.',
              'Ҳисобни ҳимоя қилиш учун телефон рақамини Telegram орқали тасдиқлаш.',
              'Тўланган материалларга кириш имкониятини бериш ва ўқув прогрессини кузатиш.',
              '"AI-консультант" функциясининг ишлашини таъминлаш (курслар ҳақидаги саволларга жавоб бериш).',
            ],
          },
          {
            heading: '4. Маълумотларни учинчи шахсларга узатиш',
            body: [
              'Платформанинг ишлаши учун маълумотлар қуйидаги хизматлар ёрдамида қайта ишланади: Supabase (маълумотлар базаси ва файлларни сақлаш), Telegram Bot API (телефон рақамини тасдиқлаш), сунъий интеллект хизмати (n8n орқали OpenAI ёки Groq) — AI-консультант ишлаши учун.',
              'Платформа Фойдаланувчиларнинг шахсий маълумотларини реклама ёки бошқа тижорат мақсадларида учинчи шахсларга сотмайди ва узатмайди.',
            ],
          },
          {
            heading: '5. Маълумотларни сақлаш ва ҳимоя қилиш',
            body: [
              'Маълумотлар Supabase серверларида, маълумотлар базаси даражасида кириш чекловлари (Row Level Security) билан сақланади — бу бегона шахсларнинг жадваллар мазмунига бевосита киришини истисно қилади.',
              'Ҳисобга кириш Фойдаланувчининг аниқ қурилмасига боғланган индивидуал сессия токени билан ҳимояланади.',
            ],
          },
          {
            heading: '6. Фойдаланувчи ҳуқуқлари',
            body: [
              'Фойдаланувчи истаган пайтда сақланаётган шахсий маълумотлари ҳақида маълумот олиш, уларни тузатиш ёки ўчиришни сўраш ҳуқуқига эга — бунинг учун "Алоқа" бўлимида кўрсатилган телефон ёки Telegram орқали мурожаат қилиш кифоя.',
              'Фойдаланувчи шахсий маълумотларни қайта ишлашга розилигини бекор қилиш ҳуқуқига эга, бу эса Платформадан кейинги фойдаланиш имконсиз бўлишига олиб келиши мумкин.',
            ],
          },
          {
            heading: '7. Сиёсатга ўзгартиришлар',
            body: [
              'Ижрочи ушбу Сиёсатга ўзгартиришлар киритиш ҳуқуқига эга. Долзарб таҳрир доимо сайтнинг футеридаги ҳавола орқали мавжуд бўлади.',
            ],
          },
          {
            heading: '8. Алоқа',
            body: [
              'Шахсий маълумотларни қайта ишлаш билан боғлиқ барча саволлар бўйича: +998 55 513 27 77, Telegram @avto_test7, Instagram @avto_test7.',
            ],
          },
        ],
      },
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
      schedule: 'Доступно 5 времён занятий',
      shifts: ['10:00–13:00', '13:00–15:00', '15:00–18:00', '19:00–21:00', '21:00–23:00'],
      mapCta: 'Посмотреть на карте',
      branches: [
        { name: 'Филиал Новза', address: 'Ташкент, Новза', mapUrl: 'https://www.google.com/maps?q=41.288832,69.229788' },
        { name: 'Филиал Юнусабад', address: 'Ташкент, Юнусабад', mapUrl: 'https://www.google.com/maps?q=41.369306,69.281378' },
      ],
    },
    testimonials: {
      title: 'Отзывы учеников',
      note: 'Настоящие отзывы наших учеников',
      items: [
        { quote: 'Assalomu alaykum. Rahmat ustoz, bergan bilimlaringiz uchun. Imtihondan oʻtdim 20/20 ✅', author: 'Озода' },
        { quote: 'Bexzod aka rahmat aka, imtihondan oʻtdim ✊🏻✊🏻', author: 'Аҳад' },
        { quote: 'Kecha hujjatim hal boʻldi, bugun borib topshirib keldim. Rahmat, katta oʻtvoldim 😊', author: 'Мадина' },
        { quote: 'Rahmat aka, men oʻtdim imtihondan 🎉', author: 'Шоҳрух' },
        { quote: 'Qalaysiz, yaxshimisiz? Men oʻtdim, hozir bordim test. Rahmat hammaga 🙏', author: 'Наргиза' },
        { quote: 'Rahmat kattakon sizlarga, Prava On ENG ZOʻRI 👍👍👍', author: 'Жасур' },
        { quote: 'Video darslar juda tushunarli, uydan chiqmasdan tayyorlandim va oʻtdim 🚗', author: 'Дилноза' },
        { quote: 'Mnemonika metodi zoʻr ekan, qoidalarni oson yodladim. Rahmat! 💪', author: 'Феруз' },
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
    legalPages: {
      offer: {
        title: 'Публичная оферта',
        updated: 'Действует с 13 июля 2026 года',
        sections: [
          {
            heading: '1. Общие положения',
            body: [
              'Настоящий документ является публичной офертой ООО «EDU MAX» (далее — «Исполнитель», «Prava On») в адрес любого дееспособного физического лица (далее — «Пользователь», «Учащийся») заключить договор на условиях, изложенных ниже.',
              'Регистрация на сайте prava-on.com и/или оплата выбранного тарифа означает полное и безоговорочное принятие (акцепт) условий настоящей оферты.',
              'В случае расхождений между языковыми версиями настоящего документа приоритет имеет версия на узбекском языке.',
            ],
          },
          {
            heading: '2. Предмет договора',
            body: [
              'Исполнитель предоставляет Пользователю доступ к образовательной онлайн- и офлайн-платформе Prava On для подготовки к теоретическому экзамену на получение водительского удостоверения: видеоуроки, учебные материалы по методу мнемоники, тестовые задания по 44 темам (1300+ вопросов), функцию Якуний (финального) теста, режим дуэлей с другими пользователями и раздел с дорожными знаками.',
              'Услуги оказываются по одному из тарифов: Standard, Premium+, VIP, Booster — состав и стоимость каждого тарифа указаны на сайте на момент оплаты.',
            ],
          },
          {
            heading: '3. Стоимость и порядок оплаты',
            body: [
              'Стоимость тарифов: Standard — 590 000 сум, Premium+ — 1 290 000 сум, VIP — 2 500 000 сум, Booster — по запросу.',
              'Оплата принимается через Click, Payme, а также наличными или банковской картой (Uzcard/Humo) в филиале. Пользователь вправе самостоятельно выбрать удобный способ оплаты из перечисленных.',
              'Покупателям офлайн-курса предоставляется 15 дней онлайн-доступа к платформе; покупателям полностью онлайн-курса — 30 дней доступа, включая видеоуроки.',
            ],
          },
          {
            heading: '4. Возврат денежных средств',
            body: [
              'Оплата по настоящему договору является окончательной. Уплаченные денежные средства не подлежат возврату ни при каких обстоятельствах, включая отказ Пользователя от дальнейшего обучения после начала оказания услуг.',
            ],
          },
          {
            heading: '5. Права и обязанности сторон',
            body: [
              'Исполнитель обязуется предоставить доступ к материалам в объёме выбранного тарифа и обеспечить работоспособность платформы.',
              'Пользователь обязуется предоставить достоверные данные при регистрации (номер телефона) и не передавать доступ к своему аккаунту третьим лицам.',
              'Исполнитель вправе ограничить доступ Пользователя к платным материалам в случае неоплаты, а также заблокировать аккаунт при выявлении попытки передачи доступа третьим лицам.',
            ],
          },
          {
            heading: '6. Ответственность сторон',
            body: [
              'Стороны несут ответственность за неисполнение обязательств по настоящему договору в соответствии с законодательством Республики Узбекистан.',
              'Исполнитель не несёт ответственности за результат сдачи Пользователем экзамена в ГСБДД, поскольку это зависит от множества факторов, включая индивидуальную подготовку самого Пользователя.',
              'Ни одна из сторон не несёт ответственности за неисполнение обязательств, вызванное обстоятельствами непреодолимой силы (форс-мажор).',
            ],
          },
          {
            heading: '7. Разрешение споров',
            body: [
              'Все споры и разногласия разрешаются путём переговоров. При недостижении согласия — в претензионном порядке (письменное обращение), а при невозможности урегулирования — в судебном порядке по законодательству Республики Узбекистан.',
            ],
          },
          {
            heading: '8. Заключительные положения',
            body: [
              'Исполнитель вправе в одностороннем порядке изменять условия настоящей оферты, размещая новую редакцию на сайте. Продолжение использования платформы после изменений означает согласие с новой редакцией.',
              'Реквизиты Исполнителя: ООО «EDU MAX» (MCHJ), Республика Узбекистан, г. Ташкент.',
              'Контакты: +998 55 513 27 77, Telegram @avto_test7, Instagram @avto_test7.',
            ],
          },
        ],
      },
      privacy: {
        title: 'Политика конфиденциальности',
        updated: 'Действует с 13 июля 2026 года',
        sections: [
          {
            heading: '1. Общие положения',
            body: [
              'Настоящая Политика конфиденциальности определяет порядок обработки персональных данных пользователей платформы Prava On (далее — «Платформа»), принадлежащей ООО «EDU MAX», в соответствии с Законом Республики Узбекистан «О персональных данных» (ЗРУ-547).',
              'Регистрируясь на Платформе, Пользователь даёт согласие на обработку своих персональных данных на условиях настоящей Политики.',
            ],
          },
          {
            heading: '2. Какие данные собираются',
            body: [
              'Номер телефона и имя/логин, указанные при регистрации.',
              'Telegram ID, получаемый при верификации номера через Telegram-бота.',
              'Результаты прохождения уроков и тестов, статистика прогресса, рекорды по времени.',
              'Технический идентификатор устройства (device id) — для защиты от передачи одного аккаунта нескольким лицам.',
              'Данные, сохраняемые локально в браузере (localStorage): токен сессии, выбранный язык интерфейса, история переписки с AI-консультантом.',
            ],
          },
          {
            heading: '3. Цели обработки данных',
            body: [
              'Идентификация и аутентификация Пользователя при входе на Платформу.',
              'Верификация номера телефона через Telegram для защиты аккаунта.',
              'Предоставление доступа к оплаченным материалам и отслеживание учебного прогресса.',
              'Обеспечение работы функции «AI-консультант» (ответы на вопросы о курсах).',
            ],
          },
          {
            heading: '4. Передача данных третьим лицам',
            body: [
              'Для функционирования Платформы данные обрабатываются с использованием следующих сервисов: Supabase (хранение базы данных и файлов), Telegram Bot API (верификация номера телефона), а также сервис искусственного интеллекта (n8n через OpenAI или Groq) — для работы AI-консультанта.',
              'Платформа не продаёт и не передаёт персональные данные Пользователей третьим лицам в рекламных или иных коммерческих целях.',
            ],
          },
          {
            heading: '5. Хранение и защита данных',
            body: [
              'Данные хранятся на серверах Supabase с ограничением доступа на уровне базы данных (Row Level Security), исключающим прямой доступ посторонних лиц к содержимому таблиц.',
              'Доступ к аккаунту защищён индивидуальным токеном сессии, привязанным к конкретному устройству Пользователя.',
            ],
          },
          {
            heading: '6. Права пользователя',
            body: [
              'Пользователь вправе в любой момент запросить сведения о хранимых персональных данных, их исправление или удаление, обратившись по телефону или в Telegram, указанным в разделе «Контакты».',
              'Пользователь вправе отозвать согласие на обработку персональных данных, что может повлечь невозможность дальнейшего использования Платформы.',
            ],
          },
          {
            heading: '7. Изменения политики',
            body: [
              'Исполнитель вправе вносить изменения в настоящую Политику. Актуальная редакция всегда доступна на сайте по ссылке в футере.',
            ],
          },
          {
            heading: '8. Контакты',
            body: [
              'По всем вопросам, связанным с обработкой персональных данных: +998 55 513 27 77, Telegram @avto_test7, Instagram @avto_test7.',
            ],
          },
        ],
      },
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
      schedule: '5 class times available',
      shifts: ['10:00–13:00', '13:00–15:00', '15:00–18:00', '19:00–21:00', '21:00–23:00'],
      mapCta: 'View on map',
      branches: [
        { name: 'Novza branch', address: 'Tashkent, Novza', mapUrl: 'https://www.google.com/maps?q=41.288832,69.229788' },
        { name: 'Yunusobod branch', address: 'Tashkent, Yunusobod', mapUrl: 'https://www.google.com/maps?q=41.369306,69.281378' },
      ],
    },
    testimonials: {
      title: 'What students say',
      note: 'Real reviews from our students',
      items: [
        { quote: 'Assalomu alaykum. Rahmat ustoz, bergan bilimlaringiz uchun. Imtihondan oʻtdim 20/20 ✅', author: 'Озода' },
        { quote: 'Bexzod aka rahmat aka, imtihondan oʻtdim ✊🏻✊🏻', author: 'Аҳад' },
        { quote: 'Kecha hujjatim hal boʻldi, bugun borib topshirib keldim. Rahmat, katta oʻtvoldim 😊', author: 'Мадина' },
        { quote: 'Rahmat aka, men oʻtdim imtihondan 🎉', author: 'Шоҳрух' },
        { quote: 'Qalaysiz, yaxshimisiz? Men oʻtdim, hozir bordim test. Rahmat hammaga 🙏', author: 'Наргиза' },
        { quote: 'Rahmat kattakon sizlarga, Prava On ENG ZOʻRI 👍👍👍', author: 'Жасур' },
        { quote: 'Video darslar juda tushunarli, uydan chiqmasdan tayyorlandim va oʻtdim 🚗', author: 'Дилноза' },
        { quote: 'Mnemonika metodi zoʻr ekan, qoidalarni oson yodladim. Rahmat! 💪', author: 'Феруз' },
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
    legalPages: {
      offer: {
        title: 'Public Offer',
        updated: 'In effect since July 13, 2026',
        sections: [
          {
            heading: '1. General provisions',
            body: [
              'This document is a public offer by "EDU MAX" LLC (hereinafter — the "Provider", "Prava On") to any legally capable individual (hereinafter — the "User", "Student") to enter into an agreement on the terms set out below.',
              'Registering on prava-on.com and/or paying for a chosen plan constitutes full and unconditional acceptance of the terms of this offer.',
              'In case of discrepancies between language versions of this document, the Uzbek-language version prevails.',
            ],
          },
          {
            heading: '2. Subject of the agreement',
            body: [
              'The Provider grants the User access to the Prava On online and offline platform for preparing for the theoretical driving-license exam: video lessons, mnemonic-method study materials, test questions across 44 topics (1,300+ questions), the Yakuniy (final) test feature, duels with other users, and the road-signs section.',
              'Services are provided under one of the following plans: Standard, Premium+, VIP, Booster — the content and price of each plan are shown on the site at the time of payment.',
            ],
          },
          {
            heading: '3. Price and payment procedure',
            body: [
              'Plan prices: Standard — 590,000 UZS, Premium+ — 1,290,000 UZS, VIP — 2,500,000 UZS, Booster — price on request.',
              'Payment is accepted via Click, Payme, cash, or bank card (Uzcard/Humo) at a branch. The User may freely choose any of the listed payment methods.',
              'Buyers of the offline course receive 15 days of online platform access; buyers of the fully online course receive 30 days of access, including video lessons.',
            ],
          },
          {
            heading: '4. Refunds',
            body: [
              'Payment under this agreement is final. Amounts paid are not refundable under any circumstances, including if the User decides not to continue studying after the service has begun.',
            ],
          },
          {
            heading: '5. Rights and obligations of the parties',
            body: [
              "The Provider undertakes to provide access to the materials included in the User's chosen plan and to keep the platform operational.",
              'The User undertakes to provide accurate registration data (phone number) and not to share account access with third parties.',
              "The Provider may restrict the User's access to paid materials in case of non-payment, and may block an account if it detects an attempt to share access with third parties.",
            ],
          },
          {
            heading: '6. Liability of the parties',
            body: [
              'The parties are liable for failure to perform their obligations under this agreement in accordance with the legislation of the Republic of Uzbekistan.',
              "The Provider is not liable for the outcome of the User's state driving exam, as this depends on many factors, including the User's own preparation.",
              'Neither party is liable for failure to perform obligations caused by force majeure.',
            ],
          },
          {
            heading: '7. Dispute resolution',
            body: [
              'All disputes are resolved through negotiation. If no agreement is reached, a written claim procedure applies; failing that, disputes are resolved in court under the legislation of the Republic of Uzbekistan.',
            ],
          },
          {
            heading: '8. Final provisions',
            body: [
              'The Provider may unilaterally amend the terms of this offer by publishing a new version on the site. Continued use of the platform after changes constitutes acceptance of the new version.',
              'Provider details: "EDU MAX" LLC, Republic of Uzbekistan, Tashkent.',
              'Contacts: +998 55 513 27 77, Telegram @avto_test7, Instagram @avto_test7.',
            ],
          },
        ],
      },
      privacy: {
        title: 'Privacy Policy',
        updated: 'In effect since July 13, 2026',
        sections: [
          {
            heading: '1. General provisions',
            body: [
              'This Privacy Policy sets out how the Prava On platform (the "Platform"), operated by "EDU MAX" LLC, processes users\' personal data in accordance with the Law of the Republic of Uzbekistan "On Personal Data" (ZRU-547).',
              'By registering on the Platform, the User consents to the processing of their personal data under the terms of this Policy.',
            ],
          },
          {
            heading: '2. Data collected',
            body: [
              'Phone number and name/login provided at registration.',
              'Telegram ID obtained when verifying the phone number via the Telegram bot.',
              'Lesson and test results, progress statistics, and best-time records.',
              'A technical device identifier, used to prevent one account being shared across multiple people.',
              'Data stored locally in the browser (localStorage): session token, selected interface language, and AI-consultant chat history.',
            ],
          },
          {
            heading: '3. Purposes of processing',
            body: [
              'Identifying and authenticating the User when logging into the Platform.',
              'Verifying the phone number via Telegram to protect the account.',
              'Granting access to paid materials and tracking learning progress.',
              'Operating the "AI consultant" feature (answering questions about the courses).',
            ],
          },
          {
            heading: '4. Disclosure to third parties',
            body: [
              'To operate the Platform, data is processed using the following services: Supabase (database and file storage), the Telegram Bot API (phone number verification), and an AI service (n8n via OpenAI or Groq) for the AI consultant.',
              "The Platform does not sell or transfer Users' personal data to third parties for advertising or other commercial purposes.",
            ],
          },
          {
            heading: '5. Storage and protection',
            body: [
              'Data is stored on Supabase servers with database-level access restrictions (Row Level Security), preventing unauthorized direct access to table contents.',
              "Account access is protected by an individual session token tied to the User's specific device.",
            ],
          },
          {
            heading: '6. User rights',
            body: [
              'The User may at any time request information about their stored personal data, its correction, or its deletion, by contacting the phone number or Telegram listed under "Contacts".',
              'The User may withdraw consent to the processing of personal data, which may make further use of the Platform impossible.',
            ],
          },
          {
            heading: '7. Changes to this policy',
            body: [
              'The Provider may amend this Policy. The current version is always available via the link in the site footer.',
            ],
          },
          {
            heading: '8. Contacts',
            body: [
              'For all questions related to personal data processing: +998 55 513 27 77, Telegram @avto_test7, Instagram @avto_test7.',
            ],
          },
        ],
      },
    },
  },
};

// --- Uzbek Cyrillic -> Latin -------------------------------------------------
// The Latin variant ("uzl") is derived from the Cyrillic source so there is a
// single content source of truth. Latin/emoji/numbers pass through unchanged.
const CYR_TO_LAT: Record<string, string> = {
  а:'a', б:'b', в:'v', г:'g', ғ:"g'", д:'d', е:'e', ё:'yo', ж:'j', з:'z',
  и:'i', й:'y', к:'k', қ:'q', л:'l', м:'m', н:'n', о:'o', п:'p', р:'r',
  с:'s', т:'t', у:'u', ў:"o'", ф:'f', х:'x', ҳ:'h', ц:'ts', ч:'ch', ш:'sh',
  ъ:"'", ы:'i', ь:'', э:'e', ю:'yu', я:'ya',
  А:'A', Б:'B', В:'V', Г:'G', Ғ:"G'", Д:'D', Е:'E', Ё:'Yo', Ж:'J', З:'Z',
  И:'I', Й:'Y', К:'K', Қ:'Q', Л:'L', М:'M', Н:'N', О:'O', П:'P', Р:'R',
  С:'S', Т:'T', У:'U', Ў:"O'", Ф:'F', Х:'X', Ҳ:'H', Ц:'Ts', Ч:'Ch', Ш:'Sh',
  Ъ:"'", Ы:'I', Ь:'', Э:'E', Ю:'Yu', Я:'Ya',
};

function toLatin(str: string): string {
  let out = '';
  for (const ch of str) out += ch in CYR_TO_LAT ? CYR_TO_LAT[ch] : ch;
  return out;
}

function transliterateDeep<T>(value: T): T {
  if (typeof value === 'string') return toLatin(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => transliterateDeep(v)) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value as Record<string, unknown>)) {
      out[k] = transliterateDeep((value as Record<string, unknown>)[k]);
    }
    return out as unknown as T;
  }
  return value;
}

export const LANDING_DICTS: Record<Lang, LandingDict> = {
  ...BASE_DICTS,
  uzl: transliterateDeep(BASE_DICTS.uz),
};
