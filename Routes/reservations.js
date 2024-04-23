const express = require('express')
const router = express.Router()
const Room = require('../Models/room')
const Reservation = require('../Models/reservation')
const authenticate = require('../middleware/authenticate')
const nodemailer = require('nodemailer');

router.get('/reservationf', async (req, res) => {
    try {

        const token = req.cookies.token;
        const tokenData = token.split('.')[1];
        const decodedToken = JSON.parse(Buffer.from(tokenData, 'base64').toString()); // Decode base64 and parse JSON
        const userId = decodedToken.id;
        const roomId = req.query.roomId;
        console.log(roomId);
        res.render('user/book', {roomId,userId, loggedIn: true }); // Pass reservations to the template
    } catch (error) {
        res.render('404', { loggedIn: true });
    }
});

router.get('/reservations', async (req, res) => {
    try {
        const token = req.cookies.token;
        const tokenData = token.split('.')[1];
        const decodedToken = JSON.parse(Buffer.from(tokenData, 'base64').toString());
        const userId = decodedToken.id;
        const roomId = req.query.roomId;

        // Fetch reservations for the specific user from the database
        const reservations = await Reservation.find({ userId: userId });

        const events = reservations.map(reservation => ({
            title: 'Reservation', 
            start: reservation.dateDeb, 
            end: reservation.dateFin,
            id: reservation._id 
        }));

        
        res.render('user/roomBooked', { userId, events: JSON.stringify(events), loggedIn: true });
    } catch (error) {
        res.render('404', { loggedIn: true });
    }
});



// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    // Configure your email service provider here
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: false,
    auth: {
        user: 'hamzamekni45@gmail.com',
        pass: 'ogki txdd qlyy uctc'
    }
});

router.post('/addReservation', async (req, res) => {
    try {
        const { roomId, userId, dateDeb, dateFin } = req.body;
        //const userId = req.user._id;

        // Check if roomId exists
        const roomExists = await Room.exists({ _id: roomId });
        if (!roomExists) {
            return res.status(404).json({ error: "Room not found" });
        }

        // Check if room is already reserved for the specified date range
        const existingReservation = await Reservation.findOne({
            roomId: roomId,
            $or: [
                { $and: [{ dateDeb: { $lte: dateDeb } }, { dateFin: { $gte: dateDeb } }] }, // Check if dateDeb is within existing reservation
                { $and: [{ dateDeb: { $lte: dateFin } }, { dateFin: { $gte: dateFin } }] }, // Check if dateFin is within existing reservation
                { $and: [{ dateDeb: { $gte: dateDeb } }, { dateFin: { $lte: dateFin } }] }  // Check if existing reservation is within dateDeb and dateFin
            ]
        });

        if (existingReservation) {
            return res.status(400).json({ error: "Room already reserved for the specified date range" });
        }

        // Create reservation
        const newReservation = new Reservation({
            roomId: roomId,
            userId: userId,
            dateDeb: dateDeb,
            dateFin: dateFin
        });

        // Save reservation
        await newReservation.save();

        // Send email confirmation
        const mailOptions = {
            from: 'hamzamekni45@gmail.com',
            to: 'hamzamekni4@gmail.com',
            subject: 'Reservation Confirmation',
            text: 'Your reservation has been successfully added.',
            html: '<h1> Reservation Confirmation</h1>' +
                '<p>Your reservation has been successfully added.</p>'
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error occurred while sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        const token = req.cookies.token;
        const tokenData = token.split('.')[1];
        const decodedToken = JSON.parse(Buffer.from(tokenData, 'base64').toString()); // Decode base64 and parse JSON
        const role = decodedToken.role;
        const rooms = await Room.find().populate('capacity', 'availability');
        res.render('rooms', { role, rooms, loggedIn: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});


router.put('/updateReservation/:reservationId', async (req, res) => {
    try {
        const { roomId,userId, dateDeb, dateFin } = req.body;
        //const userId = req.user._id; 
        const reservationId = req.params.reservationId;

        // Check if roomId exists
        const roomExists = await Room.exists({ _id: roomId });
        if (!roomExists) {
            return res.status(404).json({ error: "Room not found" });
        }

        // Check if the reservation to update exists
        const existingReservation = await Reservation.findById(reservationId);
        if (!existingReservation) {
            return res.status(404).json({ error: "Reservation not found" });
        }

        // Check if room is already reserved for the specified date range
        const conflictingReservation = await Reservation.findOne({
            roomId: roomId,
            _id: { $ne: reservationId }, // Exclude the current reservation being update
            $or: [
                { $and: [{ dateDeb: { $lte: dateDeb } }, { dateFin: { $gte: dateDeb } }] },
                { $and: [{ dateDeb: { $lte: dateFin } }, { dateFin: { $gte: dateFin } }] },
                { $and: [{ dateDeb: { $gte: dateDeb } }, { dateFin: { $lte: dateFin } }] }
            ]
        });

        if (conflictingReservation) {
            return res.status(400).json({ error: "Room already reserved for the specified date range" });
        }

        // Update reservation
        existingReservation.roomId = roomId;
        existingReservation.dateDeb = dateDeb;
        existingReservation.dateFin = dateFin;

        // Save reservation
        await existingReservation.save();

        // Send email confirmation
        const mailOptions = {
            from: 'hamzamekni45@gmail.com',
            to: 'hamzamekni4@gmail.com',
            subject: 'Reservation Confirmation',
            text: 'Your reservation has been successfully updated.'
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error occurred while sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        res.status(200).json({ message: "Reservation modified successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});


router.delete('/cancelReservation/:reservationId', async (req, res) => {
    try {
        const reservationId = req.params.reservationId;

        // Check if the reservation exists
        const existingReservation = await Reservation.findById(reservationId);
        if (!existingReservation) {
            return res.status(404).json({ error: "Reservation not found" });
        }

        // Delete the reservation
        await Reservation.deleteOne({ _id: reservationId });

        // Send email confirmation
        const mailOptions = {
            from: 'hamzamekni45@gmail.com',
            to: 'hamzamekni4@gmail.com',
            subject: 'Reservation Confirmation',
            text: 'Your reservation has been successfully canceled.'
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error occurred while sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        res.status(200).json({ message: "Reservation canceled successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router