const express = require('express');
const gcal = require('./gcal.js');
const requirementValidator = require('./requirement-validator.js');
const timeslotInitialiser = require('./timeslot-initialiser.js');
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

function handleGetRoot(req, res) {
    res.send('Welcome to root!');
}

function handleGetDays(req, res) {
    const year = req.query.year;
    const month = req.query.month;
    gcal.getBookableDays(this.auth, year, month)
    .then(function(data) {
        res.send(data);
    })
    .catch(function(data) {
        res.send(data);
    });
    const data = {
        "success": true,
        "days": [
            { "day": 1,  "hasTimeSlots": false },
            { "day": 31, "hasTimeSlots": true }
        ]
    };
}

function handleGetTimeslots(req, res) {
    const year = req.query.year;
    const month = req.query.month;
    const day = req.query.day;
    gcal.getAvailTimeslots(this.auth, year, month, day)
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
    gcal.bookAppointment(this.auth, year, month, day, hour, minute)
        .then(function(data) {
            res.send(data);
        })
        .catch(function(data) {
            res.send(data);
        });
}

function processBookAppointment() {

}

app.get('/initTimeslots', handleInitTimeslots);
app.get('/', handleGetRoot);
app.get('/days', handleGetDays);
app.get('/timeslots', handleGetTimeslots);
app.post('/book', handleBookAppointment);


const server = app.listen(8080, function() {});