const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { executablePath } = require("puppeteer");

puppeteer.use(StealthPlugin());

module.exports = {
  getBrowser: async function ({ execPath, headless, timeout, ...others }) {
    if ((execPath = "")) {
      execPath = executablePath();
    }
    if ((headless = "")) headless = true;
    if ((timeout = "")) timeout = 0;

    const browser = await puppeteer.launch({
      execPath,
      headless,
      timeout,
      ...others,
    });
    return browser;
  },
};
