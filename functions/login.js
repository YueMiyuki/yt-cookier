/**
 * @param { Browser } browser
 */
function sleep (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
const otplib = require('otplib')
const fs = require('node:fs')

module.exports = {
  login: async function (browser, { email, pass, OTPtoken }) {
    try {
      const page = await browser.newPage()
      // Opening the sign in page
      await page.goto(
        'https://accounts.google.com/signin/v2/identifier' +
          '?continue=https%3A%2F%2Fwww.youtube.com%2Fsignin' +
          '&passive=false' +
          '&service=youtube' +
          '&uilel=0t' +
          '&flowName=GlifWebSignIn' +
          '&flowEntry=AddSession'
      )

      // Find email box
      const emailClick = await page.waitForSelector('input[type="email"]', {
        visible: true
      })

      if (!emailClick) throw new Error('[ytcr] Email box not found!')

      // Fill in the email address
      await emailClick.click()
      await page.type('input[type="email"]', email)

      // Press continue button
      await page.waitForSelector('#identifierNext')
      await page.click('#identifierNext')

      // Fill in the password
      const passwordClick = await page.waitForSelector(
        'input[type="password"]',
        {
          visible: true
        }
      )

      if (!passwordClick) throw new Error('Email box not found!')

      await passwordClick.click()
      await page.type('input[type="password"]', pass)

      // Continue
      await page.waitForSelector('#passwordNext', {
        visible: true
      })
      await page.click('#passwordNext')

      await page.waitForNavigation({
        waitUntil: 'networkidle2'
      })

      const uri = page.url()
      if (
        uri.includes('accounts.google.com/signin') &&
        !uri.includes('admin.google.com/a/cpanel')
      ) {
        try {
          // throw new Error("Your password is wrong or 2FA on this account is enabled! Please check and try again.");
          const totpClick = await page.waitForSelector('input[type="tel"]', {
            visible: true
          })

          if (!totpClick) {
            throw new Error('[ytcr] A wrong password was provided!')
          } else {
            try {
              await totpClick.click()
              const code = otplib.authenticator.generate(OTPtoken)
              await page.type('input[type="tel"]', code)
              await sleep(500)
              await page.waitForSelector('#totpNext:not([disabled])')
              await page.click('#totpNext')
              await page.waitForNavigation({
                waitUntil: 'networkidle2'
              })
            } catch (e) {
              console.log(e)
            }
          }

          const Luri = page.url()

          if (!Luri.startsWith('https://www.youtube.com/')) {
            console.log(
              '[ytcr] Wrong 2FA Secret is provided! Please check and try again.'
            )
            page.close()
            return 'failed'
          } else if (
            Luri.includes('admin.google.com/a/cpanel') &&
            !Luri.includes('accounts.google.com/signin')
          ) {
            console.log(
              '[ytcr] This account have no right to access youtube.com! Please try another account!'
            )
            page.close()
            return 'failed'
          } else if (
            !Luri.startsWith('https://www.youtube.com/') &&
            !Luri.includes('accounts.google.com/signin')
          ) {
            console.log(
              '[ytcr]An unexpected error occurred!\nPleace check the popped out window to check whats wrong and post an issue to:\nhttps://github.com/ItzMiracleOwO/yt-cookier/issues'
            )
            // throw new Error("Closing the browser with the status FAILED");
          } else if (Luri.startsWith('https://www.youtube.com/')) {
            console.log('[ytcr] 2FA Passed! Successfully logged in!')

            const PageCookies = await page.cookies()

            if (!fs.existsSync('./ytcr')) fs.mkdirSync('./ytcr')
            fs.writeFileSync(
              './ytcr/sessionCookies.json',
              JSON.stringify(PageCookies, null, 2)
            ), // Update Login
            function (err) {
              if (err) throw err
            }
            page.close()
            const json = {
              login: email,
              password: pass,
              OTPtoken
            }
            fs.writeFileSync(
              './ytcr/credentials.json',
              JSON.stringify(json, null, 2)
            )
            return 'succeed'
          }
        } catch (e) {
          console.log(e)
        }
      } else if (
        uri.includes('admin.google.com/a/cpanel') &&
        !uri.includes('accounts.google.com/signin')
      ) {
        console.log(
          '[ytcr] This account have no right to access youtube.com! Please try another account!'
        )
        page.close()
        return 'failed'
      } else if (
        !uri.startsWith('https://www.youtube.com/') &&
        !uri.includes('accounts.google.com/signin')
      ) {
        console.log(
          '[ytcr] An unexpected error occurred!\nPleace check the popped out window to check whats wrong and post an issue to:\nhttps://github.com/ItzMiracleOwO/yt-cookier/issues'
        )
        page.close()
        return 'failed'
      } else if (url.startsWith('https://www.youtube.com/')) {
        console.log('[ytcr] Successfully logged in!')

        const PageCookies = await page.cookies()

        if (!fs.existsSync('./ytcr')) fs.mkdirSync('./ytcr')
        fs.writeFileSync(
          './ytcr/sessionCookies.json',
          JSON.stringify(PageCookies, null, 2)
        ), // Update Login
        function (err) {
          if (err) throw err
        }
        page.close()
        const json = {
          login: email,
          password: pass,
          OTPtoken
        }
        fs.writeFileSync(
          './ytcr/credentials.json',
          JSON.stringify(json, null, 2)
        )
        return 'succeed'
      }
    } catch (e) {
      console.error(e)
    } finally {
    }
  }
}
