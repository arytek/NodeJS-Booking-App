const fs = require('fs');
const {google} = require('googleapis');

const TIMESLOTS_PATH = 'timeslots.json';


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
                }

            }).catch(function(res, err) {
                promises.push(Promise.reject());
            });
        }
    });
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

function logAddedEvent(res) {
    const event = res.data;
    console.log('Event created: %s', event.summary,
        ' Start:', event.start.dateTime,
        ' End:', event.end.dateTime);
}


module.exports = {
    initTimeslots
}
