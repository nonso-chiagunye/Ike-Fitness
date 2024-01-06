const Plan = require('../models/planModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const csp =
  "default-src 'self' https://js.stripe.com/v3/ https://cdnjs.cloudflare.com; base-uri 'self'; block-all-mixed-content; connect-src 'self' https://js.stripe.com/v3/ https://cdnjs.cloudflare.com/; font-src 'self' https://fonts.google.com/ https: data:;frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src 'self' https://js.stripe.com/v3/ https://cdnjs.cloudflare.com/ blob:; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests;";

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediatly, please come back later.";
  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const plans = await Plan.find();

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).set('Content-Security-Policy', csp).render('overview', {
    title: 'All Plans',
    plans,
  });
});

exports.getPlan = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const plan = await Plan.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!plan) {
    return next(new AppError('There is no plan with that name.', 404));
  }

  // 2) Build template
  // 3) Render template using data from 1)
  res
    .status(200)
    .set('Content-Security-Policy', csp)
    .render('plan', {
      title: `${plan.name} Plan`,
      plan,
    });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Signup for an account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getMyPlans = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const planIDs = bookings.map((el) => el.plan);
  const plans = await Plan.find({ _id: { $in: planIDs } });

  res.status(200).set('Content-Security-Policy', csp).render('overview', {
    title: 'My Plans',
    plans,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).set('Content-Security-Policy', csp).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
