const fs = require('fs');
const {google} = require('googleapis');

const TIMESLOTS_PATH = 'timeslots.json';


function initTimeslots(auth) {
    const calendar = google.calendar({version: 'v3', auth});
    const timeslots = (JSON.parse(fs.readFileSync(TIMESLOTS_PATH))).timeslots;
    for (let value of timeslots) {
        const event = makeInitialTimeslots(value.startTime, value.endTime);
        calendar.events.insert({
            auth: auth,
            calendarId: 'primary',
            resource: event,
        }, initTimeslotsCallback(err, event));
    }
}

function makeInitialTimeslots(startTime, endTime) {
    const event = {
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
    return event;
}

function initTimeslotsCallback(err, event) {
        if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
        }
        console.log('Event created: %s', event.htmlLink);
}


module.exports = {
    initTimeslots
}
