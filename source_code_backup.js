import React, { useState, useEffect, useRef, useMemo } from 'react';
import p5 from 'p5';
import { Wind, Sun, CloudRain, Mountain, Droplets, Zap, Calendar, ChevronLeft, ChevronRight, Info, Heart, Compass, Sparkles, RefreshCcw, Leaf, Grid, Layout, Snowflake, Flame, Waves, Sprout } from 'lucide-react';

/**
 * ------------------------------------------------------------------
 * 1. 孟喜卦氣核心資料庫 (Meng Xi Data Structure)
 * ------------------------------------------------------------------
 */

// 八卦屬性
const TRIGRAMS = {
  '1': { name: '乾', nature: '天', element: '金', color: [226, 232, 240], advice: '自強不息' },
  '2': { name: '兌', nature: '澤', element: '金', color: [254, 215, 170], advice: '喜悅溝通' },
  '3': { name: '離', nature: '火', element: '火', color: [253, 164, 175], advice: '熱情顯化' },
  '4': { name: '震', nature: '雷', element: '木', color: [134, 239, 172], advice: '行動突破' },
  '5': { name: '巽', nature: '風', element: '木', color: [165, 243, 252], advice: '柔順滲透' },
  '6': { name: '坎', nature: '水', element: '水', color: [147, 197, 253], advice: '流動適應' },
  '7': { name: '艮', nature: '山', element: '土', color: [231, 229, 228], advice: '靜止安頓' },
  '8': { name: '坤', nature: '地', element: '土', color: [214, 211, 209], advice: '厚德載物' },
};

// 四正卦資料 (季節主宰)
const SEASON_MASTERS = {
  winter: { id: 29, name: '坎', pinyin: 'Kǎn', nature: '水', desc: '冬至主宰 • 潛藏之能', upper: '6', lower: '6', color: 'from-blue-100 to-slate-100', icon: Snowflake },
  spring: { id: 51, name: '震', pinyin: 'Zhèn', nature: '雷', desc: '春分主宰 • 生發之機', upper: '4', lower: '4', color: 'from-green-100 to-emerald-50', icon: Sprout },
  summer: { id: 30, name: '離', pinyin: 'Lí', nature: '火', desc: '夏至主宰 • 光明盛大', upper: '3', lower: '3', color: 'from-rose-100 to-orange-50', icon: Sun },
  autumn: { id: 58, name: '兌', pinyin: 'Duì', nature: '澤', desc: '秋分主宰 • 收斂喜悅', upper: '2', lower: '2', color: 'from-amber-100 to-yellow-50', icon: Wind } 
};

// 64卦基礎對照表
const ALL_HEXAGRAMS = {
  1: { name: '乾', u: '1', l: '1', pinyin: 'Qián' }, 2: { name: '坤', u: '8', l: '8', pinyin: 'Kūn' },
  3: { name: '屯', u: '6', l: '4', pinyin: 'Zhūn' }, 4: { name: '蒙', u: '7', l: '6', pinyin: 'Méng' },
  5: { name: '需', u: '6', l: '1', pinyin: 'Xū' }, 6: { name: '訟', u: '1', l: '6', pinyin: 'Sòng' },
  7: { name: '師', u: '8', l: '6', pinyin: 'Shī' }, 8: { name: '比', u: '6', l: '8', pinyin: 'Bǐ' },
  9: { name: '小畜', u: '5', l: '1', pinyin: 'Xiǎo Xù' }, 10: { name: '履', u: '1', l: '2', pinyin: 'Lǚ' },
  11: { name: '泰', u: '8', l: '1', pinyin: 'Tài' }, 12: { name: '否', u: '1', l: '8', pinyin: 'Pǐ' },
  13: { name: '同人', u: '1', l: '3', pinyin: 'Tóng Rén' }, 14: { name: '大有', u: '3', l: '1', pinyin: 'Dà Yǒu' },
  15: { name: '謙', u: '8', l: '7', pinyin: 'Qiān' }, 16: { name: '豫', u: '4', l: '8', pinyin: 'Yù' },
  17: { name: '隨', u: '2', l: '4', pinyin: 'Suí' }, 18: { name: '蠱', u: '7', l: '5', pinyin: 'Gǔ' },
  19: { name: '臨', u: '8', l: '2', pinyin: 'Lín' }, 20: { name: '觀', u: '5', l: '8', pinyin: 'Guān' },
  21: { name: '噬嗑', u: '3', l: '4', pinyin: 'Shì Hé' }, 22: { name: '賁', u: '7', l: '3', pinyin: 'Bì' },
  23: { name: '剝', u: '7', l: '8', pinyin: 'Bō' }, 24: { name: '復', u: '8', l: '4', pinyin: 'Fù' },
  25: { name: '无妄', u: '1', l: '4', pinyin: 'Wú Wàng' }, 26: { name: '大畜', u: '7', l: '1', pinyin: 'Dà Xù' },
  27: { name: '頤', u: '7', l: '4', pinyin: 'Yí' }, 28: { name: '大過', u: '2', l: '5', pinyin: 'Dà Guò' },
  29: { name: '坎', u: '6', l: '6', pinyin: 'Kǎn' }, 30: { name: '離', u: '3', l: '3', pinyin: 'Lí' },
  31: { name: '咸', u: '2', l: '7', pinyin: 'Xián' }, 32: { name: '恆', u: '4', l: '5', pinyin: 'Héng' },
  33: { name: '遯', u: '1', l: '7', pinyin: 'Dùn' }, 34: { name: '大壯', u: '4', l: '1', pinyin: 'Dà Zhuàng' },
  35: { name: '晉', u: '3', l: '8', pinyin: 'Jìn' }, 36: { name: '明夷', u: '8', l: '3', pinyin: 'Míng Yí' },
  37: { name: '家人', u: '5', l: '3', pinyin: 'Jiā Rén' }, 38: { name: '睽', u: '3', l: '2', pinyin: 'Kuí' },
  39: { name: '蹇', u: '6', l: '7', pinyin: 'Jiǎn' }, 40: { name: '解', u: '4', l: '6', pinyin: 'Xiè' },
  41: { name: '損', u: '7', l: '2', pinyin: 'Sǔn' }, 42: { name: '益', u: '5', l: '4', pinyin: 'Yì' },
  43: { name: '夬', u: '2', l: '1', pinyin: 'Guài' }, 44: { name: '姤', u: '1', l: '5', pinyin: 'Gòu' },
  45: { name: '萃', u: '2', l: '8', pinyin: 'Cuì' }, 46: { name: '升', u: '8', l: '5', pinyin: 'Shēng' },
  47: { name: '困', u: '2', l: '6', pinyin: 'Kùn' }, 48: { name: '井', u: '6', l: '5', pinyin: 'Jǐng' },
  49: { name: '革', u: '2', l: '3', pinyin: 'Gé' }, 50: { name: '鼎', u: '3', l: '5', pinyin: 'Dǐng' },
  51: { name: '震', u: '4', l: '4', pinyin: 'Zhèn' }, 52: { name: '艮', u: '7', l: '7', pinyin: 'Gèn' },
  53: { name: '漸', u: '5', l: '7', pinyin: 'Jiàn' }, 54: { name: '歸妹', u: '4', l: '2', pinyin: 'Guī Mèi' },
  55: { name: '豐', u: '4', l: '3', pinyin: 'Fēng' }, 56: { name: '旅', u: '3', l: '7', pinyin: 'Lǚ' },
  57: { name: '巽', u: '5', l: '5', pinyin: 'Xùn' }, 58: { name: '兌', u: '2', l: '2', pinyin: 'Duì' },
  59: { name: '渙', u: '5', l: '6', pinyin: 'Huàn' }, 60: { name: '節', u: '6', l: '2', pinyin: 'Jié' },
  61: { name: '中孚', u: '5', l: '2', pinyin: 'Zhōng Fú' }, 62: { name: '小過', u: '4', l: '7', pinyin: 'Xiǎo Guò' },
  63: { name: '既濟', u: '6', l: '3', pinyin: 'Jì Jì' }, 64: { name: '未濟', u: '3', l: '6', pinyin: 'Wèi Jì' }
};

