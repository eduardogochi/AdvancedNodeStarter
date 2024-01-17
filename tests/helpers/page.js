const puppeteer = require('puppeteer')
const sessionFactory = require('./../factories/sessionFactory')
const userFactory = require('./../factories/userFactory')

class CustomPage {
  /* 
    Generates a new puppeteer page that's then going to create a new instance of custom page
    And then it's going to combine the two together with a proxy object and return that
    */
  static async build() {
    const browser = await puppeteer.launch({
      headless: false,
    })

    const page = await browser.newPage()
    const customPage = new CustomPage(page, browser)

    return new Proxy(customPage, {
      get: function (target, property) {
        return customPage[property] || browser[property] || page[property]
      },
    })
  }

  constructor(page) {
    this.page = page
  }

  async login() {
    /* 
  Steps to fake the session: 
        1. Create page instance
        2. Take an existing user Id and generate fake session object with it
        3. Sign the session object with keygrip
        4. Set the session and signature on our page instance as cookies
     */
    const user = await userFactory()

    const { session, sig } = sessionFactory(user)

    await this.page.setCookie({
      name: 'session',
      value: session,
    })

    await this.page.setCookie({
      name: 'session.sig',
      value: sig,
    })

    await this.page.goto('localhost:3000/blogs')
    await this.page.waitFor('a[href="/auth/logout"]')
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, (el) => el.innerHTML)
  }
}

module.exports = CustomPage
