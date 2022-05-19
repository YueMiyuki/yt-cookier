const puppeteer = require("puppeteer-extra");
const ping = require("ping");
const fs = require("fs");

const hosts = ["youtube.com"];

async function login({ email, pass }) {
	const StealthPlugin = require("puppeteer-extra-plugin-stealth");
	puppeteer.use(StealthPlugin());

	const browser = await puppeteer.launch({
		headless: false,
		timeout: 0
	});

	try {
		hosts.forEach(function (host) {
			console.log("Pinging youtube.com...");
			ping.promise.probe(host)
			.then(function (res) {
				if (!res.alive) {
					console.log(`Cannot connect to ${host}!\nPlease check your connection and try again later.`);
					throw new Error("Connection TIMEOUT!");
				}

				console.log(`Host ${host} is alive\nTook ${res.avg} ms to reach`);

				if (res.avg >= 60)
					console.log("The ping it too high, your connection would properly timeout, but we will try our best with it!");
			});
		});

		const page = await browser.newPage();

		// Opening the sign in page
		await page.goto("https://accounts.google.com/signin/v2/identifier" +
			"?continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26app%3Ddesktop%26hl%3Den-US%26next%3D%252F" +
			"&hl=zh-HK" +
			"&passive=false" +
			"&service=youtube" +
			"&uilel=0t" +
			"&flowName=GlifWebSignIn" +
			"&flowEntry=AddSession");

		await page.waitForNavigation();

		// Find email box
		const select = await page.waitForSelector("input[type=\"email\"]");

		if(!select)
			throw new Error("Email box not found!");

		// Fill in the email address
		await select.click();
		await page.type("input[type=\"email\"]", email);

		// Press continue button
		await page.waitForSelector("#identifierNext");
		await page.click("#identifierNext");

		// Fill in the password
		await page.waitForSelector("input[type=\"password\"]");
		await page.waitForSelector("input[type=\"password\"]", {
			visible: true
		});

		await page.type("input[type=\"password\"]", pass);

		// Continue
		await page.keyboard.press("Enter");

		// Check tab title
		console.log("Checking login status...");

		await page.waitForNavigation({
			waitUntil: "networkidle2",
		});

		const uri = page.url();
		if (uri.includes("accounts.google.com/signin") && !uri.includes("admin.google.com/a/cpanel"))
			throw new Error("Your password is wrong or 2FA on this account is enabled! Please check and try again.");

		if (uri.includes("admin.google.com/a/cpanel") && !uri.includes("accounts.google.com/signin"))
			throw new Error("This account have no right to access youtube.com! Please try another account!");

		if (uri.startsWith("https://www.youtube.com/")) {
			console.log("Successfully logged in!\nSuccessfully verified your account!");
			const cookies = await page.cookies();
			fs.writeFileSync("./node_modules/ytcf/LoginCookies.json", JSON.stringify(cookies, null, 4))
		} else {
			process.emitWarning("An unexpected error occurred!\nPleace check the popped out window to check whats wrong and post an issue to:\nhttps://github.com/ItzMiracleOwO/yt-cookier/issues");
			throw new Error("Closing the browser with the status FAILED");
		}

	} finally {
		await browser.close();
	}
}

module.exports = { login };