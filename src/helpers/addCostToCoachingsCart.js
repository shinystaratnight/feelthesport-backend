module.exports = cart => {
  let newCart = { ...cart };
  let sum1 = 0;
  Object.entries(newCart.coachings).forEach(([coachingKey, coachingValue]) => {
    let sum2 = 0;

    Object.entries(coachingValue.participants).forEach(
      ([submissionsKey, _]) => {
        sum2 =
          sum2 +
          newCart.coachings[coachingKey].participants[submissionsKey].cost;
      }
    );

    newCart.coachings[coachingKey].cost = sum2;

    sum1 = sum1 + sum2;
  });

  newCart.cost = sum1;

  return newCart;
};
