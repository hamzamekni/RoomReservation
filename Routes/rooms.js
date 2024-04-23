const express = require('express')
const router = express.Router()
const Room = require('../Models/room')
const authenticate = require('../middleware/authenticate')

router.get('/rooms', authenticate, async (req, res) => {
  try {
    const token = req.cookies.token;
    const tokenData = token.split('.')[1];
    const decodedToken = JSON.parse(Buffer.from(tokenData, 'base64').toString()); // Decode base64 and parse JSON
    const role = decodedToken.role;
    const rooms = await Room.find().populate('capacity', 'availability');
    res.render('rooms', { role, rooms, loggedIn: true });
  } catch (error) {
    res.status(500).send('Server error: ' + error.message);
  }
});

router.get('/rooms/:id',authenticate,async (req,res) =>{
  const id= req.params.id;
  const room =await Room.findById(id);
  if(!room) return res.status(404).send('No room found with this id');
  res.send(room);
})

router.get('/add',async (req, res) => {
  try {
    return res.render('administrator/addRoom',{loggedIn: true})
  } catch (error) {
    return res.render('404',{loggedIn: true })

  }
})

router.post('/addRoom', authenticate,async (req, res) => {
  try{
    const token = req.cookies.token;
    const tokenData = token.split('.')[1];
    const decodedToken = JSON.parse(Buffer.from(tokenData, 'base64').toString()); // Decode base64 and parse JSON
    const role = decodedToken.role;
    const { capacity,availablity,equipments } = req.body;
    const equipmentArray = [];
    if (equipments && equipments.length > 0) {
      equipments.forEach(equipment => {
        equipmentArray.push({
          name: equipment.name,
          quantity: equipment.quantity
        });
      });
    }
    const room = new Room({
      capacity,
      availablity,
      equipment: equipmentArray 
    });
    await room.save()
    const rooms = await Room.find().populate('capacity', 'availability');
    res.render('rooms', {role,rooms, loggedIn: true });
  } catch(e){
    res.status(400).send(e.message)
  }
 
})

router.put('/updateRoom/:id',async (req,res) => {
  const id =req.params.id
  const room = await Room.findByIdAndUpdate(id,req.body)
  if(!room) return res.status(404).send('No room found with this id');
  res.send(room)
})

router.delete('/deleteRoom/:id',async (req,res) =>{
  const id =req.params.id
  const room = await Room.findByIdAndDelete(id)
  if(!room) return res.status(404).send('No room found with this id');
  res.send('Room Deleted')
})

module.exports = router;