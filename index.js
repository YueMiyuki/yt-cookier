const {
  login
} = require("./functions/login");
const {
  getCookie
} = require("./functions/getCookies");
const {
  getHeaders
} = require("./functions/getHeaders");

module.exports = {
  login,
  getCookie,
  getHeaders,
};
