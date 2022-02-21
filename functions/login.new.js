const puppeteer = require('puppeteer-extra')
const ping = require('ping');

const hosts = ['youtube.com'];
let pingtime = null
let ptm = null

let {
    email,
    pass
} = require("../credentials.json");

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
            if (res.avg <= 5 && res.avg >= 10) {
                pingtime = 10000
            } else if (res.avg > 11 && res.avg < 19) {
                pingtime = 15000
                ptm = 15
            } else if (res.avg > 20 && res.ave < 30) {
                pingtime = 25000
                ptm = 25
            } else if (res.avg > 30) {
                pingtime = 60000
                ptm = 60
            }
            console.log(`Your ping time to youtube.com is ${res.avg} ms , so we will wait for ${ptm} to ensure the login status!`)
        });
});

(async function login() {
    // Get the credentials from the JSON file
    let {
        email,
        pass
    } = require("../credentials.json");

    const StealthPlugin = require('puppeteer-extra-plugin-stealth')
    puppeteer.use(StealthPlugin())

    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    const navigationPromise = page.waitForNavigation()

    try {
        // Step 1 - Opening the geeksforgeeks sign in page
        page.goto("https://accounts.google.com/signin/v2/identifier" +
            "?continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26app%3Ddesktop%26hl%3Den-US%26next%3D%252F" +
            "&hl=zh-HK" +
            "&passive=false" +
            "&service=youtube" +
            "&uilel=0t" +
            "&flowName=GlifWebSignIn" +
            "&flowEntry=AddSession");
        await navigationPromise

    } catch (e) {
        console.log(e)
    } finally {
        await sleep(pingtime);
        await browser.close();
    }
})()
