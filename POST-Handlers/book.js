const {google} = require('googleapis');
const reqValidator = require('../Utility/requirement-validator.js');
const timeslots = require('../GET-Handlers/timeslots.js');

/**
 * Searches using the provided date for a timeslot matching the hour and minute specified.
 * @param {object} timeslots  Object containing info on each timeslot for the day.
 * @param {number} year  Year of the timeslot to search for.
 * @param {number} month  Month of the timeslot to search for.
 * @param {number} day  Day of the timeslot to search for.
 * @param {number} hour  Hour of the timeslot to search for.
 * @param {number} minute  Minute of the timeslot to search for.
 * @returns {object}  The timeslot object that was found. If nothing was found, returns undefined.
 */
function findMatchingTimeslot(timeslots, year, month, day, hour, minute) {
    const timeslotDate = new Date(Date.UTC(year, month-1, day, hour, minute)).toISOString();
    return timeslots.find(function (element) {
        const elementDate = new Date(element.startTime).toISOString(); // Ensure matching ISO format.
        return timeslotDate === elementDate;
    });
}

/**
 * Books an appointment using the given date and time information.
 * @param {object} auth  The oAuth2Client used for authentication for the Google Calendar API.
 * @param {number} year  Year of the timeslot to book.
 * @param {number} month  Month of the timeslot to book.
 * @param {number} day  Day of the timeslot to book.
 * @param {number} hour  Hour of the timeslot to book.
 * @param {number} minute  Minute of the timeslot to book.
 * @returns {promise}  A promise representing the eventual completion of the bookAppointment() function.
 */
function bookAppointment(auth, year, month, day, hour, minute) {
    return new Promise(function(resolve, reject) {
        const isInvalid = reqValidator.validateBooking(year, month, day, hour, minute);
        if (isInvalid) return reject(isInvalid);

        timeslots.getAvailTimeslots(auth, year, month, day, true)
            .then(function(data) {
                const timeslots = data.timeslots;
                const timeslot = findMatchingTimeslot(timeslots, year, month, day, hour, minute);
                if (!timeslot) return resolve({success: false, message: 'Invalid time slot'});

                const calendar = google.calendar({version: 'v3', auth});
                calendar.events.patch({
                    auth: auth,
                    calendarId: 'primary',
                    eventId: timeslot.id,
                    resource: {'summary': 'appointment'},
                }, function (err, res) {
                    if (err) return console.log('Error contacting the Calendar service: ' + err);
                    const event = res.data;
                    console.log('A timeslot has been changed to an appointment: ', event.id);
                    const result = {startTime: event.start.dateTime, endTime: event.end.dateTime};
                    const response = Object.assign({success: true}, result);
                    resolve(response);
                });

            })
            .catch(function(data) {
                return reject({success: false, message: 'Invalid time slot'});
            })
    });
}

module.exports = {
    bookAppointment
};