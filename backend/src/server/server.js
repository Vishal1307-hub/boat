const app = require("..//index");
const connect = require("..//configs/db");
const qrcode = require("qrcode-terminal");
const puppeteer=require("puppeteer")
const {
  Client,
  LocalAuth,
} = require("whatsapp-web.js");

require("dotenv").config();

const port = process.env.PORT || 3000;

const client = new Client({
    authStrategy: new LocalAuth()
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
    console.log(data)
    console.log("Client is ready!");
    try {
        const chats = await client.getChats();
        console.log(`Loaded ${chats.length} chats.`);
    } catch (error) {
        console.error("Error while getting chats:", error);
    }
});

client.on('message', message => {
    console.log(`Received message: ${message.body}`);
});
client.on("message_create",async (data)=>{
    try{

    }
    catch(error){
        console.error("Error while handling message",error);
    }
})





process.on('SIGINT', async () => {
    await client.destroy();
    process.exit(0);
});

 
async function getCall(){
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage(); 

    await page.setViewport({width: 1080, height: 1024});
     await page.goto('https://synergy.servicetec.in/#/login');
     await page.waitForSelector('input[name="username"]', { timeout: 30000 });
     await page.type('input[name="username"]',process.env.TVS_USERNAME);

     await page.waitForSelector('input[name="password"]', { timeout: 30000 });
     await page.type('input[name="password"]', process.env.TVS_PASSWORD);


     await page.waitForSelector('button[type="submit"]', { timeout: 30000 });
     await page.click('button[type="submit"]');

     console.log("Page loaded");

 


     await page.waitForSelector('input[name]')

 
    





    
}
getCall()




app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
});
