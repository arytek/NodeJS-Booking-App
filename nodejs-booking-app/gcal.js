/**
 * @license
 * Copyright Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
function initAuthorize(callback) {
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Calendar API.
        authorize(JSON.parse(content), callback);
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
    oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
    oAuth2Client.setCredentials(token);
    // Store the token to disk for later program executions
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
    console.log('Token stored to', TOKEN_PATH);
});
    callback(oAuth2Client);
});
});
}

function addMinutes(date, minutes) {
    return date.setMinutes(date.getMinutes() + minutes);
}

function getLastDayOfMonth(year, month) {
    return (new Date(Date.UTC(year, month, 0))).getUTCDate();
}

function getCurrDateUTC() {
    const currDate = new Date();
    return currDate.getUTCDate();
}

function getDateFromISO(dateISOString) {
    const date = new Date(dateISOString);
    return date.getUTCDate();
}

function getNumDays(startDate, endDate) {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    return Math.round(Math.abs((startDate - endDate) / oneDay));
}

function getBookedDays(events) {
    let bookedDays = [];
    let date = null;
    let prevDate = null;
    let dayArr = [];
    for (let event of events) {
        date = getDateFromISO(event.start.dateTime);
        if (date === prevDate || prevDate === null) {
            dayArr.push(event);
        } else {
            dayArr = []; // Clear array.
            dayArr.push(event);
        }
        prevDate = getDateFromISO(event.start.dateTime);
        if (dayArr.length === 11) {
            dayArr = []; // Clear array.
            bookedDays.push(date);
        }
    }
    return bookedDays;
}

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

function getBookableDays(auth, year, month) {
    return new Promise(function(resolve, reject) {
        const startDate = new Date(Date.UTC(year, month-1, getCurrDateUTC()));
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
            if (err) return reject({response: 'The API returned an error: ' + err});
            const events = res.data.items;
            if (events.length) {
                const lastDay = getLastDayOfMonth(year, month);
                let result = {};
                result.days = makeDaysArr(lastDay, getBookedDays(events));
                const response = Object.assign({success: true}, result);
                resolve(response);
            } else {
                console.log('No upcoming events found.');
                return resolve({response: 'no upcoming events found.'});
            }
        });
    });
}

function getAvailTimeslots(auth, year, month, day, includeId) {
    return new Promise(function(resolve, reject) {
        const startDate = new Date(Date.UTC(year, month-1, day));
        const endDate = new Date(Date.UTC(year, month, day+1));
        const calendar = google.calendar({version: 'v3', auth});
        calendar.events.list({
            calendarId: 'primary',
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            maxResults: 11,
            singleEvents: true,
            orderBy: 'startTime',
        }, (err, res) => {
            if (err) return reject({response: 'The API returned an error: ' + err});
            const events = res.data.items;

            if (events.length) {
                let result = {};
                result.timeslots = events.map((event, i) => {
                    if (includeId) return {startTime: event.start.dateTime, endTime: event.end.dateTime, id: event.id};
                    return {startTime: event.start.dateTime, endTime: event.end.dateTime};
                });

                const response = Object.assign({success: true}, result);
                resolve(response);
            } else {
                return resolve({response: 'no timeslots found.'});
            }
        });
    });
}

function findMatchingTimeslot(timeslots, year, month, day, hour, minute) {
    const timeslotDate = new Date(Date.UTC(year, month-1, day, hour, minute)).toISOString();
    return found = timeslots.find(function(element) {
        const elementDate = new Date(element.startTime).toISOString(); // Ensure matching ISO format.
        return timeslotDate === elementDate;
    });
}

function bookAppointment(auth, year, month, day, hour, minute) {
    return new Promise(function(resolve, reject) {
        getAvailTimeslots(auth, year, month, day, true)
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
                return resolve({success: false, message: 'Invalid time slot'});
            })
    });
}

module.exports = {
    SCOPES,
    initAuthorize,
    getBookableDays,
    getAvailTimeslots,
    bookAppointment
};