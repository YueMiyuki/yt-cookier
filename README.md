# youtube-cookier
Youtube cookier can help you get cookies and headers from youtube easily.
In that way, you can bypass those annoying 429 Errors from ytdl.

Usage:
```js
const ytcr = require("yt-cookier");

const start = async () => {
  const browser = await ytcr.getBrowser({
    executablePath: "", // Leaving empty so puppeteer can fetch path
    headless: false, // Normally we use headless
    timeout: 0, // Set timeout
  });

  const log = await ytcr.login(browser, {
    email: "xxx@gmail.com", //Gmail address
    pass: "xxx", // Gmail password
    OTPtoken: "xxx", // Your 32-key token when setting up TOTP, please remove spaces
  });

  if (log === "succeed") {
    const headers = await ytcr.getHeaders(
      browser,
      "https://www.youtube.com/watch?v=qyBSYATyIUM"
    );
    const cookies = await ytcr.getCookies(
      browser,
      "https://www.youtube.com/watch?v=qyBSYATyIUM"
    );
    console.log("headers\n" + "=============================\n", headers);
    console.log("cookies\n" + "=============================\n", cookies);
  } else {
    console.log("login failed");
  }
};

start()
```

Using with [ytdl-core](https://www.npmjs.com/package/ytdl-core)
```js
const ytcr = require("ytcr");

const fs = require("node:fs");
const ytdl = require("ytdl-core");

const url = "https://www.youtube.com/watch?v=qyBSYATyIUM"

const start = async () => {
  const browser = await ytcr.getBrowser({
    executablePath: "", // Leaving empty so puppeteer can fetch path
    headless: true, // Normally we use headless
    timeout: 0, // Set timeout
  });

  const log = await ytcr.login(browser, {
    email: "xxx", //Gmail address
    pass: "xxx", // Gmail password
    OTPtoken: "xxx", // Your 32-key token when setting up TOTP, please remove spaces
  });

  if (log === "succeed") {
    let headers = await ytcr.getHeaders(
      browser,
      url
    );
    const cookies = await ytcr.getCookies(
      browser,
      url
    );

    reqHeader = headers;
    reqHeader["Cookie"] = cookies;

    console.log(reqHeader); // Headers sent to YouTube

    // Sending ytdl request
    ytdl(url, {
      requestOptions: {
        headers: reqHeader,
      },
    }).pipe(fs.createWriteStream("video.mp4"));
  } else {
    console.log("login failed");
  }
};

start();
```