// const config = require("./credentials.json")
// const runner = require("./functions/login.js")
// runner.login(config.email, config.pass)

module.exports = {
    login: require("./functions/login.js").login({email, pass}),
    getCookie: require("./functions/getCookies.js").getCookie(),
    getHeaders: require("./functions/getHeaders.js").getHeaders(),
}
