const Stripe = require('stripe');
const Plan = require('../models/planModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryFunction');
const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  // 1) Get the currently booked tour
  const plan = await Plan.findById(req.params.planId);
  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    // success_url: `${req.protocol}://${req.get('host')}/my-plans`,
    // success_url: `${req.protocol}://${req.get('host')}/my-plans/?plan=${
    //   req.params.planId
    // }&user=${req.user.id}&price=${plan.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-plans?alert=booking`,
    // cancel_url: `${req.protocol}://${req.get('host')}/plan/${plan.slug}`,
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

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
//   const { plan, user, price } = req.query;

//   if (!plan && !user && !price) return next();
//   await Booking.create({ plan, user, price });

//   res.redirect(req.originalUrl.split('?')[0]);
// });

const createBookingCheckout = async (session) => {
  const plan = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email }))._id;
  // const price = session.line_items[0].price_data.unit_amount / 100;
  const price = session.amount_total / 100;
  await Booking.create({ plan, user, price });
};

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

// The Function that will create the new booking in the Database
// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   // This is only TEMPORARY, because it's UNSECURE: anyone can make booking without paying.
//   const { tour, user, price } = req.query;
//   if (!tour && !user && !price) return next();
//   await Booking.create({ tour, user, price });

//   res.redirect(req.originalUrl.split('?')[0]);
// });

// const createBookingCheckout = async (session) => {
//   const plan = session.client_reference_id;
//   const user = (await User.findOne({ email: session.customer_email }))._id;
//   // const price = session.line_items[0].price_data.unit_amount / 100;
//   const price = session.amount_total / 100;
//   await Booking.create({ plan, user, price });
// };

// exports.webhookCheckout = (req, res, next) => {
//   const signature = req.headers['stripe-signature'];

//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET,
//     );
//   } catch (err) {
//     return res.status(400).send(`Webhook error: ${err.message}`);
//   }

//   if (event.type === 'checkout.session.completed')
//     createBookingCheckout(event.data.object);

//   res.status(200).json({ received: true });
// };

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
