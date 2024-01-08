const Stripe = require('stripe');
const Plan = require('../models/planModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryFunction');

// Get a Stripe Checkout session
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  // 1) Get the currently requested plan
  const plan = await Plan.findById(req.params.planId);
  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/my-plans?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/plan/${plan.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.planId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: plan.price * 100,
          product_data: {
            name: `${plan.name} Plan`,
            description: plan.description,
            images: [
              `${req.protocol}://${req.get('host')}/img/plans/${
                plan.imageCover
              }`,
            ],
          },
        },
      },
    ],
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// Create a Booking with a successful stripe session
const createBookingCheckout = async (session) => {
  const plan = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email }))._id;
  const price = session.amount_total / 100;
  await Booking.create({ plan, user, price });
};

// Webhook used by stripe create booking for every completed checkout session
exports.webhookCheckout = (req, res, next) => {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
