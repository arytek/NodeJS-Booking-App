/**
 * Adds and returns the the specified minutes onto the given date.
 * @param {Date} date  The date to add minutes to.
 * @param {number} minutes  The minutes to add.
 * @returns {Date}
 */
function addMinutes(date, minutes) {
    return date.setMinutes(date.getMinutes() + minutes);
}

/**
 * Returns the last day of the month.
 * @param {number} year  The year.
 * @param {number} month  The month.
 * @returns {Date}
 */
function getLastDayOfMonth(year, month) {
    return (new Date(Date.UTC(year, month, 0))).getUTCDate();
}

/**
 * Returns the current date in the UTC timezone.
 * @returns {number}
 */
function getCurrDateUTC() {
    const currDate = new Date();
    return currDate.getUTCDate();
}

/**
 * Returns the date from a given ISOString.
 * @param {string} dateISOString  The callback for the authorized client.
 * @returns {number}
 */
function getDateFromISO(dateISOString) {
    const date = new Date(dateISOString);
    return date.getUTCDate();
}

/**
 * Returns the next date (i.e the day after).
 * @param {Date} date  The date to get the next day of.
 * @returns {Date}
 */
function getNextDay(date) {
    let tomorrow = new Date();
    tomorrow.setDate(date.getUTCDate() + 1); // Returns epoch value.
    return new Date(tomorrow); // Convert from epoch to Date.
}

module.exports = {
    addMinutes,
    getLastDayOfMonth,
    getCurrDateUTC,
    getDateFromISO,
    getNextDay
};