const database = require("../database");
const generatedReferralCode = require("../helpers/generatedReferralCode");
const generateJwtToken = require("../helpers/jwtGenerate");
const bcrypt = require("bcryptjs");
const knex = require("knex")({ client: "pg" });
const otpMobile = require('./otpMobile');
const otpEmail = require('./otpEmail');

module.exports = async function (req, registrationType) {
  const client = await database.connect();
  let referrer_code = '';
  if (req.body.referrerCode) referrer_code = req.body.referrerCode;
  if (req.body.referrer_code) referrer_code = req.body.referrer_code;
  if (referrer_code != "") {
    let { rows: searchRefererCode } = await client.query(
        `SELECT referral_code
         FROM users
         WHERE referral_code = $1`,
      [referrer_code]
    );
    if (searchRefererCode.length > 0) {
      referrer_code = searchRefererCode[0].referral_code;
    } else {
      referrer_code = "";
    }
  }
  let insert_object = {};
  insert_object.referral_code = await generatedReferralCode();
  insert_object.referrer_code = referrer_code;
  insert_object.points = 100;
  if (req.body.name) insert_object.name = req.body.name;
  if (req.body.email) insert_object.email = req.body.email;
  if (req.body.phone) insert_object.phone = req.body.phone;
  if (req.body.dateOfBirth) insert_object.date_of_birth = req.body.dateOfBirth;
  if (req.body.format_birthday) insert_object.date_of_birth = req.body.format_birthday;
  if (req.body.gender) {
    if (req.body.gender != "") {
      insert_object.gender = req.body.gender;
    }
  }
  if (req.body.avatar_url) insert_object.avatar = req.body.avatar_url;
  if (req.body.selected_city) insert_object.selected_city = req.body.selected_city;
  if (req.body.selected_sport) insert_object.selected_sport = req.body.selected_sport;
  switch (registrationType) {
    case 'site' :
      if (req.body.password) insert_object.password = await bcrypt.hash(req.body.password, 10);
      break;
    case 'facebook':
      if (req.body.id) insert_object.facebook_id = req.body.id;
      if (insert_object.email != "") {
        insert_object.email_verify = true;
      }
      break;
    case 'google':
      if (req.body.id) insert_object.google_id = req.body.id;
      if (insert_object.email != "") {
        insert_object.email_verify = true;
      }
      break;
  }
  let rerunId = knex('users').insert(insert_object).returning('id');
  let { rows: finalInsertResult } = await client.query(rerunId.toString());
  console.log(finalInsertResult);
  if (referrer_code != '') {
    await client.query(
        `UPDATE users
         SET points     = points + 100,
             updated_at = NOW()
         WHERE referral_code = $1`,
      [referrer_code]);
  }
  if (registrationType === 'site') {
    await otpEmail.send(insert_object.email);
    await otpMobile.send(insert_object.phone);
  }

  console.log(req.body)
  return finalInsertResult[0].id;
};
