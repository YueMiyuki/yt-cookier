const puppeteer = require("puppeteer-extra");
var path = require("path");

const fs = require("fs");

function checkExistsWithTimeout(filePath, timeout) {
  return new Promise(function (resolve, reject) {

    var timer = setTimeout(function () {
      watcher.close();
      reject(new Error('File did not exists and was not created during the timeout.'));
    }, timeout);

    fs.access(filePath, fs.constants.R_OK, function (err) {
      if (!err) {
        clearTimeout(timer);
        watcher.close();
        resolve();
      }
    });

    var dir = path.dirname(filePath);
    var basename = path.basename(filePath);
    var watcher = fs.watch(dir, function (eventType, filename) {
      if (eventType === 'rename' && filename === basename) {
        clearTimeout(timer);
        watcher.close();
        resolve();
      }
    });
  });
}

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
        const array = Object.entries(requestHeaders);
        if (array.indexOf("x-youtube-identity-token")) {
          await fs.writeFileSync("./node_modules/ytcf/headers.json", JSON.stringify(requestHeaders, null, 4)),
            function (err, res) {
              if (err) throw err;
            };
        } else {}

        const LoginCookies = await page.cookies();
        fs.writeFileSync("./node_modules/ytcf/LoginCookies.json", JSON.stringify(LoginCookies, null, 2)), //Update Login
          function (err) {
            if (err) throw err;
          };
      });

      await checkExistsWithTimeout("./node_modules/ytcf/headers.json", "10000")

      const headersString = fs.readFileSync("./node_modules/ytcf/headers.json");
      const headers = JSON.parse(headersString);
      return headers
    } catch (e) {
      throw new Error(e)
    } finally {
      await browser.close();
      fs.rmSync("./node_modules/ytcf/headers.json", {
        force: true,
      });
    }

  }
};