// 孟喜 60 卦序
const MENG_XI_SEQUENCE = [
  61, 24, 3, 15, 38, 46, 19, 62, 4, 42,  // 冬 (10)
  53, 11, 5, 17, 35, 40, 34, 16, 6, 18,  // 春 (10)
  49, 43, 56, 7, 8, 9, 1, 14, 37, 48,    // 夏 (10)
  31, 44, 50, 55, 59, 10, 33, 32, 60, 13,// 夏末/秋初
  41, 12, 57, 45, 26, 22, 20, 54, 25, 36,// 秋 (10)
  47, 23, 28, 52, 63, 21, 2, 64, 39, 27  // 冬初 (10)
];

// 詳細卦象解說資料庫 (全面遵循《大象傳》)
const HEXAGRAM_DETAILS = {
  1: {
    id: 1, name: '乾', pinyin: 'Qián',
    keywords: ['純陽', '創造', '領袖'],
    desc: '天行健。君子以自強不息。能量最強的時刻，生生不息的創造力。',
    body: '頭部按摩。觀想金色的光從頭頂灌入，充滿全身。',
    mind: '相信你的意志力。你是自己實相的創造者。',
    decision: '行動！這是實現夢想的最佳時機。但切記不要傲慢（亢龍有悔）。'
  },
  2: {
    id: 2, name: '坤', pinyin: 'Kūn',
    keywords: ['純陰', '包容', '順從'],
    desc: '地勢坤。君子以厚德載物。完全的接納與承載。',
    body: '腹式呼吸。感受大地的支持，讓身體變重、變鬆。',
    mind: '直方大。單純、正直、寬大。不要計較，先做配角。',
    decision: '先迷後得主。不要自己帶頭，跟隨有經驗的人走。以柔克剛。'
  },
  3: {
    id: 3, name: '屯', pinyin: 'Zhūn',
    keywords: ['初生', '艱難', '扎根'],
    desc: '雲雷屯。君子以經綸。萬物初生，像幼苗破土，雖然艱難但充滿希望。',
    body: '做一些腿部的伸展，感受雙腳踩在地上的扎根感。',
    mind: '混亂是正常的，那是生命力正在衝破外殼的過程。',
    decision: '不要輕舉妄動，先建構基礎，尋找有經驗的幫手（利建侯）。'
  },
  4: {
    id: 4, name: '蒙', pinyin: 'Méng',
    keywords: ['啟蒙', '學習', '模糊'],
    desc: '山下出泉，蒙。君子以果行育德。泉水剛湧出，路徑還不清晰。',
    body: '用溫水洗臉，或熱敷眼睛，讓視野變得清晰。',
    mind: '承認自己的「不知道」。保持初學者的心態（童蒙）。',
    decision: '現在還看不清楚全貌。去請教老師或專家，不要自己瞎猜。'
  },
  5: {
    id: 5, name: '需', pinyin: 'Xū',
    keywords: ['等待', '滋養', '時機'],
    desc: '雲上於天，需。君子以飲食宴樂。雲氣上騰但雨還沒下，需要耐心等待。',
    body: '專注於飲食的咀嚼，品嚐食物的真味。多喝湯水滋潤。',
    mind: '焦慮是因為想控制時間。放下手錶，相信時機到了自然會發生。',
    decision: '現在不是進攻的時候。請客吃飯、休息娛樂，為了將來的行動儲備能量。'
  },
  6: {
    id: 6, name: '訟', pinyin: 'Sòng',
    keywords: ['爭辯', '分歧', '謹慎'],
    desc: '天與水違行，訟。君子以作事謀始。天往上、水往下，看法不同。',
    body: '注意喉嚨的保養。生氣時深呼吸，數到十再說話。',
    mind: '爭贏了道理，輸了感情。試著理解對方的立場。',
    decision: '不利涉大川。不要硬碰硬，尋找中間人調解。做事要謀定後動。'
  },
  7: {
    id: 7, name: '師', pinyin: 'Shī',
    keywords: ['軍隊', '紀律', '領導'],
    desc: '地中有水，師。君子以容民畜眾。藏兵於民，需要有紀律與具備德行的領導者。',
    body: '站樁或核心訓練。感受丹田如大地般厚實，內藏能量。',
    mind: '專注於單一目標。混亂中需要秩序，成為你自己的指揮官。',
    decision: '需要嚴謹的規劃與強勢的執行力。不適合散漫，要有紀律。'
  },
  8: {
    id: 8, name: '比', pinyin: 'Bǐ',
    keywords: ['親比', '連結', '盟友'],
    desc: '地上有水，比。先王以建萬國，親諸侯。水依附大地，象徵親密關係。',
    body: '擁抱你愛的人。感受肌膚接觸的溫度與安全感。',
    mind: '你不是一座孤島。尋求歸屬感，建立深層的連結。',
    decision: '遲來者凶。趕快加入團隊或尋找盟友，不要落單。'
  },
  9: {
    id: 9, name: '小畜', pinyin: 'Xiǎo Xù',
    keywords: ['小蓄', '溫柔', '細節'],
    desc: '風行天上，小畜。君子以懿文德。密雲不雨，力量還在累積。',
    body: '做精細的手工藝或書寫。專注於指尖的微小動作。',
    mind: '欣賞微小的進步。雖然還沒下大雨，但滋潤已經開始。',
    decision: '不要貪大。處理細節，修正文案，累積小確幸。'
  },
  10: {
    id: 10, name: '履', pinyin: 'Lǚ',
    keywords: ['履行', '禮儀', '謹慎'],
    desc: '上天下澤，履。君子以辨上下，定民志。跟在老虎尾巴後面走，謹慎應對。',
    body: '注意腳步。走路時腳跟先著地，穩步前行。',
    mind: '禮貌是最好的護身符。保持謙恭的態度。',
    decision: '按規矩辦事。不要抄捷徑，謹言慎行則吉。'
  },
  11: {
    id: 11, name: '泰', pinyin: 'Tài',
    keywords: ['通達', '和諧', '順遂'],
    desc: '天地交，泰。后以財成天地之道。陰陽溝通良好，最舒服順遂的時刻。',
    body: '全身大字型躺平，感受天地之氣在體內暢通無阻。',
    mind: '享受當下。這是宇宙給你的禮物，不用擔憂，只需接收。',
    decision: '大吉。適合展開任何合作，溝通會非常順暢。'
  },
  12: {
    id: 12, name: '否', pinyin: 'Pǐ',
    keywords: ['閉塞', '不通', '獨處'],
    desc: '天地不交，否。君子以儉德辟難。氣場不通，適合獨善其身。',
    body: '閉目養神。減少感官的消耗，把能量收回來。',
    mind: '接受「暫時的不順」。這是大自然要你休息的訊號。',
    decision: '不利君子貞。不要強求溝通，對方聽不進去。保持沈默。'
  },
  13: {
    id: 13, name: '同人', pinyin: 'Tóng Rén',
    keywords: ['同人', '合作', '大同'],
    desc: '天與火，同人。君子以類族辨物。在野外與人和諧相處，打破門戶之見。',
    body: '張開雙臂，做擴胸運動。感受心輪的敞開。',
    mind: '尋找志同道合的夥伴。求同存異。',
    decision: '適合團隊合作、跨界交流。不要閉門造車。'
  },
  14: {
    id: 14, name: '大有', pinyin: 'Dà Yǒu',
    keywords: ['豐盛', '擁有', '遏惡'],
    desc: '火在天上，大有。君子以遏惡揚善，順天休命。如日中天，普照萬物。',
    body: '展現你的笑容。讓你的氣場像太陽一樣輻射出去。',
    mind: '富有的心態吸引財富。感恩你已經擁有的一切。',
    decision: '順天休命。利用你的資源去幫助別人，遏惡揚善，好運會持續。'
  },
  15: {
    id: 15, name: '謙', pinyin: 'Qiān',
    keywords: ['謙卑', '受益', '平衡'],
    desc: '地中有山，謙。君子以裒多益寡，稱物平施。有實力而不張揚。',
    body: '低頭放鬆頸部，做謙卑鞠躬的動作，釋放脊椎壓力。',
    mind: '把「自我」縮小一點，世界就會變大一點。',
    decision: '以退為進。不爭搶功勞，反而會獲得最大的利益。'
  },
  16: {
    id: 16, name: '豫', pinyin: 'Yù',
    keywords: ['歡豫', '預備', '共鳴'],
    desc: '雷出地奮，豫。先王以作樂崇德。能量釋放，適合音樂、藝術與眾人同樂。',
    body: '聽喜歡的音樂，隨著節奏擺動身體。釋放腦內啡。',
    mind: '快樂是最好的顯化頻率。保持興奮與期待的狀態。',
    decision: '適合舉辦活動、派對或啟動群眾募資。利用熱情感染他人。'
  },
  17: {
    id: 17, name: '隨', pinyin: 'Suí',
    keywords: ['隨順', '適應', '流動'],
    desc: '澤中有雷，隨。君子以嚮晦入宴息。順應時勢，不固執己見。',
    body: '早點睡覺，順應日夜節律。出門散步，走到哪算哪。',
    mind: '放下「應該」要怎樣的執念。隨遇而安是最高的智慧。',
    decision: '不要強推你的計畫。看看周圍的人在做什麼，加入他們。'
  },
  18: {
    id: 18, name: '蠱', pinyin: 'Gǔ',
    keywords: ['整頓', '修復', '更新'],
    desc: '山下有風，蠱。君子以振民育德。器皿生蟲，需要清理與整頓。',
    body: '進行斷食或排毒飲食。清理腸胃，也清理情緒垃圾。',
    mind: '不要害怕面對過往的錯誤。承認它，修復它，然後重生。',
    decision: '先甲三日，後甲三日。做決定前要反覆推演，重點在於革除積弊。'
  },
  19: {
    id: 19, name: '臨', pinyin: 'Lín',
    keywords: ['親臨', '增長', '視察'],
    desc: '澤上有地，臨。君子以教思無窮，容保民無疆。陽氣增長，親臨現場。',
    body: '睜大眼睛，轉動眼球。練習「觀看」周遭的細節。',
    mind: '帶著好奇心去接觸世界，像春天剛醒的動物。',
    decision: '時機大好，適合執行計畫。但要記得「八月有凶」，需有長遠備案。'
  },
  20: {
    id: 20, name: '觀', pinyin: 'Guān',
    keywords: ['觀摩', '展示', '榜樣'],
    desc: '風行地上，觀。先王以省方，觀民設教。展示莊嚴的儀式讓眾人瞻仰。',
    body: '練習「凝視」。專注地看一朵花或燭光。',
    mind: '成為榜樣。不需要多說話，你的行為就是最好的教導。',
    decision: '觀而不薦。現在是觀察期，或者展示成果，還不到動手做的階段。'
  },
  21: {
    id: 21, name: '噬嗑', pinyin: 'Shì Hé',
    keywords: ['咬合', '溝通', '刑罰'],
    desc: '雷電噬嗑。先王以明罰敕法。嘴巴裡有東西咬不碎，必須用力咬穿。',
    body: '細嚼慢嚥。注意牙齒健康。把事情「嚼碎」了再吞。',
    mind: '面對障礙要果斷清除。不管是溝通誤會還是壞習慣。',
    decision: '利用獄。適合執行紀律、懲罰或強勢溝通。把問題一次解決。'
  },
  22: {
    id: 22, name: '賁', pinyin: 'Bì',
    keywords: ['裝飾', '美學', '夕陽'],
    desc: '山下有火，賁。君子以明庶政，無敢折獄。晚霞照在山腳下，美麗但短暫。',
    body: '打扮自己，穿上喜歡的衣服。整理儀容。',
    mind: '生活需要儀式感。在平凡中發現美。',
    decision: '小利有攸往。適合處理設計、藝術或公關事務。大事不宜。'
  },
  23: {
    id: 23, name: '剝', pinyin: 'Bō',
    keywords: ['剝落', '崩解', '碩果'],
    desc: '山附於地，剝。上以厚下安宅。陰氣極盛，剝蝕陽氣。',
    body: '躺在床上休息（床切之喻）。不要做激烈的運動。',
    mind: '舊的不去，新的不來。接受失去，那是為了騰出空間。',
    decision: '不利有攸往。基礎不穩，不要啟動新計畫。保護僅存的碩果。'
  },
  24: {
    id: 24, name: '復', pinyin: 'Fù',
    keywords: ['復甦', '一陽生', '萌芽'],
    desc: '雷在地中，復。先王以至日閉關。微小的陽氣在地底萌芽，生機初現。',
    body: '熱敷腰部與丹田，養護這剛升起的微小陽氣。',
    mind: '不要急著看到成果。現在是「保護火苗」的時候。允許自己緩慢。',
    decision: '剛開始的小改變是珍貴的。不要忽視微小的靈感，小心呵護它。'
  },
  25: {
    id: 25, name: '无妄', pinyin: 'Wú Wàng',
    keywords: ['真實', '天真', '意外'],
    desc: '天下雷行，物與无妄。先王以茂對時，育萬物。順應天命，真實無欺。',
    body: '回到最自然的狀態。接觸大自然，赤腳踩草地。',
    mind: '保持初心。不要算計，老天會給你最好的安排。',
    decision: '如果動機純正，就大膽去做。如果心存僥倖，會有無妄之災。'
  },
  26: {
    id: 26, name: '大畜', pinyin: 'Dà Xù',
    keywords: ['大蓄', '累積', '學識'],
    desc: '天在山中，大畜。君子以多識前言往行，以畜其德。山蘊藏著天的能量。',
    body: '吃營養豐富的食物。儲備體力。',
    mind: '多讀書，多看前人的言行。充實內在涵養。',
    decision: '不家食吉。適合外出闖蕩，因為你已經準備好了。'
  },
  27: {
    id: 27, name: '頤', pinyin: 'Yí',
    keywords: ['頤養', '靜止', '口腹'],
    desc: '山下有雷，頤。君子以慎言語，節飲食。外在像山一樣靜止，內在充滿生機。',
    body: '放鬆下顎與口腔。感受你的牙關是否緊咬？試著大口呼氣。',
    mind: '這是一段適合「向內吸收」的時間。減少對外輸出，專注於自我滋養。',
    decision: '不宜躁進。目前的能量適合「養精蓄銳」。等待力量飽滿。'
  },
  28: {
    id: 28, name: '大過', pinyin: 'Dà Guò',
    keywords: ['過度', '壓力', '棟樑'],
    desc: '澤滅木，大過。君子以獨立不懼，遁世無悶。水淹過了樹頂，壓力極大。',
    body: '注意脊椎與腰部的支撐。不要背負過重的東西。',
    mind: '獨立特行。就算全世界都不支持你，也要撐住。',
    decision: '利有攸往。情況緊急，必須採取大膽的行動來突破。'
  },
  29: {
    id: 29, name: '坎', pinyin: 'Kǎn',
    keywords: ['習坎', '潛藏', '智慧'],
    desc: '水洊至，習坎。君子以常德行，習教事。重重險阻，但也代表深度的智慧。',
    body: '冬季應養腎。多喝溫水，注意耳部保暖，在安靜中聆聽體內的流水聲。',
    mind: '直面恐懼。水流過險處不失其信，在困難中保持內心的流動與信念。',
    decision: '現在是潛藏修練的時期，不宜大張旗鼓。如水般順勢而流，避開鋒芒。'
  },
  30: {
    id: 30, name: '離', pinyin: 'Lí',
    keywords: ['附麗', '光明', '熱情'],
    desc: '明兩作，離。大人以繼明照于四方。火光照耀，如日中天。',
    body: '夏季養心。觀想光充滿全身。注意眼睛的保養，那是心靈的窗戶。',
    mind: '保持內在的清明。火需要木材（依附）才能燃燒，確認你的熱情源自何處。',
    decision: '適合展示、社交、發表作品。讓你的才華被看見，但要保持柔順的中道。'
  },
  31: {
    id: 31, name: '咸', pinyin: 'Xián',
    keywords: ['感應', '直覺', '戀愛'],
    desc: '山上有澤，咸。君子以虛受人。虛懷若谷，才能感應萬物。',
    body: '關注皮膚的觸覺。感受風吹過、衣服摩擦的感覺。',
    mind: '放空心思（虛心）。當你沒有成見，才能真正接收訊息。',
    decision: '相信第一直覺。這是一個適合戀愛、創作與心電感應的時刻。'
  },
  32: {
    id: 32, name: '恆', pinyin: 'Héng',
    keywords: ['恆久', '堅持', '日常'],
    desc: '雷風，恆。君子以立不易方。雷風相與，循環往復，在變動中尋找不變。',
    body: '建立固定的作息。每天同樣時間起床、睡覺。',
    mind: '平凡就是偉大。在日復一日的瑣事中修煉耐心。',
    decision: '利有攸往。堅持你現在做的事，不要輕易改變方向。'
  },
  33: {
    id: 33, name: '遯', pinyin: 'Dùn',
    keywords: ['隱遯', '退避', '保持距離'],
    desc: '天下有山，遯。君子以遠小人，不惡而嚴。陰氣增長，適合退避。',
    body: '肩膀下沈，背部放鬆。做一些像嬰兒式（Child Pose）的動作。',
    mind: '退後一步海闊天空。這不是逃跑，而是為了保護能量的撤退。',
    decision: '現在不適合出頭。暫時隱居、休假或轉入幕後。'
  },
  34: {
    id: 34, name: '大壯', pinyin: 'Dà Zhuàng',
    keywords: ['強壯', '正大', '煞車'],
    desc: '雷在天上，大壯。君子以非禮弗履。陽氣極盛，聲勢浩大。',
    body: '核心肌群訓練。感受身體充滿力量，但也需要控制力。',
    mind: '君子非禮弗履。力量要用在正道上，不要欺負弱小。',
    decision: '氣勢如虹，但不要硬撞牆壁（羝羊觸藩）。適度收斂反而能走得更遠。'
  },
  35: {
    id: 35, name: '晉', pinyin: 'Jìn',
    keywords: ['晉升', '光明', '接納'],
    desc: '明出地上，晉。君子以自昭明德。像早晨的太陽升起，充滿希望。',
    body: '曬太陽，特別是背部。讓陽光溫暖你的脊椎。',
    mind: '你的才華正在被看見。接受讚美，不要害羞。',
    decision: '適合推廣、面試、發表。利用這股上升的氣流。'
  },
  36: {
    id: 36, name: '明夷', pinyin: 'Míng Yí',
    keywords: ['損傷', '韜光', '養晦'],
    desc: '明入地中，明夷。君子以蒞眾，用晦而明。太陽落入地平線，光明受傷。',
    body: '早點睡覺，進入深層的休息。保護眼睛與心臟。',
    mind: '受了委屈也不要辯解。把光藏在心裡，等待黎明。',
    decision: '利艱貞。環境艱難，不要強出頭。裝傻是最高的智慧。'
  },
  37: {
    id: 37, name: '家人', pinyin: 'Jiā Rén',
    keywords: ['家庭', '溫暖', '核心'],
    desc: '風自火出，家人。君子以言有物，而行有恆。像灶裡的火，溫暖而聚焦。',
    body: '回家吃頓熱飯。感受腹部的溫暖。',
    mind: '外面的世界再大，核心的安穩最重要。修身齊家。',
    decision: '聽取家人的意見。適合處理房產、內部人事或團隊凝聚。'
  },
  38: {
    id: 38, name: '睽', pinyin: 'Kuí',
    keywords: ['乖離', '求同', '觀察'],
    desc: '上火下澤，睽。君子以同而異。意見相左，但也因此能看見不同的觀點。',
    body: '轉動眼球，左右看，放鬆視神經。練習用不同的角度看同一個物體。',
    mind: '接納「不同」的存在。異中求同，是更高層次的和諧。',
    decision: '若遇到反對意見，不要急著反駁，那可能是你忽略的盲點。小事吉。'
  },
  39: {
    id: 39, name: '蹇', pinyin: 'Jiǎn',
    keywords: ['跛腳', '困難', '反省'],
    desc: '山上有水，蹇。君子以反身修德。水流受阻，行走困難。',
    body: '足浴或按摩腳底。注意行走安全。',
    mind: '行有不得，反求諸己。外面的困難是內心的投射。',
    decision: '利西南，不利東北。繞路而行，或者尋求長輩（大人）的幫助。'
  },
  40: {
    id: 40, name: '解', pinyin: 'Xiè',
    keywords: ['解開', '釋放', '赦免'],
    desc: '雷雨作，解。君子以赦過宥罪。春雷響過，鬱悶之氣一掃而空。',
    body: '做伸展運動，把緊繃的肩膀鬆開。深呼吸排毒。',
    mind: '原諒過去的自己。放下包袱，你已經自由了。',
    decision: '有問題要趕快解決，不要拖延。如果沒事了，就早點休息（其來復吉）。'
  },
  41: {
    id: 41, name: '損', pinyin: 'Sǔn',
    keywords: ['減損', '奉獻', '精簡'],
    desc: '山下有澤，損。君子以懲忿窒欲。減損下層來益上層，減少慾望來滋養靈性。',
    body: '清淡飲食，七分飽。減少多餘的脂肪與負擔。',
    mind: '斷捨離。丟掉不屬於你的東西，心會變輕。',
    decision: '現在是付出的時候。犧牲小我，會有長遠的回報。'
  },
  42: {
    id: 42, name: '益', pinyin: 'Yì',
    keywords: ['增益', '風雷', '投入'],
    desc: '風雷，益。君子以見善則遷，有過則改。能量增強，有利於投入資源。',
    body: '做擴胸運動，大口吸氣。讓新鮮的能量充滿胸腔。',
    mind: '慷慨一點。分享你的資源或知識，回流的會更多。',
    decision: '利有攸往。適合啟動新專案，或是跨過大河（冒險）。'
  },
  43: {
    id: 43, name: '夬', pinyin: 'Guài',
    keywords: ['決斷', '宣洩', '公開'],
    desc: '澤上於天，夬。君子以施祿及下，居德則忌。陽氣要衝破最後的陰氣。',
    body: '大聲喊叫或唱歌，把胸口的鬱悶喊出來。',
    mind: '不要隱藏。光明正大地展現你的意圖，小人自然退散。',
    decision: '果斷決策。不要私下交易，要在公開場合宣佈你的決定。'
  },
  44: {
    id: 44, name: '姤', pinyin: 'Gòu',
    keywords: ['邂逅', '機遇', '陰長'],
    desc: '天下有風，姤。后以施命誥四方。一陰始生，會有意外的相遇。',
    body: '注意臀部與髖關節的放鬆。',
    mind: '面對突如其來的誘惑或變化，保持清醒，不要隨便沈淪。',
    decision: '勿用取女。對於突然出現的好事要謹慎，可能是短暫的激情。'
  },
  45: {
    id: 45, name: '萃', pinyin: 'Cuì',
    keywords: ['聚集', '精華', '安檢'],
    desc: '澤上於地，萃。君子以除戎器，戒不虞。水聚集成澤，人聚集成群。',
    body: '參加團體運動或聚會。感受群體的共振。',
    mind: '物以類聚。觀察你身邊聚集了什麼樣的人，那是你的鏡子。',
    decision: '利見大人。適合舉辦大型集會，但要做好安全措施（除戎器）。'
  },
  46: {
    id: 46, name: '升', pinyin: 'Shēng',
    keywords: ['上升', '積累', '生長'],
    desc: '地中生木，升。君子以順德，積小以高大。像樹木一樣，順勢而上。',
    body: '站立伸展，雙手向上延伸，感受脊椎一節節拉開，像樹在長高。',
    mind: '不要急於一時的爆發。持續的累積，自然會帶你到更高的地方。',
    decision: '適合晉升、面試或尋求長輩的支持（南征吉）。'
  },
  47: {
    id: 47, name: '困', pinyin: 'Kùn',
    keywords: ['受困', '修煉', '沈默'],
    desc: '澤無水，困。君子以致命遂志。水漏光了，資源枯竭。',
    body: '節省體力。可能會感到疲憊，多休息，少說話。',
    mind: '困境是化妝的祝福。它逼你放棄外在依賴，找回內在力量。',
    decision: '有言不信。解釋沒有用，用行動證明，或者乾脆安靜等待。'
  },
  48: {
    id: 48, name: '井', pinyin: 'Jǐng',
    keywords: ['資源', '挖掘', '共享'],
    desc: '木上有水，井。君子以勞民勸相。像水井一樣，養人無窮。',
    body: '多喝水，滋潤脊椎。觀想能量沿著中脈上升。',
    mind: '你的智慧是取之不盡的。不要吝嗇分享。',
    decision: '改邑不改井。環境會變，但核心價值不變。堅持你的專業。'
  },
  49: {
    id: 49, name: '革', pinyin: 'Gé',
    keywords: ['變革', '去舊', '時機'],
    desc: '澤中有火，革。君子以治曆明時。水火相息，必須改變。',
    body: '去角質、護膚。想像舊的皮膚脫落，新生的自己出現。',
    mind: '時機已到，不能再拖了。舊模式已經無法運作。',
    decision: '徹底的改變。不要修修補補，要打掉重練。'
  },
  50: {
    id: 50, name: '鼎', pinyin: 'Dǐng',
    keywords: ['煉金', '轉化', '權威'],
    desc: '木上有火，鼎。君子以正位凝命。烹飪食物，化生為熟。',
    body: '細嚼慢嚥，享受食物轉化為能量的過程。',
    mind: '你正在經歷一場煉金術。痛苦是為了提煉出更高貴的靈魂。',
    decision: '正位凝命。適合確立新的目標、發佈新產品或建立個人品牌。'
  },
  51: {
    id: 51, name: '震', pinyin: 'Zhèn',
    keywords: ['震動', '驚醒', '出發'],
    desc: '洊雷，震。君子以恐懼修省。雷聲百里，驚醒萬物。',
    body: '春季養肝。多做伸展運動，大聲吼叫或唱歌以釋放鬱氣。',
    mind: '不要害怕改變帶來的震動。那是喚醒你沉睡意識的鬧鐘。',
    decision: '行動！猶豫會錯失良機。像雷一樣果斷，恐懼後會有笑聲。'
  },
  52: {
    id: 52, name: '艮', pinyin: 'Gèn',
    keywords: ['停止', '當下', '界線'],
    desc: '兼山，艮。君子以思不出其位。兩座山重疊。動靜不失其時。',
    body: '靜坐冥想。觀想自己像一座山，穩如泰山。',
    mind: '思不出其位。活在當下，不要擔憂過去與未來。',
    decision: '時止則止。遇到障礙就停下來，不要硬闖。回到內在。'
  },
  53: {
    id: 53, name: '漸', pinyin: 'Jiàn',
    keywords: ['循序', '緩進', '歸宿'],
    desc: '山上有木，漸。君子以居賢德，善俗。樹木生長緩慢但穩固。',
    body: '練習慢動作瑜伽或太極，感受每一個動作的過渡。',
    mind: '不要急於求成。像鴻雁一樣，跟著隊伍慢慢飛，終會到達。',
    decision: '適合結婚、歸鄉或長期的計畫。穩紮穩打是關鍵。'
  },
  54: {
    id: 54, name: '歸妹', pinyin: 'Guī Mèi',
    keywords: ['衝動', '情慾', '短視'],
    desc: '澤上有雷，歸妹。君子以永終知敝。出於情慾的結合，容易有始無終。',
    body: '調節荷爾蒙。注意情緒的起伏。',
    mind: '不要被一時的激情沖昏頭。慢下來，看清楚。',
    decision: '征凶。不要因為衝動而做承諾或簽約。結局可能不如預期。'
  },
  55: {
    id: 55, name: '豐', pinyin: 'Fēng',
    keywords: ['豐大', '極致', '日中'],
    desc: '雷電皆至，豐。君子以折獄致刑。盛大到了極點，如日中天。',
    body: '保持活躍，但不要過勞。能量太強容易燒壞保險絲。',
    mind: '日中則昃。接受生命的高峰與低谷，不要執著於永遠的盛況。',
    decision: '宜日中。把握現在最好的時機馬上行動，不要拖到太陽下山。'
  },
  56: {
    id: 56, name: '旅', pinyin: 'Lǚ',
    keywords: ['旅行', '探索', '變動'],
    desc: '山上有火，旅。君子以明慎用刑，而不留獄。火勢蔓延迅速，象徵羈旅在外。',
    body: '走路冥想（Walking Meditation）。感受雙腳移動的節奏。',
    mind: '如果不穩定的感覺出現，請視為「探索」而非「流浪」。',
    decision: '適合變動、出差或啟動新計畫。不要固守原地，去有光的地方。'
  },
  57: {
    id: 57, name: '巽', pinyin: 'Xùn',
    keywords: ['順從', '滲透', '反覆'],
    desc: '隨風，巽。君子以申命行事。像風一樣無孔不入，柔軟但持續地滲透。',
    body: '深長的呼吸練習。讓氣息充滿每一個細胞。',
    mind: '不要硬碰硬。用溫柔的方式去影響他人。',
    decision: '利見大人。要有明確的目標，然後像風一樣靈活地達成它。'
  },
  58: {
    id: 58, name: '兌', pinyin: 'Duì',
    keywords: ['喜悅', '溝通', '分享'],
    desc: '麗澤，兌。君子以朋友講習。兩澤相連，互相滋潤。',
    body: '秋季養肺。深呼吸，練習說出讚美與真實的話語。多微笑放鬆臉部肌肉。',
    mind: '獨樂樂不如眾樂樂。透過交流與朋友講習，心靈會得到滋養。',
    decision: '用柔和的方式溝通。說服別人不是靠強硬，而是靠感染力與喜悅。'
  },
  59: {
    id: 59, name: '渙', pinyin: 'Huàn',
    keywords: ['渙散', '流動', '化解'],
    desc: '風行水上，渙。先王以享于帝立廟。風吹過水面，吹散了聚集的能量。',
    body: '出汗運動。讓滯留在體內的水分與毒素排出去。',
    mind: '讓自我的邊界消融。原諒那些讓你糾結的人事物。',
    decision: '適合從事公益、宗教或精神層面的活動。化解僵局。'
  },
  60: {
    id: 60, name: '節', pinyin: 'Jié',
    keywords: ['節制', '規矩', '韻律'],
    desc: '澤上有水，節。君子以制數度，議德行。竹子有節才能長高。',
    body: '關注關節的靈活度。飲食要有節制，不可暴飲暴食。',
    mind: '自由來自於自律。為生活建立健康的界線。',
    decision: '制定制度、預算或時間表。不要過度揮霍資源。'
  },
  61: {
    id: 61, name: '中孚', pinyin: 'Zhōng Fú',
    keywords: ['誠信', '孵化', '核心'],
    desc: '澤上有風，中孚。君子以議獄緩死。如鳥孵卵，能量回歸核心。',
    body: '將雙手交疊於胸口。感受心跳的節奏，想像溫暖的光在胸腔孵化。',
    mind: '冬至之始，萬物歸根。這是許下年度「核心意圖」的最佳時刻。',
    decision: '相信直覺。如果是發自內心誠信的決定，將會獲得巨大的支持。'
  },
  62: {
    id: 62, name: '小過', pinyin: 'Xiǎo Guò',
    keywords: ['飛鳥', '小越', '謹慎'],
    desc: '山上有雷，小過。君子以行過乎恭，喪過乎哀，用過乎儉。',
    body: '練習輕聲走路，縮小動作幅度。回歸身體的中心軸。',
    mind: '可以有小小的叛逆或嘗試，但大方向要保守。',
    decision: '不宜做大事，適合處理瑣碎的小事。行事要比平常更恭敬一點。'
  },
  63: {
    id: 63, name: '既濟', pinyin: 'Jì Jì',
    keywords: ['完成', '完美', '守成'],
    desc: '水在火上，既濟。君子以思患而預防之。陰陽各得其位，事情已完成。',
    body: '平衡練習（如樹式），感受身體中軸的穩定。',
    mind: '完美的頂點就是下坡的開始。保持覺知，不要鬆懈。',
    decision: '初吉終亂。守成不易，不要再開新戰場，維護現有的成果。'
  },
  64: {
    id: 64, name: '未濟', pinyin: 'Wèi Jì',
    keywords: ['未完', '希望', '循環'],
    desc: '火在水上，未濟。君子以慎辨物居方。陰陽失位，但代表生生不息。',
    body: '自由舞動，打破身體的慣性與框架。',
    mind: '接受「未完成」的狀態。生命本來就是一場無限的遊戲。',
    decision: '保持彈性。現在不是下定論的時候，保留改變的空間。'
  }
};

