/**
 * Returns the last day of the given month (1-indexed).
 */
function getLastDayOfMonth(year, month) {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Returns the current UTC day-of-month.
 */
function getCurrDateUTC() {
    return new Date().getUTCDate();
}

/**
 * Returns the UTC day-of-month from an ISO date string.
 */
function getDateFromISO(dateISOString) {
    return new Date(dateISOString).getUTCDate();
}

/**
 * Returns a new Date one day after the given date.
 */
function getNextDay(date) {
    const next = new Date(date);
    next.setUTCDate(date.getUTCDate() + 1);
    return next;
}

/**
 * Extracts "HH:mm" from an event dateTime string (any ISO format) using UTC.
 */
function extractHourMinuteFromEvent(dateTime) {
    const d = new Date(dateTime);
    if (Number.isNaN(d.getTime())) return null;
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
}

/**
 * Extracts "HH:mm" from a timeslot time string like "T09:00:00Z".
 */
function extractHourMinuteFromSlot(slotTime) {
    const match = /T(\d{2}):(\d{2})/.exec(slotTime);
    return match ? `${match[1]}:${match[2]}` : null;
}

/**
 * Creates a Google Calendar 'events resource' for an appointment.
 */
function makeEventResource(date, startTime, endTime) {
    return {
        summary: 'appointment',
        start: {dateTime: date + startTime, timeZone: 'UTC'},
        end: {dateTime: date + endTime, timeZone: 'UTC'},
    };
}

module.exports = {
    getLastDayOfMonth,
    getCurrDateUTC,
    getDateFromISO,
    getNextDay,
    extractHourMinuteFromEvent,
    extractHourMinuteFromSlot,
    makeEventResource,
};
