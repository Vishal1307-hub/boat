const app = require("../index");
const connect = require("../configs/db");
const qrcode = require("qrcode-terminal");
const puppeteer = require("puppeteer");
const { Client, LocalAuth } = require("whatsapp-web.js");
require("dotenv").config();

const port = process.env.PORT || 3000;

const client = new Client({
  authStrategy: new LocalAuth(),
});

let qrGenerated = false;
let userState = {}; // Object to track the state of each user's conversation

client.on("qr", (qr) => {
  if (!qrGenerated) {
    qrcode.generate(qr, { small: true });
    qrGenerated = true;
    console.log("Scan QR code with the WhatsApp app on your phone.");
  } else {
    console.log("QR already generated. Scan it to login.");
  }
});

client.on("ready", async () => {
  console.log("Client is ready!");
  try {
    const chats = await client.getChats();
    console.log(`Loaded ${chats.length} chats.`);
  } catch (error) {
    console.error("Error while getting chats:", error);
  }
});

client.on("message", async (message) => {
  const userId = message.from; 
  const userMessage = message.body.toLowerCase().trim();
  
  if (!userState[userId]) {
    if (userMessage === "hi") {
      userState[userId] = { step: "askSerialNo" }; 
      await message.reply("Hello! Please send me the serial number.");
    } else {
      await message.reply("Please say 'Hi' to start the conversation.");
    }
    return;
  }

  const userCurrentState = userState[userId].step;

  switch (userCurrentState) {
    case "askSerialNo":
      userState[userId].serialNumber = userMessage; 
      userState[userId].step = "askPurchaseDate"; 
      await message.reply("Got it! Now, what is the purchase date? (Format: DD/MM/YYYY)");
      break;

    case "askPurchaseDate":
      userState[userId].purchaseDate = userMessage; 
      const { serialNumber, purchaseDate } = userState[userId];

      await message.reply(`Processing S/N: ${serialNumber} and Purchase Date: ${purchaseDate}. Please wait...`);

      await getCall(serialNumber, purchaseDate);

      delete userState[userId];
      break;

    default:
      await message.reply("Something went wrong. Please say 'Hi' to start again.");
  }
});

async function getCall(serialNumber, purchaseDate) {
  let browser;

  try {
    browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.setViewport({ width: 1520, height: 1080 });
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

    await page.waitForNavigation({ waitUntil: "networkidle0" });

    await page.goto("https://synergy.servicetec.in/#/manage-booking/create");

    // Enter the serial number
    await page.waitForSelector("#mat-input-7");
    const modelSerialNoInput = await page.$("#mat-input-7");
    if (modelSerialNoInput) {
      await modelSerialNoInput.type(serialNumber);
      console.log(`Typed S/N: ${serialNumber} into the Model Serial No. field.`);
    } else {
      console.log("Model Serial No. input element not found");
    }

    const searchButtonSelector = "button.icon-Search-Lookup";
    await page.waitForSelector(searchButtonSelector);
    const searchButton = await page.$(searchButtonSelector);
    if (searchButton) {
      await searchButton.click();
      console.log("Clicked the search button.");
    } else {
      console.log("Search button not found.");
    }

    await page.waitForSelector("#date-picker-Purchase\\ Date");
    await page.evaluate(() => {
      const dateInput = document.querySelector("#date-picker-Purchase\\ Date");
      dateInput.removeAttribute('readonly');
    });

    await page.evaluate((purchaseDate) => {
      const dateInput = document.querySelector("#date-picker-Purchase\\ Date");
      dateInput.value = purchaseDate;
      dateInput.dispatchEvent(new Event('input', { bubbles: true }));
    }, purchaseDate);
    
    console.log(`Entered Purchase Date: ${purchaseDate}`);

    await page.evaluate(() => {
      window.scrollBy(0, 200);
    });

    
  } catch (error) {
    console.error("Error in Puppeteer automation:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

process.on("SIGINT", async () => {
  await client.destroy();
  process.exit(0);
});

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
});
