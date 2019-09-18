const express = require('express');
const index = require('./index.js')
const index = require('./requirementValidator.js')
const app = express();
const auth = {};

index.initAuthorize(setAuth);

function setAuth(auth) {
    this.auth = auth;
}

function isInPast(year, month) {
    const todayDateVal = new Date().valueOf();
    const reqDateVal = new Date().valueOf();
    if (reqDateVal < todayDateVal) {
        return true;
    } else {
        return false;
    }
}

function handleGetRoot(req, res) {
    res.send('Welcome to root!');
}

function handleGetDays(req, res) {
    const year = req.query.year;
    const month = req.query.month;
    index.getBookableDays(this.auth, year, month);
    const data = {
        "success": true,
        "days": [
            { "day": 1,  "hasTimeSlots": false },
            { "day": 31, "hasTimeSlots": true }
        ]
    }
    res.send(data);
}

function handleGetTimeslots(req, res) {

}

function handleBookAppointment(req, res) {
    const year = req.query.year;
    const month = req.query.month;
    const day = req.query.day;
    const hour = req.query.hour;
    const minute = req.query.minute;
    index.bookAppointment(auth, year, month, day, hour, minute);
}

function processBookAppointment() {

}

app.get('/', handleGetRoot);
app.get('/days', handleGetDays);
app.get('/timeslots', handleGetTimeslots);
app.post('/book', handleBookAppointment);

const server = app.listen(8080, function() {});