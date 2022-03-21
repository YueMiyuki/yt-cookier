const puppeteer = require("puppeteer-extra");

const fs = require("fs");

const returnValue = null

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

      await page.on("request", async request => {
        const requestHeaders = request.headers(); //getting headers of your request
        const array = Object.entries(requestHeaders);
        console.log(array)
        if (!array.indexOf("x-youtube-identity-token")) {
          console.log(array)
          fs.writeFileSync("./node_modules/ytcf/headers.json", JSON.stringify(requestHeaders, null, 4)),
          function (err, res) {
            if (err) throw err;
          };
        }

        const LoginCookies = await page.cookies();
        fs.writeFileSync("./node_modules/ytcf/LoginCookies.json", JSON.stringify(LoginCookies, null, 2)), //Update Login
        function (err) {
          if (err) throw err;
        };
      });

      fs.watchFile("./node_modules/ytcf/LoginCookies.json", (curr, prev) => {});
      const headersString = fs.readFileSync("./node_modules/ytcf/headers.json");
      const headers = JSON.parse(headersString);
      return headers;

    } catch (e) {
      throw new Error(e);
    } finally {}
  }
};