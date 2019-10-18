const _ = require("lodash");

module.exports = rows => {
  const formatRow = ({
    itemId,
    arenaName,
    address,
    bookaslotId,
    bookaslotDate,
    courtId,
    courtType,
    slotCost,
    chargePerPlayer,
    numOfPlayers,
    sport,
    timeSlots
  }) => ({
    bookaslots: {
      [bookaslotId]: {
        arenaName,
        address,
        dates: {
          [bookaslotDate]: {
            sport,
            courts: {
              [courtId]: {
                courtType,
                timeSlots: {
                  [itemId]: timeSlots
                },
                slotCost,
                chargePerPlayer,
                numOfPlayers
              }
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
