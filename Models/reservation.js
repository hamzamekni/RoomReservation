const mongoose = require('mongoose')

const reservationSchema = mongoose.Schema({
    roomId : {type:mongoose.Schema.Types.ObjectId,ref:'Room'},
    userId : {type:mongoose.Schema.Types.ObjectId,ref:'user'},
    dateDeb : Date,
    dateFin : Date
})
const reservation = mongoose.model( 'reservation', reservationSchema )

module.exports = reservation;