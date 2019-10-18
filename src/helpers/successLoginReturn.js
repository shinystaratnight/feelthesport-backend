const generateJwtToken = require("../helpers/jwtGenerate");

module.exports = function (req) {
  let return_data =
    {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      email_verify: req.user.email_verify,
      phone: req.user.phone,
      phone_verify: req.user.phone_verify,
      gender: req.user.gender,
      dateOfBirth: req.user.date_of_birth,
      dateOfJoin: req.user.created_at,
      avatar: req.user.avatar,
      referrer: req.user.referrer_code,
      referral_code: req.user.referral_code,
      points: req.user.points,
      selected_city: req.user.selected_city,
      selected_sport: req.user.selected_sport,
    };
  return_data.jwt = generateJwtToken(return_data);
  return return_data;
};
