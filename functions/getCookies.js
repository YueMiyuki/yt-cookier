const fs = require("fs");

module.exports = async function (browser, url) {
  return new Promise(async (resolve, reject) => {
    const pages = await browser.pages();
    const page = (await pages[0]) || (await browser.newPage());

    if (fs.existsSync(__dirname + "/ytcr/sessionCookies.json")) {
      const cookiesString = await fs.readFileSync(
        __dirname + "/ytcr/sessionCookies.json"
      );
      const cookies = JSON.parse(cookiesString);
      await page.setCookie(...cookies);

      // Opening YouTube.com
      await page.goto(url);
      await page.waitForSelector("#container");
      const PageCookies = await page.cookies();

      if (!JSON.stringify(PageCookies).includes("LOGIN_INFO")) {
        const login = await require(__dirname + "/login.js").login(
          browser,
          require("./ytcr/credentials.json").login,
          require("./ytcr/credentials.json").password,
          require("./ytcr/credentials.json").OTPtoken
        );
        if (login === "succeed") {
          const LogCookies = await page.cookies();
          const cookieStr = JSON.stringify(LogCookies, null, 4);

          if (!fs.existsSync(__dirname + "/ytcr"))
            fs.mkdirSync(__dirname + "/ytcr");
          fs.writeFileSync(__dirname + "/ytcr/sessionCookies.json", cookieStr);

          const array = JSON.parse(cookieStr);
          const Rcookies = array
            .map(({ name, value }) => `${name}=${value}`)
            .join("; ");

          await browser.newPage();
          await page.close();
          resolve(Rcookies);
        } else {
          reject("Login failed");
        }
      } else {
        const cookieStr = JSON.stringify(PageCookies, null, 4);

        if (!fs.existsSync(__dirname + "/ytcr")) fs.mkdirSync("./ytcr");
        fs.writeFileSync(
          "./ytcr/sessionCookies.json",
          JSON.stringify(PageCookies, null, 2)
        ),
          function (err) {
            if (err) throw err;
          };
        await browser.newPage();
        await page.close();

        const array = JSON.parse(cookieStr);
        const Rcookies = array
          .map(({ name, value }) => `${name}=${value}`)
          .join("; ");

        resolve(Rcookies);
      }
    } else {
      reject("No login file found");
    }
  });
};
