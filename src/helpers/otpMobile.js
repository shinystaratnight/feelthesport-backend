const util = require('util');
const SendOtp = require('sendotp');

const sendOtp = new SendOtp(process.env.MSG91_AUTH_KEY);

module.exports.send = async (phone) => {
  return new Promise(function (resolve, reject) {
    sendOtp.send(phone, process.env.MSG91_SENDER_ID, function (error, data) {
      if (error) return reject(error);
      console.log(data)
      return resolve(data);
    });
  });
}

module.exports.verify = async (phone, otp) => {
  // return { type: "success" };
  return new Promise(function (resolve, reject) {
    sendOtp.verify(phone, otp, function (error, data) {
      if (error) return reject(error);
      console.log(data)
      return resolve(data);
    });
  });

};
