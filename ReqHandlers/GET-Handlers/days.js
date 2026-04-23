const {google} = require('googleapis');
const reqValidator = require('../../Utility/requirement-validator.js');
const appUtil = require('../../Utility/appUtil.js');

const TIMESLOTS_PER_DAY = 11;

/**
 * Returns the set of days (1-31) that are fully booked in the given events list.
 */
function getBookedDays(events) {
    const countsByDay = new Map();
    for (const event of events) {
        const day = appUtil.getDateFromISO(event.start.dateTime);
        countsByDay.set(day, (countsByDay.get(day) || 0) + 1);
    }
    const booked = [];
    for (const [day, count] of countsByDay) {
        if (count >= TIMESLOTS_PER_DAY) booked.push(day);
    }
    return booked;
}

function makeDaysArr(endDate, bookedDays) {
    const bookedSet = new Set(bookedDays);
    const daysArr = [];
    for (let day = 1; day <= endDate; day++) {
        daysArr.push({day, hasTimeSlots: !bookedSet.has(day)});
    }
    return daysArr;
}

async function getBookableDays(auth, rawYear, rawMonth) {
    const validation = reqValidator.validateGetDays({year: rawYear, month: rawMonth});
    if (validation.error) return validation.error;
    const {year, month} = validation.values;

    const startDay = (year === new Date().getUTCFullYear() && month === new Date().getUTCMonth() + 1)
        ? appUtil.getCurrDateUTC()
        : 1;
    const startDate = new Date(Date.UTC(year, month - 1, startDay));
    const endDate = new Date(Date.UTC(year, month));

    const calendar = google.calendar({version: 'v3', auth});
    let res;
    try {
        res = await calendar.events.list({
            calendarId: 'primary',
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            maxResults: 350,
            singleEvents: true,
            orderBy: 'startTime',
            q: 'appointment',
        });
    } catch (err) {
        return {success: false, message: `The API returned an error - ${err.message || err}`};
    }

    const events = res.data.items || [];
    const lastDay = appUtil.getLastDayOfMonth(year, month);
    return {
        success: true,
        days: makeDaysArr(lastDay, getBookedDays(events)),
    };
}

module.exports = {
    getBookableDays,
};
