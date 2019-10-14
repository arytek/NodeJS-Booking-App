const {google} = require('googleapis');
const reqValidator = require('../../Utility/requirement-validator.js');
const appUtil = require('../../Utility/appUtil.js');

/**
 * Searches through the given events (appointments), sees which appointments span
 * across a full days timeslots (11). If 11 appointment events are found within a
 * same day, then the day which those appointments fell on, is added to the bookedDays array.
 * @param {number} events  Appointment events.
 * @returns {number[]} bookedDays  An array containing the days that are fully booked.
 */
function getBookedDays(events) {
    let bookedDays = [];
    let date = null;
    let prevDate = null;
    let dayArr = [];
    for (let event of events) {
        date = appUtil.getDateFromISO(event.start.dateTime);
        if (date === prevDate || prevDate === null) {
            dayArr.push(event);
        } else {
            dayArr = []; // Clear array.
            dayArr.push(event);
        }
        prevDate = appUtil.getDateFromISO(event.start.dateTime);
        if (dayArr.length === 11) {
            dayArr = []; // Clear array.
            bookedDays.push(date);
        }
    }
    return bookedDays;
}

/**
 * Uses the bookedDays value returned from getBookedDays() to create an array containing
 * info on whether the day has any timeslots available or not.
 * @param {number} endDate  End date of the month.
 * @param {number[]} bookedDays  An array containing the days that are fully booked.
 * @returns {object[]} daysArr  An array containing objects which represent the days of
 * the month, and whether the day has any timeslots available.
 */
function makeDaysArr(endDate, bookedDays) {
    let daysArr = [];
    for (let i = 1; i <= endDate; i++) {
        if (bookedDays.includes(i)) {
            daysArr.push({"day": i, "hasTimeSlots": false});
        } else {
            daysArr.push({"day": i, "hasTimeSlots": true});
        }
    }
    return daysArr;
}

/**
 * Returns a promise with data containing objects with information on whether the days in the given
 * month have any timeslots available. Days with no timeslots are considered fully booked.
 * @param {object} auth  The oAuth2Client used for authentication for the Google Calendar API.
 * @param {number} year  Year to search for.
 * @param {number} month  Month to search for.
 * @returns {promise}  A promise representing the eventual completion of the getBookableDays() function.
 */
function getBookableDays(auth, year, month) {
    return new Promise(function(resolve, reject) {
        const isInvalid = reqValidator.validateGetDays(year, month);
        if (isInvalid) return reject(isInvalid);

        const startDate = new Date(Date.UTC(year, month-1, appUtil.getCurrDateUTC()));
        const endDate = new Date((Date.UTC(year, month)));
        const calendar = google.calendar({version: 'v3', auth});
        calendar.events.list({
            calendarId: 'primary',
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            maxResults: 350,
            singleEvents: true,
            orderBy: 'startTime',
            q: 'appointment'
        }, (err, res) => {
            if (err) return reject({success: false,
                message: 'The API returned an error - ' + err});
            const events = res.data.items;
            const lastDay = appUtil.getLastDayOfMonth(year, month);
            let result = {};
            result.days = makeDaysArr(lastDay, getBookedDays(events));
            const response = Object.assign({success: true}, result);
            resolve(response);
        });
    });
}

module.exports = {
    getBookableDays
};