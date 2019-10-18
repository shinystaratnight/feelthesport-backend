const database = require("../database");
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

module.exports = async passport => {
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = process.env.JWT_SECRET;
  passport.use(new JwtStrategy(opts, async function (jwtPayload, done) {
    const client = await database.connect();
    try {
      const { rows: response } = await client.query(
          `SELECT *
           FROM users
           WHERE id = $1`, [jwtPayload.id]);
      if (response.length === 0) {
        return done(null, false);
      }
      return done(null, response[0]);
    } catch (error) {
      console.error(error);
      return done(error);
    } finally {
      await client.release();
    }
  }));
};
