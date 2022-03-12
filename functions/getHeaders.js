const puppeteer = require("puppeteer-extra");
const ping = require("ping");

const hosts = ["youtube.com"];
let pingtime = null;
const fs = require("fs").promises;
let ptm = null;
let success = false;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

module.exports = {
  getHeaders: async function () {

    const StealthPlugin = require("puppeteer-extra-plugin-stealth");
    puppeteer.use(StealthPlugin());

    const browser = await puppeteer.launch({
      headless: false
    });
    const page = await browser.newPage();
    const navigationPromise = page.waitForNavigation();

    try {
      const cookiesString = await fs.readFile("./page_cookies.json");
      const cookies = JSON.parse(cookiesString);
      await page.setCookie(...cookies);

      // Opening YouTube.com
      await page.goto("https://www.youtube.com/watch?v=x8VYWazR5mE");
            
      page.on("request", async request => {
        if (request.isInterceptResolutionHandled()) return;   
        const requestHeaders = request.headers(); //getting headers of your request
        console.log(requestHeaders);
        await fs.writeFile("./DEBUG/headers.json", JSON.stringify(requestHeaders, null, 4));
      });
      return requestHeaders;

    } catch (e) {
      throw new Error(e);
    } finally {
      await browser.close();
    }
  }
};
