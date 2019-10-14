const express = require('express');
const gcal = require('./Utility/gcal.js');

const days = require('./ReqHandlers/GET-Handlers/days.js');
const timeslots = require('./ReqHandlers/GET-Handlers/timeslots.js');
const book = require('./ReqHandlers/POST-Handlers/book.js');

const app = express();
const auth = {};

// Get the OAuth2 client for making Google Calendar API requests.
gcal.initAuthorize(setAuth);

function setAuth(auth) {
    this.auth = auth;
    console.log('\nServer is now running... Ctrl+C to end');
}

/**
 * Handles 'days' GET requests.
 * @param {object} req  The requests object provided by Express. See Express doc.
 * @param {object} res  The results object provided by Express. See Express doc.
 */
function handleGetDays(req, res) {
    const year = req.query.year;
    const month = req.query.month;
    days.getBookableDays(this.auth, year, month)
    .then(function(data) {
        res.send(data);
    })
    .catch(function(data) {
        res.send(data);
    });
}

/**
 * Handles 'timeslots' GET requests.
 * @param {object} req  The requests object provided by Express. See Express doc.
 * @param {object} res  The results object provided by Express. See Express doc.
 */
function handleGetTimeslots(req, res) {
    const year = req.query.year;
    const month = req.query.month;
    const day = req.query.day;
    timeslots.getAvailTimeslots(this.auth, year, month, day)
        .then(function(data) {
            res.send(data);
        })
        .catch(function(data) {
            res.send(data);
        });
}

/**
 * Handles 'book' POST requests.
 * @param {object} req  The requests object provided by Express. See Express doc.
 * @param {object} res  The results object provided by Express. See Express doc.
 */
function handleBookAppointment(req, res) {
    const year = req.query.year;
    const month = req.query.month;
    const day = req.query.day;
    const hour = req.query.hour;
    const minute = req.query.minute;
    book.bookAppointment(this.auth, year, month, day, hour, minute)
        .then(function(data) {
            res.send(data);
        })
        .catch(function(data) {
            res.send(data);
        });
}

// Routes.
app.get('/days', handleGetDays);
app.get('/timeslots', handleGetTimeslots);
app.post('/book', handleBookAppointment);

// Listen on port 8080 for incoming requests to the server.
const server = app.listen(8080, function() {});