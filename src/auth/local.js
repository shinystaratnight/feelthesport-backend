const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const database = require("../database");

module.exports = async passport => {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const client = await database.connect();
      try {
        const { rows: response } = await client.query(
          `SELECT * FROM users WHERE email = $1 OR phone = $1`,
          [username]
        );
        if (response.length === 0) return done(null, false);
        const correctPassword = await bcrypt.compare(
          password,
          response[0].password
        );
        if (!correctPassword) {
          return done(null, false);
        }
        return done(null, response[0]);
      } catch (error) {
        console.error(error);
        return done(error);
      } finally {
        await client.release();
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    const client = await database.connect();
    try {
      const { rows: response } = await client.query(
        `SELECT * FROM users WHERE id = $1`,
        [id]
      );

      if (response.length !== 0) done(null, response[0]);
    } catch (error) {
      console.error(error);
      return done(error);
    } finally {
      await client.release();
    }
  });
};
