const puppeteer=require("puppeteer")

async function getCall() {
  let browser;

  try {
    browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.setViewport({ width: 1520, height: 1080 });
    await page.goto("https://synergy.servicetec.in");

    await page.waitForSelector("form", { timeout: 60000 });
    await page.waitForSelector('input[formcontrolname="username"]', { timeout: 60000 });
    const usernameInput = await page.$('input[formcontrolname="username"]');
    if (usernameInput) {
      await usernameInput.type("rogernreckon");
      console.log("Typed into the username field.");
    } else {
      console.log("Username input element not found");
    }

    await page.waitForSelector('input[formcontrolname="password"]', { timeout: 60000 });
    const passwordInput = await page.$('input[formcontrolname="password"]');
    if (passwordInput) {
      await passwordInput.type("Password@43");
      console.log("Typed into the password field.");
    } else {
      console.log("Password input element not found");
    }

    const loginButtonSelector = "button.login-btn";
    await page.waitForSelector(loginButtonSelector, { timeout: 60000 });

    const isDisabled = await page.evaluate((selector) => {
      const button = document.querySelector(selector);
      return button.disabled;
    }, loginButtonSelector);

    if (!isDisabled) {
      const loginButton = await page.$(loginButtonSelector);
      await loginButton.click();
      console.log("Clicked the login button.");
    } else {
      console.log("Login button is disabled.");
    }

    await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 });

    await page.goto("https://synergy.servicetec.in/#/manage-booking/create");

    await page.waitForSelector("#mat-input-7", { timeout: 60000 });

    const modelSerialNoInput = await page.$("#mat-input-7");

    if (modelSerialNoInput) {
      await modelSerialNoInput.type("VBY7FT001046");
      console.log("Typed into the Model Serial No. field.");
    } else {
      console.log("Model Serial No. input element not found");
    }

    const searchButtonSelector = "button.icon-Search-Lookup";

    await page.waitForSelector(searchButtonSelector, { timeout: 60000 });

    const searchButton = await page.$(searchButtonSelector);
    if (searchButton) {
      await searchButton.click();
      console.log("Clicked the search button.");
    } else {
      console.log("Search button not found.");
    }
    

    await page.click('#date-picker-Purchase Date');
    await page.type('#date-picker-Purchase Date', '25/07/2020');
    await page.keyboard.press('Enter');

  } catch (error) {
    console.error("Error in Puppeteer automation:", error);
  } finally {
    if (browser) {
      await browser.emit();
    }
  }
}

module.exports={getCall}
