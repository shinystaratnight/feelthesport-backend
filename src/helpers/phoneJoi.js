const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();

module.exports = require("joi").extend(joi => ({
  base: joi.string(),
  name: "string",
  language: {
    phone: "Must be a valid indian phone number"
  },
  rules: [
    {
      name: "phone",
      validate (params, value, state, options) {
        if (isNaN(value)) {
          return this.createError("string.phone", { value }, state, options);
        }
        const validPhone = phoneUtil.isValidNumberForRegion(
          phoneUtil.parseAndKeepRawInput(value, "IN"),
          "IN"
        );
        if (!validPhone) {
          return this.createError("string.phone", { value }, state, options);
        }
        return value;
      }
    }
  ]
}));
