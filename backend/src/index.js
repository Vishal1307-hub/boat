const express = require("express");
const app = express();
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const fs = require("fs");
const config = require("./utlis/config.json");  
const path = require("path");


require("dotenv").config();

const configPath=path.join(__dirname,config)

let Data=[]

let config;
 try{
    config=JSON.parse(fs.readFileSync(configPath, 'utf8'));

 }
 catch(error){
 console.error("Error reading config file",error)
 }
app.use(express.json());

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

client.on("ready", async (req, res) => {
  try {
    const chats = await client.getChats();
    console.log(chats);
    console.log(`Loaded ${chats.length} chats.`);
  } catch (error) {
    console.error("Error while connecting to WhatsApp:", error);
  }
});

client.on("message", async (msg) => {
    console.log(msg);
   try{
     const msgBody=msg.body.toLowerCase()
     const userId=msg.from
     const chat=await msg.getChat()

     if(config.commands[msgBody]){

        await msg.reply(config.commands[msgBody])
  
     }
     else if(msgBody==="location"){
        try{
            let location=await new Location(config.Latitude,config.Longitude,config.LName)
            await client.sendMessage(msg.from,location)
    
        }
        catch(error){
            console.error("Error while sending location:", error)
        }
     }






   }
   catch(error){
    console.error("Error while processing message:", error)
   }
});

client.on("message_create", async (data) => {
  try {
    const chatId = data.chat_id;
    const message = data.body;
  } catch (error) {
    console.error("Error while processing message:", error);
  }
});

client.initialize();
module.exports = app;