/**
 * ------------------------------------------------------------------
 * 2. 邏輯運算核心
 * ------------------------------------------------------------------
 */

const getWinterSolstice = (year) => {
  return new Date(year, 11, 21, 12, 0, 0);
};

// 簡易節氣計算
const getSolarTerm = (date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const terms = [
    { name: '小寒', m: 1, d: 5 }, { name: '大寒', m: 1, d: 20 },
    { name: '立春', m: 2, d: 4 }, { name: '雨水', m: 2, d: 19 },
    { name: '驚蟄', m: 3, d: 6 }, { name: '春分', m: 3, d: 21 },
    { name: '清明', m: 4, d: 5 }, { name: '穀雨', m: 4, d: 20 },
    { name: '立夏', m: 5, d: 5 }, { name: '小滿', m: 5, d: 21 },
    { name: '芒種', m: 6, d: 6 }, { name: '夏至', m: 6, d: 21 },
    { name: '小暑', m: 7, d: 7 }, { name: '大暑', m: 7, d: 23 },
    { name: '立秋', m: 8, d: 8 }, { name: '處暑', m: 8, d: 23 },
    { name: '白露', m: 9, d: 8 }, { name: '秋分', m: 9, d: 23 },
    { name: '寒露', m: 10, d: 8 }, { name: '霜降', m: 10, d: 23 },
    { name: '立冬', m: 11, d: 7 }, { name: '小雪', m: 11, d: 22 },
    { name: '大雪', m: 12, d: 7 }, { name: '冬至', m: 12, d: 21 }
  ];

  let currentTerm = terms[terms.length - 1]; // Default to Winter Solstice
  
  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    if (month === term.m && day >= term.d) {
      currentTerm = term;
    } else if (month === term.m && day < term.d) {
      if (i === 0) {
        currentTerm = terms[23];
      } else {
        currentTerm = terms[i - 1];
      }
      break; 
    } else if (month > term.m) {
      currentTerm = term; 
    }
  }
  
  if (month === 1 && day < 5) return '冬至';
  return currentTerm.name;
};

