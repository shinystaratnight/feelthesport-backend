/* eslint-disable standard/computed-property-even-spacing */
module.exports = cart => {
  let newCart = { ...cart };

  let sum1 = 0;
  Object.entries(newCart.bookaslots).forEach(
    ([bookaslotKey, bookaslotValue]) => {
      let sum2 = 0;

      Object.entries(bookaslotValue.dates).forEach(([dateKey, dateValue]) => {
        let sum3 = 0;

        Object.entries(dateValue.courts).forEach(([courtKey, courtValue]) => {
          newCart.bookaslots[bookaslotKey].dates[dateKey].courts[
            courtKey
          ].cost =
            courtValue.slotCost *
            Object.keys(courtValue.timeSlots).length *
            (courtValue.chargePerPlayer ? courtValue.numOfPlayers : 1);

          sum3 =
            sum3 +
            newCart.bookaslots[bookaslotKey].dates[dateKey].courts[courtKey]
              .cost;
        });

        newCart.bookaslots[bookaslotKey].dates[dateKey].cost = sum3;

        sum2 = sum2 + sum3;
      });

      newCart.bookaslots[bookaslotKey].cost = sum2;

      sum1 = sum1 + sum2;
    }
  );

  newCart.cost = sum1;

  return newCart;
};
