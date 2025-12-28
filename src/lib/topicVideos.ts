// Mapping of topic titles to YouTube video URLs
export const topicVideos: Record<string, string> = {
  // Direct title matches
  "Tartibga soluvchini ishoralari": "https://youtu.be/ioCCi64FrD8",
  "Tartibga solingan chorraxalar": "https://youtu.be/NkchbbemTXc",
  "Tartibga solinmagan chorraxalar asosiy yo'l to'g'riga": "https://youtu.be/E4jGGu6PMJQ",
  "Tartibga Solinmagan chorraxalar asosiy yo'l yo'nalishi o'zgarishi": "https://youtu.be/xXTW7ZARxOg",
  "Teng axamiyatli chorraxalar": "https://youtu.be/11_mlzzJikU",
  "Чорраҳаларда ҳаракатланиш": "https://youtu.be/zvcFZ90IThY",
  "Ogohlantiruvchi belgilar Full": "https://youtu.be/r7NzVP_r0PM",
  "Ogohlantiruvchi belgilar": "https://youtu.be/r7NzVP_r0PM",
  "Imtiyoz belgilari": "https://youtu.be/iAvP2W0IaPk",
  "Taqiqlovchi belgilar": "https://youtu.be/J2G6usQzeuM",
  "Buyuruvchi belgilar": "https://youtu.be/s_7uidszseI",
  "Axborot ko'rsatkich belgialari": "https://youtu.be/O88nJX_d1FY",
  "Servis belgilari": "https://youtu.be/_DfuGD28CbY",
  "Qo'shimcha axborot belgilari": "https://youtu.be/5qKdHSE6iK8",
  "Транспорт воситаларидан фойдаланишни тақиқловчи шартлар": "https://youtu.be/E3LDGhh6j2Q",
  "Ҳаракат хафсизлиги асослари": "https://youtu.be/JEoGeP4ATPs",
  "MANYOVR QILISH": "https://youtu.be/sBrjLMwagNA",
  "Manyovr qilish": "https://youtu.be/sBrjLMwagNA",
  "Биринчи тиббий ёрдам": "https://youtu.be/wd-0VDL_A9o",
  "Тик чизиқлар": "https://youtu.be/Gv7SDCJIaiY",
  "Ётиқ чизиқлар": "https://youtu.be/Df1XcWr2FWg",
  "Toxtash va to'xtab turish": "https://youtu.be/VRAPyVoJSUU",
  "Ҳаракатланиш тезлиги": "https://youtu.be/HR6L6ow1mRg",
  "Umumiy qoidalar": "https://youtu.be/7Ax3KHMF2So",
  "Quvib otish": "https://youtu.be/ehAOwLVT8VE",
  "Темир йўл кесишмалари орқали ҳаракатланиш": "https://youtu.be/mgm2bVWhfI0",
  "Йўлнинг қатнов қисмида транспорт воситаларининг жойлашуви": "https://youtu.be/HgmX5-m39tU",
  "Автомагистралларда ҳаракатланиш": "https://youtu.be/UbXYdV0mfac",
  "Турар жой даҳаларида ҳаракатланиш": "https://youtu.be/yr3dAqq9eQI",
  "Xaydovchilarning Umumiy vazifalari": "https://youtu.be/Njpg27Wmihg",
  "Пиёдаларнинг ўтиш жойлари ва йўналишли транспорт воситаларининг бекатлари": "https://youtu.be/ID_zXs3bedk",
  "Piyodalarning Umumiy Vazifalari": "https://youtu.be/9C2-AXROtdo",
  "Maxsus transport vositalarining imtiyozlari": "https://youtu.be/GlEA50j95Tg",
  "Йўналишли транспорт воситаларининг имтиёзлари": "https://youtu.be/8JK8Y60mXKA",
  "Ogoxlantiruvchi xavf ishoralari": "https://youtu.be/r7NzVP_r0PM",
  "Ташқи ёритиш асбобларидан фойдаланиш": "https://youtu.be/1UiVMKoJD5s",
  "Механик транспорт воситаларини шатакка олиш": "https://youtu.be/3LS9rnDUOmM",
  "Юк ташиш": "https://youtu.be/wOb0VWt8RAI",
  "Велосипед, мопед ва аравалар ҳаракатланишига, шунингдек,": "https://youtu.be/cf4oOFMKdKs",
  "Транспорт воситаларини бошқаришни ўргатиш": "https://youtu.be/JXdLQtcg4kI",
  "Мансабдор шахсларнинг ва фуқароларнинг йўл ҳаракати хавфсизлигини таъминлаш, транспорт воситаларини йўлга чиқариш, рақам ва таниқли белгиларини ўрнатиш бўйича мажбуриятлари": "https://youtu.be/nahzjWgBXVY",
  "Тик баландлик ва нишабликларда ҳаракатланиш": "https://youtu.be/aj_ij_JRbEo",
};

// Function to get YouTube embed URL from regular YouTube URL
export function getYouTubeEmbedUrl(url: string): string {
  // Extract video ID from various YouTube URL formats
  let videoId = '';
  
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
  } else if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    videoId = urlParams.get('v') || '';
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('embed/')[1]?.split('?')[0] || '';
  }
  
  return `https://www.youtube.com/embed/${videoId}`;
}

// Function to find video URL for a topic by title (case-insensitive, partial match)
export function findVideoForTopic(topicTitle: string): string | null {
  // First try exact match
  if (topicVideos[topicTitle]) {
    return topicVideos[topicTitle];
  }
  
  // Try case-insensitive match
  const lowerTitle = topicTitle.toLowerCase();
  for (const [key, value] of Object.entries(topicVideos)) {
    if (key.toLowerCase() === lowerTitle) {
      return value;
    }
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(topicVideos)) {
    if (key.toLowerCase().includes(lowerTitle) || lowerTitle.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return null;
}
