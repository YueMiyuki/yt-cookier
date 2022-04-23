const puppeteer = require("puppeteer-extra");

const fs = require("fs");



module.exports = {
  getHeaders: function (url) {
    console.log("Attempting to get headers");
    const StealthPlugin = require("puppeteer-extra-plugin-stealth");
    let returnValue = null;

    puppeteer.use(StealthPlugin());

    return new Promise(async (resolve) => {
      const browser = await puppeteer.launch({
        headless: false
      });
      const page = await browser.newPage();
      const navigationPromise = page.waitForNavigation();

      try {
        const cookiesString = fs.readFileSync("./node_modules/ytcf/LoginCookies.json");
        const cookies = JSON.parse(cookiesString);
        await page.setCookie(...cookies);

        // Opening YouTube.com
        await page.goto(url);

        await page.on("request", async request => {
          const requestHeaders = request.headers(); //getting headers of your request
          // console.log(requestHeaders)
          const headers = JSON.stringify(requestHeaders);
          if (headers.includes("x-youtube-identity-token")) {
            returnValue = requestHeaders;
            fs.writeFileSync("./node_modules/ytcf/headers.json", JSON.stringify(requestHeaders, null, 4)),
              function (err, res) {
                if (err) throw err;
              };
            resolve(returnValue);
          }

          browser.close();

          const LoginCookies = await page.cookies();
          fs.writeFileSync("./node_modules/ytcf/LoginCookies.json", JSON.stringify(LoginCookies, null, 2)), //Update Login
            function (err) {
              if (err) throw err;
            };
        });
      } catch (e) {
        throw new Error(e);
      } finally {
        // browser.close();
      }
    })
  }
};