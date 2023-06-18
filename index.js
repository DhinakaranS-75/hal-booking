const express = require('express');
const app = express();
app.use(express.json());
// Define a local variable to store room data
let rooms = [];

// Endpoint to create a room
app.post('/rooms', (req, res) => {
  const { seats, amenities, price } = req.body;
  
  // Create a new room object
  const room = {
    id: rooms.length + 1,
    seats,
    amenities,
    price,
    bookings: []
  };
  
  // Add the room to the rooms array
  rooms.push(room);
  
  res.status(201).json(room);
});

// Endpoint to book a room
app.post('/bookings', (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;
  
  // Find the room by its ID
  const room = rooms.find(room => room.id === roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  // Check if the room is already booked for the given date and time
  const conflictingBooking = room.bookings.find(booking => (
    booking.date === date &&
    ((startTime >= booking.startTime && startTime < booking.endTime) ||
     (endTime > booking.startTime && endTime <= booking.endTime) ||
     (startTime <= booking.startTime && endTime >= booking.endTime))
  ));
  
  if (conflictingBooking) {
    return res.status(400).json({ error: 'Room is already booked for the given date and time' });
  }
  
  // Create a new booking object
  const booking = {
    id: room.bookings.length + 1,
    customerName,
    date,
    startTime,
    endTime
  };
  
  // Add the booking to the room's bookings array
  room.bookings.push(booking);
  
  res.status(201).json(booking);
});

// Endpoint to list all rooms with booked data
app.get('/rooms/bookings', (req, res) => {
  const bookedRooms = rooms.map(room => ({
    roomName: `Room ${room.id}`,
    bookedStatus: room.bookings.length > 0 ? 'Booked' : 'Available',
    bookings: room.bookings.map(booking => ({
      customerName: booking.customerName,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime
    }))
  }));
  
  res.json(bookedRooms);
});

// Endpoint to list all bookings for a customer
app.get('/customers/:customerName/bookings', (req, res) => {
  const customerName = req.params.customerName;
  
  const customerBookings = [];
  
  rooms.forEach(room => {
    room.bookings.forEach(booking => {
      if (booking.customerName === customerName) {
        customerBookings.push({
          roomName: `Room ${room.id}`,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          bookingId: booking.id,
          bookingDate: new Date().toISOString(),
          bookingStatus: 'Confirmed'
        });
      }
    });
  });
  
  res.json(customerBookings);
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
