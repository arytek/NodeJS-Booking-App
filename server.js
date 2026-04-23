require('dotenv').config();

const express = require('express');
const gcal = require('./Utility/gcal.js');
const days = require('./ReqHandlers/GET-Handlers/days.js');
const timeslots = require('./ReqHandlers/GET-Handlers/timeslots.js');
const book = require('./ReqHandlers/POST-Handlers/book.js');

const PORT = Number(process.env.PORT) || 8080;

function sendResult(res, data) {
    const status = data && data.success === false ? 400 : 200;
    res.status(status).json(data);
}

function wrap(handler) {
    return (req, res, next) => Promise.resolve(handler(req, res)).catch(next);
}

async function main() {
    const auth = await gcal.initAuthorize();

    const app = express();
    app.use(express.json());

    app.get('/days', wrap(async (req, res) => {
        const data = await days.getBookableDays(auth, req.query.year, req.query.month);
        sendResult(res, data);
    }));

    app.get('/timeslots', wrap(async (req, res) => {
        const data = await timeslots.getAvailTimeslots(
            auth, req.query.year, req.query.month, req.query.day
        );
        sendResult(res, data);
    }));

    app.post('/book', wrap(async (req, res) => {
        const data = await book.bookAppointment(
            auth,
            req.query.year, req.query.month, req.query.day,
            req.query.hour, req.query.minute
        );
        sendResult(res, data);
    }));

    app.use((err, _req, res, _next) => {
        console.error(err);
        res.status(500).json({success: false, message: err.message || 'Internal server error'});
    });

    app.listen(PORT, () => {
        console.log(`Server is now running on port ${PORT}... Ctrl+C to end`);
    });
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
