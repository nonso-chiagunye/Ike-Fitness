const Review = require('../models/reviewModel');
const factory = require('./factoryFunction');

// Get both the planId and userId from the url parameters
exports.setPlanUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.plan) req.body.plan = req.params.planId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
