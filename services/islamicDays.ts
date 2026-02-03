export interface IslamicHoliday {
    month: number; // 0-indexed (0 = Muharram)
    day: number;
    name: string;
    description?: string;
}

// Islamic months are 0-indexed in moment-hijri for some operations, but we'll use 0-indexed for consistency with JS months
export const ISLAMIC_HOLIDAYS: IslamicHoliday[] = [
    { month: 0, day: 1, name: 'Islamic New Year' },
    { month: 0, day: 10, name: 'Ashura' },
    { month: 2, day: 12, name: 'Mawlid al-Nabi' },
    { month: 6, day: 27, name: "Isra' wal Mi'raj" },
    { month: 7, day: 15, name: 'Shab-e-Barat' },
    { month: 8, day: 1, name: 'Start of Ramadan' },
    { month: 8, day: 21, name: 'Laylat al-Qadr (Expected)' },
    { month: 8, day: 23, name: 'Laylat al-Qadr (Expected)' },
    { month: 8, day: 25, name: 'Laylat al-Qadr (Expected)' },
    { month: 8, day: 27, name: 'Laylat al-Qadr (Expected)' },
    { month: 8, day: 29, name: 'Laylat al-Qadr (Expected)' },
    { month: 9, day: 1, name: 'Eid al-Fitr' },
    { month: 11, day: 9, name: "Day of 'Arafah" },
    { month: 11, day: 10, name: 'Eid al-Adha' },
];

export const getHolidayForDate = (iMonth: number, iDay: number): IslamicHoliday | undefined => {
    return ISLAMIC_HOLIDAYS.find(h => h.month === iMonth && h.day === iDay);
};
