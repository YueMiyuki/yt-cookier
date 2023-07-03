const fs = require("fs");

module.exports = {
  getCookies: async function (browser, url) {
    console.log("Attempting to get cookies");
    return new Promise(async (resolve) => {
      const pages = await browser.pages();
      const page = (await pages[0]) || (await browser.newPage());

      try {
        if (fs.existsSync("./ytcr/sessionCookies.json")) {
          const cookiesString = await fs.readFileSync(
            "./ytcr/sessionCookies.json"
          );
          const cookies = JSON.parse(cookiesString);
          await page.setCookie(...cookies);

          // Opening YouTube.com
          await page.goto(url);
          await page.waitForSelector("#container");
          const PageCookies = await page.cookies();

          if (!JSON.stringify(PageCookies).includes("LOGIN_INFO")) {
            console.log("Your Login session expired! Relogging...");
            const login = await require(__dirname + "/login.js").login(
              browser,
              require("./ytcr/credentials.json").login,
              require("./ytcr/credentials.json").password,
              require("./ytcr/credentials.json").OTPtoken
            );
            if (login === "succeed") {
              const LogCookies = await page.cookies();
              const cookieStr = JSON.stringify(LogCookies, null, 4);

              if (!fs.existsSync("./ytcr")) fs.mkdirSync("./ytcr");
              fs.writeFileSync("./ytcr/sessionCookies.json", cookieStr),
                function (err) {
                  if (err) throw err;
                };

              const array = JSON.parse(cookieStr);
              const Rcookies = array
                .map(({ name, value }) => `${name}=${value}`)
                .join("; ");

              await browser.newPage();
              await page.close();
              resolve(Rcookies);
            } else {
              return console.log("login failed");
            }
          } else {
            const cookieStr = JSON.stringify(PageCookies, null, 4);

            if (!fs.existsSync("./ytcr")) fs.mkdirSync("./ytcr");
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
          return console.log("No cookies found, please login first");
        }
      } catch (e) {
        console.log(e);
      } finally {
      }
    });
  },
};
