declare module 'moment-hijri' {
    import moment from 'moment';
    interface MomentHijri extends moment.Moment {
        iDate(): number;
        iDate(date: number): MomentHijri;
        iMonth(): number;
        iMonth(month: number): MomentHijri;
        iMonth(month: string): MomentHijri;
        iYear(): number;
        iYear(year: number): MomentHijri;
        format(format: string): string;
        add(amount: number | string, unit: string): MomentHijri;
        subtract(amount: number | string, unit: string): MomentHijri;
        startOf(unit: string): MomentHijri;
        endOf(unit: string): MomentHijri;
    }
    function momentHijri(date?: any): MomentHijri;
    export default momentHijri;
}
