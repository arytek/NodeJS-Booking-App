const {google} = require('googleapis');
const reqValidator = require('../Utility/requirement-validator.js');
const appUtil = require('../Utility/appUtil.js');

/**
 * Returns a promise with data containing objects with information of the timeslots in the given day.
 * Each object contains the startTime and endTime of the timeslot.
 * @param {object} auth  The oAuth2Client used for authentication for the Google Calendar API.
 * @param {number} year  Year to search for.
 * @param {number} month  Month to search for.
 * @param {number} day  Day to search for.
 * @param {boolean} includeId  Whether the returned object should include event ids.
 * @returns {promise}  A promise representing the eventual completion of the getAvailTimeslots() function.
 */
function getAvailTimeslots(auth, year, month, day, includeId) {
    return new Promise(function(resolve, reject) {
        const isInvalid = reqValidator.checkMissingInputs(year, month, day,'0','0');
        if (isInvalid) return reject(isInvalid);
        const startDate = new Date(Date.UTC(year, month-1, day));
        const endDate = appUtil.getNextDay(startDate);
        const calendar = google.calendar({version: 'v3', auth});
        calendar.events.list({
            calendarId: 'primary',
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            maxResults: 11,
            singleEvents: true,
            orderBy: 'startTime',
            q: 'timeslot'
        }, (err, res) => {
            if (err) return reject({response: 'The API returned an error: ' + err});
            const events = res.data.items;
            let result = {};
            result.timeslots = events.map((event, i) => {
                if (includeId) return {startTime: event.start.dateTime, endTime: event.end.dateTime, id: event.id};
                return {startTime: event.start.dateTime, endTime: event.end.dateTime};
            });
            if (result.timeslots[0]) {
                const response = Object.assign({success: true}, result);
                return resolve(response);
            } else {
                const response = Object.assign({success: false}, result);
                return reject(response);
            }
        });
    });
}

module.exports = {
    getAvailTimeslots
};