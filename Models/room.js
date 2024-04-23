const mongoose = require('mongoose')

const equipmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true }
});

const roomSchema = mongoose.Schema({
    capacity: { type: Number, required: true },
    availablity: { type: Boolean, default: true },
    equipment: [equipmentSchema]
})

const room = mongoose.model( 'Room', roomSchema )

module.exports = room;