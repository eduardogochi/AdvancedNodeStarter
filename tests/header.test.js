const sessionFactory = require('./factories/sessionFactory')
const userFactory = require('./factories/userFactory')
const Page = require('./helpers/page')

let page

beforeEach(async () => {
  page = await Page.build()
  await page.goto('localhost:3000')
})

afterEach(async () => {
  await page.close()
})

test('We can launch a browser', async () => {
  const text = await page.$eval('a.brand-logo', (el) => el.innerHTML)

  expect(text).toEqual('Blogster')
})

test('Clicking login starts oAuth flow', async () => {
  await page.click('.right a')
  const url = await page.url()

  expect(url).toMatch(/accounts\.google\.com/)
})

test('When signed in, shows logout button', async () => {
  /* 
  Steps to fake the session: 
        1. Create page instance
        2. Take an existing user Id and generate fake session object with it
        3. Sign the session object with keygrip
        4. Set the session and signature on our page instance as cookies
     */

  const user = await userFactory()

  const { session, sig } = sessionFactory(user)

  await page.setCookie({
    name: 'session',
    value: session,
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
