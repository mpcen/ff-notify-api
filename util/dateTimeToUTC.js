const dateFns = require('date-fns');

function dateTimeToUTC(dateStr) {
    const [time, date] = dateStr.split(' - ').map(val => val);
    const [ day, month, year ] = date.split(' ').map(val => val);
    const timeUTC = dateFns.parse(
        `${month} ${day} ${year} ${time}`,
        'lll'
    ).toUTCString();

    return timeUTC;
}

module.exports = dateTimeToUTC;