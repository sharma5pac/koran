export interface Dua {
    id: number;
    arabic: string;
    transliteration: string;
    translation: string;
    reference: string;
}

export const DAILY_DUAS: Dua[] = [
    {
        id: 1,
        arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
        transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar",
        translation: "Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.",
        reference: "Quran 2:201"
    },
    {
        id: 2,
        arabic: "رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا",
        transliteration: "Rabbana la tu'akhidhna in nasina aw akhta'na",
        translation: "Our Lord, do not impose blame upon us if we have forgotten or erred.",
        reference: "Quran 2:286"
    },
    {
        id: 3,
        arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
        transliteration: "Rabbi-shrah li sadri wa yassir li amri",
        translation: "My Lord, expand for me my breast [with assurance] and ease for me my task.",
        reference: "Quran 20:25-26"
    },
    {
        id: 4,
        arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
        transliteration: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin wa-j'alna lil-muttaqina imama",
        translation: "Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous.",
        reference: "Quran 25:74"
    },
    {
        id: 5,
        arabic: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ",
        transliteration: "Rabbi-j'alni muqimas-salati wa min dhurriyyati Rabbana wa taqabbal du'a'",
        translation: "My Lord, make me an establisher of prayer, and [many] from my descendants. Our Lord, and accept my supplication.",
        reference: "Quran 14:40"
    }
];

export const getDuaOfTheDay = (): Dua => {
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return DAILY_DUAS[dayOfYear % DAILY_DUAS.length];
};
