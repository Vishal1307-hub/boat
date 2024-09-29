const app = require("../index");
const connect = require("../configs/db");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const {getCall}=require("..//utlis/tvs")
require("dotenv").config();

const port = process.env.PORT || 3000;











app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
});
