const _ = require("lodash");

module.exports = rows => {
  const formatRow = ({
    membershipPeriodId,
    membershipId,
    arenaName,
    address,
    sport,
    startDate,
    endDate,
    period,
    membershipPeriod,
    formSubmissionId,
    formSubmissionFieldId,
    formSubmissionFieldInfo
  }) => ({
    memberships: {
      [membershipId]: {
        arenaName,
        address,
        sport,
        participants: {
          [formSubmissionId]: {
            membershipPeriodId,
            membershipName: membershipPeriod.name,
            startDate,
            endDate,
            period,
            cost: membershipPeriod.price,
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
