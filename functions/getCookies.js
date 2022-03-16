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
  getCookie: async function () {

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
      await page.goto("https://www.youtube.com/watch?v=x8VYWazR5mE");
      await navigationPromise;

      const PageCookies = await page.cookies();
      var content = await page._client.send("Network.getAllCookies");
      fs.writeFileSync("./node_modules/ytcf/new_cookies.json" , JSON.stringify(content ,null,4));
      fs.writeFileSync("./node_modules/ytcf/DEBUG/page_cookies.json" , JSON.stringify(PageCookies ,null,4));

      await browser.close();
                
      return PageCookies;

    } catch (e) {
      throw new Error(e);
            
    } finally {
      await browser.close();
    }
  }
};
