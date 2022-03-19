const puppeteer = require("puppeteer-extra");
const ping = require("ping");

const hosts = ["youtube.com"];
let pingtime = null;
const fs = require("fs");
let ptm = null;
let success = false;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

module.exports = {
  getCookie: async function(url) {
    return new Promise(async (resolve, reject) => {

      console.log("Attempting to get cookies");

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
        await navigationPromise;

        const PageCookies = await page.cookies();
        var content = await page._client.send("Network.getAllCookies");
        fs.writeFileSync("./node_modules/ytcf/new_cookies.json", JSON.stringify(content, null, 4));
        fs.writeFileSync("./node_modules/ytcf/DEBUG/page_cookies.json", JSON.stringify(PageCookies, null, 4));

        const LoginCookies = await page.cookies();
        fs.writeFileSync("./node_modules/ytcf/LoginCookies.json", JSON.stringify(LoginCookies, null, 2)), //Update Login
          function(err) {
            if (err) throw err;
          };

        await browser.close();

        reslove(PageCookies);

      } catch (e) {
        reject(e);
      } finally {
        await browser.close();
      }
    });
  }
};