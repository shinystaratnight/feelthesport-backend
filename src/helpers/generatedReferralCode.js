const database = require("../database");

function randomIndex (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

async function genReferralCode () {
  const client = await database.connect();
  let referralCodeInDatabase = false;
  let finalRefCode = '';
  const referralCodeLength = 5;
  const referralCodeChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  while (!referralCodeInDatabase) {
    try {
      let generatedReferralCode = "";
      for (let index = 0; index < referralCodeLength; index++) {
        generatedReferralCode = generatedReferralCode.concat(referralCodeChars[randomIndex(0, referralCodeChars.length)]);
      }
      let { rows: getRows } = await client.query(
          `select *
           from users
           where referral_code = $1`,
        [generatedReferralCode]
      );
      if (getRows.length === 0) {
        finalRefCode = generatedReferralCode;
        referralCodeInDatabase = true;
      }
    } catch (error) {
      console.error(error);
    }
  }
  console.log(finalRefCode)
  return finalRefCode
}

module.exports = genReferralCode;
