const fs = require("node:fs");

module.exports = function (browser, url) {
  console.log("Attempting to get headers");
  let returnValue = null;
  return new Promise(async (resolve) => {
    const pages = await browser.pages();
    const page = (await pages[0]) || (await browser.newPage());

    if (fs.existsSync("./ytcr/sessionCookies.json")) {
      const cookiesString = await fs.readFileSync("./ytcr/sessionCookies.json");
      const cookies = JSON.parse(cookiesString);
      await page.setCookie(...cookies);

      await page.goto(url);

      page.on("request", async (request) => {
        const requestHeaders = await request.headers(); // getting headers of your request
        const headers = JSON.stringify(requestHeaders);
        if (headers.includes("x-youtube-identity-token")) {
          returnValue = requestHeaders;
          resolve(returnValue);
        }
      });
      // await browser.close();
    } else {
      return console.log("No cookies found, please login first");
    }
  });
};
