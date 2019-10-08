const fs = require('fs');
const {google} = require('googleapis');

const TIMESLOTS_PATH = './Utility/timeslots.json';

/**
 * Initialises and fills the calender with timeslots. Should only be run once.
 * @param {object} auth  The oAuth2Client used for authentication for the Google Calendar API.
 * @returns {promise}  A promise representing the eventual completion of the initTimeslots() function.
 */
function initTimeslots(auth) {
    return new Promise(function (resolve, reject) {
        const calendar = google.calendar({version: 'v3', auth});
        const timeslots = (JSON.parse(fs.readFileSync(TIMESLOTS_PATH))).timeslots;
        let promises = [];
        for (let value of timeslots) {
            const event = makeInitialTimeslots(value.startTime, value.endTime);
            calendar.events.insert({
                auth: auth,
                calendarId: 'primary',
                resource: event,
            }).then(function(res, err) {
                promises.push(Promise.resolve());
                logAddedEvent(res);
                if (promises.length === 11) { // 11 is num of total timeslots.
                    Promise.all(promises)
                        .then(resolve({success: true}))
                        .catch(reject({success: false}));
                }/**/

            }).catch(function(res, err) {
                promises.push(Promise.reject());
            });
        }
    });
}

/**
 * Creates and returns a Google Calendars 'events resource'.
 * @param {number} startTime  The start time to associate with the 'start dateTime'.
 * @param {number} endTime  The end time to associate with the 'end dateTime'.
 * @returns {object}  A Google Calendars 'events resource'.
 */
function makeInitialTimeslots(startTime, endTime) {
    return {
        'summary': 'timeslot',
        'start': {
            'dateTime': '2019-09-23' + startTime,
            'timeZone': 'UTC',
        },
        'end': {
            'dateTime': '2019-09-23' + endTime,
            'timeZone': 'UTC',
        },
        'recurrence': [
            'RRULE:FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR'
        ],
    };
}

/**
 * Logs the newly created event to the server console.
 * @param {object} res  An object representing an event.
 */
function logAddedEvent(res) {
    const event = res.data;
    console.log('Event created: %s', event.summary,
        ' Start:', event.start.dateTime,
        ' End:', event.end.dateTime);
}


module.exports = {
    initTimeslots
};
