'use strict';
const {
  DATE_TIME: { LOCAL_DATE_TIME_FORMAT }
} = require('../constants');

function formateDateTime(date) {
  return (typeof date === 'string' ? new Date(date) : date).toLocaleDateString(
    LOCAL_DATE_TIME_FORMAT.LOCALES,
    LOCAL_DATE_TIME_FORMAT.OPTION
  );
}

module.exports = { formateDateTime };