const calculateGua = (date) => {
  const currentYear = date.getFullYear();
  let refSolstice = getWinterSolstice(currentYear);
  if (date < refSolstice) {
    refSolstice = getWinterSolstice(currentYear - 1);
  }
  
  const diffTime = Math.abs(date - refSolstice);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const index = Math.floor(diffDays / 6.0875) % 60;
  const guaId = MENG_XI_SEQUENCE[index];
  
  const startOffset = index * 6.0875;
  const endOffset = (index + 1) * 6.0875;
  
  const startDate = new Date(refSolstice);
  startDate.setDate(refSolstice.getDate() + Math.floor(startOffset));
  const endDate = new Date(refSolstice);
  endDate.setDate(refSolstice.getDate() + Math.floor(endOffset));

  return { id: guaId, startDate, endDate, solarTerm: getSolarTerm(date) };
};

// 計算特定索引的日期區間 (用於總覽)
const calculateDateRangeForIndex = (index, currentYear) => {
    // 假設從今年冬至開始算，或者去年冬至 (視當下時間點而定)
    const refSolstice = getWinterSolstice(currentYear);
    
    const startOffset = index * 6.0875;
    const endOffset = (index + 1) * 6.0875;
    
    const startDate = new Date(refSolstice);
    startDate.setDate(refSolstice.getDate() + Math.floor(startOffset));
    const endDate = new Date(refSolstice);
    endDate.setDate(refSolstice.getDate() + Math.floor(endOffset));

    return { startDate, endDate };
};

