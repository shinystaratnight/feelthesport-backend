const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
//const redis = require("redis");
const passport = require("passport");
//const session = require("express-session");
//const RedisStore = require("connect-redis")(session);
const localStrategy = require("./auth/local");
const jwtStrategy = require('./auth/jwt');


const deleteCartItemsScheduler = require("./database/deleteCartItemsScheduler");
const port = process.env.PORT || 4000;

//const redisClient = redis.createClient();

const server = express();
server.use(helmet());
server.use(express.json());
server.use(cookieParser());
/*
server.use(
  session({
    secret: "seakrit",
    resave: true,
    saveUninitialized: false,
    store: new RedisStore({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_HOST,
      client: redisClient
    })
  })
);
*/
localStrategy(passport);
jwtStrategy(passport);

server.use(passport.initialize());
server.use(passport.session());
server.use(express.static(path.join(__dirname, "..", "..", "client", "build")));
server.use(express.static("build"));

server.use("/api", require("./api/"));
 //deleteCartItemsScheduler();
server.use(function (err, req, res, next) {
    console.log(err);
    const status = err.statusCode || 500;
    res.status(status).send({
        error: {
            message: err.message
        }
    })
});
server.listen(port, () =>
  console.log(`Server running in ${server.get("env")} mode on port ${port}`)
);
