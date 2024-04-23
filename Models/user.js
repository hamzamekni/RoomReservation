const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    email:{type:String,unique:true},
    password:String,
    role:String,
    dateNes:Date
})
    
const User = mongoose.model("user",userSchema)
module.exports = User