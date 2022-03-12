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
    getCookie: async function () {

        const StealthPlugin = require('puppeteer-extra-plugin-stealth')
        puppeteer.use(StealthPlugin())

        const browser = await puppeteer.launch({
            headless: false
        });
        const page = await browser.newPage();
        const navigationPromise = page.waitForNavigation()

        try {
            const cookiesString = await fs.readFile('./LoginCookies.json');
            const cookies = JSON.parse(cookiesString);
            await page.setCookie(...cookies);

            // Opening YouTube.com
            await page.goto("https://www.youtube.com/watch?v=x8VYWazR5mE");
            await navigationPromise

            const PageCookies = await page.cookies();
                var content = await page._client.send('Network.getAllCookies');
                await fs.writeFile('./DEBUG/new_cookies.json', JSON.stringify(content, null, 4));
                await fs.writeFile('./DEBUG/page_cookies.json', JSON.stringify(PageCookies, null, 4));
                await browser.close()
                
            return PageCookies

        } catch (e) {
            throw new Error(e)
            
        } finally {
            await browser.close()
        }
    }
}
