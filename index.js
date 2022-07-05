const {
  login
} = require("./functions/login");
const {
  getCookie
} = require("./functions/getCookies.js");
const {
  getHeaders
} = require("./functions/getHeaders.js");

module.exports = {
  login,
  getCookie,
  getHeaders,
};
