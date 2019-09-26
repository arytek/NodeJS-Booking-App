const express = require('express');
const gcal = require('./gcal.js');
const requirementValidator = require('./requirement-validator.js');
const timeslotInitialiser = require('./timeslot-initialiser.js');

const days = require('./GET-Handlers/days.js');
const timeslots = require('./GET-Handlers/timeslots.js');
const book = require('./POST-Handlers/book.js');

const app = express();
const auth = {};

gcal.initAuthorize(setAuth);

function setAuth(auth) {
    this.auth = auth;
}

function handleInitTimeslots(req, res) {
    timeslotInitialiser.initTimeslots(this.auth)
    .then(function(data) {
        res.send(data);
    })
    .catch(function(data) {
        res.send(data);
    });
}

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

function handleGetTimeslots(req, res) {
    const year = req.query.year;
    const month = req.query.month;
    const day = req.query.day;
    timeslots.getAvailTimeslots(this.auth, year, month, day, false)
        .then(function(data) {
            res.send(data);
        })
        .catch(function(data) {
            res.send(data);
        });
}

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

app.get('/initTimeslots', handleInitTimeslots);
app.get('/days', handleGetDays);
app.get('/timeslots', handleGetTimeslots);
app.post('/book', handleBookAppointment);


const server = app.listen(8080, function() {});