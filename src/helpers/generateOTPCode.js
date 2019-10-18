function randomIndex (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = function (lengthU = 5)
{
  const tokenLength = lengthU;
  const otpCodeChars = "0123456789";
  let otpCode = "";
  for (let index = 0; index < tokenLength; index++) {
    otpCode = otpCode.concat(otpCodeChars[randomIndex(0, otpCodeChars.length)]);
  }
  return otpCode
}
