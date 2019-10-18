module.exports = cart => {
  let newCart = { ...cart };
  let sum1 = 0;
  Object.entries(newCart.memberships).forEach(
    ([membershipKey, membershipValue]) => {
      let sum2 = 0;

      Object.entries(membershipValue.participants).forEach(
        ([submissionsKey, _]) => {
          sum2 =
            sum2 +
            newCart.memberships[membershipKey].participants[submissionsKey]
              .cost;
        }
      );

      newCart.memberships[membershipKey].cost = sum2;

      sum1 = sum1 + sum2;
    }
  );

  newCart.cost = sum1;

  return newCart;
};
