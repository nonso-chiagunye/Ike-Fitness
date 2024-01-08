const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  plan: {
    type: mongoose.Schema.ObjectId, // A reference field for the Plan Model
    ref: 'Plan',
    required: [true, 'Booking must belong to a Plan!'],
  },
  user: {
    type: mongoose.Schema.ObjectId, // A reference field for the User Model
    ref: 'User',
    required: [true, 'Booking must belong to a User!'],
  },
  price: {
    type: Number,
    require: [true, 'Booking must have a price.'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

// Pre save hook to populate the user and plan fields
bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'plan',
    select: 'name',
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
