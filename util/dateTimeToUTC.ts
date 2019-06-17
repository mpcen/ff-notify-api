import { parse } from 'date-fns';

export function util_dateTimeToUTC(dateStr: string): string {
    const [time, date] = dateStr.split(' - ').map(val => val);
    const [day, month, year] = date.split(' ').map(val => val);

    return parse(`${month} ${day} ${year} ${time}`).toUTCString();
}
