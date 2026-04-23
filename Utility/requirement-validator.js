const FIELD_RANGES = {
    year: {min: 1970, max: 9999},
    month: {min: 1, max: 12},
    day: {min: 1, max: 31},
    hour: {min: 0, max: 23},
    minute: {min: 0, max: 59},
};

/**
 * Coerces a request parameter to an integer and validates its range.
 * @returns {{value: number} | {error: object}}
 */
function parseField(name, raw) {
    if (raw === undefined || raw === null || raw === '') {
        return {error: {success: false, message: `Request is missing parameter: ${name}`}};
    }
    const value = Number(raw);
    if (!Number.isInteger(value)) {
        return {error: {success: false, message: `Parameter ${name} must be an integer`}};
    }
    const {min, max} = FIELD_RANGES[name];
    if (value < min || value > max) {
        return {error: {success: false, message: `Parameter ${name} must be between ${min} and ${max}`}};
    }
    return {value};
}

function parseFields(raw, names) {
    const result = {};
    for (const name of names) {
        const parsed = parseField(name, raw[name]);
        if (parsed.error) return {error: parsed.error};
        result[name] = parsed.value;
    }
    return {values: result};
}

function isInPast({year, month, day, hour, minute}) {
    const now = Date.now();
    let reqDate;
    if (hour !== undefined) {
        reqDate = Date.UTC(year, month - 1, day, hour, minute);
    } else if (day !== undefined) {
        reqDate = Date.UTC(year, month - 1, day);
    } else {
        reqDate = Date.UTC(year, month);
    }
    return reqDate < now;
}

function is24HoursInAdvance({year, month, day, hour, minute}) {
    const plus24Hours = Date.now() + 24 * 60 * 60 * 1000;
    const reqDate = Date.UTC(year, month - 1, day, hour, minute);
    return reqDate > plus24Hours;
}

function isInBookableTimeframe({year, month, day, hour, minute}) {
    const reqDate = hour !== undefined
        ? new Date(Date.UTC(year, month - 1, day, hour, minute))
        : new Date(Date.UTC(year, month - 1, day));
    const reqDay = reqDate.getUTCDay();
    if (reqDay === 0 || reqDay === 6) return false;
    if (hour !== undefined) {
        const reqHour = reqDate.getUTCHours();
        if (reqHour < 9 || reqHour > 17) return false;
    }
    return true;
}

function validateBooking(raw) {
    const parsed = parseFields(raw, ['year', 'month', 'day', 'hour', 'minute']);
    if (parsed.error) return {error: parsed.error};
    if (isInPast(parsed.values))
        return {error: {success: false, message: 'Cannot book time in the past'}};
    if (!isInBookableTimeframe(parsed.values))
        return {error: {success: false, message: 'Cannot book outside bookable timeframe'}};
    if (!is24HoursInAdvance(parsed.values))
        return {error: {success: false, message: 'Cannot book with less than 24 hours in advance'}};
    return {values: parsed.values};
}

function validateGetTimeslots(raw) {
    const parsed = parseFields(raw, ['year', 'month', 'day']);
    if (parsed.error) return {error: parsed.error};
    if (isInPast(parsed.values))
        return {error: {success: false, message: 'No timeslots are available in the past'}};
    if (!isInBookableTimeframe(parsed.values))
        return {error: {success: false, message: 'No timeslots exist outside bookable timeframe'}};
    return {values: parsed.values};
}

function validateGetDays(raw) {
    const parsed = parseFields(raw, ['year', 'month']);
    if (parsed.error) return {error: parsed.error};
    if (isInPast(parsed.values))
        return {error: {success: false, message: 'No timeslots are available in the past'}};
    return {values: parsed.values};
}

module.exports = {
    validateBooking,
    validateGetTimeslots,
    validateGetDays,
};
