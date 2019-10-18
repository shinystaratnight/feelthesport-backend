const _ = require("lodash");

module.exports = rows => {
  const formatRow = ({
    itemId,
    eventId,
    eventName,
    address,
    sport,
    startDate,
    endDate,
    startTime,
    endTime,
    eventCategoryId,
    eventCategory,
    formSubmissionId,
    formSubmissionFieldId,
    formSubmissionFieldInfo
  }) => ({
    events: {
      [eventId]: {
        eventName,
        address,
        sport,
        participants: {
          [formSubmissionId]: {
            itemId,
            eventCategoryName: eventCategory.name,
            startDate,
            endDate,
            startTime,
            endTime,
            cost: eventCategory.price,
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
