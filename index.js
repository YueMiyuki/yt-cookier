const config = require("./credentials.json")
const runner = require("./functions/acctest.js")
runner.login(config.email, config.pass)
