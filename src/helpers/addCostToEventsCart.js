module.exports = cart => {
  let newCart = { ...cart };
  let sum1 = 0;
  Object.entries(newCart.events).forEach(([eventKey, eventValue]) => {
    let sum2 = 0;

    Object.entries(eventValue.participants).forEach(([submissionsKey, _]) => {
      sum2 = sum2 + newCart.events[eventKey].participants[submissionsKey].cost;
    });

    newCart.events[eventKey].cost = sum2;

    sum1 = sum1 + sum2;
  });

  newCart.cost = sum1;

  return newCart;
};
