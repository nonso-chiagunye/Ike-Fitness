const Plan = require('../models/planModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Whitelist sources of contents that are allowed to be loaded with a rendered website.
const csp =
  "default-src 'self' https://js.stripe.com/v3/ https://cdnjs.cloudflare.com; base-uri 'self'; block-all-mixed-content; connect-src 'self' https://js.stripe.com/v3/ https://cdnjs.cloudflare.com/; font-src 'self' https://fonts.google.com/ https: data:;frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src 'self' https://js.stripe.com/v3/ https://cdnjs.cloudflare.com/ blob:; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests;";

// Alert displayed when there is successful booking
exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediatly, please come back later.";
  next();
};

// Render the overview page
exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get plan data from collection
  const plans = await Plan.find();

  // 2) Build template (/views/overview.pug)
  // 3) Render that template using plan data from 1)
  res.status(200).set('Content-Security-Policy', csp).render('overview', {
    title: 'All Plans',
    plans,
  });
});

// Render a specific plan
exports.getPlan = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested plan (including reviews and trainers)
  const plan = await Plan.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!plan) {
    return next(new AppError('There is no plan with that name.', 404));
  }

  // 2) Build template (/views/plan.pug)
  // 3) Render template using data from 1)
  res
    .status(200)
    .set('Content-Security-Policy', csp)
    .render('plan', {
      title: `${plan.name} Plan`,
      plan,
    });
});

// Render login form
exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

// Render signup form
exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Signup for an account',
  });
};

// Render specific authenticated user account
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

// Render a user's bookings.
exports.getMyPlans = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find plans with the returned IDs
  const planIDs = bookings.map((el) => el.plan);
  const plans = await Plan.find({ _id: { $in: planIDs } });

  res.status(200).set('Content-Security-Policy', csp).render('overview', {
    title: 'My Plans',
    plans,
  });
});

// Update user data
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
  // Render updated user data with the account template (/views/account.pug)
  res.status(200).set('Content-Security-Policy', csp).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
