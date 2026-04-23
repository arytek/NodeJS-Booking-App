const path = require('path');
const {google} = require('googleapis');
const reqValidator = require('../../Utility/requirement-validator.js');
const appUtil = require('../../Utility/appUtil.js');

const TIMESLOTS = require(path.join(__dirname, '..', '..', 'Utility', 'timeslots.json')).timeslots;

function findMatchingTimeslot(hour, minute) {
    const target = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    return TIMESLOTS.find((slot) => appUtil.extractHourMinuteFromSlot(slot.startTime) === target);
}

async function bookAppointment(auth, rawYear, rawMonth, rawDay, rawHour, rawMinute) {
    const validation = reqValidator.validateBooking({
        year: rawYear, month: rawMonth, day: rawDay, hour: rawHour, minute: rawMinute,
    });
    if (validation.error) return validation.error;
    const {year, month, day, hour, minute} = validation.values;

    const timeslot = findMatchingTimeslot(hour, minute);
    if (!timeslot) return {success: false, message: 'Invalid time slot'};

    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const event = appUtil.makeEventResource(date, timeslot.startTime, timeslot.endTime);
    const calendar = google.calendar({version: 'v3', auth});

    let res;
    try {
        res = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });
    } catch (err) {
        return {success: false, message: `Error contacting the Calendar service: ${err.message || err}`};
    }

    const created = res.data;
    console.log('Appointment created:', created.id);
    return {
        success: true,
        startTime: created.start.dateTime,
        endTime: created.end.dateTime,
    };
}

module.exports = {
    bookAppointment,
};
