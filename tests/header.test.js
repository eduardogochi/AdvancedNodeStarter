const puppeteer = require('puppeteer')

let browser, page

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false,
  })
  page = await browser.newPage()
  await page.goto('localhost:3000')
})

afterEach(async () => {
  await browser.close()
})

test('We can launch a browser', async () => {
  const text = await page.$eval('a.brand-logo', (el) => el.innerHTML)

  expect(text).toEqual('Blogster')
})

test('Clicking login starts oAuth flow', async () => {
  await page.click('.right a')
  const url = await page.url()

  console.log(url)

  expect(url).toMatch(/accounts\.google\.com/)
})

test('When signed in, shows logout button', async () => {
  /* Steps to fake the session: 
        1. Create page instance
        2. Take an existing user Id and generate fake session object with it
        3. Sign the session object with keygrip
        4. Set the session and signature on our page instance as cookies
     */

  const id = '65a0450077383e409169584f'

  const Buffer = require('safe-buffer').Buffer
  const sessionObj = {
    passport: {
      user: id,
    },
  }

  const sessionStr = Buffer.from(JSON.stringify(sessionObj)).toString('base64')

  const Keygrip = require('keygrip')
  const keys = require('../config/keys')
  const keygrip = new Keygrip([keys.cookieKey])
  const sig = keygrip.sign('session=' + sessionStr)

  // console.log(sessionStr, sig)

  await page.setCookie({
    name: 'session',
    value: sessionStr,
  })

  await page.setCookie({
    name: 'session.sig',
    value: sig,
  })

  await page.goto('localhost:3000')
  await page.waitFor('a[href="/auth/logout"]')

  const text = await page.$eval('a[href="/auth/logout"]', (el) => el.innerHTML)

  expect(text).toEqual('Logout')
})
