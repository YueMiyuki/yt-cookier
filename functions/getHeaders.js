const puppeteer = require("puppeteer-extra");
const ping = require("ping");

const hosts = ["youtube.com"];
const fs = require("fs");
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
      const cookiesString = await fs.readFileSync("./page_cookies.json");
      const cookies = JSON.parse(cookiesString);
      await page.setCookie(...cookies);

      // Opening YouTube.com
      await page.goto("https://www.youtube.com/watch?v=x8VYWazR5mE");
            
      page.on("request", async request => {
        if (request.isInterceptResolutionHandled()) return;   
        let requestHeaders = request.headers(); //getting headers of your request
        console.log(requestHeaders);
        fs.writeFileSync("./DEBUG/headers.json" , JSON.stringify(requestHeaders ,null,4)), function (err , res ) {
          if (err) throw err;
        };
       
        return requestHeaders;
      });

    } catch (e) {
      console.log(e);
      throw new Error(e);
    } finally {
      setTimeout(async () => {
        await browser.close();
      }, 5*1000);
    }
  }
};
