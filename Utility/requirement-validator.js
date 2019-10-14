/**
 * Used to check whether the booking is in the past.
 * @param {number} year  Year of booking.
 * @param {number} month  Month of booking.
 * @param {number} day  Day of booking.
 * @param {number} hour  Hour of booking.
 * @param {number} minute  Minute of booking.
 * @returns {boolean}  Returns a boolean representing whether the book is in the past.
 */
function isInPast(year, month, day, hour, minute) {
    const todayDate = Date.now();
    let reqDate = {};
    if (hour !== undefined) {
        reqDate = Date.UTC(year, month - 1, day, hour, minute);
    } else if (day !== undefined) {
        reqDate = Date.UTC(year, month - 1, day);
    } else {
        reqDate = Date.UTC(year, month);
    }
    return reqDate < todayDate;

}

/**
 * Used to check whether the booking is at least 24 hours in advance.
 * @param {number} year  Year of booking.
 * @param {number} month  Month of booking.
 * @param {number} day  Day of booking.
 * @param {number} hour  Hour of booking.
 * @param {number} minute  Minute of booking.
 * @returns {boolean}  Returns a boolean representing whether the book is 24 hours in advance.
 */
function is24HoursInAdvance(year, month, day, hour, minute) {
    const todayDate = new Date(Date.now());
    const plus24Hours = todayDate.setUTCHours(todayDate.getUTCHours() + 24);
    const reqDate = Date.UTC(year, month-1, day, hour, minute);
    return reqDate > plus24Hours;
}

/**
 * Used to check whether the booking is in the bookable time frame (on a weekday between 9 am and 5 pm).
 * @param {number} year  Year of booking.
 * @param {number} month  Month of booking.
 * @param {number} day  Day of booking.
 * @param {number} hour  Hour of booking.
 * @param {number} minute  Minute of booking.
 * @returns {boolean}  Returns a boolean representing whether the booking is in the bookable time frame.
 */
function isInBookableTimeframe(year, month, day, hour, minute) {
    if (hour !== undefined) {
        const reqDate = new Date(Date.UTC(year, month-1, day, hour, minute));
        const reqDay = reqDate.getUTCDay();
        if (reqDay === 6 || reqDay === 0) return false; // 6 is Saturday, 0 is Sunday.
        const reqHour = reqDate.getUTCHours();
        if (reqHour < 9 || reqHour > 17) return false;
    } else {
        const reqDate = new Date(Date.UTC(year, month-1, day));
        const reqDay = reqDate.getUTCDay();
        if (reqDay === 6 || reqDay === 0) return false; // 6 is Saturday, 0 is Sunday.
    }
    return true;
}

/**
 * Used to check for missing REST parameters inputs before proceeding with the request.
 * @param {number} year  Year value to check. Denote with '0' if not checking for this variable.
 * @param {number} month  Month value to check Denote with '0' if not checking for this variable.
 * @param {number} day  Day value to check Denote with '0' if not checking for this variable.
 * @param {number} hour  Hour value to check. Denote with '0' if not checking for this variable.
 * @param {number} minute  Minute value to check. Denote with '0' if not checking for this variable.
 * @returns {object}  Returns an object with info on what parameter was missing.
 */
function checkMissingInputs(year, month, day, hour, minute) {
    if (!year) return {success: false, message: 'Request is missing parameter: year'};
    if (!month) return {success: false, message: 'Request is missing parameter: month'};
    if (!day) return {success: false, message: 'Request is missing parameter: day'};
    if (!hour) return {success: false, message: 'Request is missing parameter: hour'};
    if (!minute) return {success: false, message: 'Request is missing parameter: minute'};
}

/**
 * Used to validate bookings.
 * @param {number} year  Year of booking to check.
 * @param {number} month  Month of booking to check.
 * @param {number} day  Day of booking to check.
 * @param {number} hour  Hour of booking to check.
 * @param {number} minute  Minute of booking to check.
 * @returns {object}  Returns an object with info on why the booking was invalid.
 */
function validateBooking(year, month, day, hour, minute) {
    const missingInputs = checkMissingInputs(year, month, day, hour, minute);
    if (missingInputs) return missingInputs;
    if (isInPast(year, month, day, hour, minute))
        return {success: false, message: 'Cannot book time in the past'};
    if (!isInBookableTimeframe(year, month, day, hour, minute))
        return {success: false, message: 'Cannot book outside bookable timeframe'};
    if (!is24HoursInAdvance(year, month, day, hour, minute))
        return {success: false, message: 'Cannot book with less than 24 hours in advance'};
}

/**
 * Used to validate GET Timeslot requests.
 * @param {number} year  Year parameter to check.
 * @param {number} month  Month parameter to check.
 * @param {number} day  Day parameter to check.
 * @returns {object}  Returns an object with info on why the request was invalid.
 */
function validateGetTimeslots(year, month, day) {
    const missingInputs = checkMissingInputs(year, month, day, '0', '0');
    if (missingInputs) return missingInputs;
    if (isInPast(year, month, day, undefined, undefined))
        return {success: false, message: 'No timeslots are available in the past'};
    if (!isInBookableTimeframe(year, month, day, undefined, undefined))
        return {success: false, message: 'No timeslots exist outside bookable timeframe'};
}

/**
 * Used to validate GET Days requests.
 * @param {number} year  Year parameter to check.
 * @param {number} month  Month parameter to check.
 * @returns {object}  Returns an object with info on why the request was invalid.
 */
function validateGetDays(year, month) {
    const missingInputs = checkMissingInputs(year, month, '0', '0', '0');
    if (missingInputs) return missingInputs;
    if (isInPast(year, month, undefined, undefined, undefined))
        return {success: false, message: 'No timeslots are available in the past'};
}

module.exports = {
    checkMissingInputs,
    validateBooking,
    validateGetTimeslots,
    validateGetDays
};