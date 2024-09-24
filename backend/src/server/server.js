const app = require("..//index");
const connect = require("..//configs/db");
const qrcode = require("qrcode-terminal");
const puppeteer = require("puppeteer");
const { Client, LocalAuth } = require("whatsapp-web.js");

require("dotenv").config();

const port = process.env.PORT || 3000;

const client = new Client({
  authStrategy: new LocalAuth(),
});

let qrGenerated = false;

client.on("qr", (qr) => {
  if (!qrGenerated) {
    qrcode.generate(qr, { small: true });
    qrGenerated = true;
    console.log("Scan QR code with the WhatsApp app on your phone.");
  } else {
    console.log("QR already generated. Scan it to login.");
  }
});

client.on("ready", async (data) => {
  console.log(data);
  console.log("Client is ready!");
  try {
    const chats = await client.getChats();
    console.log(`Loaded ${chats.length} chats.`);
  } catch (error) {
    console.error("Error while getting chats:", error);
  }
});

client.on("message", (message) => {
  console.log(`Received message: ${message.body}`);
});
client.on("message_create", async (data) => {
  try {
  } catch (error) {
    console.error("Error while handling message", error);
  }
});

async function getCall() {
  let browser;

  try {
    browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.setViewport({ width: 1080, height: 1024 });
    await page.goto("https://synergy.servicetec.in");

    await page.waitForSelector("form");
    await page.waitForSelector('input[formcontrolname="username"]');
    const usernameInput = await page.$('input[formcontrolname="username"]');
    if (usernameInput) {
      await usernameInput.type("rogernreckon");
      console.log("Typed into the username field.");
    } else {
      console.log("Username input element not found");
    }

    await page.waitForSelector('input[formcontrolname="password"]');
    const passwordInput = await page.$('input[formcontrolname="password"]');
    if (passwordInput) {
      await passwordInput.type("Password@43");
      console.log("Typed into the password field.");
    } else {
      console.log("Password input element not found");
    }

    const loginButtonSelector = "button.login-btn";
    await page.waitForSelector(loginButtonSelector);

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

     await page.waitForNavigation({ waitUntil: 'networkidle0' });
    

    await page.goto("https://synergy.servicetec.in/#/manage-booking/create")


    const context=await page.content()
    console.log(context)

  } catch (error) {
    console.error("Error in Puppeteer automation:", error);
  } finally {
    if (browser) {
      await browser.newPage()
    }
  }
}

getCall();

process.on("SIGINT", async () => {
  await client.destroy();
  process.exit(0);
});

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
});
