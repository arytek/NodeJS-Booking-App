function isInPast(year, month) {
    const todayDateVal = new Date().valueOf();
    const reqDateVal = new Date().valueOf();
    return reqDateVal < todayDateVal;
}

function isInvalidTimeslot(timeslots) {

}

module.exports = {
    SCOPES,

};