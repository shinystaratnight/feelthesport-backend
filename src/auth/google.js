const database = require("../database");
var GoogleTokenStrategy = require('passport-google-token').Strategy;
const passport = require("passport");
const insertUser = require("../helpers/insertUser");

module.exports = function () {
  return function (req, res, next) {
    passport.use(new GoogleTokenStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET
      },
      async function (accessToken, refreshToken, profile, done) {
        const client = await database.connect();
        console.log(req.body)
        try {
          let { rows: user_row_details } = await client.query(
              `SELECT *
               FROM users
               WHERE google_id = $1
                  or (email is not null and email != '' and email = $2)`,
            [req.body.id, req.body.email]
          );
          if (user_row_details.length === 0) {
            const userId = await insertUser(req,"google");
          } else if (user_row_details.length === 1 && user_row_details[0].id != req.body.id) {
            await client.query(
                `UPDATE users
                 SET google_id = $1
                 WHERE id = $2`,
              [req.body.id, user_row_details[0].id]
            );
          }
          let { rows: finalResponse } = await client.query(
              `SELECT *
               FROM users
               WHERE google_id = $1`,
            [req.body.id]
          );
          if (finalResponse.length === 0) {
            return done(null, false);
          }
          return done(null, finalResponse[0]);
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


