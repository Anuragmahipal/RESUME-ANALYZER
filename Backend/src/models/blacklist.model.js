const mongoose=require("mongoose")

const blacklistTokenSchema = new mongoose.Schema({
  token:{
    type:String,
    required:[true,"token isrequired to be added in blacklist"]

  }
},
  {
    timestamps:true
  })

const tokenBlacklistModel = mongoose.model("blacklistTokens",blacklistTokenSchema)

module.exports = tokenBlacklistModel
