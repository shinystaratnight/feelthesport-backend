var msg91 = require("msg91")(process.env.MSG91_AUTH_KEY, process.env.MSG91_SENDER_ID, "ROUTE_NO" );

module.exports = async  ({to,body} ) => {
  try{
    return new Promise(function (resolve, reject) {
      msg91.send(to, body, function(error, response){
        if (error) return reject(error);
        return resolve(response);
      });
    });
  }
  catch (e) {
    console.log(e)
  }
};
