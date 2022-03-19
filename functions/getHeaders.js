const puppeteer = require("puppeteer-extra");
const ping = require("ping");

const hosts = ["youtube.com"];
const fs = require("fs");
const {
  callbackify
} = require("util");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

let idle = null;

module.exports = {
  getHeaders: async function (url) {

    console.log("Attempting to get headers");

    const StealthPlugin = require("puppeteer-extra-plugin-stealth");
    puppeteer.use(StealthPlugin());

    const browser = await puppeteer.launch({
      headless: false
    });
    const page = await browser.newPage();
    const navigationPromise = page.waitForNavigation();

    try {
      const cookiesString = await fs.readFileSync("./node_modules/ytcf/LoginCookies.json");
      const cookies = JSON.parse(cookiesString);
      await page.setCookie(...cookies);

      // Opening YouTube.com
      await page.goto(url);

      page.on("request", async request => {
        if (request.isInterceptResolutionHandled()) return;
        const requestHeaders = request.headers(); //getting headers of your request
        fs.writeFileSync("./node_modules/ytcf/DEBUG/headers.json", JSON.stringify(requestHeaders, null, 4)),
        function (err, res) {
          if (err) throw err;
        };

        const LoginCookies = await page.cookies();
        fs.writeFileSync("./node_modules/ytcf/LoginCookies.json", JSON.stringify(LoginCookies, null, 2)), //Update Login
        function (err) {
          if (err) throw err;
        };
      });

      await page.waitForNavigation({
        waitUntil: "networkidle2",
      });
      const json = fs.readFileSync("./node_modules/ytcf/DEBUG/headers.json");
      const headers = JSON.parse(json);
      return headers;

    } catch (e) {
      console.log(e);
      throw new Error(e);
    } finally {
      await browser.close();
    }
  }
};