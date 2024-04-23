const express = require('express')
const app = express()
const bodyParser =require('body-parser')

app.use(express.static('public/new'));
app.set('view engine','ejs')
const cors = require('cors')
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

const authRoutes = require("./Routes/auth")
const roomsRoutes = require( './Routes/rooms' ) 
const reservationsRoutes = require('./Routes/reservations')

app.use(express.json());

const mongoose = require('mongoose')
const dotenv = require( 'dotenv');
const reservation = require('./Models/reservation')

dotenv.config()
const MONGODB_URI = process.env.MONGODB_URI
const PORT = process.env.PORT || 4000

var cookieParser = require('cookie-parser')
app.use(cookieParser())

mongoose.connect(MONGODB_URI).then(()=> {
    console.log('connected to the database')
    app.listen(PORT,()=>{
        console.log('server is running on port 4000')
    })
}).catch(err =>{
    console.log('error connecting to database : ', err.message)
})

app.use(authRoutes)
app.use('/',roomsRoutes)
app.use('/',reservationsRoutes)
