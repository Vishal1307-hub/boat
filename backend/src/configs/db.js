const mongoose=require("mongoose")
require("dotenv").config()
const {MongoStore}=require("wwebjs-mongo")

module.exports= ()=>{
    return mongoose.connect(process.env.DB).then(()=>{
        return {
            status:"connecting to database",
            store:new MongoStore({mongoose:mongoose})
        }
    }).catch((err)=>console.log("connection rejected",err))
}
