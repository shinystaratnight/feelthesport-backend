const database = require("../database");
var FacebookTokenStrategy = require('passport-facebook-token');
const passport = require("passport");
const insertUser = require("../helpers/insertUser");
module.exports = function () {
  return function (req, res, next) {
    passport.use(new FacebookTokenStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_SECRET,
        fbGraphVersion: 'v3.0'
      },
      async function (accessToken, refreshToken, profile, done) {
        const client = await database.connect();
        try {
          let { rows: user_row_details } = await client.query(
              `SELECT *
               FROM users
               WHERE facebook_id = $1
                  or (email is not null and email != '' and email = $2)`,
            [req.body.id, req.body.email]
          );
          if (user_row_details.length === 0) {
            const userId = await insertUser(req,"facebook");
          } else if (user_row_details.length === 1 && user_row_details[0].id != req.body.id) {
            await client.query(
                `UPDATE users
                 SET facebook_id = $1
                 WHERE id = $2`,
              [req.body.id, user_row_details[0].id]
            );
          }

          let { rows: finalResponse } = await client.query(
              `SELECT *
               FROM users
               WHERE facebook_id = $1`,
            [req.body.id]
          );

          if (finalResponse.length === 0) {
            return done(null, false);
          }
          return done(null,finalResponse[0]);
        } catch (error) {
          console.error(error);
          return done(error);
        } finally {
          await client.release();
        }
      }));
    next();
  };
};


