import { MENG_XI_SEQUENCE, ALL_HEXAGRAMS, HEXAGRAM_DETAILS } from './data';

export const getWinterSolstice = (year) => {
    return new Date(year, 11, 21, 12, 0, 0);
};

// 簡易節氣計算
export const getSolarTerm = (date) => {
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

export const calculateGua = (date) => {
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
export const calculateDateRangeForIndex = (index, currentYear) => {
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

export const generateGuaInfo = (id) => {
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
