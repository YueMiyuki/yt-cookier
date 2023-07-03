const fs = require('node:fs')

module.exports = {
  getHeaders: function (browser, url) {
    console.log('Attempting to get headers')
    let returnValue = null
    return new Promise(async (resolve) => {
      const pages = await browser.pages()
      const page = (await pages[0]) || (await browser.newPage())
      await page.goto(url)

      page.on('request', async (request) => {
        const requestHeaders = request.headers() // getting headers of your request
        const headers = JSON.stringify(requestHeaders)
        if (headers.includes('x-youtube-identity-token')) {
          returnValue = requestHeaders
          resolve(returnValue).then(() => {
            browser.newPage()
            page.close()
          })
        }
      })

      try {
        if (fs.existsSync('./ytcr/sessionCookies.json')) {
          const cookiesString = await fs.readFileSync(
            './ytcr/sessionCookies.json'
          )
          const cookies = JSON.parse(cookiesString)
          await page.setCookie(...cookies)

          // Opening YouTube.com
          await page.goto(url)
        }
      } catch (e) {
        console.log(e)
      } finally {
        // await browser.close();
      }
      // await browser.close();
    })
  }
}
