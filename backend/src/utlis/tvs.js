const puppeteer = require("puppeteer");
require("dotenv").config();

async function getCall(serialNumber, purchaseDate) {
    let browser;

    try {
        browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.setViewport({ width: 1520, height: 1080 });
        await page.goto(process.env.TVS_URL);

        // Login process
        await page.waitForSelector("form");
        await page.waitForSelector('input[formcontrolname="username"]');
        await page.type('input[formcontrolname="username"]', process.env.TVS_USERNAME);
        console.log("Typed into the username field.");

        await page.waitForSelector('input[formcontrolname="password"]');
        await page.type('input[formcontrolname="password"]', process.env.TVS_PASSWORD);
        console.log("Typed into the password field.");

        const loginButtonSelector = "button.login-btn";
        await page.waitForSelector(loginButtonSelector);
        const isDisabled = await page.evaluate((selector) => document.querySelector(selector).disabled, loginButtonSelector);

        if (!isDisabled) {
            await page.click(loginButtonSelector);
            console.log("Clicked the login button.");
            await page.waitForNavigation({ waitUntil: "networkidle0" });
        } else {
            throw new Error("Login button is disabled.");
        }

        // Navigate to booking creation
        await page.goto(`${process.env.TVS_URL}/#/manage-booking/create`);
        await page.waitForSelector("#mat-input-7");
        await page.type("#mat-input-7", serialNumber);
        console.log("Typed into the Model Serial No. field.");

        const searchButtonSelector = "button.icon-Search-Lookup";
        await page.waitForSelector(searchButtonSelector);
        await page.click(searchButtonSelector);
        console.log("Clicked the search button.");

        

        // Enter purchase date
        await page.waitForSelector("#date-picker-Purchase\\ Date");
        await page.evaluate(() => {
            const dateInput = document.querySelector("#date-picker-Purchase\\ Date");
            dateInput.removeAttribute("readonly");
        });

        await page.evaluate((date) => {
            const dateInput = document.querySelector("#date-picker-Purchase\\ Date");
            dateInput.value = "24/10/2020";
            dateInput.dispatchEvent(new Event("input", { bubbles: true }));
        });

        console.log("Entered purchase date.");
    } catch (error) {
        console.error("Error in Puppeteer automation:", error);
    } finally {
        if (browser) {
            await browser.close(); 
        }
    }
}

module.exports = { getCall };
