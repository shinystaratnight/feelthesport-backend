const _ = require("lodash");

module.exports = rows => {
  const formatRow = ({
    coachingPeriodId,
    coachingId,
    arenaName,
    address,
    sport,
    startDate,
    endDate,
    period,
    coachingPeriod,
    formSubmissionId,
    formSubmissionFieldId,
    formSubmissionFieldInfo
  }) => ({
    coachings: {
      [coachingId]: {
        arenaName,
        address,
        sport,
        participants: {
          [formSubmissionId]: {
            coachingPeriodId,
            coachingName: coachingPeriod.name,
            startDate,
            endDate,
            period,
            cost: coachingPeriod.price,
            form: {
              [formSubmissionFieldId]: formSubmissionFieldInfo
            }
          }
        }
      }
    }
  });

  let output = {};
  rows.forEach(row => {
    output = _.mergeWith({}, output, formatRow(row), (objValue, srcValue) => {
      if (_.isArray(objValue)) {
        return objValue.concat(srcValue);
      }
    });
  });
  return output;
};
