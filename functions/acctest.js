const puppeteer = require('puppeteer-extra')
const ping = require('ping');
const fs = require('fs').promises;

const hosts = ['youtube.com'];
let pingtime = null
let ptm = null
let success = false

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

hosts.forEach(function (host) {
    console.log('Pinging youtube.com...')
    ping.promise.probe(host)
        .then(function (res) {
            const isAlive = res.alive
            var msg = isAlive ? 'Host ' + host + ' is alive' + `\nTook ${res.avg} ms to reach ` + host : 'Cannot connect to ' + host + '!\nPlease check your connection and try again later.';
            console.log(msg);
            if (!isAlive) {
                throw new Error('Connection TIMEOUT!')
            }
            if (res.avg < 5) {
                pingtime = 90
            } else if (res.avg >= 5 && res.avg <= 10) {
                pingtime = 100
            } else if (res.avg >= 11 && res.avg <= 19) {
                pingtime = 150
            } else if (res.avg >= 20 && res.ave <= 29) {
                pingtime = 250
            } else if (res.avg >= 30 && res.avg <= 60) {
                pingtime = 600
            } else if (res.avg >= 61) {
                pingtime = 1000
            }
            console.log(`Your ping time to youtube.com is ${res.avg} ms , so we will wait for ${pingtime*100} ms to ensure the login status!`)
            if (pingtime > 600) console.log("The ping it too high, your connection would properly timeout, but we will try our best with it!")
        });
});

module.exports = {
    login: async function (email, pass) {

        const StealthPlugin = require('puppeteer-extra-plugin-stealth')
        puppeteer.use(StealthPlugin())

        const browser = await puppeteer.launch({
            headless: false
        });
        const page = await browser.newPage();
        const navigationPromise = page.waitForNavigation()

        try {
            // Opening the sign in page
            page.goto("https://accounts.google.com/signin/v2/identifier" +
                "?continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26app%3Ddesktop%26hl%3Den-US%26next%3D%252F" +
                "&hl=zh-HK" +
                "&passive=false" +
                "&service=youtube" +
                "&uilel=0t" +
                "&flowName=GlifWebSignIn" +
                "&flowEntry=AddSession");
            await navigationPromise

            // Find email box
            let select = await page.waitForSelector('input[type="email"]')
            if (!select) {
                sleep(pingtime)
                let select2 = await page.waitForSelector('input[type="email"]')
                if (!select2) {
                    console.log("Connection TIMEOUT!")
                } else(
                    select = await page.waitForSelector('input[type="email"]')
                )
            }
            await navigationPromise

            // Fill in the email address
            await page.click('input[type="email"]')
            await page.type('input[type="email"]', email)

            // Press continue button
            await page.waitForSelector('#identifierNext')
            await page.click('#identifierNext')

            // Fill in the password
            await page.waitForSelector('input[type="password"]')
            await page.waitForSelector('input[type="password"]', {
                visible: true
            });
            await page.type('input[type="password"]', pass)

            // Continue
            await page.keyboard.press('Enter')

            // Check tab title
            console.log("Checking login status...")
            await page.waitForNavigation({
                waitUntil: 'networkidle2',
            });
            const uri = await page.url()
            if (uri.includes('accounts.google.com/signin') && !uri.includes('admin.google.com/a/cpanel')) {
                await sleep(pingtime)
                await browser.close()
                throw new Error("Your password is wrong! Please check you password and try again.")
            } else if (uri.includes('admin.google.com/a/cpanel') && !uri.includes('accounts.google.com/signin')) {
                await sleep(pingtime)
                await browser.close()
                throw new Error("This account have no right to access youtube.com! Please try another account!")
            } else if (uri == "https://www.youtube.com/") {
                console.log("Successfully logged in!\nSuccessfully verified your account!")
                await sleep(pingtime)
                success = true
                const cookies = await page.cookies();
                await fs.writeFile('../cookies.json', JSON.stringify(cookies, null, 2));
                require("./getcookie").gc(email, pass, pingtime)
                await browser.close()
            } else {
                console.log("An unexpected error occurred!\nPleace check the popped out window to check whats wrong and post an issue to:\nhttps://github.com/ItzMiracleOwO/yt-cookier/issues")
                sleep(pingtime * 100)
                throw new Error("Closing the browser with the status FAILED")
            }

        } catch (e) {
            console.log(e)
        } finally {
            // nothing here
        }
    }
}
