const mongoose = require("mongoose");
var commentSchema = mongoose.Schema({
    name:String,
    content:String,
    rate:Number,
    reply:String
})
var comment = mongoose.model("comment",commentSchema);
module.exports = comment;