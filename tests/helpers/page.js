const puppeteer = require('puppeteer')

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
}

module.exports = CustomPage
