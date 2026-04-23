const path = require('path');
const {google} = require('googleapis');
const reqValidator = require('../../Utility/requirement-validator.js');
const appUtil = require('../../Utility/appUtil.js');

const TIMESLOTS = require(path.join(__dirname, '..', '..', 'Utility', 'timeslots.json')).timeslots;

/**
 * Returns the timeslots that are not already occupied by an appointment.
 */
function getAvailableTimeslots(appointments) {
    const bookedHm = new Set(
        appointments
            .map((a) => appUtil.extractHourMinuteFromEvent(a.startTime))
            .filter(Boolean)
    );
    return TIMESLOTS.filter((slot) => {
        const hm = appUtil.extractHourMinuteFromSlot(slot.startTime);
        return hm && !bookedHm.has(hm);
    });
}

async function getAvailTimeslots(auth, rawYear, rawMonth, rawDay) {
    const validation = reqValidator.validateGetTimeslots({year: rawYear, month: rawMonth, day: rawDay});
    if (validation.error) return validation.error;
    const {year, month, day} = validation.values;

    const startDate = new Date(Date.UTC(year, month - 1, day));
    const endDate = appUtil.getNextDay(startDate);

    const calendar = google.calendar({version: 'v3', auth});
    let res;
    try {
        res = await calendar.events.list({
            calendarId: 'primary',
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            maxResults: TIMESLOTS.length,
            singleEvents: true,
            orderBy: 'startTime',
            q: 'appointment',
        });
    } catch (err) {
        return {success: false, message: `The API returned an error - ${err.message || err}`};
    }

    const appointments = (res.data.items || []).map((event) => ({
        startTime: event.start.dateTime,
        endTime: event.end.dateTime,
    }));
    const timeslots = getAvailableTimeslots(appointments);
    return {success: timeslots.length > 0, timeslots};
}

module.exports = {
    getAvailTimeslots,
};
