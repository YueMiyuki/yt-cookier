const puppeteer = require('puppeteer-extra')
const ping = require('ping');

const hosts = ['youtube.com'];
let pingtime = null
const fs = require('fs').promises;
let ptm = null
let success = false

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = {
    gc: async function (email, pass, pingtime) {

        const StealthPlugin = require('puppeteer-extra-plugin-stealth')
        puppeteer.use(StealthPlugin())

        const browser = await puppeteer.launch({
            headless: false
        });
        const page = await browser.newPage();
        const navigationPromise = page.waitForNavigation()

        try {
            const cookiesString = await fs.readFile('./cookies.json');
            const cookies = JSON.parse(cookiesString);
            await page.setCookie(...cookies);

            // Opening YouTube.com
            page.goto("https://www.youtube.com");
            await navigationPromise

            console.log("There we go!")

        } catch (e) {
            console.log(e)
            
        } finally {
            // nothing here
        }
    }
}
