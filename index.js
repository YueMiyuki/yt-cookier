const { login } = require("./functions/login.js");
const { getCookies } = require("./functions/getCookies.js");
const { getHeaders } = require("./functions/getHeaders.js");
const { getBrowser } = require("./functions/helper.js");

module.exports = {
  login,
  getCookies,
  getHeaders,
  getBrowser
};
