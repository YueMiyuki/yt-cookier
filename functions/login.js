// Include the chrome driver
require("chromedriver");

// Include selenium webdriver
const swd = require("selenium-webdriver");
const ping = require('ping');
const {
    Builder,
    By,
    Key,
    until
} = require('selenium-webdriver');

const hosts = ['youtube.com'];
let pingtime = 10

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
            if (res.ave < 5) {
                pingtime = 10
            } else if (res.avg > 10 && res.avg < 19) {
                pingtime = 15
            } else if (res.avg > 20 && res.ave < 30) {
                pingtime = 25
            } else if (res.avg > 30) {
                pingtime = 60
            }
            console.log(`Your ping time to youtube.com is ${res.avg}ms , so we will wait for ${pingtime} seconds to ensure the login status!`)
        });
});

(async function start() {
    // Get the credentials from the JSON file
    let {
        email,
        pass
    } = require("../credentials.json");

    const driver = await new Builder().forBrowser('chrome').build();

    try {
        // Step 1 - Opening the geeksforgeeks sign in page
        let tabToOpen =
            driver.get("https://accounts.google.com/signin/v2/identifier?continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26app%3Ddesktop%26hl%3Dzh-HK%26next%3D%252F&hl=zh-HK&passive=false&service=youtube&uilel=0&flowName=GlifWebSignIn&flowEntry=AddSession");
        tabToOpen
            .then(function () {

                // Timeout to wait if connection is slow
                let findTimeOutP =
                    driver.manage().setTimeouts({
                        implicit: 10000, // 10 seconds
                    });
                return findTimeOutP;
            })
            .then(function () {

                // Step 2 - Finding the email input
                let promiseEmailBox =
                    driver.findElement(By.className("whsOnd zHQkBf"));
                return promiseEmailBox;
            })
            .then(function (usernameBox) {

                // Step 3 - Entering the username
                let promiseFillUsername =
                    usernameBox.sendKeys(email);
                return promiseFillUsername;
            })
            .then(function () {
                console.log("Successfully injected the email address!");

                // Step 6 - Finding the Sign In button
                let promiseSignInBtn = driver.findElement(
                    swd.By.className("VfPpkd-LgbsSe VfPpkd-LgbsSe-OWXEXe-k8QpJ VfPpkd-LgbsSe-OWXEXe-dgl2Hf nCP5yc AjY5Oe DuMIQc qIypjc TrZEUc lw1w4b")
                );
                return promiseSignInBtn;
            })
            .then(function (signInBtn) {

                // Step 7 - Clicking the Sign In button
                let promiseClickSignIn = signInBtn.click();
                return promiseClickSignIn;
            })
            .then(async function () {
                await new Promise(resolve => setTimeout(resolve, pingtime + 1000))
                // Step 2 - Finding the pwd input
                let promisepwdBox = driver.findElement(By.className("whsOnd zHQkBf"));
                return promisepwdBox;
            })
            .then(function (loginBox) {

                // Step 3 - Entering the username
                let promiseLogin =
                    loginBox.sendKeys(pass);
                return promiseLogin;
            })
            .then(function () {
                console.log("Successfully injected the password!");

                // Step 6 - Finding the Sign In button
                let promiseBtn = driver.findElement(
                    swd.By.className("VfPpkd-LgbsSe VfPpkd-LgbsSe-OWXEXe-k8QpJ VfPpkd-LgbsSe-OWXEXe-dgl2Hf nCP5yc AjY5Oe DuMIQc qIypjc TrZEUc lw1w4b")
                );
                return promiseBtn;
            })
            .then(function (promiseBtn) {

                // Step 7 - Clicking the Sign In button
                let promiseClickSignIn = promiseBtn.click();
                return promiseClickSignIn;
            })
            .then(async function () {
                await sleep(pingtime + 1000)
                const uri = await driver.getCurrentUrl();
                if (uri !== 'www.youtube.com') {
                    throw new Error('Cannot connect to youtube.com! Do you have the right to use youtube?')
                } else if (uri.includes("https://accounts.google.com/signin/")) {
                    throw new Error('Cannot sign in with google! Make sure your username and password are correct!')
                } else if (uri === 'www.youtube.com') {
                    console.log("Successfully logged in!")
                    console.log("Killing the driver since the operation was done!")
                    await driver.quit
                } else {
                    console.log("An unexpected error occurred!\nKilling the webdriver...")
                    await driver.quit
                }
                // await driver.wait(until.titleIs('YouTube'), pingtime);
                // if (title.includes("https://admin.google.com/a/cpanel/")) {
                //     throw new Error("You have no right to access youtube.com!\nPlease try another account!")
                // }
            })
            .catch(function (err) {
                console.log("Error ", err, " occurred!");
            });
    } catch (e) {
        console.log(e)
    } finally {
        await driver.quit
    }
})()