const generateGuaInfo = (id) => {
  const basicInfo = ALL_HEXAGRAMS[id] || { 
    name: `卦象 ${id}`, u: '1', l: '1', pinyin: `Gua ${id}` 
  };

  const detailInfo = HEXAGRAM_DETAILS[id] || {
    keywords: ['流動', '時機', '平衡'],
    desc: `目前走到了${basicInfo.name}。順應天時，觀照當下。能量正在轉化中。`,
    body: '深呼吸，將意識帶回當下的身體感覺。掃描全身有無緊繃之處。',
    mind: '保持開放的心。每一個當下都是完美的安排。',
    decision: '在做決定前，先安靜三分鐘。聽從內在的聲音。'
  };

  return {
    id: id,
    name: basicInfo.name, 
    pinyin: basicInfo.pinyin,
    upper: basicInfo.u,
    lower: basicInfo.l,
    keywords: detailInfo.keywords,
    desc: detailInfo.desc,
    body: detailInfo.body,
    mind: detailInfo.mind,
    decision: detailInfo.decision
  };
};

/**
 * ------------------------------------------------------------------
 * 3. UI 組件
 * ------------------------------------------------------------------
 */

const HexagramSymbol = ({ upper, lower, size = "md" }) => {
  const trigramLines = {
    '1': [1,1,1], '2': [0,1,1], '3': [1,0,1], '4': [0,0,1],
    '5': [1,1,0], '6': [0,1,0], '7': [1,0,0], '8': [0,0,0]
  };
  
  const widthClass = size === "sm" ? "w-12" : size === "md" ? "w-24 md:w-32" : "w-16";
  const heightClass = size === "sm" ? "h-1.5" : size === "md" ? "h-3" : "h-2";
  const gapClass = size === "sm" ? "my-0.5" : size === "md" ? "my-1.5" : "my-1";
  
  const renderLine = (isYang, idx) => (
    <div key={idx} className={`w-full ${heightClass} flex justify-between ${gapClass}`}>
      {isYang ? (
        <div className="w-full h-full bg-slate-800/80 rounded-sm shadow-sm"></div>
      ) : (
        <>
          <div className="w-[45%] h-full bg-slate-800/80 rounded-sm shadow-sm"></div>
          <div className="w-[45%] h-full bg-slate-800/80 rounded-sm shadow-sm"></div>
        </>
      )}
    </div>
  );

  return (
    <div className={`flex flex-col ${widthClass} opacity-90 mix-blend-multiply transition-all duration-500 cursor-pointer`}>
      {trigramLines[upper]?.map((line, i) => renderLine(line, `u-${i}`))}
      <div className={size === "sm" ? "h-1" : size === "md" ? "h-4" : "h-2"}></div> 
      {trigramLines[lower]?.map((line, i) => renderLine(line, `l-${i}`))}
    </div>
  );
};

