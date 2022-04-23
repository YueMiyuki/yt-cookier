const puppeteer = require("puppeteer-extra");
const fs = require("fs")

module.exports = {
  getCookie: async function (url) {

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
      const cookieStr = JSON.stringify(PageCookies, null, 4)

      await browser.close();

      // const cookieString = fs.readFileSync("./node_modules/ytcf/cookies.json");
      const array = JSON.parse(cookieStr);
      const Rcookies = array.map(({
        name,
        value
      }) =>
        `${name}=${value}`).join("; ");

      return Rcookies;

    } catch (e) {
      throw new Error(e);
    } finally {
      // await browser.close();
    }
  }
};