const Overview = ({ onSelectGua, onSelectMaster }) => {
  const currentYear = new Date().getFullYear();
  // 分組：每 15 個卦為一季 (冬: 坎, 春: 震, 夏: 離, 秋: 兌)
  const quarters = [
    { title: '冬季 Winter', master: SEASON_MASTERS.winter, range: [0, 15] },
    { title: '春季 Spring', master: SEASON_MASTERS.spring, range: [15, 30] },
    { title: '夏季 Summer', master: SEASON_MASTERS.summer, range: [30, 45] },
    { title: '秋季 Autumn', master: SEASON_MASTERS.autumn, range: [45, 60] }
  ];

  const getSolarTermForIndex = (startDate) => {
    return getSolarTerm(startDate);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-serif text-slate-700 mb-2">歲時全覽</h2>
        <p className="text-sm text-slate-500 tracking-widest uppercase">The Cycle of 60 Hexagrams</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quarters.map((quarter, qIdx) => (
          <div key={qIdx} className={`rounded-3xl p-6 bg-gradient-to-b ${quarter.master.color} border border-white/60 shadow-lg backdrop-blur-sm`}>
            {/* 季節主卦 Header - 可點擊 */}
            <div 
                className="flex flex-col items-center mb-8 pb-6 border-b border-slate-400/20 cursor-pointer group hover:bg-white/30 rounded-xl transition-all p-2"
                onClick={() => onSelectMaster(quarter.master.id)}
            >
              <div className="flex items-center gap-2 mb-3">
                 <quarter.master.icon className="w-4 h-4 text-slate-500" />
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{quarter.title}</div>
              </div>
              <div className="mb-4 transform scale-75 group-hover:scale-90 transition-transform duration-500">
                 <HexagramSymbol upper={quarter.master.upper} lower={quarter.master.lower} size="md" />
              </div>
              <h3 className="text-2xl font-serif text-slate-800">{quarter.master.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{quarter.master.desc}</p>
              <span className="text-[10px] mt-2 bg-white/50 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-slate-500">點擊查看主卦詳解</span>
            </div>

            {/* 六十卦列表 */}
            <div className="space-y-3">
              {MENG_XI_SEQUENCE.slice(quarter.range[0], quarter.range[1]).map((guaId, idx) => {
                const absIndex = quarter.range[0] + idx;
                const { startDate } = calculateDateRangeForIndex(absIndex, currentYear - (new Date().getMonth() < 11 ? 1 : 0)); // 簡易處理跨年
                const info = ALL_HEXAGRAMS[guaId];
                const solarTerm = getSolarTermForIndex(startDate);
                
                const isTermStart = idx === 0 || solarTerm !== getSolarTermForIndex(calculateDateRangeForIndex(absIndex - 1, currentYear - (new Date().getMonth() < 11 ? 1 : 0)).startDate);

                return (
                  <div key={idx} className="flex items-center gap-3 p-2 hover:bg-white/40 rounded-lg transition-colors group cursor-pointer" onClick={() => onSelectGua(absIndex)}>
                    <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                      <HexagramSymbol upper={info.u} lower={info.l} size="sm" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-serif text-slate-700">{info.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {startDate.getMonth()+1}/{startDate.getDate()}
                        </span>
                      </div>
                      {isTermStart && (
                         <div className="text-[10px] text-amber-600/80 font-medium mt-0.5 flex items-center gap-1">
                           <Leaf className="w-2 h-2" /> {solarTerm}
                         </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ... (P5Background component)
const P5Background = ({ upper, lower }) => {
  const canvasRef = useRef(null);
  const p5Instance = useRef(null);

  useEffect(() => {
    const sketch = (p) => {
      let particles = [];
      const numParticles = 80;

      p.setup = () => {
        const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
        canvas.parent(canvasRef.current);
        canvas.style('position', 'absolute');
        canvas.style('top', '0');
        canvas.style('left', '0');
        canvas.style('z-index', '-1');
        
        for (let i = 0; i < numParticles; i++) {
          particles.push(new Particle(p));
        }
      };

      p.draw = () => {
        const c1 = p.color(...(TRIGRAMS[upper]?.color || [200,200,200]));
        const c2 = p.color(...(TRIGRAMS[lower]?.color || [200,200,200]));
        
        p.noStroke();
        const bgColor = p.lerpColor(c1, c2, 0.5);
        p.fill(p.red(bgColor), p.green(bgColor), p.blue(bgColor), 20);
        p.rect(0, 0, p.width, p.height);

        particles.forEach(pt => {
          pt.update(upper, lower);
          pt.display(upper);
        });
      };

      p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
      };

      class Particle {
        constructor(p) {
          this.p = p;
          this.pos = p.createVector(p.random(p.width), p.random(p.height));
          this.vel = p.createVector(0, 0);
          this.size = p.random(2, 6);
        }

        update(u, l) {
          let noiseVal = this.p.noise(this.pos.x * 0.003, this.pos.y * 0.003, this.p.frameCount * 0.002);
          let angle = noiseVal * this.p.TWO_PI * 2;
          let force = p5.Vector.fromAngle(angle);
          force.mult(0.5);
          
          if (u === '3' || l === '3') force.y -= 0.1; 
          if (u === '6' || l === '6') force.y += 0.1; 
          if (u === '7' || l === '7') force.mult(0.1); 

          this.vel.add(force);
          this.vel.limit(1.5);
          this.pos.add(this.vel);

          if (this.pos.x > this.p.width) this.pos.x = 0;
          if (this.pos.x < 0) this.pos.x = this.p.width;
          if (this.pos.y > this.p.height) this.pos.y = 0;
          if (this.pos.y < 0) this.pos.y = this.p.height;
        }

        display(u) {
          let c = this.p.color(...(TRIGRAMS[u]?.color || [100,100,100]));
          c.setAlpha(100);
          this.p.fill(c);
          this.p.circle(this.pos.x, this.pos.y, this.size);
        }
      }
    };

    p5Instance.current = new p5(sketch);
    return () => p5Instance.current.remove();
  }, [upper, lower]);

  return <div ref={canvasRef} className="fixed inset-0 transition-opacity duration-1000 ease-in-out" />;
};

/**
 * ------------------------------------------------------------------
 * 4. 主程式
 * ------------------------------------------------------------------
 */
export default function MengXiCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [gua, setGua] = useState(null); // 當前顯示的卦
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('calendar'); // 'calendar', 'overview', 'master'
  const [masterMode, setMasterMode] = useState(false); // 是否在查看主卦詳情

  useEffect(() => {
    // 只有在非 master 模式下才根據日期計算卦象
    if (!masterMode) {
        setLoading(true);
        const timer = setTimeout(() => {
          const calc = calculateGua(currentDate);
          const info = generateGuaInfo(calc.id);
          setGua({ ...calc, ...info });
          setLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }
  }, [currentDate, masterMode]);

  const handleDateChange = (days) => {
    setMasterMode(false); // 切換日期時退出主卦模式
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const handleSelectGuaFromOverview = (index) => {
    setMasterMode(false);
    const currentYear = new Date().getFullYear();
    const refSolstice = getWinterSolstice(currentYear - (new Date().getMonth() < 11 ? 1 : 0));
    const targetDate = new Date(refSolstice);
    targetDate.setDate(refSolstice.getDate() + Math.floor(index * 6.0875) + 1);
    
    setCurrentDate(targetDate);
    setView('calendar');
  };

  const handleSelectMasterGua = (id) => {
    setLoading(true);
    setTimeout(() => {
        // 直接使用 generateGuaInfo 獲取主卦詳情 (ID 29, 30, 51, 58)
        const info = generateGuaInfo(id);
        // 主卦沒有特定日期區間，我們可以給一個標記
        setGua({ ...info, solarTerm: 'Seasonal Ruler' }); 
        setMasterMode(true);
        setView('calendar'); // 使用日曆的詳細視圖來顯示
        setLoading(false);
    }, 300);
  };

  const formatDate = (d) => `${d.getMonth() + 1}/${d.getDate()}`;

  if (!gua) return <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-400">載入天時...</div>;

  return (
    <div className="relative min-h-screen font-sans text-slate-700 overflow-hidden selection:bg-teal-100 selection:text-teal-900 overflow-y-auto">
      
      <P5Background upper={gua.upper} lower={gua.lower} />

      {/* 頂部導航 */}
      <nav className="relative z-20 p-6 flex justify-between items-center bg-gradient-to-b from-white/20 to-transparent">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => {
            setView('calendar');
            setMasterMode(false);
            setCurrentDate(new Date());
        }}>
          <div className="bg-white/40 p-2.5 rounded-full backdrop-blur-md shadow-sm border border-white/50 group-hover:bg-white/60 transition-all">
            <Compass className="w-5 h-5 text-slate-700" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg tracking-widest text-slate-800">孟喜卦氣</span>
            <span className="text-[10px] text-slate-500 tracking-wider uppercase">Generative Calendar</span>
            <a 
              href="https://www.facebook.com/groups/happyihana" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] text-slate-400/80 hover:text-amber-600/80 transition-colors mt-0.5 tracking-wider font-light no-underline z-50"
              onClick={(e) => e.stopPropagation()}
            >
              © 純在喜悅祝福圈
            </a>
          </div>
        </div>

        {view === 'calendar' ? (
          <div className="flex items-center gap-4 bg-white/40 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/40 shadow-sm transition-all duration-500">
            {/* 如果是主卦模式，隱藏前後切換與日期，只顯示標題 */}
            {!masterMode ? (
                <>
                    <button onClick={() => handleDateChange(-7)} className="hover:bg-white/50 p-1.5 rounded-full transition-colors text-slate-600">
                    <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col items-center min-w-[110px]">
                    <span className="text-sm font-medium text-slate-800 tracking-wide font-serif">
                        {currentDate.getFullYear()} / {currentDate.getMonth()+1} / {currentDate.getDate()}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-medium">
                            {formatDate(gua.startDate)} - {formatDate(gua.endDate)}
                        </span>
                        <span className="text-[10px] bg-amber-100/80 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
                            {gua.solarTerm}
                        </span>
                    </div>
                    </div>
                    <button onClick={() => handleDateChange(7)} className="hover:bg-white/50 p-1.5 rounded-full transition-colors text-slate-600">
                    <ChevronRight className="w-5 h-5" />
                    </button>
                </>
            ) : (
                <div className="flex items-center gap-2 px-4">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-serif text-slate-700 tracking-wider">季節主宰 • {gua.name}</span>
                </div>
            )}
          </div>
        ) : (
          <div className="px-5 py-2.5">
             <span className="text-sm font-serif text-slate-600 italic">Select a hexagram to view details</span>
          </div>
        )}

        <button 
          onClick={() => setView(view === 'calendar' ? 'overview' : 'calendar')}
          className="flex items-center gap-2 bg-white/40 px-4 py-2.5 rounded-full backdrop-blur-md border border-white/40 shadow-sm hover:bg-white/60 transition-all text-slate-700 text-sm font-medium"
        >
          {view === 'calendar' ? <><Grid className="w-4 h-4" /> 總覽</> : <><Layout className="w-4 h-4" /> 曆法</>}
        </button>
      </nav>

      {/* 主要內容區 */}
      {view === 'calendar' ? (
        <main className={`relative z-10 max-w-5xl mx-auto px-6 py-4 flex flex-col items-center justify-center min-h-[80vh] transition-all duration-700 ${loading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          <div className="w-full bg-white/30 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 shadow-2xl overflow-hidden grid md:grid-cols-5 min-h-[500px]">
            {/* 左側：視覺區 */}
            <div className="md:col-span-2 p-10 flex flex-col items-center justify-center bg-gradient-to-b from-white/40 to-transparent border-b md:border-b-0 md:border-r border-white/30 relative">
               <div className="absolute top-6 left-6 text-xs font-bold text-slate-400/80 uppercase tracking-widest border border-slate-300/50 px-2 py-1 rounded-md">
                  No. {gua.id}
               </div>
               
               <div className="mb-8 relative group cursor-pointer" title="點擊深呼吸">
                  <div className="absolute inset-0 bg-white/30 rounded-full blur-3xl scale-75 animate-pulse-slow"></div>
                  <HexagramSymbol upper={gua.upper} lower={gua.lower} />
               </div>
               
               <div className="text-center z-10">
                 <h1 className="text-6xl font-serif text-slate-800 mb-1 tracking-tight">{gua.name}</h1>
                 <p className="text-sm tracking-[0.3em] text-slate-500 uppercase font-light mb-6 ml-1">{gua.pinyin}</p>
                 <div className="flex flex-wrap justify-center gap-2">
                   {gua.keywords.map(k => (
                     <span key={k} className="px-3 py-1 bg-white/60 rounded-full text-xs text-slate-600 border border-white/40 shadow-sm backdrop-blur-sm">
                       {k}
                     </span>
                   ))}
                 </div>
               </div>
            </div>

            {/* 右側：內容區 */}
            <div className="md:col-span-3 p-10 md:p-14 flex flex-col justify-center bg-white/10">
              <div className="mb-10">
                 <div className="flex items-center gap-2 mb-4 opacity-70">
                   {masterMode ? <Sparkles className="w-4 h-4 text-purple-500" /> : <Leaf className="w-4 h-4 text-emerald-600" />}
                   <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                      {masterMode ? 'Master Energy' : `${gua.solarTerm} Season`}
                   </span>
                 </div>
                 <p className="text-2xl font-serif text-slate-700 leading-relaxed">
                   {gua.desc}
                 </p>
              </div>

              <div className="grid gap-8">
                 <div className="flex gap-5 group cursor-default">
                    <div className="mt-1 bg-teal-100/50 p-2 rounded-xl h-fit group-hover:bg-teal-100 transition-colors">
                      <Heart className="w-5 h-5 text-teal-700" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-600 mb-1">身體掃描 Body Scan</h4>
                      <p className="text-sm text-slate-500 leading-6">{gua.body}</p>
                    </div>
                 </div>

                 <div className="flex gap-5 group cursor-default">
                    <div className="mt-1 bg-indigo-100/50 p-2 rounded-xl h-fit group-hover:bg-indigo-100 transition-colors">
                      <Wind className="w-5 h-5 text-indigo-700" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-600 mb-1">靈性指引 Spirit Guide</h4>
                      <p className="text-sm text-slate-500 leading-6">{gua.mind}</p>
                    </div>
                 </div>

                 <div className="flex gap-5 group cursor-default">
                    <div className="mt-1 bg-amber-100/50 p-2 rounded-xl h-fit group-hover:bg-amber-100 transition-colors">
                      <Compass className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-600 mb-1">決策建議 Decision</h4>
                      <p className="text-sm text-slate-500 leading-6">{gua.decision}</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
          
          {!masterMode && (
            <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-400/80 font-light tracking-widest">
                <Info className="w-3 h-3" />
                <span>孟喜六日七分法 • 順應四時 • 頤養身心</span>
            </div>
          )}
        </main>
      ) : (
        <Overview onSelectGua={handleSelectGuaFromOverview} onSelectMaster={handleSelectMasterGua} />
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-slow {
          0%, 100% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        .animate-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}